"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ScannerTopbar() {
    const { userData } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-[var(--fnb-black)] border-b border-white/10">
            <div className="flex-1 px-6 flex justify-between items-center">
                {/* Left side - Logo */}
                <div className="flex items-center gap-3">
                    <Image src="/fnb.svg" alt="FNB Logo" width={32} height={32} />
                    <div>
                        <h1 className="text-base font-bold text-white">
                            Go<span className="text-[var(--fnb-teal)]">Monate</span>
                        </h1>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider">Scanner Station</p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm text-white/70">
                        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                        <span>Online</span>
                    </div>

                    <div className="hidden md:block h-6 w-px bg-white/20" />

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-white">
                                {userData?.firstName} {userData?.lastName}
                            </p>
                            <p className="text-xs text-white/50">Scanner</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            title="Sign out"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
