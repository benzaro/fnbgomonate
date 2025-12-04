"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ScannerTopbar from "@/components/scanner/Topbar";

export default function ScannerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!userData || userData.role !== "scanner") {
                router.push("/login");
            }
        }
    }, [userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--fnb-black)]">
                <div className="text-center">
                    <div className="spinner w-10 h-10 mx-auto mb-4 border-white/20 border-t-[var(--fnb-teal)]" />
                    <p className="text-white/70">Loading scanner...</p>
                </div>
            </div>
        );
    }

    if (!userData || userData.role !== "scanner") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--fnb-black)] flex flex-col">
            <ScannerTopbar />
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
                <div className="py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
