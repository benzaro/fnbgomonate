"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HRSidebar from "@/components/hr/Sidebar";
import HRTopbar from "@/components/hr/Topbar";

export default function HRLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!userData || userData.role !== "hr") {
                router.push("/login");
            }
        }
    }, [userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="spinner w-10 h-10 mx-auto mb-4" />
                    <p className="text-[var(--muted)]">Loading HR portal...</p>
                </div>
            </div>
        );
    }

    if (!userData || userData.role !== "hr") {
        return null;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-[var(--background)]">
            <HRSidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
                <HRTopbar />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-8 px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
