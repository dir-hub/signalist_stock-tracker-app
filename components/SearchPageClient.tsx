"use client";

import { useState, useEffect, useCallback } from "react";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";
import Link from "next/link";
import WatchlistButton from "@/components/WatchlistButton";
import { Loader2, Search } from "lucide-react";

interface SearchPageClientProps {
    initialStocks: StockWithWatchlistStatus[];
    userId: string;
    watchlistSymbols: string[];
}

const SearchPageClient = ({ initialStocks, userId, watchlistSymbols }: SearchPageClientProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
    const [watchlistSymbolsSet] = useState(new Set(watchlistSymbols.map(s => s.toUpperCase())));

    const isSearchMode = !!searchTerm.trim();

    const handleSearch = useCallback(async () => {
        const trimmed = searchTerm.trim();
        if (!trimmed) {
            setStocks(initialStocks);
            return;
        }

        setLoading(true);
        try {
            const results = await searchStocks(trimmed);
            // Enrich search results with watchlist status
            const enrichedResults = results.map(stock => ({
                ...stock,
                isInWatchlist: watchlistSymbolsSet.has(stock.symbol.toUpperCase()),
            }));
            setStocks(enrichedResults);
        } catch {
            setStocks([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, initialStocks, watchlistSymbolsSet]);

    const debouncedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [searchTerm, debouncedSearch]);

    // Reset to initial stocks when search is cleared
    useEffect(() => {
        if (!searchTerm.trim()) {
            setStocks(initialStocks);
        }
    }, [searchTerm, initialStocks]);

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Search Stocks</h1>
            
            {/* Search Input */}
            <div className="relative mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for stocks by symbol or company name..."
                        className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A574] transition-colors"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            {stocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <svg
                        className="w-24 h-24 text-gray-600 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                        {isSearchMode ? "No results found" : "No stocks available"}
                    </h2>
                    <p className="text-gray-500">
                        {isSearchMode
                            ? "Try searching for a different stock symbol or company name"
                            : "Unable to load stocks at this time"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-4 text-gray-400">
                        {isSearchMode ? "Search results" : "Popular stocks"} ({stocks.length})
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stocks.map((stock, index) => (
                            <div
                                key={`${stock.symbol}-${stock.exchange}-${stock.type}-${index}`}
                                className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <Link
                                            href={`/stocks/${stock.symbol}`}
                                            className="text-2xl font-bold text-white hover:text-[#D4A574] transition-colors"
                                        >
                                            {stock.symbol}
                                        </Link>
                                        <p className="text-gray-400 text-sm mt-1">{stock.name}</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            {stock.exchange} • {stock.type}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/stocks/${stock.symbol}`}
                                         className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium h-12"
                                    >
                                        View Details
                                    </Link>
                                    <div className="flex-1">
                                        <WatchlistButton
                                            userId={userId}
                                            symbol={stock.symbol}
                                            company={stock.name}
                                            initialIsInWatchlist={stock.isInWatchlist}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchPageClient;

