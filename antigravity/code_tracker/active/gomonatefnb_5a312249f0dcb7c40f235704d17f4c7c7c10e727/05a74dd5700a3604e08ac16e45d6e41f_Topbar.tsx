³"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";

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
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-gray-900 shadow">
            <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex items-center text-white font-bold text-lg">
                    <ScanLine className="h-6 w-6 mr-2" />
                    GoMonate Scanner
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center text-sm text-gray-300">
                            <span>
                                {userData?.firstName} {userData?.lastName}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none"
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
³*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272hfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/components/scanner/Topbar.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb