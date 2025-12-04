# GoMonate Implementation Plan

## Goal Description
Build "GoMonate", a cloud-based QR code digital beverage management platform for FNB corporate events. The system replaces manual drink tickets with digital tokens, providing real-time tracking and analytics.

## User Review Required
> [!IMPORTANT]
> Firebase project setup and credentials are required. I will assume a standard configuration structure but will need the actual keys to be provided in `.env.local`.

## Proposed Changes

### Project Setup
#### [NEW] [package.json](file:///c:/Users/benzi/Dropbox/VS%20Code%20Projects%202025/gomonatefnb/package.json)
- Initialize Next.js 15 app with Tailwind CSS.
- Add dependencies: `firebase`, `qrcode.react`, `html5-qrcode`, `lucide-react`, `clsx`, `tailwind-merge`.

### Architecture
- **Frontend**: Next.js 15 (App Router).
- **Backend**: Firebase (Firestore, Auth, Functions).
- **Styling**: Tailwind CSS.

### Component Structure
- `/app`: App Router pages.
    - `/(auth)/login`: Login page.
    - `/(dashboard)/admin`: SuperAdmin dashboard.
    - `/(dashboard)/hr`: HR portal.
    - `/(dashboard)/employee`: Employee dashboard.
    - `/(dashboard)/scanner`: Scanner station.
- `/components`: Reusable UI components.
- `/lib`: Firebase config, utility functions.

### Database Schema (Firestore)
- `users`: SuperAdmin, HR, Scanner accounts.
- `employees`: Employee data.
- `qrCodes`: QR code assignments.
- `transactions`: Redemption logs.
- `eventConfig`: Event settings.

## Verification Plan
### Automated Tests
- Run `npm run build` to ensure no build errors.
- Use `browser_subagent` to verify navigation and basic rendering.

### Manual Verification
- Verify Login flow for different roles.
- Verify Employee CSV import.
- Verify QR Code assignment and display.
- Verify Scanning and Redemption flow (simulated).
