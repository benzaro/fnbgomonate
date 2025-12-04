ÜK"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Loader2, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        // We use a timeout to ensure the DOM element exists
        const timer = setTimeout(() => {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
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

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
        // Handle the scanned code
        if (!processing) {
            handleRedemption(decodedText);
        }
    };

    const onScanFailure = (error: any) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
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
            // Pause scanner if running? 
            // scannerRef.current?.pause(); 

            await runTransaction(db, async (transaction) => {
                // 1. Find QR Code
                const qrCodesRef = collection(db, "qrCodes");
                let q = query(qrCodesRef, where("id", "==", code));
                let snapshot = await getDocs(q);

                if (snapshot.empty) {
                    // Try 6-digit code
                    q = query(qrCodesRef, where("sixDigitCode", "==", code.toUpperCase()));
                    snapshot = await getDocs(q);
                }

                if (snapshot.empty) {
                    throw new Error("Invalid QR Code");
                }

                const qrDoc = snapshot.docs[0];
                const qrData = qrDoc.data();
                const qrDocRef = doc(db, "qrCodes", qrDoc.id);

                if (!qrData.isActive) {
                    throw new Error("QR Code is inactive");
                }

                // 2. Get Employee
                const empDocRef = doc(db, "employees", qrData.employeeId);
                const empDoc = await transaction.get(empDocRef);

                if (!empDoc.exists()) {
                    throw new Error("Employee not found");
                }

                const empData = empDoc.data();

                // 3. Check Balance
                if (empData.tokenBalance <= 0) {
                    throw new Error(`Insufficient tokens. Balance: ${empData.tokenBalance}`);
                }

                // 4. Deduct Token & Log Transaction
                const newBalance = empData.tokenBalance - 1;
                transaction.update(empDocRef, { tokenBalance: newBalance });

                // Create transaction record
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
            }).then((result) => {
                setMessage({
                    type: "success",
                    text: `Redeemed! ${result.firstName} has ${result.newBalance} tokens left.`,
                });
            });

        } catch (error: any) {
            console.error("Redemption error:", error);
            setMessage({
                type: "error",
                text: error.message || "Redemption failed",
            });
        } finally {
            setProcessing(false);
            setManualCode("");
            // scannerRef.current?.resume();
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setMessage(null);
        setProcessing(false);
    };

    return (
        <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Scan Drink Token</h1>

            {/* Scanner Area */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div id="reader" className="w-full"></div>
                <p className="text-sm text-gray-500 text-center mt-2">
                    Position the QR code within the frame
                </p>
            </div>

            {/* Manual Entry */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 uppercase"
                        disabled={processing}
                    />
                    <button
                        type="submit"
                        disabled={processing || !manualCode}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {processing ? <Loader2 className="animate-spin h-5 w-5" /> : "Redeem"}
                    </button>
                </form>
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`rounded-md p-4 ${message.type === 'success' ? 'bg-green-50' :
                        message.type === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                    }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                                message.type === 'error' ? <XCircle className="h-5 w-5 text-red-400" /> :
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" />}
                        </div>
                        <div className="ml-3">
                            <h3 className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' :
                                    message.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                                }`}>
                                {message.type === 'success' ? 'Success' :
                                    message.type === 'error' ? 'Error' : 'Warning'}
                            </h3>
                            <div className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-700' :
                                    message.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                <p>{message.text}</p>
                            </div>
                            {message.type !== 'success' && (
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={resetScanner}
                                        className={`text-sm font-medium ${message.type === 'error' ? 'text-red-600 hover:text-red-500' : 'text-yellow-600 hover:text-yellow-500'
                                            }`}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
ÜK*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272ofile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/scanner/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb