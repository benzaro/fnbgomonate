import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const DEFAULT_PASSWORD = "changeme";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, role, createdBy } = body;

        // Validate required fields
        if (!email || !firstName || !lastName || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate role
        if (!["hr", "scanner"].includes(role)) {
            return NextResponse.json(
                { error: "Invalid role. Must be 'hr' or 'scanner'" },
                { status: 400 }
            );
        }

        // Create the user in Firebase Auth with default password
        const userRecord = await adminAuth.createUser({
            email,
            password: DEFAULT_PASSWORD,
            displayName: `${firstName} ${lastName}`,
        });

        // Create the user document in Firestore with the same UID
        await adminDb.collection("users").doc(userRecord.uid).set({
            email,
            firstName,
            lastName,
            role,
            isActive: true,
            mustChangePassword: true,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: createdBy || null,
        });

        return NextResponse.json({
            success: true,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
            },
            message: `User created successfully. Default password is "${DEFAULT_PASSWORD}". User will be prompted to change it on first login.`,
        });
    } catch (error: unknown) {
        console.error("Error creating user:", error);

        const firebaseError = error as { code?: string; message?: string };

        if (firebaseError.code === "auth/email-already-exists") {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 409 }
            );
        }

        if (firebaseError.code === "auth/invalid-email") {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: firebaseError.message || "Failed to create user" },
            { status: 500 }
        );
    }
}
