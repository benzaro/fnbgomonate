©€"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Loader2, Search, QrCode, Printer, X } from "lucide-react";
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
    qrCodeUrl: string; // We'll generate this client-side for display
}

export default function HRDashboard() {
    const [searchTerm, setSearchTerm] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [assignedQR, setAssignedQR] = useState<QRCodeData | null>(null);

    // Debounced search
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
            // Firestore doesn't support full-text search natively.
            // We'll implement a simple prefix search on email or mobile for now.
            // For name search, we'd need a third-party service like Algolia or a workaround.
            // Workaround: Fetch all (if small dataset) or rely on exact match for mobile/email.
            // Let's try to search by email prefix

            const employeesRef = collection(db, "employees");
            // Simple prefix search for email
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
            // 1. Generate unique codes
            const sixDigitCode = generateSixDigitCode();
            const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // 2. Create QR Code document
            await addDoc(collection(db, "qrCodes"), {
                id: qrCodeId, // We might use doc.id instead, but let's keep a custom ID field if needed
                sixDigitCode: sixDigitCode,
                employeeId: selectedEmployee.id,
                isActive: true,
                isRegistered: false,
                assignedAt: serverTimestamp(),
                assignedBy: auth.currentUser?.uid,
                expiresAt: null, // Set based on event config
            });

            // 3. Update Employee document
            await updateDoc(doc(db, "employees", selectedEmployee.id), {
                registrationStatus: "code_assigned",
                qrCodeId: qrCodeId,
                tokenBalance: 18, // Initialize tokens
            });

            // 4. Show success modal with QR code
            setAssignedQR({
                id: qrCodeId,
                sixDigitCode: sixDigitCode,
                qrCodeUrl: `https://gomonate.app/register?code=${qrCodeId}`, // Example URL
            });

            // Refresh employee list
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

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Employee Search</h1>
            <p className="mt-2 text-sm text-gray-700">
                Search for employees to assign QR codes or manage their status.
            </p>

            <div className="mt-6 max-w-xl">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3 border"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tokens</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
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
                                            <td colSpan={5} className="text-center py-4 text-gray-500">
                                                {searchTerm ? "No employees found" : "Start typing to search..."}
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {employee.firstName} {employee.lastName}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                            ${employee.registrationStatus === 'registered' ? 'bg-green-100 text-green-800' :
                                                            employee.registrationStatus === 'code_assigned' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                        {employee.registrationStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{employee.tokenBalance}</td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={() => openAssignModal(employee)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        {employee.registrationStatus === 'pending' ? 'Assign Code' : 'Reassign Code'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            {isAssignModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-medium">
                                {assignedQR ? "Code Assigned Successfully" : `Assign Code to ${selectedEmployee.firstName}`}
                            </h2>
                            <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {!assignedQR ? (
                            <div>
                                <p className="text-sm text-gray-500 mb-4">
                                    This will generate a new QR code and 6-digit code for the employee.
                                    {selectedEmployee.registrationStatus !== 'pending' && " The previous code will be deactivated."}
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAssignModalOpen(false)}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAssignCode}
                                        disabled={assigning}
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {assigning ? <Loader2 className="animate-spin h-4 w-4" /> : "Generate Code"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <QRCodeCanvas value={assignedQR.id} size={200} />
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500">6-Digit Code</p>
                                    <p className="text-3xl font-bold tracking-widest text-gray-900">{assignedQR.sixDigitCode}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
                                    <p className="text-sm text-blue-800 font-medium mb-1">Registration Instructions:</p>
                                    <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                                        <li>Ask employee to scan this QR code</li>
                                        <li>Or visit <strong>gomonate.app/register</strong></li>
                                        <li>Enter code: <strong>{assignedQR.sixDigitCode}</strong></li>
                                    </ol>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="w-full inline-flex justify-center items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 mb-3"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Code
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
©€*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272jfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/hr/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb