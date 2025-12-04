"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

function RegisterForm() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const codeParam = searchParams.get("code");
        if (codeParam) {
            setCode(codeParam);
        }
    }, [searchParams]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const qrCodesRef = collection(db, "qrCodes");
            let q = query(qrCodesRef, where("id", "==", code));
            let snapshot = await getDocs(q);

            if (snapshot.empty) {
                q = query(qrCodesRef, where("sixDigitCode", "==", code.toUpperCase()));
                snapshot = await getDocs(q);
            }

            if (snapshot.empty) {
                throw new Error("Invalid code. Please check and try again.");
            }

            const qrDoc = snapshot.docs[0];
            const qrData = qrDoc.data();

            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;

            if (!qrData.isRegistered) {
                await updateDoc(doc(db, "qrCodes", qrDoc.id), {
                    isRegistered: true,
                    registeredAt: serverTimestamp(),
                    registeredDeviceId: user.uid,
                });

                await updateDoc(doc(db, "employees", qrData.employeeId), {
                    registrationStatus: "registered",
                });
            }

            localStorage.setItem("gomonate_employee_code", qrDoc.id);
            router.push("/employee");

        } catch (err: unknown) {
            console.error("Registration error:", err);
            setError(err instanceof Error ? err.message : "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--background)] bg-pattern">
            {/* Header */}
            <header className="py-6 px-6">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/fnb.svg" alt="FNB Logo" width={40} height={40} />
                    <span className="font-bold text-xl text-[var(--foreground)]">
                        Go<span className="text-[var(--fnb-teal)]">Monate</span>
                    </span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-[var(--fnb-teal-light)] flex items-center justify-center">
                            <svg className="w-10 h-10 text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">
                            Register Your Code
                        </h1>
                        <p className="text-[var(--muted)]">
                            Enter your 6-digit code to access your drink tokens
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-[var(--background-card)] rounded-2xl shadow-lg border border-[var(--border-light)] p-8">
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="code"
                                    className="block text-sm font-medium text-[var(--foreground)] mb-3"
                                >
                                    Registration Code
                                </label>
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] uppercase bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:border-[var(--fnb-teal)] focus:ring-4 focus:ring-[var(--fnb-teal-10)] outline-none transition-all text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                                    placeholder="Enter code"
                                    maxLength={6}
                                />
                                <p className="mt-2 text-xs text-[var(--muted)] text-center">
                                    You received this code from HR at registration
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--error-light)] text-[var(--error-foreground)] text-sm animate-shake">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || code.length < 6}
                                className="btn-primary w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner w-5 h-5" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 p-4 rounded-xl bg-[var(--fnb-orange-light)] border border-[var(--fnb-orange)]/20">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-[var(--fnb-orange)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-[var(--fnb-orange-dark)]">
                                <p className="font-medium mb-1">Don&apos;t have a code?</p>
                                <p>Visit the HR desk at the event to get your unique registration code.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center">
                <p className="text-sm text-[var(--muted)]">
                    FNB End-of-Year Celebration
                </p>
            </footer>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="spinner w-8 h-8" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
