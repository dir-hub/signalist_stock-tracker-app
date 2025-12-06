'use client'
import {NAV_ITEMS} from "@/lib/constants";
import Link from "next/link";
import {usePathname} from "next/navigation";
import SearchCommand from "@/components/SearchCommand";

const NavItems = ({initialStocks, userId, watchlistSymbols} : {initialStocks: StockWithWatchlistStatus[], userId: string, watchlistSymbols: string[]}) => {
    const pathname = usePathname()

    const isActive = (path: string)=>{
        if(path === '/') return pathname === '/'

        return pathname.startsWith(path)
    }

    return (
        <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
            {NAV_ITEMS.map(({ href, label }) => {
                if(label === 'Search') return (
                    <li key={"search-trigger"} className="hidden sm:block">
                        <SearchCommand
                            renderAs="text"
                            label="Search"
                            initialStocks={initialStocks}
                            userId={userId}
                            watchlistSymbols={watchlistSymbols}
                        />
                    </li>
                )

               return <li key={href}>
                    <Link href={href} className={`hover:text-yellow-500 transition-colors ${
                        isActive(href) ? 'text-gray-100' : ''
                    }`}>
                        {label}
                    </Link>
                </li>
            })}
        </ul>
    )
}
export default NavItems
