# 🛡️ AssetFlow – Enterprise Asset & Resource Optimization Platform

> **A full-stack Digital Twin system that eliminates hardware waste, prevents scheduling conflicts, and tracks every asset in real-time — built entirely offline with zero cloud dependencies.**

[![Tech Stack](https://img.shields.io/badge/Frontend-React_+_TypeScript-blue)](#) [![Backend](https://img.shields.io/badge/Backend-Express_+_SQLite-green)](#) [![Build](https://img.shields.io/badge/Build-Vite_v8-purple)](#) [![License](https://img.shields.io/badge/Hackathon-Odoo_2026-orange)](#)

---

## 🎓 Participant Details

| Field | Details |
|-------|---------|
| **Developer** | DAKSH MISHRA |
| **Institution** | BML MUNJAL UNIVERSITY |
| **Event** | Odoo Hackathon 2026 |
| **Theme** | Enterprise Asset & Resource Management |

---

## 📌 Problem Statement

Large organizations face **three critical operational leaks** that drain budgets silently:

1. **💸 Duplicate Procurement Waste** — Departments purchase identical equipment without knowing matching items are sitting idle in storage. A single duplicated server purchase can cost ₹1,50,000+.

2. **📍 Lost & Untraceable Assets** — Without physical audit trails, equipment gets misplaced across floors and buildings. IT teams spend hours locating hardware that was "last seen somewhere on Floor 3."

3. **⚡ Scheduling Collisions** — Meeting rooms and shared equipment (projectors, vehicles) get double-booked, causing wasted time and inter-team friction.

**AssetFlow solves all three** by merging Digital Twin diagnostics, QR-based location tracking, conflict-free scheduling, and intelligent procurement workflows into a single unified platform.

---

## 🧠 Core Features & Real-World Applications

| # | Feature | How It Works | Real-Life Impact |
|---|---------|-------------|------------------|
| 1 | **🤖 Interactive Digital Twin Chat** | Each asset has a personality. Click "Chat with Asset" to ask questions like *"How are you feeling?"*, *"Are you tired?"*, *"Should we replace you?"*. The asset responds using live database values (health score, repair costs, warranty dates, age). | Technicians diagnose equipment health through natural conversation instead of reading raw spreadsheets. Asset replies like *"My health is at 42/100... I've been needing repairs regularly"* make data instantly actionable. |
| 2 | **🔄 Intelligent Duplicate Blocker** | When requesting new hardware, the system scans the database for matching idle/available items in the same category. If duplicates exist, an interception screen halts the workflow and lists reusable alternatives. | **Prevents wasted budget.** A marketing team requesting a new printer gets shown: *"HP LaserJet has been idle for 20+ days in storage."* Override requests are flagged with a blinking "Duplicate Risk" badge for manager review. |
| 3 | **📍 QR Location Trails & Check-In** | Every asset has a unique QR code. Scanning it (or appending `?scan=true` to the URL) opens a mobile-optimized check-in screen where field engineers log the asset's current location. Each scan creates a timestamped entry in the **Location Trail**. | **Loss & theft prevention.** The system shows *"Last Seen: Engineering Block 3 (2 min ago)"* — giving IT teams instant GPS-free visibility into where equipment physically sits across buildings. |
| 4 | **⚡ Collision-Free Scheduling** | Bookings are checked against existing reservations in real-time. On overlap, the system blocks the request, displays a conflict warning, and **automatically suggests a free alternative** of the same type with a one-click "Book Instead" button. | Eliminates double-booking of conference rooms, projectors, and shared vehicles. Visual Gantt-style hourly grids show today's occupancy at a glance. |
| 5 | **🛠️ Maintenance Resolution & Timeline Handoff** | Resolving a maintenance ticket requires entering resolution notes and verifying the physical asset via QR scan. On completion, the system heals the asset's health to 95% and appends the repair event directly into the asset's **Lifecycle Timeline**. | Creates an auditable repair history. Managers can open any asset and see: *"July 12 — Maintenance: Cleaned roller, replaced toner (by Daksh Mishra)"* logged permanently in the timeline. |
| 6 | **📊 AI Dashboard Briefs** | The dashboard constructs dynamic operational alerts by scanning live database records — identifying replacement candidates, idle hardware, and scheduling overlap conflicts without any static labels. | Managers see instant insights like *"HP Printer is cost-ineffective to repair (₹45K repair vs ₹38K replacement)"* and *"MacBook Air has been idle for 20+ days"*. |
| 7 | **📈 Financial Reports & CSV Export** | Run live reports on Asset Valuation & Depreciation, Utilization Analytics, and Maintenance Cost Trends. Each report calculates real-time metrics from the database and exports downloadable CSV spreadsheets. | CFOs and operations managers generate audit-ready financial snapshots without manual data collection. |
| 8 | **🔔 Live Notification System** | The header bell icon pulls real-time activity logs from the database (bookings, check-ins, maintenance events). The help icon opens an interactive FAQ center. | Keeps administrators informed of system-wide changes without needing to navigate to individual pages. |
| 9 | **✅ Robust Input Validation** | All forms validate fields before submission — empty names, missing descriptions (min 10 chars), invalid date ranges (end before start), and unverified QR scans are blocked with inline red error messages. | Prevents corrupt or incomplete data from reaching the database. Forms highlight exactly which field failed and why. |
| 10 | **📴 Public Scanner Mode** | Appending `?scan=true` to any asset URL hides all admin controls (sidebar, topbar, allocation buttons). Only the asset specs, QR check-in prompt, and "Report Issue" button remain visible. | General staff can scan and report issues without accessing sensitive admin functionality. Works on any phone browser over local Wi-Fi. |

---

## 🎨 Design System & Color Palette

AssetFlow uses a dense, enterprise-grade design system optimized for readability and trust:

| Element | Value | Usage |
|---------|-------|-------|
| **Primary** | `#714B67` (Dusty Plum) | Sidebar, branding, primary buttons, chat bubbles |
| **Secondary** | `#017E84` (Green-Teal) | "Available" badges, health bars, positive indicators, scan logs |
| **Surface** | `#FFFFFF` with `1px solid #E5E5E5` | Card backgrounds with `8px` border-radius and subtle shadow |
| **Typography** | System font stack | Clean, fast-loading enterprise text |
| **Constraint** | No gradients, no glassmorphism | Mimics the density and reliability of real ERP applications |

---

## ⚙️ Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)               │
│  TypeScript │ Tailwind CSS v4 │ Lucide Icons │ QR React  │
│                                                         │
│  Pages: Dashboard │ Assets │ AssetDetail │ Bookings      │
│         Maintenance │ Reports                            │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (fetch)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                     │
│  15+ REST endpoints │ CORS │ JSON middleware              │
│                                                         │
│  Routes: /api/assets │ /api/bookings │ /api/maintenance  │
│          /api/reports │ /api/activity-logs │ /api/scan    │
└────────────────────────┬────────────────────────────────┘
                         │ better-sqlite3
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (SQLite)                        │
│  File: server/assetflow.db                               │
│                                                         │
│  Tables: assets │ employees │ departments │ bookings     │
│          maintenance_requests │ activity_logs             │
│          asset_scan_history │ asset_requests              │
└─────────────────────────────────────────────────────────┘
```

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| **Frontend** | Vite + React + TypeScript | Type-safe, fast HMR, production-optimized builds |
| **Styling** | Tailwind CSS v4 | Utility-first, consistent design tokens, zero CSS files to manage |
| **Icons** | Lucide React | Lightweight, tree-shakable, consistent icon set |
| **QR Codes** | `qrcode.react` | Client-side QR generation, no external API calls |
| **Backend** | Express.js | Minimal, fast REST API server with middleware support |
| **Database** | SQLite (`better-sqlite3`) | Zero-config, file-based, fully offline — no cloud dependency |
| **Dev Server** | Nodemon | Auto-restart on backend file changes |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18+ and **npm** v9+

### Step 1: Clone the Repository
```bash
git clone https://github.com/idaxon/odoo-hackathon-2026-ghost.git
cd odoo-hackathon-2026-ghost
```

### Step 2: Start the Backend Server
```bash
cd server
npm install
npm run dev
```
> The server auto-creates `assetflow.db` if missing, seeding **12 assets**, **6 employees**, **3 departments**, **historical bookings**, and **maintenance tickets**.

### Step 3: Start the Frontend Client
```bash
cd AssetFlow
npm install
npm run dev -- --host
```
> The `--host` flag exposes the app on your local network (e.g. `http://192.168.1.x:5173`) so phones on the same Wi-Fi can scan QR codes and load the digital twin screens.

### Step 4: Open in Browser
```
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
```

---

## 🎯 Judges' Interactive Demo Script

Follow these 5 steps to experience every major feature:

### Step 1: 🔄 Duplicate Prevention (Assets Page)
1. Go to **Assets** → Click **Request New Asset**.
2. Select category **Printer** → Click **Submit Request**.
3. ⚠️ **Interception Screen** appears: *"Idle printers already exist in your inventory."*
4. Click **Still Request New** to override → The request is logged with a blinking red **"Duplicate Risk"** badge.
5. **What this proves:** The system actively prevents wasteful duplicate purchases.

### Step 2: 📍 QR Scan & Location Check-In (Asset Detail Page)
1. Open any asset (e.g. **MacBook Pro 16"**).
2. Add `?scan=true` to the URL → The mobile check-in mode activates (sidebar & admin buttons hide).
3. Type *"Engineering Block 3"* → Click **Save Location**.
4. ✅ The **"Last Seen"** badge updates instantly, and the **Location Trail** logs the entry.
5. **What this proves:** Physical asset tracking without GPS hardware.

### Step 3: 💬 Talk to the Asset (Asset Detail Page)
1. On any asset detail page, click the **"Chat with Asset"** button in the voice status banner.
2. A side drawer opens with the asset's chat interface.
3. Click presets like **"How are you feeling?"**, **"Are you tired?"**, **"Any complaints?"** or type custom questions.
4. ✅ The asset responds with live data: *"My health is at 85/100 — running smooth, no complaints!"*
5. **What this proves:** Digital Twin concept — assets communicate their status in human language.

### Step 4: ⚡ Conflict-Free Scheduling (Bookings Page)
1. Go to **Bookings** → Review the **Gantt-style hourly grid** showing today's resource occupancy.
2. Click **New Booking** → Click the **"Simulate Room B Conflict"** preset hotkey.
3. Click **Confirm Booking** → ⚠️ The system **blocks the request** and suggests **Meeting Room A** instead.
4. Click **Book Instead** → The alternative slot is booked instantly.
5. Click **Cancel & Release** on any booking → The reservation is deleted, the timeline grid updates, and the event is logged.
6. **What this proves:** Zero double-bookings with automatic alternative suggestions.

### Step 5: 🛠️ Maintenance Resolution & Timeline (Maintenance Page)
1. Go to **Maintenance** → Click **Resolve Issue** on any open ticket.
2. Enter notes: *"Cleaned roller, replaced toner"* → Click **Simulate Scan** to verify the QR code.
3. Click **Complete Resolution**.
4. ✅ Go back to the asset's detail page → The **Lifecycle Timeline** now shows the maintenance event with your exact notes.
5. **What this proves:** Full audit trail from ticket → resolution → permanent asset history.

---

## 📋 Hackathon Criteria Compliance

| Criteria | Status | Evidence |
|----------|--------|----------|
| Real-time dynamic data (no static JSON) | ✅ | SQLite DB with 15+ REST endpoints. All pages fetch live data. |
| Responsive & clean UI | ✅ | Consistent color system, mobile-responsive QR mode, dense enterprise layout. |
| Robust input validation | ✅ | All forms validate with inline red error messages. Empty fields, short descriptions, and invalid date ranges are blocked. |
| Intuitive navigation | ✅ | Persistent sidebar, topbar with search/help/notifications, breadcrumb back buttons. |
| Version control (Git) | ✅ | Granular feature-level commits with `feat:`, `docs:`, `fix:` prefixes on GitHub. |
| Backend APIs + local DB | ✅ | Express server + SQLite with relational tables and auto-seeding. |
| Offline / local solutions | ✅ | Entire stack runs locally. No external APIs, no cloud keys, no internet required. |
| AI/code understood & adapted | ✅ | Digital Twin chatbot uses live DB values — not generic text. Responses change per asset. |
| Trendy tech adds real value | ✅ | Digital Twin chat, QR trails, Gantt scheduling — each solves a real operational problem. |

---

## 📁 Project Structure

```
Od00-Hakathon/
├── AssetFlow/                    # React Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/                # Dashboard, Assets, AssetDetail, Bookings, Maintenance, Reports
│   │   ├── components/           # Sidebar, Topbar, Layout
│   │   ├── api.ts                # Centralized API client with all fetch wrappers
│   │   └── index.css             # Design system tokens & utility classes
│   └── package.json
├── server/                       # Express Backend
│   ├── index.js                  # 15+ REST API routes with CORS
│   ├── db.js                     # SQLite schema creation & data seeding
│   └── assetflow.db              # Auto-generated SQLite database file
├── README.md                     # This file
└── PROBLEM_STATEMENT.md          # Original hackathon problem statement
```

---

## 🏗️ Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite over PostgreSQL/MongoDB** | Zero-config, single-file database. No Docker, no cloud setup. Judges can clone and run instantly. |
| **Client-side QR generation** | `qrcode.react` renders QR codes without external API calls. Works fully offline. |
| **Pattern-matching chat (not LLM)** | The "Talk to Asset" feature uses keyword matching + live DB values. No API keys, no latency, no cost. Works offline. |
| **Validation on both client + server** | Forms validate before submission (client-side), and the server enforces constraints (e.g., booking overlap 409 responses). |
| **`--host` flag for mobile QR scanning** | Vite's network exposure lets any phone on the same Wi-Fi scan QR codes and open asset pages. No deployment needed. |

---

<p align="center">
  Built with ❤️ by <strong>Daksh Mishra</strong> | BML Munjal University | Odoo Hackathon 2026
</p>
