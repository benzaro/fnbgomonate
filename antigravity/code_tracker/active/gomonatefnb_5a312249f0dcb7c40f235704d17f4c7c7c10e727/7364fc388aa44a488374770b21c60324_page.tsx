Ìp"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Loader2, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { httpsCallable, getFunctions } from "firebase/functions";

// Note: Creating users with specific roles usually requires a backend function (Firebase Admin SDK)
// because client-side SDK cannot set custom claims or create users without logging them in.
// For this prototype, we'll simulate the UI and assume a Cloud Function `createUser` exists
// or we'll use a workaround if we can't deploy functions yet.
// Workaround: We can't easily create secondary users from the client side while logged in as Admin.
// We will implement the UI and the Firestore logic, but the actual Auth user creation 
// would typically need a Cloud Function. 
// For now, we will just create the Firestore document to represent the user in the system.

interface SystemUser {
    id: string;
    email: string;
    role: "hr" | "scanner";
    firstName: string;
    lastName: string;
    isActive: boolean;
}

export default function UserManagement() {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        email: "",
        firstName: "",
        lastName: "",
        role: "hr" as "hr" | "scanner",
    });
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "in", ["hr", "scanner"]));
            const querySnapshot = await getDocs(q);
            const usersList: SystemUser[] = [];
            querySnapshot.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() } as SystemUser);
            });
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            // In a real app, call Cloud Function here:
            // const functions = getFunctions();
            // const createUser = httpsCallable(functions, 'createUser');
            // await createUser(newUser);

            // For prototype/demo without Cloud Functions deployed:
            // We'll just add to Firestore. The actual Auth account creation 
            // would need to be done manually or via a separate admin tool if we don't have Functions.
            // However, to make it "work" for the demo, we can just add the Firestore doc.

            await addDoc(collection(db, "users"), {
                ...newUser,
                isActive: true,
                createdAt: serverTimestamp(),
                createdBy: auth.currentUser?.uid,
            });

            setIsModalOpen(false);
            setNewUser({ email: "", firstName: "", lastName: "", role: "hr" });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Failed to create user");
        } finally {
            setCreating(false);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isActive: !currentStatus,
            });
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">System Users</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage HR and Scanner accounts.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
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
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
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
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-gray-500">No users found</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {user.firstName} {user.lastName}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{user.role}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <button
                                                        onClick={() => toggleStatus(user.id, user.isActive)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        {user.isActive ? 'Deactivate' : 'Activate'}
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-lg font-medium mb-4">Add New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "hr" | "scanner" })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    >
                                        <option value="hr">HR</option>
                                        <option value="scanner">Scanner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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
        </div>
    );
}
Ìp*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272sfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/admin/users/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb