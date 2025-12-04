ç"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminTopbar() {
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
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                    {/* Search bar could go here */}
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-700">
                            <User className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="hidden md:inline">
                                {userData?.firstName} {userData?.lastName}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Sign out"
                        >
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
ç*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/components/admin/Topbar.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb