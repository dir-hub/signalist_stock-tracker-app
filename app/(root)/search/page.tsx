import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { getUserWatchlist } from "@/lib/actions/watchlist.actions";
import SearchPageClient from "@/components/SearchPageClient";

const SearchPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/sign-in");
    }

    const userId = session.user.id;

    // Fetch popular stocks by default
    const initialStocks = await searchStocks();
    
    // Get user's watchlist to enrich stocks with watchlist status
    const watchlistItems = await getUserWatchlist(userId);
    const watchlistSymbols = watchlistItems.map(item => item.symbol.toUpperCase());
    
    // Enrich stocks with watchlist status
    const watchlistSymbolsSet = new Set(watchlistSymbols);
    const enrichedStocks = initialStocks.map(stock => ({
        ...stock,
        isInWatchlist: watchlistSymbolsSet.has(stock.symbol.toUpperCase()),
    }));

    return <SearchPageClient initialStocks={enrichedStocks} userId={userId} watchlistSymbols={watchlistSymbols} />;
};

export default SearchPage;

