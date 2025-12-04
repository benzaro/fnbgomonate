°"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!userData || userData.role !== "hr") {
        return null;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <HRSidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <HRTopbar />
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
¾ *cascade08¾ *cascade08 æ *cascade08æñ*cascade08ñõ *cascade08õ«*cascade08«¬ *cascade08¬ *cascade08 ª *cascade08ªÄ*cascade08ÄÊ *cascade08Êª*cascade08ª° *cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272lfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/hr/layout.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb