Ò"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Employees might not have a user account if they just scan a QR code
            // But if they are accessing the dashboard via login, they should be authenticated
            // For now, we'll assume this layout is for authenticated employees or those with a session
            // We might need to adjust this for the public registration flow
        }
    }, [userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return <div>{children}</div>;
}
Ò*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272rfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/employee/layout.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb