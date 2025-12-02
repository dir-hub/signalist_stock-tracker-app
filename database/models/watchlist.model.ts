import { Schema, model, models, Document } from "mongoose";

export interface WatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    addedAt: Date;
}

const WatchlistSchema = new Schema<WatchlistItem>({
    userId: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent duplicate symbols per user
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const WatchlistModel = models?.Watchlist || model<WatchlistItem>("Watchlist", WatchlistSchema);

export default WatchlistModel;