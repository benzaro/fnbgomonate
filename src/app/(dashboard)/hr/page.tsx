"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { QRCodeCanvas } from "qrcode.react";

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    registrationStatus: "pending" | "code_assigned" | "registered";
    tokenBalance: number;
    qrCodeId?: string;
}

interface QRCodeData {
    id: string;
    sixDigitCode: string;
    qrCodeUrl: string;
}

export default function HRDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [assignedQR, setAssignedQR] = useState<QRCodeData | null>(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchEmployees();
            } else {
                setEmployees([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchEmployees = async () => {
        setLoading(true);
        try {
            const employeesRef = collection(db, "employees");
            const q = query(
                employeesRef,
                where("email", ">=", searchTerm),
                where("email", "<=", searchTerm + "\uf8ff")
            );

            const snapshot = await getDocs(q);
            const results: Employee[] = [];
            snapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() } as Employee);
            });

            setEmployees(results);
        } catch (error) {
            console.error("Error searching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateSixDigitCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleAssignCode = async () => {
        if (!selectedEmployee) return;
        setAssigning(true);
        try {
            const sixDigitCode = generateSixDigitCode();
            const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await addDoc(collection(db, "qrCodes"), {
                id: qrCodeId,
                sixDigitCode: sixDigitCode,
                employeeId: selectedEmployee.id,
                isActive: true,
                isRegistered: false,
                assignedAt: serverTimestamp(),
                assignedBy: auth.currentUser?.uid,
                expiresAt: null,
            });

            await updateDoc(doc(db, "employees", selectedEmployee.id), {
                registrationStatus: "code_assigned",
                qrCodeId: qrCodeId,
                tokenBalance: 18,
            });

            setAssignedQR({
                id: qrCodeId,
                sixDigitCode: sixDigitCode,
                qrCodeUrl: `https://gomonate.app/register?code=${qrCodeId}`,
            });

            searchEmployees();
        } catch (error) {
            console.error("Error assigning code:", error);
            alert("Failed to assign code");
        } finally {
            setAssigning(false);
        }
    };

    const openAssignModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setAssignedQR(null);
        setIsAssignModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "registered":
                return "badge-teal";
            case "code_assigned":
                return "badge-orange";
            default:
                return "bg-[var(--warning-light)] text-[var(--warning-foreground)]";
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Employee Search</h1>
                <p className="text-[var(--muted)] mt-1">
                    Search for employees to assign or reassign QR codes
                </p>
            </div>

            {/* Search Box */}
            <div className="max-w-2xl mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="input-base w-full pl-12 pr-4 py-4 text-lg"
                        placeholder="Search by employee email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <div className="spinner w-5 h-5" />
                        </div>
                    )}
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--background)]">
                        <tr>
                            <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                                Employee
                            </th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                                Email
                            </th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                                Status
                            </th>
                            <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                                Tokens
                            </th>
                            <th scope="col" className="relative py-4 pl-3 pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <div className="spinner w-8 h-8 mx-auto" />
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-[var(--muted)]">
                                        {searchTerm ? "No employees found" : "Start typing to search employees"}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-[var(--background)] transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--fnb-teal-light)] flex items-center justify-center">
                                                <span className="text-sm font-semibold text-[var(--fnb-teal)]">
                                                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--foreground)]">
                                                    {employee.firstName} {employee.lastName}
                                                </p>
                                                <p className="text-sm text-[var(--muted)]">{employee.mobileNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--muted)]">
                                        {employee.email}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(employee.registrationStatus)}`}>
                                            {employee.registrationStatus.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className="text-sm font-medium text-[var(--foreground)]">
                                            {employee.tokenBalance || 0}
                                        </span>
                                        <span className="text-sm text-[var(--muted)]"> / 18</span>
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                                        <button
                                            onClick={() => openAssignModal(employee)}
                                            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                                        >
                                            {employee.registrationStatus === "pending" ? "Assign Code" : "Reassign"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assignment Modal */}
            {isAssignModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-[var(--background-card)] rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border-light)]">
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">
                                {assignedQR ? "Code Assigned Successfully" : `Assign Code to ${selectedEmployee.firstName}`}
                            </h2>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
                            >
                                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {!assignedQR ? (
                                <>
                                    <p className="text-[var(--muted)] mb-6">
                                        This will generate a new QR code and 6-digit code for the employee.
                                        {selectedEmployee.registrationStatus !== "pending" && (
                                            <span className="block mt-2 text-[var(--fnb-orange)]">
                                                The previous code will be deactivated.
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setIsAssignModalOpen(false)}
                                            className="btn-ghost px-4 py-2.5 rounded-xl font-medium border border-[var(--border)]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAssignCode}
                                            disabled={assigning}
                                            className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60"
                                        >
                                            {assigning ? (
                                                <>
                                                    <div className="spinner w-4 h-4" />
                                                    Generating...
                                                </>
                                            ) : (
                                                "Generate Code"
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    {/* QR Code */}
                                    <div className="flex justify-center mb-6">
                                        <div className="p-4 bg-white rounded-2xl shadow-inner">
                                            <QRCodeCanvas value={assignedQR.id} size={200} level="H" />
                                        </div>
                                    </div>

                                    {/* 6-digit Code */}
                                    <div className="mb-6">
                                        <p className="text-sm text-[var(--muted)] mb-2">6-Digit Code</p>
                                        <p className="text-4xl font-mono font-bold tracking-[0.4em] text-[var(--foreground)]">
                                            {assignedQR.sixDigitCode}
                                        </p>
                                    </div>

                                    {/* Instructions */}
                                    <div className="bg-[var(--fnb-teal-light)] rounded-xl p-4 mb-6 text-left">
                                        <p className="text-sm font-medium text-[var(--fnb-teal-dark)] mb-2">
                                            Registration Instructions:
                                        </p>
                                        <ol className="list-decimal list-inside text-sm text-[var(--fnb-teal-dark)]/80 space-y-1">
                                            <li>Ask employee to scan this QR code</li>
                                            <li>Or visit <strong>gomonate.app/register</strong></li>
                                            <li>Enter code: <strong>{assignedQR.sixDigitCode}</strong></li>
                                        </ol>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => window.print()}
                                            className="w-full btn-ghost px-4 py-3 rounded-xl font-medium border border-[var(--border)] flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                            </svg>
                                            Print Code
                                        </button>
                                        <button
                                            onClick={() => setIsAssignModalOpen(false)}
                                            className="w-full btn-primary px-4 py-3 rounded-xl font-medium"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
