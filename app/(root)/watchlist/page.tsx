import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistItems from "@/components/WatchlistItems";

const WatchlistPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/sign-in");
    }

    const userId = session.user.id;
    const watchlistItems = await getUserWatchlist(userId);

    return (
        <div className="min-h-screen p-6">
            <h1 className="text-3xl font-bold text-white mb-6">My Watchlist</h1>
            <WatchlistItems items={watchlistItems} userId={userId} />
        </div>
    );
};

export default WatchlistPage;
