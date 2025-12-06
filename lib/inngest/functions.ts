import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendWelcomeEmail, sendNewsSummaryEmail } from "@/lib/nodemailer";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: "sign-up-email" },
    { event: "app/user.created" },
    async ({ event, step }) => {
        console.log('sendSignUpEmail function triggered for:', event.data.email);
        
        const userProfile = `
           - Country: ${event.data.country}
           - Investment goals: ${event.data.investmentGoals}
           - Risk tolerance: ${event.data.riskTolerance}
           - Preferred industry: ${event.data.preferredIndustry}
        `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile);

        let introtext = "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.";

        try {
            const response = await step.ai.infer("generate-welcome-intro", {
                model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
                body: {
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }],
                        },
                    ],
                },
            });

            // Try multiple response structures to handle different API response formats
            const candidate = response.candidates?.[0];
            if (candidate) {
                // Try content.parts structure first (as used in sendDailyNewsSummary)
                const partFromContent = (candidate as any)?.content?.parts?.[0];
                if (partFromContent && "text" in partFromContent) {
                    introtext = (partFromContent as { text: string }).text;
                } else {
                    // Try direct parts structure
                    const part = (candidate as any)?.parts?.[0];
                    if (part && "text" in part) {
                        introtext = (part as { text: string }).text;
                    } else if (typeof part === 'string') {
                        introtext = part;
                    }
                }
            }

            console.log("AI-generated intro:", introtext);
        } catch (e: any) {
            const err = e as { code?: number; status?: string; message?: string };
            
            if (err.code === 503 || err.status === "UNAVAILABLE") {
                console.warn(
                    `AI overloaded for welcome email, using default message:`,
                    err.message
                );
            } else {
                console.error("Failed to generate personalized welcome email:", err.message ?? e);
            }
            // Continue with default introtext if AI fails
        }

        await step.run("send-welcome-email", async () => {
            const {
                data: { email, name },
            } = event;

            console.log(`Sending welcome email to ${email} with personalized intro`);
            
            return sendWelcomeEmail({
                email,
                name,
                intro: introtext,
            });
        });

        console.log('Welcome email process completed for:', event.data.email);
        
        return {
            success: true,
            message: "Welcome email sent successfully",
        };
    }
);

export const sendDailyNewsSummary = inngest.createFunction(
    { id: "daily-news-summary" },
    [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
    async ({ step }) => {
        // Step 1: Get all users who should receive the news email
        const users = await step.run("get-all-users-for-news-email", async () => getAllUsersForNewsEmail());

        if (!users || users.length === 0) {
            return { success: true, message: "No users found for news email" };
        }

        // Step 2: For each user, get their watchlist symbols and fetch news
        const results = await step.run(
            "fetch-news-for-users",
            async (): Promise<{ user: User; articles: MarketNewsArticle[] }[]> => {
                const perUser: { user: User; articles: MarketNewsArticle[] }[] = [];

                await Promise.all(
                    users.map(async (user: User) => {
                        try {
                            const symbols = await getWatchlistSymbolsByEmail(user.email);

                            const news = await getNews(symbols.length > 0 ? symbols : undefined);

                            const limitedNews = (news || []).slice(0, 6);

                            if (limitedNews.length === 0) {
                                return;
                            }

                            perUser.push({ user, articles: limitedNews });
                        } catch (error) {
                            console.error(`Error fetching news for user ${user.email}:`, error);
                        }
                    })
                );

                return perUser;
            }
        );

        if (!results || results.length === 0) {
            return { success: true, message: "No news available for any user" };
        }

        // Step 3: Summarize news via AI (with graceful fallback on 503 overload)
        const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

        for (const { user, articles } of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
                    "{{newsData}}",
                    JSON.stringify(articles, null, 2)
                );

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
                    body: {
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                    },
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent =
                    (part && "text" in part ? (part as { text: string }).text : null) ||
                    "No market news.";

                userNewsSummaries.push({ user, newsContent });
            } catch (e: any) {
                const err = e as { code?: number; status?: string; message?: string };

                if (err.code === 503 || err.status === "UNAVAILABLE") {
                    console.warn(
                        `AI overloaded for ${user.email}, falling back to simple summary:`,
                        err.message
                    );

                    userNewsSummaries.push({
                        user,
                        newsContent:
                            "Here is a brief summary of today's key market news based on the latest articles in your watchlist.",
                    });
                    continue;
                }

                console.error("Failed to summarize news for:", err.message ?? e);
                userNewsSummaries.push({ user, newsContent: null });
            }
        }

        // Step 4: Send the emails (still using mocked news & simple summary)
        await step.run("send-news-emails", async () => {
            await Promise.all(
                userNewsSummaries.map(async ({ user, newsContent }) => {
                    if (!newsContent) return false;

                    return await sendNewsSummaryEmail({
                        email: user.email,
                        date: getFormattedTodayDate(),
                        newsContent,
                    });
                })
            );
        });

        return {
            success: true,
            message: "Daily news summary emails sent successfully (mocked news)",
        };
    }
);
