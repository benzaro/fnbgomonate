"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HRTopbar() {
    const { userData } = useAuth();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-[var(--background-card)] border-b border-[var(--border)]">
            <div className="flex-1 px-6 flex justify-between items-center">
                {/* Left side */}
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold text-[var(--foreground)]">Employee Search</h1>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--background)] transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-[var(--fnb-teal)] flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                    {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
                                </span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {userData?.firstName} {userData?.lastName}
                                </p>
                                <p className="text-xs text-[var(--muted)]">HR Staff</p>
                            </div>
                            <svg className="w-4 h-4 text-[var(--muted)] hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--background-card)] border border-[var(--border)] shadow-lg z-20 py-1 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-[var(--border-light)]">
                                        <p className="text-sm font-medium text-[var(--foreground)]">
                                            {userData?.firstName} {userData?.lastName}
                                        </p>
                                        <p className="text-xs text-[var(--muted)]">{userData?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
