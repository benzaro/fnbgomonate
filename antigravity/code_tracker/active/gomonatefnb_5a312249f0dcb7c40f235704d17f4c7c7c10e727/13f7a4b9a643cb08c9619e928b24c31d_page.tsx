ò#"use client";

import { useEffect, useState } from "react";
import { Users, Beer, UserCheck, Activity, TrendingUp } from "lucide-react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
                // Fetch counts
                const employeesColl = collection(db, "employees");
                const registeredQuery = query(employeesColl, where("registrationStatus", "==", "registered"));
                const registeredSnapshot = await getCountFromServer(registeredQuery);

                const usersColl = collection(db, "users");
                const hrQuery = query(usersColl, where("role", "==", "hr"), where("isActive", "==", true));
                const hrSnapshot = await getCountFromServer(hrQuery);

                const scannerQuery = query(usersColl, where("role", "==", "scanner"), where("isActive", "==", true));
                const scannerSnapshot = await getCountFromServer(scannerQuery);

                // For total redeemed, we might need an aggregation query or a counter document
                // For now, we'll placeholder it or fetch from eventConfig if we implement that
                // Assuming eventConfig has this data or we count transactions (expensive)
                // Let's use a placeholder for now as we haven't implemented the aggregation logic yet
                const totalRedeemed = 0;
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
        { name: "Total Registrations", stat: metrics.totalRegistrations, icon: Users, color: "bg-blue-500" },
        { name: "Total Redeemed", stat: metrics.totalRedeemed, icon: Beer, color: "bg-green-500" },
        { name: "Active HR Users", stat: metrics.activeHR, icon: UserCheck, color: "bg-purple-500" },
        { name: "Active Scanners", stat: metrics.activeScanners, icon: Activity, color: "bg-orange-500" },
        { name: "Redemption Rate", stat: `${metrics.redemptionRate.toFixed(1)}%`, icon: TrendingUp, color: "bg-indigo-500" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">
                                {loading ? "..." : item.stat}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>
        </div>
    );
}
ò#*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272mfile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/admin/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb