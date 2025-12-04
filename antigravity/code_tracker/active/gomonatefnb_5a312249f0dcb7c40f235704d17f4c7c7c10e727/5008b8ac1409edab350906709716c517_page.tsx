š¦"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, getCountFromServer, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Loader2, Plus, Upload, Search, FileText } from "lucide-react";

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
            // Limit to 50 for initial load, implement pagination later
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
            const rows = text.split("\n").slice(1); // Skip header
            let successCount = 0;
            let failedCount = 0;

            for (const row of rows) {
                if (!row.trim()) continue;
                const [firstName, lastName, email, mobileNumber] = row.split(",");

                if (firstName && lastName && email && mobileNumber) {
                    try {
                        // Check for duplicate email (simple check)
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
                            failedCount++; // Duplicate
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

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage employee list and imports.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
                    <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Mobile</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tokens</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">
                                                <Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-500" />
                                            </td>
                                        </tr>
                                    ) : employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-gray-500">No employees found</td>
                                        </tr>
                                    ) : (
                                        employees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {employee.firstName} {employee.lastName}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.mobileNumber}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                            ${employee.registrationStatus === 'registered' ? 'bg-green-100 text-green-800' :
                                                            employee.registrationStatus === 'code_assigned' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                        {employee.registrationStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.tokenBalance}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-medium mb-4">Add New Employee</h2>
                        <form onSubmit={handleCreateEmployee}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmployee.firstName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEmployee.lastName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newEmployee.email}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="+267..."
                                        value={newEmployee.mobileNumber}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="animate-spin h-4 w-4" /> : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import CSV Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-medium mb-4">Import Employees (CSV)</h2>

                        {!importStats ? (
                            <form onSubmit={handleCsvImport}>
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500">
                                        Upload a CSV file with headers: firstName, lastName, email, mobileNumber
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CSV File</label>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            required
                                            onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(false)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={importing || !csvFile}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {importing ? <Loader2 className="animate-spin h-4 w-4" /> : "Import"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center">
                                <div className="mb-4">
                                    <FileText className="h-12 w-12 text-green-500 mx-auto" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">Import Complete</h3>
                                </div>
                                <dl className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <dt className="text-xs text-gray-500">Total</dt>
                                        <dd className="text-xl font-semibold text-gray-900">{importStats.total}</dd>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <dt className="text-xs text-green-600">Success</dt>
                                        <dd className="text-xl font-semibold text-green-700">{importStats.success}</dd>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <dt className="text-xs text-red-600">Failed</dt>
                                        <dd className="text-xl font-semibold text-red-700">{importStats.failed}</dd>
                                    </div>
                                </dl>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportStats(null);
                                        setCsvFile(null);
                                    }}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
š¦*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272wfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/admin/employees/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb