<div align="center">

<img src="https://raw.githubusercontent.com/Omatsulijoshua/NovaPay/main/novapay_flutter/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" width="100" alt="NovaPay Logo"/>

# NovaPay

### A Modern, Full-Stack Peer-to-Peer Digital Wallet & Payment Platform

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-6366f1?style=for-the-badge)](assets/NovaPay.apk)

<br/>

> **NovaPay** is a production-ready fintech application that lets users send and receive money instantly using unique 10-digit account numbers — powered by Flutter, React, and Supabase.

<br/>

[📥 Download APK](assets/NovaPay.apk) • [🌐 Live Backend](https://fdopodxxrhkkqinilswu.supabase.co) • [🐛 Report Bug](https://github.com/Omatsulijoshua/NovaPay/issues) • [✨ Request Feature](https://github.com/Omatsulijoshua/NovaPay/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Highlights](#-key-highlights)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Security Model](#-security-model)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup-supabase)
  - [Flutter App](#2-flutter-mobile-app)
  - [React Web App](#3-react-web-app)
- [Install on Android](#-install-on-android)
- [API Reference](#-api-reference-rpc-functions)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**NovaPay** is a full-stack, production-grade peer-to-peer (P2P) digital payment platform that replicates the core functionality of modern mobile money apps (like OPay, PalmPay, Kuda). It enables real-time money transfers between users using unique **10-digit account numbers** — all powered by cutting-edge open-source technologies.

The platform is delivered as **two complete client applications** sharing a single unified backend:

| Client | Technology | Target |
|---|---|---|
| 📱 Mobile App | Flutter + Dart | Android (APK) |
| 🌐 Web App | React + TypeScript | Browser (PWA) |

Both apps connect to a **Supabase** backend that handles authentication, real-time data synchronization, atomic financial transactions, and row-level access control — with zero custom server code.

---

## 🚀 Key Highlights

- ⚡ **Real-time** — Balance and transactions update instantly across all devices
- 🔒 **Bank-grade Security** — Atomic PostgreSQL transactions with deadlock prevention
- 🆔 **Unique Account Numbers** — Auto-generated 10-digit IDs for every user on signup
- 📱 **Cross-Platform** — One codebase runs natively on Android; web builds included
- 🧾 **PDF Receipts** — Print or share transaction receipts natively from the app
- 📷 **QR Payments** — Scan or share a QR code to receive money instantly
- 🛡️ **Row-Level Security** — Users can only ever access their own financial data
- 🔍 **Smart Search** — Filter and search transactions by name, reference, or description

---

## ✨ Features

### 🔐 Authentication & Onboarding
- Email & password **signup and login**
- Automatic **profile + wallet creation** on first signup (via database trigger)
- Auto-generated **unique 10-digit account number** for every new user
- **Forgot password** — sends a reset link to the user's email
- **Reset password** screen for updating credentials securely
- JWT-based **session persistence** — users stay logged in across app restarts

### 💰 Wallet & Balance Management
- Live wallet balance displayed on the home screen
- **Show / Hide balance** toggle for privacy in public spaces
- **Real-time balance sync** — updates instantly when money is received
- One-tap **copy account number** to clipboard

### 💸 Send Money
- Recipient lookup by **10-digit account number** in real time
- Recipient's **full name previewed** before confirming transfer
- **Self-transfer prevention** — blocked at the database level
- **Insufficient balance validation** with clear error messaging
- Bottom-sheet **confirmation dialog** showing full transfer details
- Transfer executed atomically via **PostgreSQL stored procedure**
- Full-screen **success receipt** shown after every completed transfer
- Every transaction gets a **unique reference number**

### 📲 Receive Money
- Auto-generated **QR code** that encodes the user's account number
- Share QR image or account number via native **share sheet**
- One-tap **copy account number** to clipboard
- Clean, minimal UI optimized for showing others your payment details

### 📋 Transaction History
- Complete chronological list of **all sent and received transactions**
- Transactions grouped by **date headers** (Today, Yesterday, older dates)
- **Search** transactions by name, description, or reference number
- **Filter tabs**: All / Sent / Received
- Color-coded direction indicators (🟢 green = received, 🔴 red = sent)
- Status badges (Completed, Pending, Failed)

### 🧾 Transaction Details & Receipts
- Full detail screen for every transaction: reference, parties, amount, date, description
- **Share as text** — sends a formatted receipt via native share sheet
- **Print receipt** — generates a pixel-perfect PDF in memory and sends to the system printer/PDF viewer

### 👤 Profile & Settings
- View full name, email, account number
- Secure **logout** that clears the session completely

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│   ┌──────────────────────────┐   ┌──────────────────────────┐   │
│   │     Flutter Mobile App   │   │      React Web App        │   │
│   │   ┌──────────────────┐   │   │   ┌──────────────────┐   │   │
│   │   │  Provider State  │   │   │   │  Context + Hooks │   │   │
│   │   └────────┬─────────┘   │   │   └────────┬─────────┘   │   │
│   │            │             │   │            │             │   │
│   │   supabase_flutter SDK   │   │   @supabase/supabase-js  │   │
│   └────────────┼─────────────┘   └────────────┼─────────────┘   │
└────────────────┼────────────────────────────── ┼ ───────────────┘
                 │   HTTPS / WebSocket            │
                 ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                           │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Auth Service   │  │  REST / PostgREST│  │    Realtime    │  │
│  │  (JWT tokens)   │  │  (Auto-generated)│  │  (WebSockets)  │  │
│  └─────────────────┘  └────────┬─────────┘  └───────┬────────┘  │
│                                │                     │           │
│                    ┌───────────▼─────────────────────▼──────┐   │
│                    │           PostgreSQL 15                 │   │
│                    │                                        │   │
│                    │  Tables:  profiles, wallets,           │   │
│                    │           transactions                  │   │
│                    │                                        │   │
│                    │  RLS:     Row-Level Security on all    │   │
│                    │           tables                       │   │
│                    │                                        │   │
│                    │  RPCs:    transfer_money()             │   │
│                    │           get_transaction_history()    │   │
│                    │           lookup_recipient()           │   │
│                    │           handle_new_user() [trigger]  │   │
│                    └────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow: Money Transfer

```
User enters recipient account number
           │
           ▼
  lookup_recipient() RPC
  (validates account exists)
           │
           ▼
  Confirmation sheet shown
  (name, amount, description)
           │
           ▼
  transfer_money() RPC called
           │
     ┌─────▼──────────────────────────────────┐
     │  BEGIN TRANSACTION                      │
     │  1. Verify auth.uid() not null          │
     │  2. Resolve recipient UUID              │
     │  3. Block self-transfers                │
     │  4. Lock wallets (sorted UUID order)    │
     │  5. Check sender balance >= amount      │
     │  6. Debit sender wallet                 │
     │  7. Credit recipient wallet             │
     │  8. Insert transaction record           │
     │  9. Return transaction reference        │
     │  COMMIT                                 │
     └─────────────────────────────────────────┘
           │
           ▼
  Realtime subscription fires on both
  sender and recipient devices —
  balances update instantly
           │
           ▼
  Success receipt displayed
```

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Mobile** | Flutter | 3.x | Cross-platform mobile framework |
| **Mobile Language** | Dart | 3.x | Type-safe, compiled language |
| **Mobile State** | Provider | 6.x | Reactive state management |
| **Web Framework** | React | 18 | Component-based web UI |
| **Web Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Web Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **Web Components** | shadcn/ui | Latest | Accessible component library |
| **Backend** | Supabase | Latest | Backend-as-a-Service |
| **Database** | PostgreSQL | 15 | Relational database with RLS |
| **Auth** | Supabase Auth | Latest | JWT-based authentication |
| **Real-time** | Supabase Realtime | Latest | WebSocket pub/sub |
| **PDF** | printing + pdf | Latest | In-app PDF receipt generation |
| **QR Codes** | qr_flutter | Latest | QR code widget generation |
| **Fonts** | Google Fonts (Poppins) | Latest | Modern, clean typography |
| **Build Tool** | Vite | 5.x | Fast web bundler |

---

## 📂 Project Structure

```
NovaPay/
│
├── 📁 assets/
│   └── NovaPay.apk                    # ← Ready-to-install Android APK
│
├── 📁 novapay_flutter/                # Flutter mobile application
│   ├── 📁 lib/
│   │   ├── main.dart                  # Entry point, router, providers
│   │   ├── 📁 models/
│   │   │   ├── profile.dart           # User profile model
│   │   │   ├── wallet.dart            # Wallet balance model
│   │   │   └── transaction.dart       # Transaction model
│   │   ├── 📁 services/
│   │   │   ├── auth_service.dart      # Login, signup, session
│   │   │   ├── wallet_service.dart    # Balance fetch + realtime
│   │   │   ├── transaction_service.dart # History + details
│   │   │   └── transfer_service.dart  # Send money RPC calls
│   │   ├── 📁 screens/
│   │   │   ├── login_screen.dart
│   │   │   ├── signup_screen.dart
│   │   │   ├── forgot_password_screen.dart
│   │   │   ├── reset_password_screen.dart
│   │   │   ├── dashboard_screen.dart  # Bottom nav shell
│   │   │   ├── home_tab.dart          # Balance + quick actions
│   │   │   ├── send_money_screen.dart # Transfer flow
│   │   │   ├── receive_money_screen.dart # QR code screen
│   │   │   ├── transactions_screen.dart  # History list
│   │   │   ├── transaction_details_screen.dart # Receipt
│   │   │   └── profile_screen.dart
│   │   └── 📁 widgets/
│   │       ├── custom_button.dart     # Async-aware button
│   │       ├── custom_input.dart      # Validated text field
│   │       ├── wallet_card.dart       # Balance display card
│   │       └── transaction_item.dart  # Transaction list tile
│   ├── 📁 android/                    # Android platform config
│   │   └── app/src/main/
│   │       ├── AndroidManifest.xml    # Permissions + app name
│   │       └── res/mipmap-*/          # App icons (all densities)
│   └── pubspec.yaml                   # Flutter dependencies
│
├── 📁 src/                            # React web application
│   ├── 📁 components/                 # Reusable UI components
│   ├── 📁 pages/                      # Route-level page components
│   ├── 📁 hooks/                      # Custom React hooks
│   ├── 📁 services/                   # API service functions
│   ├── 📁 context/                    # React context providers
│   ├── 📁 types/                      # TypeScript type definitions
│   └── 📁 utils/                      # Helper utilities
│
├── 📁 supabase/
│   └── 📁 migrations/
│       └── 20260826000000_init.sql    # Complete DB schema + RPCs
│
├── .env.example                       # Environment variable template
├── .gitignore
├── package.json                       # Node dependencies
├── pubspec.yaml                       # Flutter dependencies
└── README.md
```

---

## 🗄️ Database Schema

### Table: `profiles`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users` | Matches the auth user ID |
| `full_name` | `text` | NOT NULL | User display name |
| `email` | `text` | NOT NULL, UNIQUE | User email address |
| `account_number` | `varchar(10)` | NOT NULL, UNIQUE | Auto-generated 10-digit ID |
| `created_at` | `timestamptz` | DEFAULT now() | Record creation time |
| `updated_at` | `timestamptz` | DEFAULT now() | Last modification time |

### Table: `wallets`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT gen_random_uuid() | Wallet ID |
| `user_id` | `uuid` | FK → `profiles.id`, UNIQUE | One wallet per user |
| `balance` | `numeric(18,2)` | NOT NULL, DEFAULT 0 | Current balance |
| `currency` | `varchar(3)` | NOT NULL, DEFAULT 'NGN' | ISO currency code |
| `created_at` | `timestamptz` | DEFAULT now() | Created timestamp |
| `updated_at` | `timestamptz` | DEFAULT now() | Updated timestamp |

### Table: `transactions`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Transaction ID |
| `reference` | `varchar(50)` | NOT NULL, UNIQUE | Human-readable tx reference |
| `sender_id` | `uuid` | FK → `profiles.id` | Sender's user ID |
| `recipient_id` | `uuid` | FK → `profiles.id` | Recipient's user ID |
| `amount` | `numeric(18,2)` | NOT NULL, CHECK > 0 | Transfer amount |
| `currency` | `varchar(3)` | NOT NULL | ISO currency code |
| `transaction_type` | `varchar(30)` | NOT NULL | e.g. `transfer` |
| `status` | `varchar(20)` | NOT NULL | `completed`, `failed`, etc. |
| `description` | `text` | NULLABLE | Optional transfer note |
| `created_at` | `timestamptz` | DEFAULT now() | Transaction timestamp |

---

## 🔒 Security Model

NovaPay uses a **defense-in-depth** security approach with multiple layers:

### 1. Row-Level Security (RLS)
Every table has RLS enabled with strict `USING` clauses:

```sql
-- profiles: users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- wallets: users can only see their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

-- transactions: users can only see transactions they are part of
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
```

### 2. SECURITY DEFINER Functions
All cross-user operations (e.g., crediting a recipient's wallet) run via `SECURITY DEFINER` stored procedures. These run with elevated DB privileges in a **tightly controlled, auditable scope** — making it impossible for clients to directly manipulate another user's balance.

### 3. Atomic Transactions with Deadlock Prevention
```sql
-- Locks are always acquired in sorted UUID order
-- to prevent deadlock between concurrent transfers
IF sender_uuid < recipient_uuid THEN
  SELECT balance INTO sender_bal FROM wallets WHERE user_id = sender_uuid FOR UPDATE;
  SELECT balance INTO recipient_bal FROM wallets WHERE user_id = recipient_uuid FOR UPDATE;
ELSE
  SELECT balance INTO recipient_bal FROM wallets WHERE user_id = recipient_uuid FOR UPDATE;
  SELECT balance INTO sender_bal FROM wallets WHERE user_id = sender_uuid FOR UPDATE;
END IF;
```

### 4. Server-Side Identity Verification
```sql
-- Inside every RPC, the caller's identity is verified server-side
sender_uuid := auth.uid();
IF sender_uuid IS NULL THEN
  RAISE EXCEPTION 'Unauthorized';
END IF;
```

No client can forge a transfer — the server always resolves the true caller from the JWT.

---

## 🚀 Getting Started

### Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Flutter SDK | 3.0.0 | [flutter.dev](https://flutter.dev/docs/get-started/install) |
| Dart SDK | 3.0.0 | Included with Flutter |
| Node.js | 18.0 | [nodejs.org](https://nodejs.org) |
| npm | 9.0 | Included with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com) |
| Supabase account | — | [supabase.com](https://supabase.com) (free) |

---

### 1. Backend Setup (Supabase)

#### Create Project
1. Log in at [supabase.com](https://supabase.com)
2. Click **New Project** → set name, password, region
3. Copy your **Project Reference ID** from the project URL

#### Deploy Schema via CLI
```bash
# Clone the repo
git clone https://github.com/Omatsulijoshua/NovaPay.git
cd NovaPay

# Initialize Supabase locally
npx supabase init

# Login to Supabase
npx supabase login

# Link to your remote project
npx supabase link --project-ref YOUR_PROJECT_REF --password YOUR_DB_PASSWORD

# Push all migrations (tables, triggers, RPCs, RLS)
npx supabase db push
```

#### Enable Realtime
```bash
npx supabase db query --linked \
  "alter publication supabase_realtime add table public.wallets;
   alter publication supabase_realtime add table public.transactions;"
```

#### Get Your API Keys
Go to **Supabase Dashboard** → **Settings** → **API** and copy:
- `Project URL` (e.g. `https://xxxx.supabase.co`)
- `anon / public` key (long JWT string)

---

### 2. Flutter Mobile App

```bash
# Navigate to Flutter app
cd novapay_flutter

# Install dependencies
flutter pub get

# Configure credentials in lib/main.dart
# Replace the defaultValue strings:
const String supabaseUrl = String.fromEnvironment(
  'SUPABASE_URL',
  defaultValue: 'https://YOUR_REF.supabase.co',
);
const String supabaseAnonKey = String.fromEnvironment(
  'SUPABASE_ANON_KEY',
  defaultValue: 'YOUR_ANON_KEY',
);

# Run on connected device / emulator
flutter run

# Or build release APK
flutter build apk --release
# → build/app/outputs/flutter-apk/app-release.apk
```

---

### 3. React Web App

```bash
# From the project root
npm install

# Create .env file
cp .env.example .env

# Edit .env and fill in:
# VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
# VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📱 Install on Android

A pre-built release APK is included in this repo under [`assets/NovaPay.apk`](assets/NovaPay.apk).

### Steps:

**Step 1** — Download the APK from GitHub:
> [`assets/NovaPay.apk`](assets/NovaPay.apk) → click **Download**

**Step 2** — Enable installing from unknown sources:
- Android 8+: **Settings** → **Apps** → **Special app access** → **Install unknown apps** → enable for your file manager
- Older Android: **Settings** → **Security** → enable **Unknown sources**

**Step 3** — Open the downloaded APK and tap **Install**

**Step 4** — Launch **NovaPay** from your app drawer and sign up!

> **Minimum Android version**: Android 6.0 Marshmallow (API 23)
> **APK size**: ~51 MB

---

## 📡 API Reference (RPC Functions)

All database functions are callable via Supabase's REST API or client SDKs.

### `transfer_money(recipient_account_number, transfer_amount, transfer_description)`

Performs an atomic peer-to-peer transfer.

| Parameter | Type | Description |
|---|---|---|
| `recipient_account_number` | `varchar(10)` | Target account number |
| `transfer_amount` | `numeric(18,2)` | Amount to transfer (must be > 0) |
| `transfer_description` | `text` | Optional note/description |

**Returns**: `JSONB` with `{ reference, amount, status, created_at }`

**Errors thrown**:
- `Unauthorized` — user not logged in
- `Recipient account not found` — invalid account number
- `You cannot transfer money to your own account` — self-transfer blocked
- `Insufficient balance` — sender balance too low
- `Transfer amount must be greater than zero` — invalid amount

---

### `get_transaction_history()`

Returns the full transaction history for the authenticated user with sender and recipient names resolved.

**Returns**: Table of `{ id, reference, amount, currency, transaction_type, status, description, created_at, sender_id, sender_name, sender_account, recipient_id, recipient_name, recipient_account }`

---

### `lookup_recipient(recipient_account_number)`

Looks up a recipient by account number (bypasses RLS safely via SECURITY DEFINER).

| Parameter | Type | Description |
|---|---|---|
| `recipient_account_number` | `varchar(10)` | Account number to look up |

**Returns**: `{ full_name, account_number }`

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Email/password authentication
- [x] Auto-provisioned 10-digit account numbers
- [x] Wallet creation on signup
- [x] Real-time balance updates
- [x] P2P money transfers (atomic)
- [x] Transaction history with search & filters
- [x] QR code receive screen
- [x] PDF receipt generation & printing
- [x] Android APK build
- [x] Supabase backend deployed to production

### 🔜 Planned
- [ ] Push notifications for incoming transfers
- [ ] Transaction PIN / 2-step transfer confirmation
- [ ] Biometric authentication (fingerprint / Face ID)
- [ ] iOS support
- [ ] Airtime & data top-up
- [ ] Electricity & cable bill payments
- [ ] Bank account withdrawal
- [ ] Multi-currency wallets
- [ ] Spending analytics & charts
- [ ] Dark mode
- [ ] Scheduled / recurring transfers

---

## 🤝 Contributing

Contributions are warmly welcome! Here is how to get started:

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/NovaPay.git
   cd NovaPay
   ```
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make** your changes and commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push** and open a Pull Request:
   ```bash
   git push origin feature/amazing-feature
   ```

### Commit Types
| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style / formatting |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build system / dependency updates |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Omatsulijoshua

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

**Built with ❤️ using Flutter & Supabase**

⭐ If you found this project helpful, please give it a star!

[⬆ Back to top](#novapay)

</div>
