'use client'

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { addToWatchlist, removeFromWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';

interface WatchlistButtonProps {
    userId: string;
    symbol: string;
    company: string;
    initialIsInWatchlist: boolean;
    onRemove?: () => void;
}

const WatchlistButton = ({ userId, symbol, company, initialIsInWatchlist, onRemove }: WatchlistButtonProps) => {
    const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                if (isInWatchlist) {
                    const result = await removeFromWatchlist(userId, symbol);
                    if (result.success) {
                        setIsInWatchlist(false);
                        toast.success('Removed from watchlist');
                        // Call onRemove callback if provided (for watchlist page)
                        if (onRemove) {
                            onRemove();
                        }
                    } else {
                        toast.error(result.message);
                    }
                } else {
                    const result = await addToWatchlist(userId, symbol, company);
                    if (result.success) {
                        setIsInWatchlist(true);
                        toast.success('Added to watchlist');
                    } else {
                        toast.error(result.message);
                    }
                }
            } catch (error) {
                toast.error('Something went wrong');
            }
        });
    };

    return (
        <Button
            onClick={handleToggle}
            disabled={isPending}
            className="w-full h-12 bg-yellow-500 hover:bg-yellow-500 cursor-pointer text-black font-semibold text-sm sm:text-base text-wrap flex items-center justify-center"
        >
            {isPending ? 'Loading...' : isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Button>
    );
};

export default WatchlistButton;
