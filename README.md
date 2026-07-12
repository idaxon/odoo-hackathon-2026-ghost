# 🛡️ AssetFlow – Enterprise Asset & Resource Management System

AssetFlow is a next-generation, high-density digital twin and resource optimization system designed to tackle hardware losses, duplicate procurement waste, and meeting room collision conflicts. 

---

## 🎓 Participant Details
- **Developer Name:** DAKSH MISHRA
- **Institution:** BML MUNJAL UNIVERSITY
- **Project Scope:** Odoo Hackathon 2026

---

## 🎨 System Design & Color Palette

AssetFlow is built around a dense enterprise design system designed to convey trust, clean alignment, and immediate readability. 
- **Primary Color (`#714B67` - Dusty Plum/Purple)**: Used for sidebar navigation, branding nodes, and primary interface actions. Represents security, reliability, and modern dashboard shells.
- **Secondary Color (`#017E84` - Green-Teal)**: Highlights positive parameters such as "Available" tags, "Healthy" progress bars, active scan logs, and dynamic check-in information.
- **Surface Contrast**: Crisp white cards with a `1px solid #E5E5E5` border, `8px` rounded corners, and a micro-shadow `rgba(0,0,0,0.06)`. 
- **Aesthetic Constraint**: Zero gradients or heavy glassmorphism to mimic density, reliability, and speed found in enterprise ERP applications.

---

## 🧠 Real-World Business Context & Core Features

Enterprise organizations lose millions annually due to three main leakage points: **duplicate hardware spend**, **idle resources sitting in lockers**, and **inefficient scheduling**. AssetFlow solves these by unifying asset lifecycle twins with interactive location tracking.

| Feature | How It Works | Real-Life Business Application |
| :--- | :--- | :--- |
| **📊 Dynamic AI Briefs** | Scans the SQLite database on startup, constructing alerts for replacement candidates, idle equipment, and daily maintenance lists without static labels. | Managers open the dashboard and instantly see: *"HP Printer is cost-ineffective to repair"* or *"MacBook Air has been idle in HR for 20+ days"*. |
| **💡 Talk to this Asset** | Dynamically templates a first-person diagnostic speech bubble based on database variables (health, repair counts, idle dates, repair vs. replacement costs). | Assets "speak" to administrators. For example: *"I've needed repairs 3 times, and replacing me makes more sense than fixing me again."* |
| **🔄 Duplicate-Prevention Requests** | Before a manager requests a new device, the system checks for duplicates. If found, it halts the workflow with an interrupt screen listing matching idle/available assets. | **Prevents wasted budget.** Encourages employees to reuse existing idle inventory instead of buying new hardware, with a "Duplicate Risk" manager tag warning for overrides. |
| **📍 QR Location Trails** | Scanning the asset's QR code opens a public route, prompting for an optional location. Saving updates a chronological check-in feed and sets the telemetry "Last Seen" badge. | **Loss & theft prevention.** Field engineers scan assets on-site to automatically update geographic audit trails (e.g. *"Last seen: Engineering Floor 2"*). |
| **📴 Standalone Public Scan View** | Appending `?scan=true` to the URL automatically hides all admin actions (allocation drawers, QR downloads, sidebar/topbar menus) across all screens. | General public scanners see spec sheets and report issues, but cannot access administrative reallocation controls. |
| **⚡ Collision-Resistant Scheduler** | When booking equipment/rooms, the system checks overlapping start/end blocks. On conflict (409), it recommends free alternatives with a "Book Instead" hot-swap button. | Prevents double-booking of meeting rooms, projectors, and vehicles, suggesting alternative free options instantly. |
| **🛠️ Maintenance Queue & Heal** | Displays open support tickets. Resolving a ticket automatically logs an activity log and heals the asset's telemetry health back to `95%`. | Streamlines IT hardware tickets, logging actor actions and restoring virtual device health in one click. |
| **💬 Offline Assistant Bot** | A custom pattern-matching floating widget answering queries on idle assets, available projectors, replacement comparisons, and schedules locally. | Provides instant support and diagnostics without needing external internet access or LLM subscription keys. |

---

## ⚙️ Technical Stack & Architecture

- **Frontend**: Vite + React (TypeScript) + Tailwind CSS (v4) + Lucide Icons
- **Backend**: Node.js + Express API Server
- **Database**: SQLite (`better-sqlite3`), file-based storage in `server/assetflow.db`

---

## 🚀 Setup & Execution Guide

### 1. Database & Backend Server Setup
Navigate to the `server` folder, install dependencies, and start the development environment:
```bash
cd server
npm install
npm run dev
```
*Note: If `assetflow.db` is missing or empty, the server automatically boots `db.js` to create the schemas and seed 12 assets, 6 employees, 3 departments, and historical bookings.*

### 2. React Frontend Client Setup
Open a separate terminal window, navigate to the `AssetFlow` folder, install dependencies, and start the hot-reloading dev server:
```bash
cd AssetFlow
npm install
npm run dev -- --host
```
*Note: Adding the `--host` flag exposes the Vite client on your local network (e.g. `http://192.168.1.3:5173`). This allows phone cameras connected to the same Wi-Fi network to scan QR codes and load the digital twin check-in screens instantly.*

---

## 🎯 Judges' Interactive Demo Script (Step-by-Step)

Follow these steps to demonstrate the full capabilities of AssetFlow:

### Step 1: Duplicate Prevention (Assets Page)
1. Go to the **Assets** tab and click **Request New Asset**.
2. Request a new **Printer** for **Marketing** and click **Submit Request**.
3. **The Interception Screen appears**: It warns you that there are already idle printers available (*HP LaserJet Enterprise*).
4. Click **Use Existing Asset Instead** to view that device's details, or click **Still Request New** to force it.
5. Review the **Asset Request approval queue** at the bottom: the request is logged and flashes a red **"Duplicate Risk"** warning badge.

### Step 2: The QR Location Check-In & Last Seen Telemetry
1. Open the details page of any asset (e.g. **MacBook Pro 16"**).
2. Look at the URL query. Add `?scan=true` to simulate scanning the physical QR code.
3. An **Inline Location Prompt** card slides in at the top of the page.
4. Type *"Engineering Block 3"* and click **Save Location**.
5. The **Location Trail** at the bottom updates with the new entry, and the static department metadata field at the top dynamically swaps to: **"Last Seen: Engineering Block 3 (just now)"**.
6. Switch viewports or scan on a mobile phone to see the sidebar and topbar hide automatically, focusing 100% of the screen on the scanned asset check-in.

### Step 3: Conflict-Free Scheduling (Bookings Page)
1. Navigate to the **Bookings** tab.
2. Attempt to create a conflicting reservation for **Meeting Room A** (e.g., matching the pre-seeded time slots).
3. The booking is blocked, showing a warning: *"Schedule conflict detected!"*.
4. The system automatically recommends an available alternative resource (e.g., *"Meeting Room B"*).
5. Click the green **Book Instead** button to schedule the slot instantly.
