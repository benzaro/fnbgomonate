Ø/"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, updateDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Loader2, QrCode, ArrowRight } from "lucide-react";

function RegisterForm() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const codeParam = searchParams.get("code");
        if (codeParam) {
            setCode(codeParam);
        }
    }, [searchParams]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const qrCodesRef = collection(db, "qrCodes");
            let q = query(qrCodesRef, where("id", "==", code));
            let snapshot = await getDocs(q);

            if (snapshot.empty) {
                q = query(qrCodesRef, where("sixDigitCode", "==", code.toUpperCase()));
                snapshot = await getDocs(q);
            }

            if (snapshot.empty) {
                throw new Error("Invalid code. Please check and try again.");
            }

            const qrDoc = snapshot.docs[0];
            const qrData = qrDoc.data();

            const userCredential = await signInAnonymously(auth);
            const user = userCredential.user;

            if (!qrData.isRegistered) {
                await updateDoc(doc(db, "qrCodes", qrDoc.id), {
                    isRegistered: true,
                    registeredAt: serverTimestamp(),
                    registeredDeviceId: user.uid,
                });

                await updateDoc(doc(db, "employees", qrData.employeeId), {
                    registrationStatus: "registered",
                });
            }

            localStorage.setItem("gomonate_employee_code", qrDoc.id);
            router.push("/employee");

        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="rounded-full bg-blue-100 p-3">
                        <QrCode className="h-10 w-10 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Register Your Code
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your 6-digit code or scan your QR code to access your drinks.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Registration Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase tracking-widest text-center text-lg"
                                    placeholder="A1B2C3"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        Continue <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
- *cascade08-7*cascade087ª *cascade08ª®*cascade08®þ, *cascade08þ,¬- *cascade08¬-®-*cascade08®-¸- *cascade08¸-¼-*cascade08¼-Ö- *cascade08Ö-Ü-*cascade08Ü-¶. *cascade08¶.¾.*cascade08¾.ú. *cascade08ú.þ.*cascade08þ.„/ *cascade08„/†/*cascade08†/Ž/ *cascade08Ž/’/*cascade08’/š/ *cascade08š/ /*cascade08 /¼/ *cascade08¼/À/*cascade08À/Ï/ *cascade08Ï/Ñ/*cascade08Ñ/Ø/ *cascade08"(5a312249f0dcb7c40f235704d17f4c7c7c10e7272`file:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/src/app/register/page.tsx:Ffile:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb