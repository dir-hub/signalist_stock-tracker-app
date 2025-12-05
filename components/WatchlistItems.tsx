'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WatchlistButton from '@/components/WatchlistButton';

interface WatchlistItem {
    symbol: string;
    company: string;
    addedAt: string;
}

interface WatchlistItemsProps {
    items: WatchlistItem[];
    userId: string;
}

const WatchlistItems = ({ items: initialItems, userId }: WatchlistItemsProps) => {
    const [items, setItems] = useState(initialItems);
    const router = useRouter();

    // Sync with server data when it changes (after refresh)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const handleRemove = (symbol: string) => {
        // Optimistically remove the item from the UI
        setItems(items.filter(item => item.symbol !== symbol));
        
        // Refresh the page data to get the updated watchlist from the server
        router.refresh();
    };

    if (items.length === 0) {
        return (
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
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                    Your watchlist is empty
                </h2>
                <p className="text-gray-500 mb-6">
                    Start adding stocks to track your favorite companies
                </p>
                <Link
                    href="/search"
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
                >
                    Search Stocks
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <div
                    key={item.symbol}
                    className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <Link
                                href={`/stocks/${item.symbol}`}
                                className="text-2xl font-bold text-white hover:text-[#D4A574] transition-colors"
                            >
                                {item.symbol}
                            </Link>
                            <p className="text-gray-400 text-sm mt-1">{item.company}</p>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-xs text-gray-500">
                            Added: {new Date(item.addedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="flex gap-2 items-stretch">
                        <Link
                            href={`/stocks/${item.symbol}`}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium h-12"
                        >
                            View Details
                        </Link>
                        <div className="flex-1">
                            <WatchlistButton
                                userId={userId}
                                symbol={item.symbol}
                                company={item.company}
                                initialIsInWatchlist={true}
                                onRemove={() => handleRemove(item.symbol)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WatchlistItems;

