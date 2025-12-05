'use server';

import WatchlistModel, { WatchlistItem } from "@/database/models/watchlist.model";
import { connectToDatabase } from "@/database/mongoose";

interface BetterAuthUserRecord {
    id?: string;
    _id?: { toString(): string };
    email?: string | null;
}

export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) throw new Error("Database connection failed");

        const user = await db.collection("user").findOne<BetterAuthUserRecord>(
            { email },
            { projection: { _id: 1, id: 1, email: 1 } }
        );

        if (!user) {
            return [];
        }

        const userId: string = user.id || user._id?.toString() || "";

        if (!userId) {
            return [];
        }

        const watchlistItems = await WatchlistModel.find({ userId })
            .select("symbol -_id")
            .lean<{ symbol: WatchlistItem["symbol"] }[]>()
            .exec();

        return watchlistItems.map((item) => item.symbol);
    } catch (error) {
        console.error("Error fetching watchlist symbols by email:", error);
        return [];
    }
};

export const addToWatchlist = async (userId: string, symbol: string, company: string) => {
    try {
        await connectToDatabase();

        const existingItem = await WatchlistModel.findOne({ userId, symbol });
        
        if (existingItem) {
            return { success: false, message: "Stock already in watchlist" };
        }

        await WatchlistModel.create({
            userId,
            symbol: symbol.toUpperCase(),
            company,
            addedAt: new Date(),
        });

        return { success: true, message: "Added to watchlist" };
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return { success: false, message: "Failed to add to watchlist" };
    }
};

export const removeFromWatchlist = async (userId: string, symbol: string) => {
    try {
        await connectToDatabase();

        const result = await WatchlistModel.deleteOne({ userId, symbol: symbol.toUpperCase() });

        if (result.deletedCount === 0) {
            return { success: false, message: "Stock not found in watchlist" };
        }

        return { success: true, message: "Removed from watchlist" };
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return { success: false, message: "Failed to remove from watchlist" };
    }
};

export const checkWatchlistStatus = async (userId: string, symbol: string): Promise<boolean> => {
    try {
        await connectToDatabase();
        const item = await WatchlistModel.findOne({ userId, symbol: symbol.toUpperCase() });
        return !!item;
    } catch (error) {
        console.error("Error checking watchlist status:", error);
        return false;
    }
};

export const getUserWatchlist = async (userId: string) => {
    try {
        await connectToDatabase();
        
        const watchlistItems = await WatchlistModel.find({ userId })
            .sort({ addedAt: -1 })
            .lean<WatchlistItem[]>()
            .exec();

        return watchlistItems.map((item) => ({
            symbol: item.symbol,
            company: item.company,
            addedAt: item.addedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching user watchlist:", error);
        return [];
    }
};
