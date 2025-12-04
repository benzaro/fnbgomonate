"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navigation = [
    {
        name: "Employee Search",
        href: "/hr",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
];

export default function HRSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 gradient-teal">
            <div className="flex-1 flex flex-col min-h-0">
                {/* Logo Section */}
                <div className="flex items-center gap-3 h-16 flex-shrink-0 px-6 border-b border-white/10">
                    <Image src="/fnb.svg" alt="FNB Logo" width={32} height={32} />
                    <div>
                        <h1 className="text-base font-bold text-white">
                            Go<span className="text-[var(--fnb-orange)]">Monate</span>
                        </h1>
                        <p className="text-[10px] text-white/60 uppercase tracking-wider">HR Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 flex flex-col overflow-y-auto py-6">
                    <nav className="flex-1 px-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                                        ${isActive
                                            ? "bg-white text-[var(--fnb-teal)] shadow-lg"
                                            : "text-white/80 hover:bg-white/10 hover:text-white"
                                        }
                                    `}
                                >
                                    <span className={`transition-colors ${isActive ? "text-[var(--fnb-teal)]" : "text-white/60 group-hover:text-white"}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Help Card */}
                    <div className="px-3 mt-6">
                        <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-[var(--fnb-orange)] flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-white">Need Help?</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-white/70">
                                Search for employees by email to assign or reassign QR codes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
