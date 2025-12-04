"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string; details?: string } | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 280, height: 280 } },
                    false
                );

                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
            }
        }, 100);

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
            }
            clearTimeout(timer);
        };
    }, []);

    const onScanSuccess = (decodedText: string) => {
        if (!processing) {
            handleRedemption(decodedText);
        }
    };

    const onScanFailure = () => {
        // Silent failure - keep scanning
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleRedemption(manualCode.trim());
        }
    };

    const handleRedemption = async (code: string) => {
        if (processing) return;
        setProcessing(true);
        setMessage(null);
        setScanResult(code);

        try {
            const result = await runTransaction(db, async (transaction) => {
                const qrCodesRef = collection(db, "qrCodes");
                let q = query(qrCodesRef, where("id", "==", code));
                let snapshot = await getDocs(q);

                if (snapshot.empty) {
                    q = query(qrCodesRef, where("sixDigitCode", "==", code.toUpperCase()));
                    snapshot = await getDocs(q);
                }

                if (snapshot.empty) {
                    throw new Error("Invalid QR Code");
                }

                const qrDoc = snapshot.docs[0];
                const qrData = qrDoc.data();

                if (!qrData.isActive) {
                    throw new Error("QR Code is inactive");
                }

                const empDocRef = doc(db, "employees", qrData.employeeId);
                const empDoc = await transaction.get(empDocRef);

                if (!empDoc.exists()) {
                    throw new Error("Employee not found");
                }

                const empData = empDoc.data();

                if (empData.tokenBalance <= 0) {
                    throw new Error(`No tokens remaining`);
                }

                const newBalance = empData.tokenBalance - 1;
                transaction.update(empDocRef, { tokenBalance: newBalance });

                const newTxRef = doc(collection(db, "transactions"));
                transaction.set(newTxRef, {
                    employeeId: qrData.employeeId,
                    qrCodeId: qrDoc.id,
                    scannerId: auth.currentUser?.uid,
                    amount: 1,
                    tokensBefore: empData.tokenBalance,
                    tokensAfter: newBalance,
                    timestamp: serverTimestamp(),
                    type: "redemption",
                });

                return { newBalance, firstName: empData.firstName, lastName: empData.lastName };
            });

            setMessage({
                type: "success",
                text: `Token Redeemed!`,
                details: `${result.firstName} has ${result.newBalance} tokens remaining`,
            });

        } catch (error: unknown) {
            console.error("Redemption error:", error);
            setMessage({
                type: "error",
                text: error instanceof Error ? error.message : "Redemption failed",
            });
        } finally {
            setProcessing(false);
            setManualCode("");
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setMessage(null);
        setProcessing(false);
    };

    return (
        <div className="max-w-lg mx-auto animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Scan Drink Token</h1>
                <p className="text-white/60">Position QR code within the frame or enter code manually</p>
            </div>

            {/* Scanner Area */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/10">
                <div id="reader" className="overflow-hidden rounded-xl" />
            </div>

            {/* Manual Entry */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
                <p className="text-sm text-white/60 mb-4">Or enter 6-digit code manually:</p>
                <form onSubmit={handleManualSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="A1B2C3"
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-xl font-mono tracking-[0.3em] uppercase placeholder:text-white/30 focus:border-[var(--fnb-teal)] focus:ring-2 focus:ring-[var(--fnb-teal)]/20 outline-none transition-all"
                        disabled={processing}
                        maxLength={6}
                    />
                    <button
                        type="submit"
                        disabled={processing || !manualCode || manualCode.length < 6}
                        className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <div className="spinner w-5 h-5 border-white/30 border-t-white" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Redeem
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Feedback Message */}
            {message && (
                <div
                    className={`rounded-2xl p-6 mb-6 animate-fade-in ${
                        message.type === "success"
                            ? "bg-[var(--success)]/20 border border-[var(--success)]/30"
                            : message.type === "error"
                            ? "bg-[var(--error)]/20 border border-[var(--error)]/30"
                            : "bg-[var(--warning)]/20 border border-[var(--warning)]/30"
                    }`}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.type === "success"
                                    ? "bg-[var(--success)]"
                                    : message.type === "error"
                                    ? "bg-[var(--error)]"
                                    : "bg-[var(--warning)]"
                            }`}
                        >
                            {message.type === "success" ? (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : message.type === "error" ? (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3
                                className={`text-lg font-semibold ${
                                    message.type === "success"
                                        ? "text-[var(--success)]"
                                        : message.type === "error"
                                        ? "text-[var(--error)]"
                                        : "text-[var(--warning)]"
                                }`}
                            >
                                {message.text}
                            </h3>
                            {message.details && (
                                <p className="text-white/70 mt-1">{message.details}</p>
                            )}
                            {message.type !== "success" && (
                                <button
                                    onClick={resetScanner}
                                    className="mt-4 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Session Scans</p>
                    <p className="text-2xl font-bold text-[var(--fnb-teal)]">0</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Status</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                        <p className="text-lg font-semibold text-white">Ready</p>
                    </div>
                </div>
            </div>

            {/* Scanner Styles Override */}
            <style jsx global>{`
                #reader {
                    border: none !important;
                }
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__scan_region video {
                    border-radius: 12px !important;
                }
                #reader__dashboard {
                    padding: 16px 0 0 0 !important;
                }
                #reader__dashboard_section_swaplink {
                    color: var(--fnb-teal) !important;
                    text-decoration: none !important;
                }
                #reader__dashboard_section_csr button {
                    background: var(--fnb-teal) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 8px 16px !important;
                    color: white !important;
                    font-weight: 500 !important;
                }
                #reader__filescan_input {
                    display: none !important;
                }
                #reader__status_span {
                    color: rgba(255, 255, 255, 0.7) !important;
                    background: transparent !important;
                }
            `}</style>
        </div>
    );
}
