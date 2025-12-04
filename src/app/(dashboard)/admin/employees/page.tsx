"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, getCountFromServer, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    registrationStatus: "pending" | "code_assigned" | "registered";
    tokenBalance: number;
}

export default function EmployeeManagement() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
    });
    const [creating, setCreating] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [importStats, setImportStats] = useState<{ total: number; success: number; failed: number } | null>(null);

    const fetchEmployees = async () => {
        try {
            const q = query(collection(db, "employees"), orderBy("email"));
            const querySnapshot = await getDocs(q);
            const employeesList: Employee[] = [];
            querySnapshot.forEach((doc) => {
                employeesList.push({ id: doc.id, ...doc.data() } as Employee);
            });
            setEmployees(employeesList);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await addDoc(collection(db, "employees"), {
                ...newEmployee,
                registrationStatus: "pending",
                tokenBalance: 18,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser?.uid,
            });

            setIsModalOpen(false);
            setNewEmployee({ firstName: "", lastName: "", email: "", mobileNumber: "" });
            fetchEmployees();
        } catch (error) {
            console.error("Error creating employee:", error);
            alert("Failed to create employee");
        } finally {
            setCreating(false);
        }
    };

    const handleCsvImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvFile) return;

        setImporting(true);
        setImportStats(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const rows = text.split("\n").slice(1);
            let successCount = 0;
            let failedCount = 0;

            for (const row of rows) {
                if (!row.trim()) continue;
                const [firstName, lastName, email, mobileNumber] = row.split(",");

                if (firstName && lastName && email && mobileNumber) {
                    try {
                        const q = query(collection(db, "employees"), where("email", "==", email.trim()));
                        const snapshot = await getCountFromServer(q);

                        if (snapshot.data().count === 0) {
                            await addDoc(collection(db, "employees"), {
                                firstName: firstName.trim(),
                                lastName: lastName.trim(),
                                email: email.trim(),
                                mobileNumber: mobileNumber.trim(),
                                registrationStatus: "pending",
                                tokenBalance: 18,
                                createdAt: serverTimestamp(),
                                createdBy: auth.currentUser?.uid,
                            });
                            successCount++;
                        } else {
                            failedCount++;
                        }
                    } catch (error) {
                        console.error("Error importing row:", row, error);
                        failedCount++;
                    }
                } else {
                    failedCount++;
                }
            }

            setImportStats({ total: rows.length, success: successCount, failed: failedCount });
            setImporting(false);
            fetchEmployees();
        };
        reader.readAsText(csvFile);
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Employees</h1>
                    <p className="text-[var(--muted)] mt-1">Manage employee list and bulk imports</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="btn-ghost px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 border border-[var(--border)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--background)]">
                        <tr>
                            <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Employee</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Email</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Mobile</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Status</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Tokens</th>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-[var(--muted)]">No employees found</p>
                                    <p className="text-sm text-[var(--muted-foreground)]">Add employees or import from CSV</p>
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
                                            <p className="font-medium text-[var(--foreground)]">{employee.firstName} {employee.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--muted)]">{employee.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--muted)]">{employee.mobileNumber}</td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(employee.registrationStatus)}`}>
                                            {employee.registrationStatus.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className="text-sm font-medium text-[var(--foreground)]">{employee.tokenBalance}</span>
                                        <span className="text-sm text-[var(--muted)]"> / 18</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-[var(--background-card)] rounded-2xl shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border-light)]">
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Add New Employee</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
                                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">First Name</label>
                                    <input type="text" required value={newEmployee.firstName} onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })} className="input-base w-full text-[var(--foreground)]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Last Name</label>
                                    <input type="text" required value={newEmployee.lastName} onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })} className="input-base w-full text-[var(--foreground)]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email</label>
                                <input type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="input-base w-full text-[var(--foreground)]" placeholder="employee@fnb.co.bw" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Mobile Number</label>
                                <input type="text" required placeholder="+267..." value={newEmployee.mobileNumber} onChange={(e) => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })} className="input-base w-full text-[var(--foreground)]" />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost px-4 py-2.5 rounded-xl font-medium border border-[var(--border)]">Cancel</button>
                                <button type="submit" disabled={creating} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60">
                                    {creating ? <div className="spinner w-4 h-4" /> : null}
                                    {creating ? "Creating..." : "Create Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import CSV Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-[var(--background-card)] rounded-2xl shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border-light)]">
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Import Employees (CSV)</h2>
                            <button onClick={() => { setIsImportModalOpen(false); setImportStats(null); setCsvFile(null); }} className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
                                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {!importStats ? (
                            <form onSubmit={handleCsvImport} className="p-6 space-y-4">
                                <div className="p-4 rounded-xl bg-[var(--fnb-teal-light)] border border-[var(--fnb-teal)]/20">
                                    <p className="text-sm text-[var(--fnb-teal-dark)]">
                                        <strong>CSV Format:</strong> firstName, lastName, email, mobileNumber
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">CSV File</label>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        required
                                        onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-sm text-[var(--muted)] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--fnb-teal-light)] file:text-[var(--fnb-teal-dark)] hover:file:bg-[var(--fnb-teal)]/20"
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn-ghost px-4 py-2.5 rounded-xl font-medium border border-[var(--border)]">Cancel</button>
                                    <button type="submit" disabled={importing || !csvFile} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60">
                                        {importing ? <div className="spinner w-4 h-4" /> : null}
                                        {importing ? "Importing..." : "Import"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                                    <svg className="w-8 h-8 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Import Complete</h3>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-[var(--background)]">
                                        <p className="text-xs text-[var(--muted)]">Total</p>
                                        <p className="text-2xl font-bold text-[var(--foreground)]">{importStats.total}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[var(--success-light)]">
                                        <p className="text-xs text-[var(--success-foreground)]">Success</p>
                                        <p className="text-2xl font-bold text-[var(--success)]">{importStats.success}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-[var(--error-light)]">
                                        <p className="text-xs text-[var(--error-foreground)]">Failed</p>
                                        <p className="text-2xl font-bold text-[var(--error)]">{importStats.failed}</p>
                                    </div>
                                </div>
                                <button onClick={() => { setIsImportModalOpen(false); setImportStats(null); setCsvFile(null); }} className="w-full btn-primary py-3 rounded-xl font-medium">Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
