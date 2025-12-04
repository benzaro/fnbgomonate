ü="use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Reports() {
    const [generating, setGenerating] = useState(false);

    const generateReport = async (type: "summary" | "employees" | "transactions") => {
        setGenerating(true);
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
                // Fetch summary data
                // This is a simplified example. Real reports would aggregate data properly.
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
            setGenerating(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="mt-2 text-sm text-gray-700">
                Generate and download PDF reports for the event.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Event Summary Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Event Summary</dt>
                                    <dd>
                                        <div className="text-sm text-gray-900">High-level overview of event metrics</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <button
                                onClick={() => generateReport("summary")}
                                disabled={generating}
                                className="font-medium text-blue-700 hover:text-blue-900 flex items-center"
                            >
                                {generating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Employee Report Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Employee Activity</dt>
                                    <dd>
                                        <div className="text-sm text-gray-900">Detailed list of employee registrations and balances</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <button
                                onClick={() => generateReport("employees")}
                                disabled={generating}
                                className="font-medium text-blue-700 hover:text-blue-900 flex items-center"
                            >
                                {generating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transaction Report Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FileText className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Transaction Log</dt>
                                    <dd>
                                        <div className="text-sm text-gray-900">Full history of all token redemptions</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <button
                                onClick={() => generateReport("transactions")}
                                disabled={generating}
                                className="font-medium text-blue-700 hover:text-blue-900 flex items-center"
                            >
                                {generating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
ü=*cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272ufile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/%28dashboard%29/admin/reports/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb