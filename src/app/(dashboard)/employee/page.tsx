"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import Image from "next/image";
import QRCodeWithLogo from "@/components/QRCodeWithLogo";
import { QRCodeCanvas } from "qrcode.react";

interface EmployeeData {
    id: string;
    firstName: string;
    lastName: string;
    tokenBalance: number;
}

interface Transaction {
    id: string;
    timestamp: { toDate: () => Date } | null;
    tokensAfter: number;
}

export default function EmployeeDashboard() {
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<EmployeeData | null>(null);
    const [qrCodeId, setQrCodeId] = useState<string | null>(null);
    const [sixDigitCode, setSixDigitCode] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedCodeId = localStorage.getItem("gomonate_employee_code");

        if (!storedCodeId) {
            router.push("/register");
            return;
        }

        // Ensure user is signed in anonymously before accessing Firestore
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // Sign in anonymously if not already signed in
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Error signing in anonymously:", error);
                    setLoading(false);
                }
                return; // onAuthStateChanged will fire again after sign in
            }

            // User is signed in, fetch data
            try {
                const qrDocRef = doc(db, "qrCodes", storedCodeId);
                const qrDoc = await getDoc(qrDocRef);

                if (!qrDoc.exists()) {
                    const q = query(collection(db, "qrCodes"), where("sixDigitCode", "==", storedCodeId));
                    const snapshot = await getDocs(q);
                    if (snapshot.empty) {
                        router.push("/register");
                        return;
                    }
                    const data = snapshot.docs[0].data();
                    setQrCodeId(snapshot.docs[0].id);
                    setSixDigitCode(data.sixDigitCode);
                    await loadEmployee(data.employeeId);
                } else {
                    const data = qrDoc.data();
                    setQrCodeId(qrDoc.id);
                    setSixDigitCode(data.sixDigitCode);
                    await loadEmployee(data.employeeId);
                }

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        });

        const loadEmployee = async (employeeId: string) => {
            const empDoc = await getDoc(doc(db, "employees", employeeId));
            if (empDoc.exists()) {
                setEmployee({ id: empDoc.id, ...empDoc.data() } as EmployeeData);

                // Try to load transactions, but don't fail if not allowed
                try {
                    const transQ = query(
                        collection(db, "transactions"),
                        where("employeeId", "==", employeeId),
                        orderBy("timestamp", "desc"),
                        limit(10)
                    );
                    const transSnapshot = await getDocs(transQ);
                    const transList: Transaction[] = [];
                    transSnapshot.forEach(doc => {
                        transList.push({ id: doc.id, ...doc.data() } as Transaction);
                    });
                    setTransactions(transList);
                } catch (error) {
                    // Transactions might not be accessible, that's okay
                    console.log("Could not load transactions:", error);
                }
            }
        };

        return () => unsubscribe();
    }, [router]);

    const refreshData = async () => {
        setRefreshing(true);
        try {
            const storedCodeId = localStorage.getItem("gomonate_employee_code");
            if (storedCodeId && employee) {
                const transQ = query(
                    collection(db, "transactions"),
                    where("employeeId", "==", employee.id),
                    orderBy("timestamp", "desc"),
                    limit(10)
                );
                const transSnapshot = await getDocs(transQ);
                const transList: Transaction[] = [];
                transSnapshot.forEach(doc => {
                    transList.push({ id: doc.id, ...doc.data() } as Transaction);
                });
                setTransactions(transList);

                // Also refresh employee data
                const empDoc = await getDoc(doc(db, "employees", employee.id));
                if (empDoc.exists()) {
                    setEmployee({ id: empDoc.id, ...empDoc.data() } as EmployeeData);
                }
            }
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("gomonate_employee_code");
        router.push("/register");
    };

    const saveQRCode = async () => {
        const qrCanvas = document.querySelector("canvas");
        if (!qrCanvas) {
            alert("QR Code not found");
            return;
        }

        try {
            // Convert canvas to blob
            qrCanvas.toBlob((blob) => {
                if (!blob) return;

                // Create a temporary download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `gomonate-qr-${sixDigitCode || "code"}.png`;

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                // Show success message
                alert("QR Code saved to your device!");
            });
        } catch (error) {
            console.error("Error saving QR code:", error);
            alert("Failed to save QR code");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <div className="spinner w-10 h-10 mx-auto mb-4" />
                    <p className="text-[var(--muted)]">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!employee || !qrCodeId) {
        return null;
    }

    const percentage = (employee.tokenBalance / 18) * 100;
    const getTokenColor = () => {
        if (employee.tokenBalance < 5) return "var(--error)";
        if (employee.tokenBalance < 10) return "var(--fnb-orange)";
        return "var(--fnb-teal)";
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <header className="sticky top-0 z-10 glass border-b border-[var(--border-light)]">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/fnb.svg" alt="FNB Logo" width={36} height={36} />
                        <span className="font-bold text-lg text-[var(--foreground)]">
                            Go<span className="text-[var(--fnb-teal)]">Monate</span>
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-[var(--muted)] hover:text-[var(--error)] transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto px-4 py-6 space-y-6">
                {/* Welcome */}
                <div className="text-center animate-fade-in">
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">
                        Welcome, {employee.firstName}!
                    </h1>
                    <p className="text-[var(--muted)] mt-1">FNB End-of-Year Celebration</p>
                </div>

                {/* Token Balance Card */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-lg border border-[var(--border-light)] p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
                            Token Balance
                        </h2>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 mb-4">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="none"
                                    stroke="var(--border)"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    fill="none"
                                    stroke={getTokenColor()}
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={`${percentage * 4.4} 440`}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-[var(--foreground)]">{employee.tokenBalance}</span>
                                <span className="text-sm text-[var(--muted)]">of 18</span>
                            </div>
                        </div>

                        <p className="text-center text-[var(--muted)] mb-4">
                            {employee.tokenBalance === 0
                                ? "You've used all your tokens!"
                                : employee.tokenBalance === 18
                                    ? "All tokens available"
                                    : `${18 - employee.tokenBalance} tokens redeemed`}
                        </p>

                        {/* Refresh Button */}
                        <button
                            onClick={refreshData}
                            disabled={refreshing}
                            className="w-full px-4 py-3 rounded-xl font-semibold bg-[var(--fnb-orange)] text-black hover:bg-[#E58A1F] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                            title="Refresh balance and activity"
                        >
                            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-lg border border-[var(--border-light)] p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-6 text-center">
                        Your Drink Pass
                    </h2>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white rounded-2xl shadow-inner pulse-qr">
                            <QRCodeWithLogo
                                value={sixDigitCode || ""}
                                size={200}
                                logoSize={60}
                                level="H"
                            />
                        </div>
                    </div>

                    {/* 6-digit Code */}
                    {sixDigitCode && (
                        <div className="text-center mb-6">
                            <p className="text-xs text-[var(--muted)] mb-1">Manual Entry Code</p>
                            <p className="text-2xl font-mono font-bold tracking-[0.3em] text-[var(--foreground)]">
                                {sixDigitCode}
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-[var(--muted)] text-center mb-6">
                        Show this QR code at any beverage station to redeem your drinks
                    </p>

                    {/* Save Button */}
                    <button
                        onClick={saveQRCode}
                        className="w-full px-4 py-3 rounded-xl font-semibold bg-[var(--fnb-orange)] text-black hover:bg-[#E58A1F] transition-all flex items-center justify-center gap-2"
                        title="Save QR code to your device"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Save Code
                    </button>
                </div>

                {/* Activity History Card */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-lg border border-[var(--border-light)] p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
                            Recent Activity
                        </h2>
                        <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--fnb-teal-light)] flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[var(--muted)]">No redemptions yet</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Your activity will appear here</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {transactions.map((tx, index) => (
                                <li
                                    key={tx.id}
                                    className="flex items-center justify-between py-3 border-b border-[var(--border-light)] last:border-0"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--fnb-orange-light)] flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[var(--fnb-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-[var(--foreground)]">Redeemed 1 token</span>
                                    </div>
                                    <span className="text-sm text-[var(--muted)]">
                                        {tx.timestamp?.toDate
                                            ? tx.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : 'Just now'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Tips Card */}
                <div className="bg-[var(--fnb-teal-light)] rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--fnb-teal)] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--fnb-teal-dark)] mb-1">Quick Tip</h3>
                            <p className="text-sm text-[var(--fnb-teal-dark)]/80">
                                Increase your screen brightness before scanning for faster redemption at beverage stations.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
