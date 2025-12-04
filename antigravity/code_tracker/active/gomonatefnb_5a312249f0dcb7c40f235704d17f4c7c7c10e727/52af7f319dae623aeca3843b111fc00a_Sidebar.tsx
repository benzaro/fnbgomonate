Ÿ"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Search } from "lucide-react";
import clsx from "clsx";

const navigation = [
    { name: "Employee Search", href: "/hr", icon: Search },
    // Future: { name: "My Profile", href: "/hr/profile", icon: User },
];

export default function HRSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-blue-900">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-900">
                    <h1 className="text-xl font-bold text-white">GoMonate HR</h1>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        isActive
                                            ? "bg-blue-800 text-white"
                                            : "text-blue-100 hover:bg-blue-700 hover:text-white",
                                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            isActive
                                                ? "text-white"
                                                : "text-blue-300 group-hover:text-white",
                                            "mr-3 flex-shrink-0 h-6 w-6"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
Ÿ*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272dfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/components/hr/Sidebar.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb