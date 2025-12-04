Ç"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!userData || userData.role !== "scanner") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <ScannerTopbar />
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
æ *cascade08æ¯*cascade08¯Õ *cascade08Õÿ*cascade08ÿ‹ *cascade08‹è*cascade08èê *cascade08êí
*cascade08í
ú
 *cascade08ú
≤
*cascade08≤
∏
 *cascade08∏
¸
*cascade08¸
Ç *cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272qfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/scanner/layout.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb