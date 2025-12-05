"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, getDocs, sumDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface DashboardMetrics {
    totalRegistrations: number;
    totalRedeemed: number;
    activeHR: number;
    activeScanners: number;
    redemptionRate: number;
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalRegistrations: 0,
        totalRedeemed: 0,
        activeHR: 0,
        activeScanners: 0,
        redemptionRate: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const employeesColl = collection(db, "employees");
                const registeredQuery = query(employeesColl, where("registrationStatus", "==", "registered"));
                const registeredSnapshot = await getCountFromServer(registeredQuery);

                const usersColl = collection(db, "users");
                const hrQuery = query(usersColl, where("role", "==", "hr"), where("isActive", "==", true));
                const hrSnapshot = await getCountFromServer(hrQuery);

                const scannerQuery = query(usersColl, where("role", "==", "scanner"), where("isActive", "==", true));
                const scannerSnapshot = await getCountFromServer(scannerQuery);

                // Calculate total redeemed from transactions
                const transactionsColl = collection(db, "transactions");
                const transactionsQuery = query(transactionsColl, where("type", "==", "redemption"));
                const transactionsSnapshot = await getDocs(transactionsQuery);

                let totalRedeemed = 0;
                transactionsSnapshot.forEach((doc) => {
                    const txData = doc.data();
                    totalRedeemed += txData.amount || 1; // Sum up amount field, default to 1
                });

                const totalAllocated = registeredSnapshot.data().count * 18;
                const redemptionRate = totalAllocated > 0 ? (totalRedeemed / totalAllocated) * 100 : 0;

                setMetrics({
                    totalRegistrations: registeredSnapshot.data().count,
                    totalRedeemed: totalRedeemed,
                    activeHR: hrSnapshot.data().count,
                    activeScanners: scannerSnapshot.data().count,
                    redemptionRate: redemptionRate,
                });
            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const stats = [
        {
            name: "Total Registrations",
            stat: metrics.totalRegistrations,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: "var(--fnb-teal)",
            bgColor: "var(--fnb-teal-light)",
        },
        {
            name: "Tokens Redeemed",
            stat: metrics.totalRedeemed,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            ),
            color: "var(--fnb-orange)",
            bgColor: "var(--fnb-orange-light)",
        },
        {
            name: "Active HR Users",
            stat: metrics.activeHR,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            color: "#8B5CF6",
            bgColor: "#EDE9FE",
        },
        {
            name: "Active Scanners",
            stat: metrics.activeScanners,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
            ),
            color: "#EC4899",
            bgColor: "#FCE7F3",
        },
        {
            name: "Redemption Rate",
            stat: `${metrics.redemptionRate.toFixed(1)}%`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
            color: "#10B981",
            bgColor: "#D1FAE5",
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard Overview</h1>
                <p className="text-[var(--muted)] mt-1">Monitor your event&apos;s beverage management in real-time</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {stats.map((item, index) => (
                    <div
                        key={item.name}
                        className="relative bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6 card-hover"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Left Border Accent */}
                        <div
                            className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />

                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--muted)]">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
                                    {loading ? (
                                        <span className="inline-block w-16 h-8 bg-[var(--border)] rounded animate-pulse" />
                                    ) : (
                                        item.stat
                                    )}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: item.bgColor }}
                            >
                                <div style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Activity Card */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Activity</h2>
                        <button className="text-sm text-[var(--fnb-teal)] hover:underline">View all</button>
                    </div>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center">
                            <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-[var(--muted)]">Activity will appear here</p>
                        <p className="text-sm text-[var(--muted-foreground)]">Recent transactions and events</p>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/users" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--fnb-teal)] hover:bg-[var(--fnb-teal-light)] transition-all group">
                            <div className="w-12 h-12 rounded-full bg-[var(--fnb-teal-light)] group-hover:bg-[var(--fnb-teal)] flex items-center justify-center mb-3 transition-colors">
                                <svg className="w-6 h-6 text-[var(--fnb-teal)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]">Add User</span>
                        </Link>
                        <Link href="/admin/reports" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--fnb-orange)] hover:bg-[var(--fnb-orange-light)] transition-all group">
                            <div className="w-12 h-12 rounded-full bg-[var(--fnb-orange-light)] group-hover:bg-[var(--fnb-orange)] flex items-center justify-center mb-3 transition-colors">
                                <svg className="w-6 h-6 text-[var(--fnb-orange)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]">Export Report</span>
                        </Link>
                        <Link href="/admin/employees" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--success)] hover:bg-[var(--success-light)] transition-all group">
                            <div className="w-12 h-12 rounded-full bg-[var(--success-light)] group-hover:bg-[var(--success)] flex items-center justify-center mb-3 transition-colors">
                                <svg className="w-6 h-6 text-[var(--success)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]">Import Data</span>
                        </Link>
                        <Link href="/admin/settings" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[#8B5CF6] hover:bg-[#EDE9FE] transition-all group">
                            <div className="w-12 h-12 rounded-full bg-[#EDE9FE] group-hover:bg-[#8B5CF6] flex items-center justify-center mb-3 transition-colors">
                                <svg className="w-6 h-6 text-[#8B5CF6] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-[var(--foreground)]">Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
