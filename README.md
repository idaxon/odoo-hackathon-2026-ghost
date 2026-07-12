# 🛡️ AssetFlow — Enterprise Asset & Resource Optimization System

> **A next-generation Digital Twin platform that eliminates hardware waste, prevents duplicate procurement, and resolves scheduling collisions — all from a single unified dashboard.**

[![Built with](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20SQLite-339933?style=flat-square&logo=node.js)](https://expressjs.com)
[![Hackathon](https://img.shields.io/badge/Odoo%20Hackathon-2026-714B67?style=flat-square)](https://www.odoo.com)

---

## 🎓 Participant Details

| Field | Detail |
|-------|--------|
| **Developer** | DAKSH MISHRA |
| **Institution** | BML MUNJAL UNIVERSITY |
| **Event** | Odoo Hackathon 2026 |

---

## 📌 The Problem We Solve

Large enterprises silently bleed millions annually from **three operational failures**:

| Problem | Impact | How AssetFlow Fixes It |
|---------|--------|----------------------|
| 🔴 **Duplicate Procurement** | Departments buy hardware that already exists idle in storage | Smart interception screen blocks duplicate requests & surfaces idle inventory |
| 🔴 **Ghost Assets & Losses** | Equipment goes missing with no location audit trail | QR-based check-in trail logs every scan with timestamped location updates |
| 🔴 **Scheduling Collisions** | Double-booked meeting rooms and equipment cause productivity loss | Real-time conflict detection with automatic alternative recommendations |

---

## ✨ Core Features & Real-World Applications

### 1. 📊 AI-Powered Dashboard Briefs
The dashboard doesn't show static cards — it **queries the live SQLite database** on every load to construct intelligent alerts:
- *"HP Printer repair cost (₹18,000) exceeds replacement cost (₹15,000) — consider replacing"*
- *"MacBook Air has been idle in HR storage for 20+ days"*
- *"2 booking conflicts detected for today's schedule"*

**Real-world use:** Operations managers open one screen and instantly know what needs attention.

---

### 2. 💬 Interactive "Talk to Asset" Digital Twin Chat
Every asset has a **first-person conversational chatbot** that speaks like a real person, powered by live database values:

| Question You Ask | What the Asset Responds |
|-----------------|------------------------|
| *"How are you feeling?"* | Reports health score with emotional context (happy when healthy, asks for help when degraded) |
| *"How old are you?"* | Calculates real age from purchase date and responds as new/prime/veteran |
| *"Are you still under warranty?"* | Checks warranty expiry date, counts remaining days |
| *"Should we repair or replace you?"* | Compares repair vs replacement costs and gives honest financial advice |
| *"Are you tired?"* | Reports workload fatigue based on health score trends |
| *"Any complaints?"* | Flags maintenance needs or confirms everything is running smoothly |

**Real-world use:** Non-technical staff can "interview" equipment to understand its condition without reading spreadsheets.

---

### 3. 🔄 Intelligent Duplicate Prevention Engine
When an employee requests new hardware:
1. The system **scans existing inventory** for idle/available items in the same category
2. If duplicates exist → shows an **Interception Screen** listing reusable alternatives
3. If the user overrides → the request enters the **Manager Approval Queue** flagged with a blinking **"Duplicate Risk"** badge

**Real-world use:** Prevents ₹50,000+ wasted per unnecessary laptop/printer purchase. Finance teams get visibility into procurement waste patterns.

---

### 4. 📍 QR Code Location Trails & Check-In System
Every asset generates a **live QR code** that, when scanned:
- Opens a **mobile-optimized public view** (sidebar/topbar auto-hide)
- Prompts the scanner to log the asset's current location
- Updates a **chronological Location Trail** and a "Last Seen" metadata badge

**Real-world use:** Field engineers scan assets during audits. Security teams track high-value equipment across campus buildings. Lost items are traced to their last scanned location.

---

### 5. ⚡ Collision-Free Resource Scheduler with Gantt Grid
The Bookings page features:
- A **visual hourly timeline grid** (8 AM - 8 PM) showing occupied vs free slots
- **Conflict detection** that blocks overlapping reservations instantly
- **Smart alternative suggestions** — if Room B is taken, it recommends Room A
- **Cancel & Release** — deletes bookings, frees timeline blocks, and logs the action

**Real-world use:** Eliminates meeting room double-bookings. Equipment managers see at a glance which projectors, vehicles, or labs are available.

---

### 6. 🛠️ Maintenance Resolution with QR Verification
Resolving a maintenance ticket requires:
1. **Written resolution notes** describing actions taken
2. **QR code verification** — scan or type the asset code to confirm you're fixing the right device
3. On completion: asset health **auto-heals to 95%** and the event is appended to the **Lifecycle Timeline**

**Real-world use:** Ensures technicians document their work and verify they're servicing the correct machine — preventing mix-ups in large facilities.

---

### 7. 📈 Financial Reports & CSV Export
The Reports page runs **live calculations** against the database:
- **Asset Valuation & Depreciation** — straight-line depreciation across all assets
- **Utilization & Idle Analysis** — identifies underused equipment
- **Maintenance Cost Tracking** — total repair spend per asset
- One-click **CSV export** for finance teams

---

### 8. 🔔 Live Notification Feed & Help Center
- **Notification Bell** — polls SQLite activity logs every 15 seconds, showing the 5 most recent system events
- **Help Center** — contextual FAQ panel explaining QR check-ins, duplicate rules, and scheduling workflows

---

### 9. 🛡️ Robust Input Validation
Every form across the application enforces:
- **Required field checks** with inline red error messages
- **Minimum length enforcement** (e.g., descriptions must be ≥10 characters)
- **Logical validation** (e.g., end time must be after start time)
- **QR verification gates** (maintenance resolution requires successful scan match)

---

## 🎨 Design System & Color Palette

AssetFlow follows a **dense enterprise design language** optimized for trust and readability:

| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `#714B67` (Dusty Plum) | Sidebar, branding, primary buttons, chat bubbles |
| **Secondary** | `#017E84` (Teal-Green) | Success states, health bars, scan confirmations |
| **Surface** | `#FFFFFF` with `1px solid #E5E5E5` | Card backgrounds with micro-shadow `rgba(0,0,0,0.06)` |
| **Border Radius** | `8px` cards / `6px` buttons / `4px` badges | Consistent rounded corners throughout |
| **Constraint** | Zero gradients, zero glassmorphism | Mimics dense, fast enterprise ERP aesthetics |

---

## ⚙️ Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Vite + React 18 (TypeScript) + Tailwind CSS v4     │
│  Lucide Icons · QRCode.react · React Router v6      │
├─────────────────────────────────────────────────────┤
│                  REST API LAYER                      │
│  Express.js Server (Node.js)                        │
│  15+ endpoints · CORS enabled · JSON middleware     │
├─────────────────────────────────────────────────────┤
│                    DATABASE                          │
│  SQLite (better-sqlite3) · File: assetflow.db       │
│  Tables: assets, employees, departments, bookings,  │
│  maintenance_requests, activity_logs, scan_history   │
└─────────────────────────────────────────────────────┘
```

### Key Technical Decisions
- **SQLite over cloud DB** — runs 100% offline, zero API keys, zero internet dependency
- **QR codes generated client-side** — `qrcode.react` library, no external service calls
- **Pattern-matching chat engine** — no LLM dependency, responses built from live DB values
- **Real-time polling** — notifications refresh every 15 seconds via `setInterval`

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+ and npm

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
> The server auto-creates `assetflow.db` on first run, seeding **12 assets**, **6 employees**, **3 departments**, and **sample bookings/maintenance tickets**.

### 2. Start the Frontend Client
```bash
cd AssetFlow
npm install
npm run dev -- --host
```
> The `--host` flag exposes the app on your local network (e.g., `http://192.168.1.x:5173`), enabling phones on the same Wi-Fi to scan QR codes directly.

### 3. Open in Browser
```
http://localhost:5173
```

---

## 🎯 Judges' Interactive Demo Script

Follow these steps to experience every feature in under 5 minutes:

### Step 0: Administrative Sign In (Auth Gateway)
1. Open the application. You are automatically presented with the secure **AssetFlow Login Page**.
2. Review the autocomplete-friendly layout. Enter the default administrator email `admin@assetflow.com` and password `admin`, or simply click **One-Click Login as Admin**.
3. Click **Sign In**. On success, the secure cookie/storage session initializes and redirects you to the AI Briefs dashboard page.
4. Try clicking the **Sign Out** (Log Out) button in the bottom sidebar tray to return to the gateway, then log back in to continue the demo.

### Step 1: Duplicate Prevention (Assets Page)
1. Navigate to the **Assets** tab → Click **Request New Asset**
2. Select **Printer** category → Click **Submit Request**
3. ⚠️ The **Interception Screen** appears — warning that idle printers already exist
4. Click **Still Request New** to override → observe the **"Duplicate Risk"** badge in the approval queue

### Step 2: QR Location Check-In (Asset Detail Page)
1. Open any asset's detail page (e.g., **MacBook Pro 16"**)
2. Append `?scan=true` to the URL to simulate a physical QR scan
3. The **Location Prompt** slides in → Type *"Engineering Block 3"* → Click **Save**
4. The **"Last Seen"** badge updates instantly, and the **Location Trail** logs the entry

### Step 3: Talk to the Asset (Asset Detail Page)
1. Click the **"Chat with Asset"** button on the status banner
2. A side drawer opens → Click preset questions like *"How are you feeling?"* or *"Are you still under warranty?"*
3. The asset responds with personality, using its real database values

### Step 4: Conflict-Free Scheduling (Bookings Page)
1. Navigate to **Bookings** → Review the **hourly Gantt grid** showing today's schedule
2. Click **New Booking** → Use the **"Simulate Room B Conflict"** preset
3. Click **Confirm** → the system blocks it and suggests **Meeting Room A**
4. Click **Book Instead** → then **Cancel & Release** the new booking to see the timeline update

### Step 5: Maintenance Resolution (Maintenance Page)
1. Navigate to **Maintenance** → Click **Resolve Issue** on any open ticket
2. Enter resolution notes → Click **Simulate Scan** to verify the QR code → Click **Complete Resolution**
3. Navigate back to that asset's detail page → the **Lifecycle Timeline** now shows the maintenance event

### Step 6: Reports & Export (Reports Page)
1. Navigate to **Reports** → Click **Run Report** on any report card
2. Watch the animated progress bar → Review the generated data preview
3. Click **Export CSV** to download the raw data

---

## 📁 Project Structure

```
Od00-Hakathon/
├── server/                    # Backend API server
│   ├── index.js               # Express server with 15+ REST endpoints
│   ├── db.js                  # SQLite schema creation & data seeding
│   ├── assetflow.db           # SQLite database file (auto-generated)
│   └── package.json
│
├── AssetFlow/                 # Frontend React application
│   ├── src/
│   │   ├── api.ts             # Centralized API client with typed methods
│   │   ├── App.tsx            # Router configuration & layout shell
│   │   ├── components/
│   │   │   ├── Sidebar.tsx    # Navigation sidebar with brand logo
│   │   │   └── Topbar.tsx     # Search, notifications bell, help center
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx  # AI briefs, metrics cards, activity feed
│   │   │   ├── Assets.tsx     # Asset list, duplicate prevention, request queue
│   │   │   ├── AssetDetail.tsx # Digital twin, QR codes, chat, timeline
│   │   │   ├── Bookings.tsx   # Gantt grid, conflict detection, presets
│   │   │   ├── Maintenance.tsx # Ticket queue, resolve modal, QR verify
│   │   │   └── Reports.tsx    # Live calculations, progress animation, CSV
│   │   └── index.css          # Design system tokens & utility classes
│   └── package.json
│
└── README.md                  # This file
```

---

## 🏆 Hackathon Criteria Compliance

| Criteria | Status | Evidence |
|----------|--------|----------|
| Real-time dynamic data (no static JSON) | ✅ | SQLite DB with 15+ REST endpoints, all pages fetch live |
| Responsive & clean UI | ✅ | Consistent design system, mobile QR scan mode |
| Robust input validation | ✅ | Field-level errors, min-length checks, logical validation |
| Intuitive navigation | ✅ | Persistent sidebar, topbar search/notifications/help |
| Version control (Git) | ✅ | Granular commits with `feat:`, `fix:`, `docs:` prefixes |
| Backend APIs + local DB | ✅ | Express + SQLite, relational schema, seeded data |
| AI/code adapted to project | ✅ | Chat engine uses live DB values, not generic AI text |
| Offline-first / local solutions | ✅ | Zero cloud dependencies, zero API keys required |
| Trendy tech adds real value | ✅ | Digital Twin chat, QR trails, Gantt scheduler — all solve real problems |

---

<p align="center">
  <strong>Built with ❤️ by Daksh Mishra — BML Munjal University</strong><br>
  <em>Odoo Hackathon 2026</em>
</p>
