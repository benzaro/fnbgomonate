"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface ScanHistoryItem {
    id: string;
    employeeName: string;
    timestamp: Date;
    tokensAfter: number;
}

interface CameraInfo {
    id: string;
    label: string;
}

type ScannerState = "initializing" | "streaming" | "error" | "unsupported" | "permission-denied";

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string; details?: string } | null>(null);
    const [sessionScans, setSessionScans] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [cameras, setCameras] = useState<CameraInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    const [scannerState, setScannerState] = useState<ScannerState>("initializing");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [switchingCamera, setSwitchingCamera] = useState(false);

    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const initializingRef = useRef<boolean>(false);
    const cleanupRef = useRef<boolean>(false);
    const mountedRef = useRef<boolean>(true);

    // Stop scanner
    const stopScanner = useCallback(async () => {
        if (qrScannerRef.current) {
            try {
                const state = qrScannerRef.current.getState();
                if (state === 2) { // 2 = SCANNING state
                    await qrScannerRef.current.stop();
                }
                await qrScannerRef.current.clear();
                qrScannerRef.current = null;
            } catch (error) {
                console.error("Scanner cleanup error:", error);
            }
        }
        const container = document.getElementById("qr-scanner-container");
        if (container) {
            container.innerHTML = "";
        }
    }, []);

    // Initialize cameras and scanner on mount
    useEffect(() => {
        mountedRef.current = true;

        ;(async () => {
            try {
                if (initializingRef.current) return;
                initializingRef.current = true;
                setScannerState("initializing");
                setErrorMessage("");

                // Wait for DOM to be ready
                await new Promise(resolve => setTimeout(resolve, 0));

                if (cleanupRef.current || !mountedRef.current) return;

                const container = document.getElementById("qr-scanner-container");
                if (!container) {
                    setScannerState("error");
                    setErrorMessage("Scanner initialization failed. Please refresh the page.");
                    initializingRef.current = false;
                    return;
                }

                // Get available cameras
                const devices = await Html5Qrcode.getCameras();
                if (cleanupRef.current || !mountedRef.current) return;

                if (!devices || devices.length === 0) {
                    setScannerState("unsupported");
                    setErrorMessage("No camera device found on this device.");
                    initializingRef.current = false;
                    return;
                }

                // Set available cameras
                const cameraList: CameraInfo[] = devices.map(device => ({
                    id: device.id,
                    label: device.label || `Camera ${devices.indexOf(device) + 1}`,
                }));
                setCameras(cameraList);

                // Get stored preference or auto-select back camera
                const storedCameraId = localStorage.getItem("gomonate_selected_camera");
                let cameraToUse = storedCameraId || "";

                if (!cameraToUse) {
                    // Try to find back camera
                    const backCamera = cameraList.find(
                        (c) =>
                            c.label.toLowerCase().includes("back") ||
                            c.label.toLowerCase().includes("rear") ||
                            c.label.toLowerCase().includes("environment")
                    );
                    cameraToUse = backCamera ? backCamera.id : cameraList[0].id;
                }

                setSelectedCamera(cameraToUse);

                if (cleanupRef.current || !mountedRef.current || qrScannerRef.current) {
                    initializingRef.current = false;
                    return;
                }

                // Clear container before creating new instance
                container.innerHTML = "";
                const qrScanner = new Html5Qrcode("qr-scanner-container");
                qrScannerRef.current = qrScanner;

                // Start scanner
                await qrScanner.start(
                    cameraToUse,
                    {
                        fps: 10,
                        qrbox: { width: 280, height: 280 },
                    },
                    onScanSuccess,
                    (error) => {
                        console.debug("QR scan error:", error);
                    }
                );

                if (!cleanupRef.current && mountedRef.current) {
                    setScannerState("streaming");
                    initializingRef.current = false;
                } else {
                    await stopScanner();
                    initializingRef.current = false;
                }
            } catch (error: unknown) {
                if (cleanupRef.current || !mountedRef.current) {
                    initializingRef.current = false;
                    return;
                }

                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error("Scanner initialization error:", error);

                if (errorMsg.includes("Permission denied") || errorMsg.includes("NotAllowedError")) {
                    setScannerState("permission-denied");
                    setErrorMessage("Camera permission denied. Please enable camera access in your browser settings.");
                } else if (errorMsg.includes("NotFoundError")) {
                    setScannerState("unsupported");
                    setErrorMessage("No camera found on this device.");
                } else if (errorMsg.includes("NotSupportedError")) {
                    setScannerState("unsupported");
                    setErrorMessage("Camera access not supported by this browser.");
                } else {
                    setScannerState("error");
                    setErrorMessage(errorMsg || "Failed to initialize camera. Please try again.");
                }
                initializingRef.current = false;
            }
        })();

        return () => {
            cleanupRef.current = true;
            initializingRef.current = false;
            mountedRef.current = false;
            stopScanner();
        };
    }, [stopScanner]);

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

                return { newBalance, firstName: empData.firstName || "", lastName: empData.lastName || "" };
            });

            setMessage({
                type: "success",
                text: `Token Redeemed!`,
                details: `${result.firstName} has ${result.newBalance} tokens remaining`,
            });
            setSessionScans(prev => prev + 1);
            addToLocalHistory(`${result.firstName} ${result.lastName}`, result.newBalance);

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

    const handleCameraChange = async (cameraId: string) => {
        setSwitchingCamera(true);
        try {
            localStorage.setItem("gomonate_selected_camera", cameraId);
            setSelectedCamera(cameraId);

            // Stop current scanner
            await stopScanner();

            // Reinitialize with new camera
            initializingRef.current = false;
            cleanupRef.current = false;
            setScannerState("initializing");

            // Trigger reinitialization by clearing refs
            if (qrScannerRef.current) {
                qrScannerRef.current = null;
            }

            // Create new scanner instance with selected camera
            await new Promise(resolve => setTimeout(resolve, 100));

            const container = document.getElementById("qr-scanner-container");
            if (container) {
                container.innerHTML = "";
            }

            const qrScanner = new Html5Qrcode("qr-scanner-container");
            qrScannerRef.current = qrScanner;

            await qrScanner.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 280, height: 280 },
                },
                onScanSuccess,
                (error) => {
                    console.debug("QR scan error:", error);
                }
            );

            setScannerState("streaming");
        } catch (error) {
            console.error("Error switching camera:", error);
            setScannerState("error");
            setErrorMessage("Failed to switch camera. Please try again.");
        } finally {
            setSwitchingCamera(false);
        }
    };

    const fetchScanHistory = async () => {
        if (!auth.currentUser) return;

        setLoadingHistory(true);
        try {
            const transactionsRef = collection(db, "transactions");
            const q = query(
                transactionsRef,
                where("scannerId", "==", auth.currentUser.uid),
                orderBy("timestamp", "desc"),
                limit(50)
            );
            const snapshot = await getDocs(q);

            const historyItems: ScanHistoryItem[] = [];

            for (const txDoc of snapshot.docs) {
                const txData = txDoc.data();
                // Fetch employee name
                const empDoc = await getDocs(query(collection(db, "employees"), where("__name__", "==", txData.employeeId)));
                let employeeName = "Unknown";
                if (!empDoc.empty) {
                    const empData = empDoc.docs[0].data();
                    employeeName = `${empData.firstName} ${empData.lastName}`;
                }

                historyItems.push({
                    id: txDoc.id,
                    employeeName,
                    timestamp: txData.timestamp?.toDate() || new Date(),
                    tokensAfter: txData.tokensAfter,
                });
            }

            setScanHistory(historyItems);
        } catch (error) {
            console.error("Error fetching scan history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const toggleHistory = () => {
        if (!showHistory) {
            fetchScanHistory();
        }
        setShowHistory(!showHistory);
    };

    // Add new scan to local history without refetching
    const addToLocalHistory = (employeeName: string, tokensAfter: number) => {
        const newItem: ScanHistoryItem = {
            id: Date.now().toString(),
            employeeName,
            timestamp: new Date(),
            tokensAfter,
        };
        setScanHistory(prev => [newItem, ...prev]);
    };

    // Handle error states
    if (scannerState === "unsupported") {
        return (
            <div className="max-w-lg mx-auto animate-fade-in">
                <div className="rounded-2xl p-6 bg-red-500/20 border border-red-500/30">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-red-400 mb-2">Camera Not Supported</h3>
                            <p className="text-white/70 mb-4">{errorMessage}</p>
                            <p className="text-white/50 text-sm">Use manual input instead to proceed.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (scannerState === "permission-denied") {
        return (
            <div className="max-w-lg mx-auto animate-fade-in">
                <div className="rounded-2xl p-6 bg-orange-500/20 border border-orange-500/30">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-orange-400 mb-2">Camera Permission Denied</h3>
                            <p className="text-white/70 mb-4">{errorMessage}</p>
                            <div className="bg-white/5 rounded p-3 mb-4 text-left text-xs text-white/60">
                                <p className="font-medium mb-2 text-orange-300">To enable camera:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Click the lock icon in your address bar</li>
                                    <li>Find "Camera" and set it to "Allow"</li>
                                    <li>Refresh the page</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (scannerState === "error") {
        return (
            <div className="max-w-lg mx-auto animate-fade-in">
                <div className="rounded-2xl p-6 bg-red-500/20 border border-red-500/30">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-red-400 mb-2">Camera Error</h3>
                            <p className="text-white/70">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Scan Drink Token</h1>
                <p className="text-white/60">Position QR code within the frame or enter code manually</p>
            </div>

            {/* Camera Selector */}
            {cameras.length > 1 && (
                <div className="mb-6 flex gap-3 items-center">
                    <label htmlFor="camera-select" className="text-sm font-medium text-white/70 whitespace-nowrap">
                        Camera:
                    </label>
                    <select
                        id="camera-select"
                        value={selectedCamera}
                        onChange={(e) => handleCameraChange(e.target.value)}
                        disabled={switchingCamera || scannerState !== "streaming"}
                        className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-[var(--fnb-teal)] focus:ring-2 focus:ring-[var(--fnb-teal)]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cameras.map((camera) => (
                            <option key={camera.id} value={camera.id}>
                                {camera.label}
                            </option>
                        ))}
                    </select>
                    {switchingCamera && (
                        <div className="flex items-center gap-2 text-white/70">
                            <div className="spinner w-4 h-4 border-white/30 border-t-white" />
                        </div>
                    )}
                </div>
            )}

            {/* Scanner Area */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/10 relative overflow-hidden flex justify-center">
                {scannerState === "initializing" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm z-10">
                        <div className="text-center">
                            <div className="spinner w-8 h-8 mx-auto mb-3 border-white/30 border-t-white" />
                            <p className="text-white/70 text-sm">Initializing camera...</p>
                        </div>
                    </div>
                )}
                <div id="qr-scanner-container" className="overflow-hidden rounded-xl w-80 h-80" />
            </div>

            {/* Manual Entry */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
                <p className="text-sm text-white/60 mb-4">Or enter 6-digit code manually:</p>
                <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="A1B2C3"
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-center text-xl font-mono tracking-[0.3em] uppercase placeholder:text-white/30 focus:border-[var(--fnb-teal)] focus:ring-2 focus:ring-[var(--fnb-teal)]/20 outline-none transition-all"
                        disabled={processing}
                        maxLength={6}
                    />
                    <div className="flex justify-center">
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
                    </div>
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
                    <p className="text-2xl font-bold text-[var(--fnb-teal)]">{sessionScans}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Status</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                        <p className="text-lg font-semibold text-white">Ready</p>
                    </div>
                </div>
            </div>

            {/* View History Link */}
            <div className="mt-6 text-center">
                <button
                    onClick={toggleHistory}
                    className="inline-flex items-center gap-2 text-[var(--fnb-teal)] hover:text-[var(--fnb-teal-light)] transition-colors text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showHistory ? "Hide Scan History" : "View Scan History"}
                    <svg className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Scan History Panel */}
            {showHistory && (
                <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Scan History</h3>
                        <button
                            onClick={fetchScanHistory}
                            disabled={loadingHistory}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                            title="Refresh history"
                        >
                            <svg className={`w-4 h-4 text-white/70 ${loadingHistory ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {loadingHistory ? (
                        <div className="p-8 text-center">
                            <div className="spinner w-6 h-6 mx-auto border-white/30 border-t-white" />
                            <p className="text-white/50 mt-2 text-sm">Loading history...</p>
                        </div>
                    ) : scanHistory.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-white/50 text-sm">No scans yet</p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wide">Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wide">Employee</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wide">Remaining</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {scanHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-sm text-white/70">
                                                {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                <span className="block text-xs text-white/40">
                                                    {item.timestamp.toLocaleDateString([], { month: "short", day: "numeric" })}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-white font-medium">{item.employeeName}</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    item.tokensAfter <= 3
                                                        ? "bg-[var(--error)]/20 text-[var(--error)]"
                                                        : item.tokensAfter <= 8
                                                        ? "bg-[var(--fnb-orange)]/20 text-[var(--fnb-orange)]"
                                                        : "bg-[var(--fnb-teal)]/20 text-[var(--fnb-teal)]"
                                                }`}>
                                                    {item.tokensAfter} left
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

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
