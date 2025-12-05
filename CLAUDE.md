# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoMonate is a QR code-based digital beverage management platform for corporate events in Botswana. It replaces physical drink tickets with digital tokens that employees can redeem at beverage stations via QR code scanning.

## Tech Stack

- **Frontend:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Firebase (Auth, Firestore, Storage)
- **QR Libraries:** qrcode.react (generation), html5-qrcode (scanning)
- **PDF Generation:** jsPDF

## Development Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint (flat config in eslint.config.mjs)
```

## Project Architecture

### Route Structure (App Router)
- `src/app/(auth)/login` - Staff login (SuperAdmin, HR, Scanner)
- `src/app/register` - Employee QR code registration (public)
- `src/app/(dashboard)/admin` - SuperAdmin dashboard with nested routes
- `src/app/(dashboard)/hr` - HR portal for assigning QR codes
- `src/app/(dashboard)/scanner` - Beverage station scanning interface
- `src/app/(dashboard)/employee` - Employee view with QR code and token balance

### Key Directories
- `src/context/AuthContext.tsx` - Firebase auth state and user role management
- `src/lib/firebase.ts` - Firebase client initialization
- `src/components/admin/` - SuperAdmin UI components
- `src/components/hr/` - HR portal components
- `src/components/scanner/` - Scanner station components

### User Roles
1. **SuperAdmin** - Full system access, user management, reporting
2. **HR** - Employee search, QR code assignment/reassignment
3. **Scanner** - Token redemption at beverage stations
4. **Employee** - View QR code and token balance (no Firebase Auth, session-based)

### Firestore Collections
- `users` - Staff accounts with role field
- `employees` - Employee data and token balances
- `qrCodes` - QR code assignments with 6-digit alphanumeric codes
- `transactions` - Token redemption audit log
- `eventConfig` - Event settings (default 18 tokens per employee)
- `auditLogs` - Administrative action tracking

## Environment Setup

Copy `env.example` to `.env.local` and add Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firebase Configuration

- Firestore security rules in `firestore.rules` - role-based access control
- Storage rules in `storage.rules`
- Deploy rules with Firebase CLI: `firebase deploy --only firestore:rules,storage`

### Important: Authorized Domains

When deploying to production (Vercel or custom domain), you must add the domain to Firebase's **Authorized Domains** list:

1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your domain (e.g., `fnbgomonate.vercel.app`)
4. Without this, login will fail with "Invalid email or password" error

Domains already authorized:
- `localhost` (automatic for development)

## Path Aliases

Use `@/*` to import from `src/*` (configured in tsconfig.json).
