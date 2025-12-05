"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { userData } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && userData) {
            if (userData.role === "superadmin") router.push("/admin");
            else if (userData.role === "hr") router.push("/hr");
            else if (userData.role === "scanner") router.push("/scanner");
        }
    }, [userData, loading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Log Firebase config for debugging
            if (!auth) {
                console.error("Firebase auth not initialized");
                setError("System error: Firebase not initialized. Please refresh the page.");
                return;
            }

            await signInWithEmailAndPassword(auth, email, password);
            // AuthContext will handle state update and redirect
        } catch (err: unknown) {
            console.error("Login error details:", err);

            // Provide more specific error messages
            if (err instanceof Error) {
                const errorMessage = err.message.toLowerCase();

                if (errorMessage.includes("invalid-email") || errorMessage.includes("user-not-found")) {
                    setError("Email not found");
                } else if (errorMessage.includes("wrong-password")) {
                    setError("Incorrect password");
                } else if (errorMessage.includes("too-many-requests")) {
                    setError("Too many login attempts. Please try again later.");
                } else if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
                    setError("Network error. Please check your connection and try again.");
                } else {
                    setError(err.message || "Invalid email or password");
                }
            } else {
                setError("Invalid email or password");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--background)]">
            {/* Left Panel - Brand */}
            <div className="hidden lg:flex lg:w-1/2 gradient-teal relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--fnb-orange)] rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <Image
                        src="/fnb.svg"
                        alt="FNB Logo"
                        width={140}
                        height={140}
                        className="mb-8 drop-shadow-lg"
                    />
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                        Go<span className="text-[var(--fnb-orange)]">Monate</span>
                    </h1>
                    <p className="text-xl text-white/80 text-center max-w-md">
                        Streamlined beverage management for FNB corporate events
                    </p>

                    {/* Feature List */}
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span>Real-time token tracking</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span>Instant QR code redemption</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/90">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span>Comprehensive analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
                <div className="w-full max-w-md mx-auto">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <Image
                            src="/fnb.svg"
                            alt="FNB Logo"
                            width={80}
                            height={80}
                            className="mb-4"
                        />
                        <h1 className="text-2xl font-bold text-[var(--foreground)]">
                            Go<span className="text-[var(--fnb-teal)]">Monate</span>
                        </h1>
                    </div>

                    {/* Form Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-[var(--muted)]">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-[var(--foreground)] mb-2"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-base w-full text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                                placeholder="you@fnb.co.bw"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-[var(--foreground)] mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-base w-full text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                                placeholder="Enter your password"
                            />
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
                            disabled={loading}
                            className="btn-primary w-full py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="text-sm text-[var(--muted)] hover:text-[var(--fnb-teal)] transition-colors"
                        >
                            &larr; Back to home
                        </Link>
                    </div>

                    {/* Help Text */}
                    <div className="mt-12 p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border-light)]">
                        <p className="text-sm text-[var(--muted)] text-center">
                            <span className="font-medium text-[var(--foreground)]">Need help?</span>
                            <br />
                            Contact your administrator for login credentials
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
