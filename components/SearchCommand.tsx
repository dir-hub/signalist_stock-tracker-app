"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import {Button} from "@/components/ui/button";
import {Loader2, TrendingUp, Star} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebounce} from "@/hooks/useDebounce";
import {addToWatchlist, removeFromWatchlist} from "@/lib/actions/watchlist.actions";
import {toast} from "sonner";

export default function SearchCommand({ renderAs = 'button', label = 'Add stock', initialStocks = [], userId, watchlistSymbols = [] }: SearchCommandProps) {
    const [open, setDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
    const [watchlistSymbolsSet, setWatchlistSymbolsSet] = useState(new Set(watchlistSymbols.map(s => s.toUpperCase())));

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? stocks : stocks.slice(0, 10);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setDialogOpen(v => !v)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const handleSearch = async () => {
        if (!isSearchMode) {
            setStocks(initialStocks);
            return;
        }

        setLoading(true)
        try {
            const results = await searchStocks(searchTerm.trim());
            // Enrich search results with watchlist status
            const enrichedResults = results.map(stock => ({
                ...stock,
                isInWatchlist: watchlistSymbolsSet.has(stock.symbol.toUpperCase()),
            }));
            setStocks(enrichedResults);
        } catch {
            setStocks([])
        } finally {
            setLoading(false)
        }
    }

    const debouncedSearch = useDebounce(handleSearch, 300);

    useEffect(() => {
        debouncedSearch();
    }, [searchTerm]);

    // Update watchlist symbols set when prop changes
    useEffect(() => {
        setWatchlistSymbolsSet(new Set(watchlistSymbols.map(s => s.toUpperCase())));
        // Also update stocks with watchlist status
        setStocks(prevStocks => 
            prevStocks.map(stock => ({
                ...stock,
                isInWatchlist: watchlistSymbols.includes(stock.symbol.toUpperCase()),
            }))
        );
    }, [watchlistSymbols]);

    // Prevent background page scroll while the search dialog is open
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    const handleSelectStock = () => {
        setDialogOpen(false);
        setSearchTerm("");
        setStocks(initialStocks);
    }

    const handleToggleWatchlist = async (e: React.MouseEvent, stock: StockWithWatchlistStatus) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!userId) {
            toast.error("Please sign in to add stocks to watchlist");
            return;
        }

        const isInWatchlist = watchlistSymbolsSet.has(stock.symbol.toUpperCase());
        
        try {
            if (isInWatchlist) {
                const result = await removeFromWatchlist(userId, stock.symbol);
                if (result.success) {
                    const newSet = new Set(watchlistSymbolsSet);
                    newSet.delete(stock.symbol.toUpperCase());
                    setWatchlistSymbolsSet(newSet);
                    
                    // Update the stock in the list
                    setStocks(prevStocks => 
                        prevStocks.map(s => 
                            s.symbol === stock.symbol 
                                ? { ...s, isInWatchlist: false }
                                : s
                        )
                    );
                    toast.success('Removed from watchlist');
                } else {
                    toast.error(result.message);
                }
            } else {
                const result = await addToWatchlist(userId, stock.symbol, stock.name);
                if (result.success) {
                    const newSet = new Set(watchlistSymbolsSet);
                    newSet.add(stock.symbol.toUpperCase());
                    setWatchlistSymbolsSet(newSet);
                    
                    // Update the stock in the list
                    setStocks(prevStocks => 
                        prevStocks.map(s => 
                            s.symbol === stock.symbol 
                                ? { ...s, isInWatchlist: true }
                                : s
                        )
                    );
                    toast.success('Added to watchlist');
                } else {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    }

    return (
        <>
            {renderAs === 'text' ? (
                <span onClick={() => setDialogOpen(true)} className="search-text">
            {label}
          </span>
            ): (
                <Button onClick={() => setDialogOpen(true)} className="search-btn">
                    {label}
                </Button>
            )}
            <CommandDialog open={open} onOpenChange={setDialogOpen} className="search-dialog">
                <div className="search-field">
                    <CommandInput value={searchTerm} onValueChange={setSearchTerm} placeholder="Search stocks..." className="search-input" />
                    {loading && <Loader2 className="search-loader" />}
                </div>
                <CommandList className="search-list">
                    {loading ? (
                        <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
                    ) : displayStocks?.length === 0 ? (
                        <div className="search-list-indicator">
                            {isSearchMode ? 'No results found' : 'No stocks available'}
                        </div>
                    ) : (
                        <ul>
                            <div className="search-count">
                                {isSearchMode ? 'Search results' : 'Popular stocks'}
                                {` `}({displayStocks?.length || 0})
                            </div>
                            {displayStocks?.map((stock, i) => {
                                const isInWatchlist = watchlistSymbolsSet.has(stock.symbol.toUpperCase());
                                return (
                                    <li key={`${stock.symbol}-${stock.exchange}-${i}`} className="search-item flex items-center">
                                        <Link
                                            href={`/stocks/${stock.symbol}`}
                                            onClick={handleSelectStock}
                                            className="search-item-link flex-1"
                                        >
                                            <TrendingUp className="h-4 w-4 text-gray-500" />
                                            <div  className="flex-1">
                                                <div className="search-item-name">
                                                    {stock.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {stock.symbol} • {stock.exchange} • {stock.type}
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={(e) => handleToggleWatchlist(e, stock)}
                                            className="ml-2 mr-2 p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                                            aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                                        >
                                            <Star 
                                                className={`h-5 w-5 transition-colors ${
                                                    isInWatchlist 
                                                        ? "fill-yellow-500 text-yellow-500" 
                                                        : "text-gray-400 hover:text-yellow-500"
                                                }`}
                                            />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                    }
                </CommandList>
            </CommandDialog>
        </>
    )
}