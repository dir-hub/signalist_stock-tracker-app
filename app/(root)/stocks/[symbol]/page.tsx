import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { checkWatchlistStatus } from "@/lib/actions/watchlist.actions";
import { fetchJSON } from "@/lib/actions/finnhub.actions";

const StockDetails = async ({ params }: StockDetailsPageProps) => {
    const { symbol } = await params;
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    // Get user session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user?.id || "";

    // Fetch company profile to get company name
    let companyName = symbol;
    try {
        const profile = await fetchJSON<any>(
            `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
            3600
        );
        companyName = profile?.name || symbol;
    } catch (error) {
        console.error("Error fetching company profile:", error);
    }

    // Check if stock is in watchlist
    const isInWatchlist = userId ? await checkWatchlistStatus(userId, symbol) : false;

    return (
        <div className="min-h-screen p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <section className="space-y-6">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                        height={170}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                        height={600}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}advanced-chart.js`}
                        config={BASELINE_WIDGET_CONFIG(symbol)}
                        height={600}
                    />
                </section>

                {/* Right Column */}
                <section className="space-y-6">
                    <WatchlistButton 
                        userId={userId}
                        symbol={symbol} 
                        company={companyName} 
                        initialIsInWatchlist={isInWatchlist} 
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}technical-analysis.js`}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                        height={400}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}symbol-profile.js`}
                        config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                        height={440}
                    />
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}financials.js`}
                        config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                        height={464}
                    />
                </section>
            </div>
        </div>
    );
};

export default StockDetails;
