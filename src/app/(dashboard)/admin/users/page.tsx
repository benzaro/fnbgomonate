"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

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
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newUser,
                    createdBy: auth.currentUser?.uid,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create user");
            }

            alert(`User created successfully!\n\nDefault password: changeme\n\nThe user will be prompted to change their password on first login.`);
            setIsModalOpen(false);
            setNewUser({ email: "", firstName: "", lastName: "", role: "hr" });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            alert(error instanceof Error ? error.message : "Failed to create user");
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
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">System Users</h1>
                    <p className="text-[var(--muted)] mt-1">Manage HR and Scanner accounts</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-0 btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--background)]">
                        <tr>
                            <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">User</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Role</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Email</th>
                            <th className="px-3 py-4 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Status</th>
                            <th className="relative py-4 pl-3 pr-6"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <div className="spinner w-8 h-8 mx-auto" />
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-[var(--muted)]">No users found</p>
                                    <p className="text-sm text-[var(--muted-foreground)]">Add HR or Scanner users to get started</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-[var(--background)] transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'hr' ? 'bg-[var(--fnb-teal-light)]' : 'bg-[var(--fnb-orange-light)]'}`}>
                                                <span className={`text-sm font-semibold ${user.role === 'hr' ? 'text-[var(--fnb-teal)]' : 'text-[var(--fnb-orange)]'}`}>
                                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--foreground)]">{user.firstName} {user.lastName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'hr' ? 'badge-teal' : 'badge-orange'}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-[var(--muted)]">{user.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                                        <button
                                            onClick={() => toggleStatus(user.id, user.isActive)}
                                            className={`text-sm font-medium transition-colors ${user.isActive ? 'text-[var(--error)] hover:text-[var(--error-foreground)]' : 'text-[var(--fnb-teal)] hover:text-[var(--fnb-teal-dark)]'}`}
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

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-[var(--background-card)] rounded-2xl shadow-xl max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border-light)]">
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Add New User</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
                                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "hr" | "scanner" })}
                                    className="input-base w-full text-[var(--foreground)]"
                                >
                                    <option value="hr">HR Staff</option>
                                    <option value="scanner">Scanner Operator</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="input-base w-full text-[var(--foreground)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="input-base w-full text-[var(--foreground)]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="input-base w-full text-[var(--foreground)]"
                                    placeholder="user@fnb.co.bw"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost px-4 py-2.5 rounded-xl font-medium border border-[var(--border)]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60">
                                    {creating ? <div className="spinner w-4 h-4" /> : null}
                                    {creating ? "Creating..." : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
