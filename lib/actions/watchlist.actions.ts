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