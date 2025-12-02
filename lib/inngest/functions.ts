import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendWelcomeEmail, sendNewsSummaryEmail } from "@/lib/nodemailer";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { formatDateToday } from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: "sign-up-email" },
    { event: "app/user.created" },
    async ({ event, step }) => {
        const userProfile = `
           - Country: ${event.data.country}
           - Investment goals: ${event.data.investmentGoals}
           - Risk tolerance: ${event.data.riskTolerance}
           - Preferred industry: ${event.data.preferredIndustry}
        `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", userProfile);

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

        await step.run("send-welcome-email", async () => {
            const part = response.candidates?.[0]?.parts?.[0];
            const introtext =
                (part && "text" in part ? part.text : null) ||
                "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.";

            const {
                data: { email, name },
            } = event;

            return sendWelcomeEmail({
                email,
                name,
                intro: introtext,
            });
        });

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

        // Step 3: Summarize news via AI (no step.run wrapper to avoid nested tooling)
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
            } catch (e) {
                console.error("Failed to summarize news for:", (e as Error).message);
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
                        date: formatDateToday,
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
