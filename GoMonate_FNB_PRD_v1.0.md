# GoMonate - FNB Beverage Management Platform
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** December 4, 2025  
**Project Owner:** [Your Organization]  
**Platform:** Web Application (Mobile Responsive)  
**Tech Stack:** Next.js 15 + Firebase  
**Target Market:** Botswana  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Functional Requirements](#4-functional-requirements)
5. [Technical Architecture](#5-technical-architecture)
6. [User Flows](#6-user-flows)
7. [Data Model](#7-data-model)
8. [Security Requirements](#8-security-requirements)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [Reporting & Analytics](#10-reporting--analytics)
11. [Edge Cases & Error Handling](#11-edge-cases--error-handling)
12. [Performance Requirements](#12-performance-requirements)
13. [Future Considerations](#13-future-considerations)

---

## 1. Executive Summary

### 1.1 Project Vision
GoMonate is a cloud-based QR code digital beverage management platform designed to streamline drink allocation and redemption at corporate events in Botswana. The system replaces manual drink ticket distribution with a digital token-based system that provides real-time tracking, analytics, and efficient beverage station management.

### 1.2 Business Goals
- Eliminate physical drink tickets and manual tracking
- Provide real-time visibility into beverage consumption
- Reduce fraud and token sharing through digital binding
- Enable data-driven decision making for future events
- Improve attendee experience with seamless digital redemption

### 1.3 Success Metrics
- 100% of pre-registered employees successfully assigned QR codes
- < 5 seconds average scan time per redemption
- Zero duplicate QR code assignments
- Real-time dashboard updates within 2 seconds
- 95%+ successful scan rate on first attempt

---

## 2. Product Overview

### 2.1 System Description
GoMonate is a web-based platform that manages the complete lifecycle of beverage token allocation and redemption:

1. **Pre-Event:** Bulk employee import via CSV
2. **On-Site Registration:** HR assigns unique QR codes to employees
3. **Employee Activation:** Employees scan/register their QR codes
4. **Redemption:** Scanner stations validate and deduct tokens
5. **Post-Event:** SuperAdmin generates reports and manages data

### 2.2 Core Components
- **Admin Dashboard** (SuperAdmin role)
- **HR Portal** (HR role)
- **Employee Dashboard** (Employee role)
- **Scanner Station** (Scanner role)
- **Real-time Analytics Engine**
- **Reporting Module**

### 2.3 Key Features
- CSV bulk import of employee data
- Dynamic QR code generation with 6-digit alphanumeric codes
- Real-time token balance tracking
- Multi-role access control
- Comprehensive reporting and analytics
- Mobile-responsive web interface

---

## 3. User Roles & Permissions

### 3.1 SuperAdmin Role

**Primary Responsibilities:**
- Overall system administration and oversight
- User management for HR and Scanner roles
- Real-time monitoring of all operations
- Report generation and data export
- Post-event data destruction

**Permissions:**
| Function | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| HR Users | ✓ | ✓ | ✓ (activate/deactivate) | ✓ |
| Scanner Users | ✓ | ✓ | ✓ (activate/deactivate) | ✓ |
| Employees | ✓ (manual add) | ✓ | ✓ | ✓ |
| QR Codes | - | ✓ | - | - |
| Transactions | - | ✓ | - | ✓ (event data) |
| Reports | ✓ | ✓ | - | - |

**Dashboard Views:**
- Total registrations (real-time)
- Total drinks redeemed (real-time)
- Active HR users count
- Active Scanner users count
- Redemption rate (percentage of tokens used)
- Peak redemption times
- Employee registration status (registered vs. pending)
- System health indicators

### 3.2 HR Role

**Primary Responsibilities:**
- Search and locate employees from pre-loaded list
- Assign QR codes to employees
- Handle QR code reassignment for lost devices
- Monitor registration progress

**Permissions:**
| Function | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Employees | ✓ (manual add) | ✓ (search) | - | - |
| QR Codes | ✓ (assign/reassign) | ✓ | - | - |
| Transactions | - | ✓ (view only) | - | - |

**Dashboard Views:**
- Employee search interface
- QR code assignment status
- Live registration count
- Recently assigned codes (last 20)
- Employee token balance (upon reassignment)

### 3.3 Employee Role

**Primary Responsibilities:**
- Register assigned QR code via mobile device
- Redeem beverages at scanning stations
- Monitor remaining token balance

**Permissions:**
| Function | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Profile | - | ✓ | - | - |
| QR Code | - | ✓ | - | - |
| Token Balance | - | ✓ | - | - |

**Dashboard Views:**
- QR code display (scannable)
- 6-digit alphanumeric code
- Remaining token balance (real-time)
- Token usage history with timestamps
- "Save QR Code" button (download image)

### 3.4 Scanner Role

**Primary Responsibilities:**
- Scan employee QR codes at beverage stations
- Manual entry of 6-digit codes (fallback)
- Monitor scan activity

**Permissions:**
| Function | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Transactions | ✓ (redeem tokens) | ✓ (scan history) | - | - |

**Dashboard Views:**
- QR code scanner interface
- Manual 6-digit code entry field
- Scan result feedback (success/failure)
- Total scans today
- Successful scans count
- Failed scans count
- Recent scan history (last 50)
- Current scan rate (scans per minute)

---

## 4. Functional Requirements

### 4.1 Authentication System

#### 4.1.1 SuperAdmin Authentication
- **Login Method:** Email + Password
- **Password Requirements:** 8 characters (4 alphabetic + 4 numeric, any order)
  - Example: `5434JKLO` or `LLOM2098`
- **Session Management:** 8-hour session timeout
- **Account Creation:** Manual creation (first SuperAdmin account created via Firebase Console)
- **Password Reset:** Email-based reset flow

#### 4.1.2 HR User Authentication
- **Login Method:** Email + Password (auto-generated)
- **Password Format:** 8 characters (4 alphabetic + 4 numeric, any order)
- **Creation:** SuperAdmin creates HR accounts
- **Status:** Can be activated/deactivated by SuperAdmin
- **First Login:** Force password change on first login
- **Session Management:** 8-hour session timeout

#### 4.1.3 Scanner User Authentication
- **Login Method:** Username + Password (auto-generated)
- **Password Format:** 8 characters (4 alphabetic + 4 numeric, any order)
- **Creation:** SuperAdmin creates Scanner accounts
- **Status:** Can be activated/deactivated by SuperAdmin
- **Session Management:** 12-hour session timeout (longer for event duration)

#### 4.1.4 Employee Authentication
- **Login Method:** QR Code Scan or 6-digit code entry
- **No Password Required:** Access via QR code binding only
- **Device Binding:** QR code binds to first device that registers it
- **Session Management:** 24-hour session, persistent login

### 4.2 Employee Data Management

#### 4.2.1 CSV Bulk Import (SuperAdmin/HR)
**CSV Format Requirements:**
```csv
firstName,lastName,email,mobileNumber
John,Doe,john.doe@company.com,+26771234567
Jane,Smith,jane.smith@company.com,+26772345678
```

**Validation Rules:**
- `firstName`: Required, 2-50 characters, alphabetic only
- `lastName`: Required, 2-50 characters, alphabetic only
- `email`: Required, valid email format, unique
- `mobileNumber`: Required, valid Botswana format (+267XXXXXXXX), unique

**Import Process:**
1. SuperAdmin uploads CSV file
2. System validates each row
3. Display validation errors (if any)
4. Confirm import (create employee records)
5. Generate import summary report

**Error Handling:**
- Duplicate email/mobile: Skip row, log error
- Invalid format: Skip row, log error
- Missing required fields: Skip row, log error
- Import summary shows: Total rows, Successful, Failed with reasons

#### 4.2.2 Manual Employee Addition (SuperAdmin/HR)
**Form Fields:**
- First Name (required)
- Last Name (required)
- Email (required, unique)
- Mobile Number (required, unique)

**Validation:** Same as CSV import

#### 4.2.3 Employee Search (HR)
**Search Capabilities:**
- Search by First Name (partial match)
- Search by Last Name (partial match)
- Search by Email (partial match)
- Search by Mobile Number (exact match)
- Real-time search results (debounced 300ms)

**Search Results Display:**
- Employee name (First + Last)
- Email
- Mobile number
- Registration status (Pending/Registered)
- Token balance (if registered)
- "Assign Code" button (if pending)
- "Reassign Code" button (if registered)

### 4.3 QR Code Generation & Assignment

#### 4.3.1 QR Code Specifications
**Format:**
- **QR Code Data:** Unique UUID (e.g., `emp_abc123def456`)
- **6-Digit Alphanumeric Code:** 6 uppercase characters (A-Z, 0-9)
  - Example: `A1B2C3`, `9X8Y7Z`
  - Generated using crypto-secure random
  - Collision check before assignment

**Generation Trigger:** When HR clicks "Assign Code" button

**Assignment Process:**
1. HR searches and finds employee
2. HR clicks "Assign Code"
3. System generates:
   - Unique UUID
   - 6-digit alphanumeric code
   - QR code image (PNG, 300x300px)
4. Display QR code and 6-digit code on screen
5. Show registration URL for employee
6. Mark employee status as "Code Assigned"
7. Initialize 18 tokens for employee

**QR Code Display:**
- Full-screen modal with QR code
- 6-digit code displayed prominently below QR
- Registration URL: `https://gomonate.app/register`
- "Print" button (optional)
- "Close" button

#### 4.3.2 QR Code Reassignment (Lost Device Scenario)

**Trigger:** HR clicks "Reassign Code" for registered employee

**Process:**
1. System checks current token balance
2. Deactivate old QR code
3. Generate new QR code and 6-digit code
4. Transfer remaining token balance to new QR code
5. Display new QR code to HR
6. Log reassignment event with timestamp

**Business Rules:**
- Old QR code becomes invalid immediately
- Remaining tokens preserved (not reset to 18)
- Employee can only have 1 active QR code at a time
- Reassignment event logged for audit

**Example Scenario:**
- Employee had 18 tokens, redeemed 5 drinks (13 remaining)
- Lost phone
- HR reassigns new QR code
- New QR code has 13 tokens (not 18)

### 4.4 Employee Registration Flow

#### 4.4.1 Registration URL
- **URL:** `https://gomonate.app/register`
- **Access:** Public (no authentication required initially)
- **Mobile Optimized:** Responsive design for mobile devices

#### 4.4.2 QR Code Scan Registration
**Step 1: Landing Page**
- "Register Your Code" button
- Brief instructions
- Fallback option: "Enter Code Manually"

**Step 2: Camera Permission**
- Request camera access
- Display live camera feed
- QR code detection overlay
- "Switch Camera" button (front/back)

**Step 3: QR Code Scan**
- Auto-detect QR code
- Validate QR code against database
- Check if code already registered
- Bind QR code to device/browser session

**Step 4: Success**
- Display employee name
- Show token balance (18)
- Redirect to employee dashboard
- Store session (24-hour persistent login)

#### 4.4.3 Manual Code Entry (Fallback)
**Step 1: Manual Entry Screen**
- Input field for 6-digit code
- Uppercase auto-formatting
- "Submit" button

**Step 2: Validation**
- Check code exists
- Check code not already registered
- Bind code to device/browser session

**Step 3: Success**
- Same as QR scan success flow

#### 4.4.4 Registration Business Rules
- **One Device Binding:** QR code binds to first device that registers it
- **Duplicate Prevention:** Cannot register same code twice (error: "Code already registered")
- **Invalid Code:** Display error "Invalid code. Please contact HR."
- **Expired Code:** Display error "Code expired. Please contact HR."
- **Session Persistence:** 24-hour persistent login via JWT/session cookie

### 4.5 Token Management System

#### 4.5.1 Token Initialization
- **Default Token Count:** 18 tokens per employee
- **Allocation Timing:** Upon QR code assignment by HR
- **Token Type:** Non-refundable, single-use

#### 4.5.2 Token Redemption
**Trigger:** Scanner scans employee QR code or enters 6-digit code

**Process:**
1. Scanner scans QR code
2. System validates code
3. Check token balance > 0
4. Deduct 1 token
5. Log transaction with timestamp
6. Display success message to scanner
7. Update employee dashboard in real-time

**Redemption Rules:**
- **No Rate Limiting:** Employee can redeem all 18 tokens consecutively
- **No Refunds:** Tokens cannot be added back once redeemed
- **Real-time Deduction:** Token balance updates immediately
- **Audit Trail:** Every redemption logged with:
  - Employee ID
  - Scanner ID
  - Timestamp
  - Token balance before/after
  - Transaction ID

#### 4.5.3 Token Balance Display
**Employee Dashboard:**
- Large, prominent display: "Tokens Remaining: X / 18"
- Visual progress bar
- Token usage history (list of timestamps)

**HR Portal:**
- Token balance shown in search results
- Visible during reassignment

**Scanner Station:**
- Token balance shown after each successful scan
- Not shown on failed scans (security)

### 4.6 Scanner Station Functionality

#### 4.6.1 Scanner Interface
**Primary View:**
- Large QR code scanner viewport
- "Scan QR Code" header
- Manual entry field (hidden by default)
- "Enter Code Manually" button
- Scan statistics panel (sidebar)

**Statistics Panel:**
- Total scans today
- Successful scans
- Failed scans
- Success rate percentage
- Current scan rate (scans/minute)

#### 4.6.2 QR Code Scanning
**Process:**
1. Scanner station displays camera feed
2. Employee presents QR code to camera
3. System detects and decodes QR code
4. Validate QR code
5. Check token balance
6. Deduct token
7. Display result

**Success Feedback:**
- Large green checkmark animation
- "Success! Tokens Remaining: X"
- Employee name display
- Auto-dismiss after 3 seconds
- Audio beep (optional)

**Failure Feedback:**
- Large red X animation
- Error message:
  - "No tokens remaining"
  - "Invalid QR code"
  - "Code not registered"
- Auto-dismiss after 4 seconds
- Audio error beep (optional)

#### 4.6.3 Manual Code Entry (Scanner Fallback)
**Trigger:** Scanner clicks "Enter Code Manually"

**Process:**
1. Display 6-digit code input field
2. Scanner types 6-digit code
3. Auto-uppercase formatting
4. Click "Submit"
5. Same validation as QR scan
6. Display result (success/failure)

**Use Cases:**
- QR code won't scan (screen brightness, damage)
- Camera malfunction
- Employee phone battery dead

#### 4.6.4 Scan Cooldown
**Purpose:** Prevent accidental double-scans

**Mechanism:**
- 5-second cooldown per unique QR code
- If same QR code scanned within 5 seconds, display:
  - "Please wait X seconds before next scan"
  - Countdown timer
- Different QR codes can be scanned immediately (no global cooldown)

**Implementation:**
- Track last scan timestamp per QR code
- Client-side and server-side validation

#### 4.6.5 Scan History
**Display:**
- Recent 50 scans
- Each entry shows:
  - Employee name
  - Timestamp
  - Result (success/failed)
  - Tokens remaining (if success)
- Auto-refresh every 5 seconds

### 4.7 Real-time Dashboard Updates

#### 4.7.1 Technology
- **Firebase Realtime Database** or **Firestore** for real-time sync
- **WebSocket** connections for live updates
- **Server-Sent Events (SSE)** as fallback

#### 4.7.2 Update Triggers
**Employee Dashboard:**
- Token balance changes (on redemption)
- Update within 2 seconds of redemption

**HR Portal:**
- Registration count changes
- New employee registrations
- Update within 2 seconds

**SuperAdmin Dashboard:**
- All metrics update in real-time:
  - Total registrations
  - Total redemptions
  - Active users
  - Scan activity

**Scanner Station:**
- Scan statistics update after each scan
- History list updates in real-time

#### 4.7.3 Connection Handling
- Display "Connected" indicator (green dot)
- Display "Disconnected" indicator (red dot) if WebSocket fails
- Auto-reconnect on connection loss
- Queue updates during disconnect, sync on reconnect

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### 5.1.1 Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API + Zustand
- **Real-time:** Firebase SDK
- **QR Code Generation:** `qrcode.react` or `qr-code-styling`
- **QR Code Scanning:** `html5-qrcode` or `@zxing/browser`
- **Charts:** Recharts or Chart.js
- **PDF Export:** jsPDF + html2canvas

#### 5.1.2 Backend
- **Platform:** Firebase (Google Cloud)
  - **Authentication:** Firebase Auth (Email/Password)
  - **Database:** Firestore
  - **Storage:** Firebase Storage (QR code images)
  - **Functions:** Cloud Functions for Firebase (Node.js)
  - **Hosting:** Firebase Hosting

#### 5.1.3 Infrastructure
- **CDN:** Firebase Hosting CDN (global)
- **SSL:** Auto-managed by Firebase
- **Domain:** Custom domain support
- **Backup:** Automated Firestore backups

### 5.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js App (SSR + CSR)                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │SuperAdmin│  │    HR    │  │ Employee │  │ Scanner  │   │
│  │Dashboard │  │  Portal  │  │Dashboard │  │ Station  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   Firebase SDK    │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Services                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Auth      │  │  Firestore  │  │   Storage   │         │
│  │(Email/Pass) │  │  (Database) │  │(QR Images)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │         Cloud Functions (Serverless)             │        │
│  │  • Token Redemption Logic                        │        │
│  │  • QR Code Generation                            │        │
│  │  • Report Generation                             │        │
│  │  • CSV Import Processing                         │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Deployment Architecture

#### 5.3.1 Hosting
- **Primary:** Firebase Hosting (https://gomonate.app)
- **Regions:** Multi-region (africa-south1 primary for Botswana)
- **CDN:** Global CDN for static assets
- **SSL:** Auto-provisioned and managed

#### 5.3.2 Database
- **Firestore:** Multi-region (africa-south1 + backup region)
- **Backup Strategy:** Daily automated backups, 30-day retention
- **Indexing:** Composite indexes for complex queries

#### 5.3.3 Monitoring
- **Firebase Performance Monitoring:** Track app performance
- **Firebase Crashlytics:** Error tracking
- **Google Analytics 4:** User behavior analytics
- **Cloud Monitoring:** Infrastructure health

---

## 6. User Flows

### 6.1 SuperAdmin Flows

#### 6.1.1 Create HR User Flow
```
START → SuperAdmin Dashboard → Users Management → Add HR User
  → Enter Email → System Generates Password (8 chars)
  → Display Password (copy to clipboard) → Save User
  → Email Sent to HR (login credentials) → END
```

#### 6.1.2 Generate Event Report Flow
```
START → SuperAdmin Dashboard → Reports Section
  → Select Date Range → Select Report Type
  → Click "Generate Report" → System Compiles Data
  → Preview Report → Click "Export PDF"
  → PDF Downloads → END
```

#### 6.1.3 Bulk Import Employees Flow
```
START → SuperAdmin Dashboard → Employees Section
  → Click "Import CSV" → Select File → Upload
  → System Validates Rows → Display Validation Summary
  → Confirm Import → System Creates Employee Records
  → Display Import Results (Success/Failed) → END
```

### 6.2 HR Flows

#### 6.2.1 Assign QR Code to Employee Flow
```
START → HR Portal → Search Employee → Enter Name/Email/Mobile
  → View Search Results → Select Employee
  → Click "Assign Code" → System Generates QR + 6-digit Code
  → Display QR Code on Screen → Show Registration URL
  → Employee Views QR Code → HR Closes Modal → END
```

#### 6.2.2 Reassign QR Code (Lost Device) Flow
```
START → HR Portal → Search Employee → Select Employee
  → View Current Token Balance → Click "Reassign Code"
  → Confirm Reassignment → System Deactivates Old Code
  → Generate New QR + 6-digit Code → Transfer Remaining Tokens
  → Display New QR Code → Employee Scans New Code → END
```

### 6.3 Employee Flows

#### 6.3.1 Register QR Code Flow (Camera Scan)
```
START → Visit gomonate.app/register → Click "Register Code"
  → Grant Camera Permission → Point Camera at QR Code
  → System Scans QR Code → Validate Code → Bind to Device
  → Display Success Message → Redirect to Dashboard
  → View Token Balance (18) → END
```

#### 6.3.2 Register QR Code Flow (Manual Entry)
```
START → Visit gomonate.app/register → Click "Enter Code Manually"
  → Type 6-digit Code → Click Submit → Validate Code
  → Bind to Device → Display Success Message
  → Redirect to Dashboard → View Token Balance (18) → END
```

#### 6.3.3 Redeem Beverage Flow
```
START → Employee at Drinks Station → Open Dashboard
  → Display QR Code to Scanner → Scanner Scans Code
  → System Validates → Deduct 1 Token → Display Success
  → Employee Dashboard Updates (17 tokens remaining)
  → Employee Collects Beverage → END
```

#### 6.3.4 Save QR Code to Phone Flow
```
START → Employee Dashboard → View QR Code
  → Click "Save QR Code" → QR Image Downloads to Device
  → Employee Saves to Photo Gallery → END
```

### 6.4 Scanner Flows

#### 6.4.1 Scan QR Code Flow (Success)
```
START → Scanner Station → Display Camera Feed
  → Employee Presents QR Code → System Detects QR
  → Validate Code → Check Token Balance > 0
  → Deduct 1 Token → Display Success Message
  → Show Tokens Remaining → Auto-dismiss (3 sec)
  → Update Scan Statistics → 5-second Cooldown → END
```

#### 6.4.2 Scan QR Code Flow (Failed - No Tokens)
```
START → Scanner Station → Employee Presents QR Code
  → System Detects QR → Validate Code → Check Token Balance
  → Balance = 0 → Display Error "No Tokens Remaining"
  → Audio Error Beep → Auto-dismiss (4 sec)
  → Update Failed Scan Count → END
```

#### 6.4.3 Manual Code Entry Flow
```
START → Scanner Station → Click "Enter Code Manually"
  → Display Input Field → Type 6-digit Code
  → Click Submit → Validate Code → Check Token Balance
  → Deduct Token → Display Success → Auto-dismiss → END
```

---

## 7. Data Model

### 7.1 Firestore Collections Structure

#### 7.1.1 `users` Collection
**Purpose:** Store all user accounts (SuperAdmin, HR, Scanner)

```typescript
interface User {
  uid: string; // Firebase Auth UID
  email: string;
  role: 'superadmin' | 'hr' | 'scanner';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Timestamp;
  createdBy: string; // UID of creator
  lastLoginAt?: Timestamp;
  passwordResetRequired: boolean; // True on first login
}
```

**Indexes:**
- `email` (unique)
- `role`
- `isActive`

**Security Rules:**
- SuperAdmin: Full read/write
- HR: Read own profile only
- Scanner: Read own profile only

#### 7.1.2 `employees` Collection
**Purpose:** Store employee data and registration status

```typescript
interface Employee {
  id: string; // Auto-generated document ID
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string; // Format: +267XXXXXXXX
  registrationStatus: 'pending' | 'code_assigned' | 'registered';
  qrCodeId?: string; // Reference to qrCodes collection
  tokenBalance: number; // Default: 18
  createdAt: Timestamp;
  createdBy: string; // UID of creator (SuperAdmin/HR)
  registeredAt?: Timestamp;
  deviceInfo?: {
    userAgent: string;
    deviceId: string; // Browser fingerprint or device ID
  };
}
```

**Indexes:**
- `email` (unique)
- `mobileNumber` (unique)
- `registrationStatus`
- `qrCodeId`

**Security Rules:**
- SuperAdmin: Full read/write
- HR: Read all, write (create, update status)
- Employee: Read own record only

#### 7.1.3 `qrCodes` Collection
**Purpose:** Store QR code data and assignment information

```typescript
interface QRCode {
  id: string; // UUID (e.g., emp_abc123def456)
  sixDigitCode: string; // 6-character alphanumeric (e.g., A1B2C3)
  employeeId: string; // Reference to employees collection
  isActive: boolean;
  isRegistered: boolean;
  assignedAt: Timestamp;
  assignedBy: string; // UID of HR user
  registeredAt?: Timestamp;
  registeredDeviceId?: string;
  expiresAt: Timestamp; // Event end date/time
  qrImageUrl?: string; // Firebase Storage URL
  reassignmentHistory?: Array<{
    previousCodeId: string;
    reassignedAt: Timestamp;
    reassignedBy: string; // HR UID
    reason: string;
    tokensTransferred: number;
  }>;
}
```

**Indexes:**
- `sixDigitCode` (unique)
- `employeeId`
- `isActive`
- `isRegistered`

**Security Rules:**
- SuperAdmin: Full read
- HR: Read all, write (create, update)
- Employee: Read own QR code only
- Scanner: Read active QR codes for validation

#### 7.1.4 `transactions` Collection
**Purpose:** Log every token redemption event

```typescript
interface Transaction {
  id: string; // Auto-generated document ID
  transactionType: 'redemption';
  employeeId: string;
  qrCodeId: string;
  scannerId: string; // UID of scanner user
  tokensBefore: number;
  tokensAfter: number;
  timestamp: Timestamp;
  scanMethod: 'qr_scan' | 'manual_entry';
  status: 'success' | 'failed';
  failureReason?: string; // If status = failed
  location?: string; // Optional: Scanner station identifier
}
```

**Indexes:**
- `employeeId`
- `scannerId`
- `timestamp` (descending)
- `status`

**Security Rules:**
- SuperAdmin: Full read
- HR: Read all
- Scanner: Create only, read own scans
- Employee: Read own transactions only

#### 7.1.5 `eventConfig` Collection (Single Document)
**Purpose:** Store event-level configuration

```typescript
interface EventConfig {
  id: 'event_2025'; // Single document
  eventName: string;
  eventDate: Timestamp;
  eventEndDate: Timestamp;
  defaultTokenAllocation: number; // 18
  isEventActive: boolean;
  totalEmployeesImported: number;
  totalRegistered: number;
  totalTokensRedeemed: number;
  scanCooldownSeconds: number; // 5
  createdAt: Timestamp;
  lastUpdatedAt: Timestamp;
}
```

**Security Rules:**
- SuperAdmin: Full read/write
- HR: Read only
- Scanner: Read only

#### 7.1.6 `auditLogs` Collection
**Purpose:** Track all administrative actions

```typescript
interface AuditLog {
  id: string; // Auto-generated document ID
  userId: string; // UID of user performing action
  userRole: 'superadmin' | 'hr' | 'scanner';
  action: string; // e.g., 'create_hr_user', 'assign_qr_code', 'import_employees'
  targetType: string; // e.g., 'user', 'employee', 'qrcode'
  targetId: string; // ID of affected entity
  details: object; // Action-specific details
  timestamp: Timestamp;
  ipAddress?: string;
}
```

**Indexes:**
- `userId`
- `action`
- `timestamp` (descending)

**Security Rules:**
- SuperAdmin: Full read
- Others: No access

### 7.2 Firebase Storage Structure

```
/qr-codes/
  /{qrCodeId}/
    qr-image.png       // QR code image (300x300px)
    
/reports/
  /{reportId}/
    report.pdf         // Generated PDF reports
    
/csv-imports/
  /{importId}/
    employees.csv      // Uploaded CSV files (archived)
```

**Security Rules:**
- QR code images: Read by authenticated users
- Reports: Read by SuperAdmin only
- CSV imports: Read by SuperAdmin only

### 7.3 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    function isHR() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'hr' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    function isScanner() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'scanner' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSuperAdmin() || request.auth.uid == userId;
      allow create, update, delete: if isSuperAdmin();
    }
    
    // Employees collection
    match /employees/{employeeId} {
      allow read: if isSuperAdmin() || isHR();
      allow create: if isSuperAdmin() || isHR();
      allow update: if isSuperAdmin() || isHR();
      allow delete: if isSuperAdmin();
    }
    
    // QR Codes collection
    match /qrCodes/{qrCodeId} {
      allow read: if isSuperAdmin() || isHR() || isScanner();
      allow create, update: if isSuperAdmin() || isHR();
      allow delete: if isSuperAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if isSuperAdmin() || isHR();
      allow create: if isScanner();
    }
    
    // Event Config collection
    match /eventConfig/{configId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // Audit Logs collection
    match /auditLogs/{logId} {
      allow read: if isSuperAdmin();
      allow write: if false; // Only backend can write
    }
  }
}
```

---

## 8. Security Requirements

### 8.1 Authentication Security

#### 8.1.1 Password Policy
- **Format:** 8 characters (4 alphabetic + 4 numeric, any order)
- **Generation:** Crypto-secure random generation
- **Storage:** Firebase Auth (bcrypt hashed)
- **Reset:** Email-based reset with time-limited token (1 hour)
- **First Login:** Force password change for HR/Scanner users

#### 8.1.2 Session Management
- **SuperAdmin:** 8-hour session timeout
- **HR:** 8-hour session timeout
- **Scanner:** 12-hour session timeout
- **Employee:** 24-hour persistent login
- **Token Type:** JWT (Firebase Auth token)
- **Refresh:** Automatic token refresh before expiry

#### 8.1.3 Account Security
- **Failed Login Attempts:** Lock account after 5 failed attempts (15-minute cooldown)
- **Concurrent Sessions:** Allow multiple sessions per user
- **Session Invalidation:** Manual logout invalidates current session
- **Deactivation:** Deactivated users immediately lose access

### 8.2 QR Code Security

#### 8.2.1 Anti-Fraud Measures
- **Unique Binding:** QR code binds to first device that registers it
- **Device Fingerprinting:** Store browser/device fingerprint on registration
- **One-Time Registration:** QR code cannot be re-registered without HR reassignment
- **Expiration:** QR codes expire at event end (timestamp validation)

#### 8.2.2 Scan Cooldown
- **Cooldown Period:** 5 seconds per unique QR code
- **Purpose:** Prevent accidental double-scans
- **Implementation:** Client-side and server-side validation
- **Bypass Prevention:** Server-side timestamp comparison

#### 8.2.3 Screenshot Sharing Prevention
- **Disclaimer:** System warns that sharing QR = sharing drinks
- **No Technical Prevention:** Intentional sharing is user's choice
- **Token Depletion:** Once tokens used, QR code becomes useless

### 8.3 Data Protection

#### 8.3.1 Personal Data Handling
- **Encryption in Transit:** TLS 1.3 (HTTPS)
- **Encryption at Rest:** Firestore automatic encryption
- **Data Access:** Role-based access control (RBAC)
- **Data Retention:** Configurable post-event retention
- **Data Deletion:** SuperAdmin can destroy all event data

#### 8.3.2 Compliance
- **POPIA (Botswana):** Compliance with Protection of Personal Information Act
- **GDPR Principles:** Right to access, right to deletion
- **Audit Trail:** All administrative actions logged
- **Data Minimization:** Collect only necessary employee data

### 8.4 API Security

#### 8.4.1 Cloud Functions Security
- **Authentication Required:** All functions require valid Firebase Auth token
- **Rate Limiting:** 
  - QR code generation: 10 requests/minute per HR user
  - Token redemption: 1 request/5 seconds per QR code
  - Report generation: 5 requests/hour per SuperAdmin
- **CORS:** Restrict to known origins
- **Input Validation:** Strict input sanitization and validation

#### 8.4.2 Firestore Security
- **Security Rules:** Enforce role-based access at database level
- **No Direct Access:** All writes through Cloud Functions
- **Backup Security:** Backup data encrypted at rest
- **Audit Logging:** Log all sensitive operations

---

## 9. UI/UX Requirements

### 9.1 Design Principles

#### 9.1.1 Core Principles
- **Mobile-First:** Optimize for mobile devices (primary use case)
- **Accessibility:** WCAG 2.1 AA compliance
- **Simplicity:** Minimal clicks to complete tasks
- **Feedback:** Clear, immediate feedback for all actions
- **Consistency:** Consistent UI patterns across all roles

#### 9.1.2 Brand Guidelines
- **Primary Color:** #1E40AF (Blue)
- **Secondary Color:** #10B981 (Green - success)
- **Error Color:** #EF4444 (Red)
- **Warning Color:** #F59E0B (Amber)
- **Typography:** Inter (sans-serif)
- **Logo:** "GoMonate" with beverage icon

### 9.2 Responsive Design

#### 9.2.1 Breakpoints
- **Mobile:** 320px - 767px (primary target)
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

#### 9.2.2 Layout Adaptation
- **Mobile:** Single-column layout, stacked elements
- **Tablet:** Two-column where appropriate
- **Desktop:** Multi-column dashboards with sidebars

### 9.3 Role-Specific UI Requirements

#### 9.3.1 SuperAdmin Dashboard
**Layout:**
- Top navigation bar with logo, role indicator, logout
- Sidebar navigation (Users, Employees, Analytics, Reports)
- Main content area with metric cards
- Real-time update indicators

**Metric Cards:**
- Total Registrations (large, prominent)
- Total Tokens Redeemed
- Active HR Users
- Active Scanner Users
- Redemption Rate (percentage)
- Current Scan Rate (scans/minute)

**Interactions:**
- Click metric cards to drill down into details
- Real-time updates with subtle animation
- Export buttons for reports

#### 9.3.2 HR Portal
**Layout:**
- Top navigation bar
- Search bar (prominent, always visible)
- Search results table
- QR code assignment modal

**Search Interface:**
- Large search input field
- Search icon (magnifying glass)
- Filter dropdown (search by: name, email, mobile)
- Real-time search results (debounced)

**Search Results:**
- Table view with columns:
  - Name (First + Last)
  - Email
  - Mobile
  - Status (badge: Pending/Registered)
  - Token Balance (if registered)
  - Action button (Assign/Reassign)
- Pagination (20 results per page)

**QR Code Modal:**
- Full-screen overlay
- Large QR code display (center)
- 6-digit code (large, bold, below QR)
- Registration URL (copy button)
- "Close" button (top-right)
- Optional "Print" button

#### 9.3.3 Employee Dashboard
**Layout:**
- Minimal navigation (logo, logout)
- Large QR code display (center)
- 6-digit code (below QR)
- Token balance (prominent, top)
- "Save QR Code" button
- Token usage history (scrollable list)

**QR Code Display:**
- High-contrast QR code (black on white)
- Responsive sizing (80% of screen width, max 400px)
- Screen brightness auto-adjust reminder

**Token Balance:**
- Large display: "18 / 18" or "15 / 18"
- Visual progress bar
- Color coding:
  - Green: 10+ tokens
  - Amber: 5-9 tokens
  - Red: 1-4 tokens

**Token History:**
- List view (most recent first)
- Each entry shows:
  - Timestamp (e.g., "2:45 PM")
  - "Redeemed 1 token"
  - Scanner name (optional)
- Empty state: "No tokens redeemed yet"

#### 9.3.4 Scanner Station
**Layout:**
- Full-screen camera feed
- Overlay UI elements
- Scan feedback (center)
- Statistics panel (sidebar, collapsible)

**Camera Interface:**
- Live camera feed (full-screen)
- QR code detection overlay (animated frame)
- "Switch Camera" button (top-right)
- "Manual Entry" button (bottom)

**Scan Feedback:**
- Success: Large green checkmark animation
  - Employee name
  - "Tokens Remaining: X"
  - Auto-dismiss (3 seconds)
- Failure: Large red X animation
  - Error message
  - Auto-dismiss (4 seconds)

**Statistics Panel:**
- Collapsible sidebar (swipe/click to hide)
- Metrics:
  - Total scans today
  - Successful scans
  - Failed scans
  - Success rate (%)
- Recent scan history (last 10)

### 9.4 Accessibility Requirements

#### 9.4.1 WCAG 2.1 AA Compliance
- **Color Contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader:** Proper ARIA labels and semantic HTML
- **Focus Indicators:** Visible focus states for all interactive elements

#### 9.4.2 Inclusive Design
- **Touch Targets:** Minimum 44x44px for mobile
- **Text Size:** Minimum 16px for body text, scalable
- **Error Messages:** Clear, descriptive error messages
- **Loading States:** Visible loading indicators for all async actions

### 9.5 Performance Requirements

#### 9.5.1 Load Times
- **Initial Load:** < 3 seconds on 3G connection
- **Time to Interactive (TTI):** < 5 seconds
- **QR Code Scan:** < 1 second detection time
- **Real-time Update Latency:** < 2 seconds

#### 9.5.2 Optimization
- **Image Optimization:** WebP format, lazy loading
- **Code Splitting:** Route-based code splitting
- **Caching:** Aggressive caching of static assets
- **CDN:** Global CDN for fast delivery

---

## 10. Reporting & Analytics

### 10.1 Real-time Analytics (SuperAdmin Dashboard)

#### 10.1.1 Key Metrics
1. **Total Registrations**
   - Count of employees who have registered QR codes
   - Percentage of total employees
   - Trend: Registrations over time (line chart)

2. **Total Tokens Redeemed**
   - Sum of all tokens redeemed
   - Percentage of total allocated tokens
   - Average tokens per employee

3. **Redemption Rate**
   - Percentage of allocated tokens redeemed
   - Real-time progress bar
   - Projected final redemption rate

4. **Active Users**
   - Active HR users (currently logged in)
   - Active Scanner users (currently logged in)
   - Peak concurrent users

5. **Scan Activity**
   - Current scan rate (scans per minute)
   - Peak scan rate
   - Scans by hour (bar chart)

6. **Token Distribution**
   - Employees by token balance (histogram)
   - Average tokens remaining
   - Median tokens remaining

#### 10.1.2 Real-time Charts
- **Registrations Over Time:** Line chart, 5-minute intervals
- **Redemptions Over Time:** Line chart, 5-minute intervals
- **Scans by Hour:** Bar chart, hourly buckets
- **Token Balance Distribution:** Histogram, 0-18 tokens
- **Success vs. Failed Scans:** Donut chart

### 10.2 Report Generation

#### 10.2.1 Report Types

**1. Event Summary Report**
- Event details (name, date)
- Total employees imported
- Total registrations
- Total tokens allocated
- Total tokens redeemed
- Redemption rate
- Peak redemption time
- Average tokens per employee

**2. Employee Activity Report**
- List of all employees with:
  - Name
  - Email
  - Registration status
  - Registration timestamp
  - Tokens allocated
  - Tokens redeemed
  - Tokens remaining
  - First redemption time
  - Last redemption time

**3. Scanner Performance Report**
- List of all scanners with:
  - Scanner name
  - Total scans
  - Successful scans
  - Failed scans
  - Success rate
  - Average scan time
  - Peak activity time

**4. Redemption Timeline Report**
- Hourly breakdown of redemptions
- Peak redemption hours
- Redemption trends (chart)
- Busiest scanner stations

**5. Audit Trail Report**
- All administrative actions
- User activities (HR, SuperAdmin)
- QR code assignments/reassignments
- System events

#### 10.2.2 Report Export

**Format:** PDF

**Generation Process:**
1. SuperAdmin selects report type
2. SuperAdmin selects date range (if applicable)
3. Click "Generate Report"
4. System compiles data from Firestore
5. Generate PDF using jsPDF
6. Display preview modal
7. Click "Download PDF"
8. PDF saves to device

**PDF Structure:**
- Header: GoMonate logo, report title, generation date
- Executive summary (1 page)
- Detailed data tables
- Charts and visualizations
- Footer: Page numbers, confidentiality notice

**File Naming Convention:**
- `GoMonate_EventSummary_2025-12-04.pdf`
- `GoMonate_EmployeeActivity_2025-12-04.pdf`
- etc.

### 10.3 Data Export

#### 10.3.1 CSV Export (SuperAdmin)
**Available Exports:**
- Employee list (all data)
- Transaction history (all redemptions)
- Scanner activity (all scans)
- Audit logs (all administrative actions)

**CSV Format:**
```csv
# employees_export.csv
firstName,lastName,email,mobileNumber,registrationStatus,tokensAllocated,tokensRedeemed,tokensRemaining,registeredAt

# transactions_export.csv
transactionId,employeeId,employeeName,scannerId,scannerName,timestamp,tokensBefore,tokensAfter,scanMethod,status

# scanner_activity_export.csv
scannerId,scannerName,totalScans,successfulScans,failedScans,successRate,firstScanAt,lastScanAt
```

### 10.4 Analytics Dashboards

#### 10.4.1 SuperAdmin Dashboard Widgets

**Widget 1: Registration Progress**
- Circular progress indicator
- Center: "X / Y Registered"
- Subtext: "XX% complete"

**Widget 2: Redemption Heatmap**
- Hour-by-hour heatmap (rows: hours, columns: days)
- Color intensity: Number of redemptions
- Hover: Exact count

**Widget 3: Top Performers**
- List of employees with most redemptions
- Leaderboard style (top 10)
- Employee name, tokens redeemed

**Widget 4: Scanner Efficiency**
- List of scanners with success rates
- Bar chart visualization
- Green (>95%), Amber (90-95%), Red (<90%)

**Widget 5: Live Activity Feed**
- Real-time stream of events:
  - "John Doe redeemed 1 token"
  - "Scanner 3 scanned 10 tokens in last minute"
  - "Jane Smith registered"
- Auto-scroll, last 20 events

---

## 11. Edge Cases & Error Handling

### 11.1 Authentication Edge Cases

#### 11.1.1 Forgotten Password
**Scenario:** User forgets password

**Flow:**
1. User clicks "Forgot Password" on login page
2. Enter email address
3. System sends password reset email
4. User clicks reset link (valid 1 hour)
5. User enters new password (8 chars, 4 alpha + 4 numeric)
6. Password updated, redirect to login

**Error Handling:**
- Email not found: "Email not registered"
- Invalid token: "Reset link expired or invalid"
- Weak password: "Password must be 8 characters (4 letters + 4 numbers)"

#### 11.1.2 Account Deactivation During Session
**Scenario:** SuperAdmin deactivates user while they're logged in

**Handling:**
- Next API request: Return 403 Forbidden
- Display modal: "Your account has been deactivated. Please contact administrator."
- Force logout
- Redirect to login page

#### 11.1.3 Multiple Failed Login Attempts
**Scenario:** User enters wrong password 5 times

**Handling:**
- After 5th attempt: Lock account for 15 minutes
- Display: "Account locked due to multiple failed attempts. Try again in 15 minutes."
- Email sent to user (security notification)
- SuperAdmin can manually unlock

### 11.2 QR Code Edge Cases

#### 11.2.1 QR Code Already Registered
**Scenario:** Employee tries to register QR code that's already registered

**Handling:**
- Display error: "This code is already registered. If this is your code, please log in. If not, contact HR."
- Provide "Login" button
- Do not reveal which employee registered it (privacy)

#### 11.2.2 QR Code Expired
**Scenario:** Employee tries to use QR code after event end

**Handling:**
- Scanner: Display error "QR code expired"
- Employee dashboard: Display banner "Event has ended. Your QR code is no longer valid."
- No redemptions allowed

#### 11.2.3 Invalid QR Code
**Scenario:** Scanner scans non-GoMonate QR code

**Handling:**
- Display error: "Invalid QR code. Please ensure this is a GoMonate code."
- Audio error beep
- Do not increment failed scan count (not a legitimate attempt)

#### 11.2.4 QR Code Won't Scan (Technical Issue)
**Scenario:** Scanner cannot detect QR code (low light, screen glare, etc.)

**Solutions:**
1. **Brightness Adjustment:** Prompt employee to increase screen brightness
2. **Manual Entry:** Scanner uses 6-digit code fallback
3. **Reassignment:** HR assigns new QR code if issue persists

### 11.3 Token Redemption Edge Cases

#### 11.3.1 Zero Token Balance
**Scenario:** Scanner scans QR code with 0 tokens remaining

**Handling:**
- Display error: "No tokens remaining"
- Show employee name
- Audio error beep
- Increment failed scan count
- Do not allow redemption

#### 11.3.2 Rapid Successive Scans (Cooldown)
**Scenario:** Same QR code scanned twice within 5 seconds

**Handling:**
- Display: "Please wait X seconds before next scan"
- Show countdown timer
- Audio warning beep
- Do not deduct token
- Do not log as failed scan (intentional cooldown)

#### 11.3.3 Concurrent Scans (Race Condition)
**Scenario:** Two scanners scan same QR code simultaneously

**Handling:**
- **Server-side Transaction:** Use Firestore transactions for atomic token deduction
- First request succeeds, deducts token
- Second request fails (stale token balance)
- Display error to second scanner: "Token already redeemed. Please try again."

#### 11.3.4 Network Failure During Redemption
**Scenario:** Scanner loses network connectivity mid-scan

**Handling:**
- Display: "Network error. Checking redemption status..."
- Retry request (automatic, 3 attempts)
- If successful: Display success message
- If failed: Display "Network error. Please try again."
- Employee dashboard will update when network restored (idempotent)

### 11.4 Data Import Edge Cases

#### 11.4.1 CSV Format Errors
**Scenario:** Uploaded CSV has incorrect format

**Handling:**
- **Missing Headers:** Display error "CSV must have headers: firstName, lastName, email, mobileNumber"
- **Extra Columns:** Ignore extra columns, import valid data
- **Wrong Delimiter:** Attempt auto-detection (comma, semicolon, tab)
- **Empty File:** Display error "CSV file is empty"

#### 11.4.2 Duplicate Entries in CSV
**Scenario:** CSV contains duplicate email or mobile numbers

**Handling:**
- Skip duplicate rows
- Log errors: "Row X skipped: Duplicate email [email]"
- Continue processing remaining rows
- Display summary: "Imported: X, Skipped: Y (see errors)"

#### 11.4.3 Invalid Data in CSV
**Scenario:** CSV contains invalid email, mobile, or names

**Handling:**
- Validate each row
- Skip invalid rows
- Log specific errors:
  - "Row X: Invalid email format"
  - "Row X: Mobile number must start with +267"
  - "Row X: First name cannot contain numbers"
- Display detailed error report after import

### 11.5 Device & Browser Edge Cases

#### 11.5.1 Camera Permission Denied
**Scenario:** Employee denies camera permission during registration

**Handling:**
- Display: "Camera access required to scan QR code"
- Provide instructions to enable camera in browser settings
- Offer fallback: "Enter Code Manually" button

#### 11.5.2 Unsupported Browser
**Scenario:** User accesses site on Internet Explorer or very old browser

**Handling:**
- Display banner: "This browser is not supported. Please use Chrome, Firefox, Safari, or Edge."
- Provide download links to modern browsers
- Graceful degradation (basic functionality if possible)

#### 11.5.3 Offline Access
**Scenario:** User tries to access dashboard without internet

**Handling:**
- Display: "No internet connection. Please connect to Wi-Fi or mobile data."
- Cache employee dashboard page (service worker) for offline viewing of QR code
- Disable redemption actions (require online)

#### 11.5.4 Low Device Battery
**Scenario:** Employee's phone battery is low (<10%)

**Handling:**
- Display optional banner: "Low battery detected. Consider saving your QR code image."
- Emphasize "Save QR Code" button
- Allow QR code viewing even at low battery (no auto-sleep)

### 11.6 HR Portal Edge Cases

#### 11.6.1 No Search Results
**Scenario:** HR searches for employee, no results found

**Handling:**
- Display: "No employees found matching 'X'"
- Suggestions:
  - Check spelling
  - Try searching by email or mobile number
  - "Add New Employee" button (if not in system)

#### 11.6.2 Reassignment Without Consumption
**Scenario:** HR reassigns QR code when employee hasn't redeemed any tokens

**Handling:**
- Display confirmation: "Employee has not redeemed any tokens. Reassign code anyway?"
- Options: "Yes, Reassign" / "Cancel"
- If confirmed: Generate new QR code with full 18 tokens

#### 11.6.3 Multiple HR Users Assigning Same Employee
**Scenario:** Two HR users try to assign QR code to same employee simultaneously

**Handling:**
- **Firestore Transaction:** Atomic check-and-set operation
- First HR user succeeds
- Second HR user gets error: "QR code already assigned to this employee"
- Refresh employee search results

### 11.7 Scanner Station Edge Cases

#### 11.7.1 Scanner Accidentally Scans Own QR Code
**Scenario:** Scanner user tries to scan their own employee QR code

**Handling:**
- Display warning: "You cannot scan your own QR code at a scanner station"
- Do not deduct token
- Suggest: "Please use a different scanner station"

#### 11.7.2 Scanner Station Idle Timeout
**Scenario:** Scanner station left idle for extended period

**Handling:**
- After 30 minutes idle: Display warning "Scanner inactive. Logout for security?"
- After 60 minutes idle: Auto-logout
- Redirect to login page

#### 11.7.3 High-Volume Scanning (Event Rush)
**Scenario:** 100+ employees try to scan simultaneously

**Handling:**
- **Backend:** Cloud Functions scale automatically (Firebase)
- **Rate Limiting:** Enforce 5-second cooldown per QR code
- **Queue Display:** Show "Processing..." during high load
- **Performance:** Ensure <2 second response time under load

---

## 12. Performance Requirements

### 12.1 Response Time Targets

| Action | Target Response Time | Maximum Acceptable |
|--------|---------------------|-------------------|
| Page Load (First Load) | < 2 seconds | < 3 seconds |
| Page Load (Cached) | < 1 second | < 1.5 seconds |
| QR Code Scan Detection | < 500ms | < 1 second |
| Token Redemption (Backend) | < 1 second | < 2 seconds |
| Real-time Dashboard Update | < 2 seconds | < 3 seconds |
| Search Results (HR Portal) | < 500ms | < 1 second |
| Report Generation | < 5 seconds | < 10 seconds |
| CSV Import (100 rows) | < 3 seconds | < 5 seconds |

### 12.2 Scalability Requirements

#### 12.2.1 Concurrent Users
- **Expected:** 50 concurrent users (5 HR, 5 Scanners, 40 Employees)
- **Peak Load:** 200 concurrent users
- **Stress Test:** System should handle 500 concurrent users without degradation

#### 12.2.2 Database Operations
- **Reads per Second:** 1,000 reads/second
- **Writes per Second:** 100 writes/second
- **Firestore:** Automatically scales

#### 12.2.3 Storage
- **QR Code Images:** ~50KB per image
- **Total Storage (500 employees):** ~25MB QR codes + 10MB reports = 35MB
- **Firebase Storage:** 5GB free tier sufficient

### 12.3 Network Requirements

#### 12.3.1 Bandwidth
- **Per User:** ~500KB initial load, ~50KB per page transition
- **Total Bandwidth (200 users):** ~100MB initial, ~10MB sustained
- **CDN:** Global CDN reduces latency

#### 12.3.2 Offline Resilience
- **Service Worker:** Cache static assets for offline viewing
- **Queue Sync:** Queue failed requests, retry when online
- **Graceful Degradation:** Show cached data if real-time updates fail

### 12.4 Browser Performance

#### 12.4.1 Client-Side Optimization
- **Code Splitting:** Route-based lazy loading
- **Tree Shaking:** Remove unused code
- **Minification:** Minify JavaScript and CSS
- **Image Optimization:** WebP format, responsive images

#### 12.4.2 Rendering Performance
- **First Contentful Paint (FCP):** < 1.5 seconds
- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

---

## 13. Future Considerations

### 13.1 Potential Enhancements

#### 13.1.1 Multi-Event Support
- Create separate events within single platform
- Event templates (token allocations, settings)
- Historical event comparison
- Cross-event analytics

#### 13.1.2 Advanced Analytics
- Machine learning for redemption predictions
- Anomaly detection (unusual redemption patterns)
- Beverage preference tracking (if multiple drink types)
- Real-time alerts for low redemption rates

#### 13.1.3 Mobile Native Apps
- iOS app (Swift/SwiftUI)
- Android app (Kotlin/Jetpack Compose)
- Offline QR code viewing
- Push notifications for event updates

#### 13.1.4 Integration with POS Systems
- Direct integration with beverage POS
- Automatic inventory tracking
- Real-time stock alerts

#### 13.1.5 Gamification
- Leaderboards (most social employees)
- Badges for participation
- Social sharing features

### 13.2 Technical Debt Prevention

#### 13.2.1 Code Quality
- Enforce TypeScript strict mode
- ESLint + Prettier for code formatting
- Unit tests (Jest + React Testing Library)
- Integration tests (Cypress)
- Code coverage: >80%

#### 13.2.2 Documentation
- API documentation (OpenAPI/Swagger)
- Component documentation (Storybook)
- Developer onboarding guide
- System architecture diagrams

#### 13.2.3 Monitoring & Observability
- Firebase Performance Monitoring
- Error tracking (Sentry or Firebase Crashlytics)
- Custom dashboards (Grafana + Prometheus)
- Alerting for critical issues

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **QR Code** | Quick Response code - 2D barcode used for employee identification |
| **Token** | Digital beverage voucher (18 per employee) |
| **6-Digit Code** | Alphanumeric fallback code (e.g., A1B2C3) |
| **Redemption** | Act of scanning QR code to exchange token for beverage |
| **Cooldown** | 5-second wait period between scans of same QR code |
| **Binding** | Linking QR code to specific device during registration |
| **SuperAdmin** | Administrator with full system access |
| **HR User** | Staff responsible for QR code assignment |
| **Scanner User** | Staff operating beverage station scanners |
| **Employee** | Event attendee receiving beverage tokens |
| **Firestore** | Google Cloud NoSQL database |
| **Firebase** | Google Cloud platform for web/mobile apps |

---

## Appendix B: API Endpoints (Cloud Functions)

### B.1 Authentication Endpoints

```
POST /api/auth/login
Body: { email, password, role }
Response: { token, user, expiresAt }

POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: true }

POST /api/auth/reset-password
Body: { email }
Response: { success: true, message: "Reset email sent" }

POST /api/auth/change-password
Body: { oldPassword, newPassword }
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### B.2 Employee Management Endpoints

```
GET /api/employees
Query: { search?, limit?, offset? }
Headers: { Authorization: Bearer <token> }
Response: { employees: [], total, page }

POST /api/employees
Body: { firstName, lastName, email, mobileNumber }
Headers: { Authorization: Bearer <token> }
Response: { employee: {...}, id }

POST /api/employees/import
Body: { csvData: string }
Headers: { Authorization: Bearer <token> }
Response: { imported: 10, failed: 2, errors: [...] }

GET /api/employees/:id
Headers: { Authorization: Bearer <token> }
Response: { employee: {...} }
```

### B.3 QR Code Management Endpoints

```
POST /api/qr-codes/assign
Body: { employeeId }
Headers: { Authorization: Bearer <token> }
Response: { qrCode: {...}, sixDigitCode, qrImageUrl }

POST /api/qr-codes/reassign
Body: { employeeId, reason }
Headers: { Authorization: Bearer <token> }
Response: { qrCode: {...}, sixDigitCode, tokensTransferred }

POST /api/qr-codes/register
Body: { qrCodeId OR sixDigitCode, deviceInfo }
Response: { employee: {...}, tokenBalance, sessionToken }

GET /api/qr-codes/:id
Headers: { Authorization: Bearer <token> }
Response: { qrCode: {...}, employee: {...} }
```

### B.4 Transaction Endpoints

```
POST /api/transactions/redeem
Body: { qrCodeId OR sixDigitCode, scannerId }
Headers: { Authorization: Bearer <token> }
Response: { success: true, tokensRemaining, employee: {...} }

GET /api/transactions
Query: { employeeId?, scannerId?, startDate?, endDate?, limit?, offset? }
Headers: { Authorization: Bearer <token> }
Response: { transactions: [], total, page }

GET /api/transactions/stats
Query: { startDate?, endDate? }
Headers: { Authorization: Bearer <token> }
Response: { totalRedemptions, successRate, peakHour, ... }
```

### B.5 Reporting Endpoints

```
POST /api/reports/generate
Body: { reportType, dateRange?, filters? }
Headers: { Authorization: Bearer <token> }
Response: { reportId, downloadUrl, generatedAt }

GET /api/reports/:id
Headers: { Authorization: Bearer <token> }
Response: { report: {...}, pdfUrl }

POST /api/reports/export-csv
Body: { dataType: 'employees'|'transactions'|'scanners', filters? }
Headers: { Authorization: Bearer <token> }
Response: { csvUrl, generatedAt }
```

### B.6 Analytics Endpoints

```
GET /api/analytics/dashboard
Headers: { Authorization: Bearer <token> }
Response: { metrics: {...}, charts: {...} }

GET /api/analytics/real-time
Headers: { Authorization: Bearer <token> }
Response: { registrations, redemptions, activeUsers, scanRate }

GET /api/analytics/redemptions-by-hour
Query: { date? }
Headers: { Authorization: Bearer <token> }
Response: { hourlyData: [{ hour, count }] }
```

---

## Appendix C: Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gomonate.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gomonate
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gomonate.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=gomonate
FIREBASE_ADMIN_CLIENT_EMAIL=<service-account-email>
FIREBASE_ADMIN_PRIVATE_KEY=<private-key>

# Application Configuration
NEXT_PUBLIC_APP_URL=https://gomonate.app
NEXT_PUBLIC_API_BASE_URL=https://api.gomonate.app

# Event Configuration
EVENT_NAME="FNB End-of-Year Celebration"
EVENT_DATE="2025-12-15"
EVENT_END_DATE="2025-12-16"
DEFAULT_TOKEN_ALLOCATION=18
SCAN_COOLDOWN_SECONDS=5

# Email Configuration (for password resets)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<password>
FROM_EMAIL=noreply@gomonate.app

# Security
JWT_SECRET=<random-secret>
SESSION_TIMEOUT_HOURS=8

# Feature Flags
ENABLE_MULTI_EVENT=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS_EXPORT=true
```

---

## Appendix D: Deployment Checklist

### Pre-Launch
- [ ] All Firestore security rules configured and tested
- [ ] All Firebase Auth methods enabled (Email/Password)
- [ ] Environment variables configured for production
- [ ] Domain (gomonate.app) configured and SSL enabled
- [ ] Firebase billing plan upgraded (Blaze plan for Cloud Functions)
- [ ] SuperAdmin account created manually
- [ ] CSV template for employee import prepared
- [ ] QR code generation tested with 100+ codes
- [ ] Token redemption flow tested under load (500 concurrent scans)
- [ ] Real-time updates verified across all roles
- [ ] Report generation tested with large datasets (1000+ transactions)
- [ ] Error handling tested for all edge cases
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Mobile responsiveness tested on 5+ devices
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Performance benchmarks met (all < target response times)

### Launch Day
- [ ] Final data backup before go-live
- [ ] Monitor Firebase console for errors
- [ ] HR users created and credentials distributed
- [ ] Scanner users created and credentials distributed
- [ ] Employee CSV imported successfully
- [ ] Test QR code assignment and registration flow
- [ ] Test token redemption at scanner stations
- [ ] Verify real-time dashboard updates
- [ ] Monitor system performance under actual load

### Post-Launch
- [ ] Daily monitoring of system health
- [ ] Review error logs and user feedback
- [ ] Generate daily summary reports
- [ ] Monitor token redemption rates
- [ ] Address any performance issues immediately
- [ ] Backup all event data after event conclusion
- [ ] Generate final event report
- [ ] Archive or destroy data as per privacy policy

---

## Appendix E: Support & Maintenance

### 13.1 Support Tiers

**Tier 1: Self-Service**
- FAQ page
- Video tutorials
- User guides (PDF)

**Tier 2: On-Site Support (Event Day)**
- Dedicated support staff at registration
- Dedicated support staff at scanner stations
- Walkie-talkie communication for quick escalation

**Tier 3: Technical Support**
- Email: support@gomonate.app
- Phone: +267 XXX XXXX (during event hours)
- Response time: < 15 minutes during event

### 13.2 Maintenance Windows

**Regular Maintenance:**
- Weekly: Sunday 2:00 AM - 4:00 AM (CAT)
- Database optimization
- Backup verification
- Security updates

**Emergency Maintenance:**
- Anytime if critical security issue
- Anytime if system outage
- Notify all users via email/SMS

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | [Your Name] | Initial PRD creation |

---

## Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| SuperAdmin | | | |
| HR Manager | | | |

---

**END OF DOCUMENT**
