"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Reports() {
    const [generating, setGenerating] = useState<string | null>(null);

    const generateReport = async (type: "summary" | "employees" | "transactions") => {
        setGenerating(type);
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();

            // Header
            doc.setFontSize(20);
            doc.text("GoMonate Event Report", 20, 20);
            doc.setFontSize(12);
            doc.text(`Generated on: ${date}`, 20, 30);
            doc.text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, 20, 38);
            doc.line(20, 42, 190, 42);

            let yPos = 50;

            if (type === "summary") {
                doc.text("Event Summary Data", 20, yPos);
                yPos += 10;
                doc.text("- Total Employees: [Fetching...]", 20, yPos);
                yPos += 10;
                doc.text("- Total Redemptions: [Fetching...]", 20, yPos);
            } else if (type === "employees") {
                doc.text("Employee List", 20, yPos);
                yPos += 10;

                const q = query(collection(db, "employees"), orderBy("lastName"));
                const snapshot = await getDocs(q);

                snapshot.docs.forEach((d, index) => {
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const data = d.data();
                    doc.text(`${index + 1}. ${data.lastName}, ${data.firstName} - ${data.email}`, 20, yPos);
                    yPos += 7;
                });
            }

            doc.save(`GoMonate_Report_${type}_${Date.now()}.pdf`);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report");
        } finally {
            setGenerating(null);
        }
    };

    const reportTypes = [
        {
            id: "summary",
            title: "Event Summary",
            description: "High-level overview of event metrics including attendance and redemption stats",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: "teal",
        },
        {
            id: "employees",
            title: "Employee Activity",
            description: "Detailed list of employee registrations, balances, and participation status",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: "orange",
        },
        {
            id: "transactions",
            title: "Transaction Log",
            description: "Complete history of all token redemptions with timestamps and locations",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            color: "teal",
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Reports & Analytics</h1>
                <p className="text-[var(--muted)] mt-1">Generate and download PDF reports for event analysis</p>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        className={`bg-[var(--background-card)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden hover:shadow-md transition-shadow ${
                            report.color === "teal" ? "border-l-4 border-l-[var(--fnb-teal)]" : "border-l-4 border-l-[var(--fnb-orange)]"
                        }`}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${
                                    report.color === "teal"
                                        ? "bg-[var(--fnb-teal-light)] text-[var(--fnb-teal)]"
                                        : "bg-[var(--fnb-orange-light)] text-[var(--fnb-orange)]"
                                }`}>
                                    {report.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[var(--foreground)]">{report.title}</h3>
                                    <p className="text-sm text-[var(--muted)] mt-1">{report.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-[var(--background)] border-t border-[var(--border-light)]">
                            <button
                                onClick={() => generateReport(report.id as "summary" | "employees" | "transactions")}
                                disabled={generating !== null}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                    generating === report.id
                                        ? "bg-[var(--fnb-teal-light)] text-[var(--fnb-teal)]"
                                        : "btn-primary"
                                } disabled:opacity-60`}
                            >
                                {generating === report.id ? (
                                    <>
                                        <div className="spinner w-4 h-4" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-[var(--fnb-teal-light)] rounded-2xl p-6 border border-[var(--fnb-teal)]/20">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[var(--fnb-teal)]/10">
                        <svg className="w-5 h-5 text-[var(--fnb-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-medium text-[var(--fnb-teal-dark)]">Report Information</h4>
                        <p className="text-sm text-[var(--fnb-teal-dark)]/80 mt-1">
                            Reports are generated in PDF format and will automatically download to your device.
                            For large datasets, report generation may take a few moments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
