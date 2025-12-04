’"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!userData || userData.role !== "superadmin") {
        return null;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            <AdminSidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <AdminTopbar />
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
æ *cascade08æ¨*cascade08¨Ö *cascade08Öê*cascade08êî *cascade08î *cascade08 À *cascade08À≈*cascade08≈œ *cascade08œÈ*cascade08ÈÔ *cascade08Ôœ*cascade08œ’ *cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272ofile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/admin/layout.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb