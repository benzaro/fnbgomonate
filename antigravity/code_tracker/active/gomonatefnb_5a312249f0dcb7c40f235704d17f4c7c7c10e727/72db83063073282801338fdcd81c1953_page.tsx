ûD"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, RefreshCw, History, Beer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface EmployeeData {
    id: string;
    firstName: string;
    lastName: string;
    tokenBalance: number;
}

interface Transaction {
    id: string;
    timestamp: any;
    tokensAfter: number;
}

export default function EmployeeDashboard() {
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState<EmployeeData | null>(null);
    const [qrCodeId, setQrCodeId] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchEmployeeData = async () => {
            const storedCodeId = localStorage.getItem("gomonate_employee_code");

            if (!storedCodeId) {
                router.push("/register");
                return;
            }

            try {
                // 1. Get QR Code Doc
                // We search by ID or we assume storedCodeId is the doc ID
                // Let's assume it is the doc ID from the register page
                const qrDocRef = doc(db, "qrCodes", storedCodeId);
                const qrDoc = await getDoc(qrDocRef);

                if (!qrDoc.exists()) {
                    // Try searching by 6-digit code just in case
                    const q = query(collection(db, "qrCodes"), where("sixDigitCode", "==", storedCodeId));
                    const snapshot = await getDocs(q);
                    if (snapshot.empty) {
                        router.push("/register");
                        return;
                    }
                    // Found by 6-digit code
                    const data = snapshot.docs[0].data();
                    setQrCodeId(snapshot.docs[0].id);
                    await loadEmployee(data.employeeId);
                } else {
                    // Found by doc ID
                    const data = qrDoc.data();
                    setQrCodeId(qrDoc.id);
                    await loadEmployee(data.employeeId);
                }

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        const loadEmployee = async (employeeId: string) => {
            const empDoc = await getDoc(doc(db, "employees", employeeId));
            if (empDoc.exists()) {
                setEmployee({ id: empDoc.id, ...empDoc.data() } as EmployeeData);

                // Load recent transactions
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
            }
        };

        fetchEmployeeData();
    }, [router]);

    const refreshData = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    if (!employee || !qrCodeId) {
        return null; // Will redirect
    }

    const percentage = (employee.tokenBalance / 18) * 100;
    let colorClass = "bg-green-500";
    if (employee.tokenBalance < 5) colorClass = "bg-red-500";
    else if (employee.tokenBalance < 10) colorClass = "bg-yellow-500";

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {employee.firstName}</h1>
                    <p className="text-sm text-gray-500">FNB End-of-Year Celebration</p>
                </div>

                {/* Token Balance Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Token Balance</h2>
                        <Beer className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                    Available
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-blue-600">
                                    {employee.tokenBalance} / 18
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-200">
                            <div style={{ width: `${percentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${colorClass} transition-all duration-500`}></div>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-4xl font-bold text-gray-900">{employee.tokenBalance}</span>
                        <span className="text-gray-500 ml-2">tokens remaining</span>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 flex flex-col items-center">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Your Drink Pass</h2>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <QRCodeCanvas value={qrCodeId} size={250} />
                    </div>
                    <p className="mt-4 text-sm text-gray-500 text-center">
                        Show this QR code at any beverage station to redeem your drinks.
                    </p>
                    <button
                        onClick={refreshData}
                        className="mt-6 flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh Balance
                    </button>
                </div>

                {/* History Card */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                        <History className="h-5 w-5 text-gray-400" />
                    </div>
                    {transactions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No redemptions yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {transactions.map((tx) => (
                                <li key={tx.id} className="py-3 flex justify-between text-sm">
                                    <span className="text-gray-900">Redeemed 1 Token</span>
                                    <span className="text-gray-500">
                                        {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}
ûD*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272pfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/employee/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb