"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!userData || userData.role !== "superadmin") {
                router.push("/login");
            }
        }
    }, [userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="spinner w-10 h-10 mx-auto mb-4" />
                    <p className="text-[var(--muted)]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!userData || userData.role !== "superadmin") {
        return null;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-[var(--background)]">
            <AdminSidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden md:ml-64">
                <AdminTopbar />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-8 px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
