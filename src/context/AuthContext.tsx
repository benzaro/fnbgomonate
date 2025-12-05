"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
    uid: string;
    email: string;
    role: "superadmin" | "hr" | "scanner";
    firstName?: string;
    lastName?: string;
    isActive: boolean;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            console.log("Auth state changed - user:", firebaseUser?.email || "none");

            if (firebaseUser) {
                try {
                    console.log("Attempting to fetch user document for:", firebaseUser.uid);
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        console.log("User document found:", userDoc.data());
                        setUserData(userDoc.data() as UserData);
                    } else {
                        console.log("User document does not exist in Firestore");
                        setUserData(null);
                    }
                } catch (error: unknown) {
                    console.error("Error fetching user data:", error);

                    // Check if it's a permission error
                    if (error instanceof Error) {
                        if (error.message.includes("permission") || error.message.includes("PERMISSION_DENIED")) {
                            console.warn("Permission denied reading user document - Firestore rules may need adjustment");
                        }
                    }

                    // Set userData to null but don't block login flow
                    // The app will handle missing userData appropriately
                    setUserData(null);
                }
            } else {
                console.log("User not authenticated");
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
