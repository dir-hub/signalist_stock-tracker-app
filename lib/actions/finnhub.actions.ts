'use server';

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

if (!FINNHUB_BASE_URL) {
    throw new Error("FINNHUB_BASE_URL must be defined");
}

export const fetchJSON = async <T>(
    url: string,
    revalidateSeconds?: number
): Promise<T> => {
    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? {
              cache: "force-cache",
              next: { revalidate: revalidateSeconds },
          }
        : {
              cache: "no-store",
          };

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
};

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
    try {
        if (!FINNHUB_API_KEY) {
            console.error("Finnhub API key is not configured");
            throw new Error("Finnhub API key is not configured");
        }

        const { from, to } = getDateRange(5);

        const cleanedSymbols = (symbols || [])
            .map((symbol) => symbol.trim().toUpperCase())
            .filter((symbol) => symbol.length > 0);

        const uniqueSymbols = Array.from(new Set(cleanedSymbols));

        const maxArticles = 6;

        const fetchCompanyNewsForSymbols = async (): Promise<MarketNewsArticle[]> => {
            if (uniqueSymbols.length === 0) {
                return [];
            }

            const symbolNewsMap: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                uniqueSymbols.map(async (symbol) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(
                            symbol
                        )}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

                        const articles = await fetchJSON<RawNewsArticle[]>(url, 600);
                        symbolNewsMap[symbol] = articles.filter((article) => validateArticle(article));
                    } catch (error) {
                        console.error(`Error fetching company news for ${symbol}:`, error);
                        symbolNewsMap[symbol] = [];
                    }
                })
            );

            const collected: MarketNewsArticle[] = [];
            let round = 0;

            while (round < maxArticles && collected.length < maxArticles) {
                const symbol = uniqueSymbols[round % uniqueSymbols.length];
                const articlesForSymbol = symbolNewsMap[symbol];

                if (articlesForSymbol && articlesForSymbol.length > 0) {
                    const article = articlesForSymbol.shift()!;
                    const formatted = formatArticle(article, true, symbol, collected.length);
                    collected.push(formatted);
                }

                round += 1;
            }

            collected.sort((a, b) => b.datetime - a.datetime);
            return collected.slice(0, maxArticles);
        };

        const fetchGeneralNews = async (): Promise<MarketNewsArticle[]> => {
            const url = `${FINNHUB_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 600);

            const seenIds = new Set<number>();
            const seenUrls = new Set<string>();
            const seenHeadlines = new Set<string>();

            const deduped: MarketNewsArticle[] = [];

            for (let index = 0; index < articles.length && deduped.length < maxArticles; index += 1) {
                const article = articles[index];

                if (!validateArticle(article)) continue;

                const id = article.id;
                const urlValue = article.url ?? "";
                const headline = article.headline ?? "";

                if (
                    (id && seenIds.has(id)) ||
                    (urlValue && seenUrls.has(urlValue)) ||
                    (headline && seenHeadlines.has(headline))
                ) {
                    continue;
                }

                if (id) seenIds.add(id);
                if (urlValue) seenUrls.add(urlValue);
                if (headline) seenHeadlines.add(headline);

                const formatted = formatArticle(article, false, undefined, deduped.length);
                deduped.push(formatted);
            }

            deduped.sort((a, b) => b.datetime - a.datetime);
            return deduped.slice(0, maxArticles);
        };

        const companyNews = await fetchCompanyNewsForSymbols();

        if (companyNews.length > 0) {
            return companyNews;
        }

        return fetchGeneralNews();
    } catch (error) {
        console.error("Error in getNews:", error);
        throw new Error("Failed to fetch news");
    }
};