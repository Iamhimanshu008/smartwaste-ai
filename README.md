# 🗑️ SmartWaste AI
### AI-Powered Rural Plastic Waste Management Platform
**Climatathon 2026 · NIT Raipur · Problem Statement #4**

---

## 🚀 Quick Start (One Command)

```bash
git clone https://github.com/Iamhimanshu008/smartwaste-ai.git
cd smartwaste-ai
docker compose up --build
```

Then open **http://localhost:5173**

> ⚠️ `.env` file is **not included** for security reasons. Copy `.env.example` to `.env` and fill in your values before running.

---

## 🔑 Demo Credentials

| Role | Email | Password | Platform |
|------|-------|----------|----------|
| Admin | admin@smartwaste.com | Admin@123 | Web |
| Sub-Admin | subadmin@smartwaste.com | SubAdmin@123 | Web |
| SHG Member | shg1@smartwaste.com | Shg@123 | Mobile / Web |
| Collector | collector1@smartwaste.com | Collector@123 | Mobile |
| Public | _(No login needed)_ | — | http://localhost:5173/public |

---

## 💡 What It Does

SmartWaste AI is a full-stack platform that streamlines rural plastic waste management. Citizens submit photo reports via mobile, which are analyzed by **Gemini 1.5 Flash** AI to detect fill levels, waste type, and urgency. Sub-Admins verify reports and trigger **OR-Tools VRP route optimization**, dispatching collectors via a geofence-enabled mobile app. SHG members monitor their assigned bins, while recyclers can browse available materials through a dedicated marketplace portal.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL + PostGIS |
| **AI Vision** | Gemini 1.5 Flash |
| **AI Routing** | Google OR-Tools VRP |
| **Web Frontend** | React + Vite + Tailwind CSS |
| **Mobile App** | React Native + Expo |

---

## 👥 5-Role Ecosystem

| Role | Platform | Primary Action |
|------|----------|----------------|
| **Admin** | Web | Manage users, view analytics, oversee all operations |
| **Sub-Admin** | Web | Verify citizen reports, trigger route optimization |
| **SHG Member** | Mobile + Web | Monitor assigned bins, submit fill-level reports |
| **Collector** | Mobile | Follow GPS-optimized routes, mark bins collected |
| **Public / Citizen** | Mobile | Submit bin overfill reports with photo evidence |

---

## 📁 Project Structure

```
smartwaste-ai/
├── backend/          # FastAPI + Python (routers, models, AI)
├── web/              # React Web Dashboard (Admin, SubAdmin, SHG, Recycler)
├── mobile/           # React Native App (Collector, SHG, Public)
├── docker-compose.yml
├── .env.example      # Template — copy to .env and fill values
└── .env              # ⚠️ NOT included — create from .env.example
```

---

## Environment Setup
Copy `.env.example` to `.env` and fill in your values.
Never commit `.env` to version control.

Required variables:
- DATABASE_URL
- SECRET_KEY
- GOOGLE_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

---

## 🗄️ Database Migrations

This project uses **Alembic** to manage database schema migrations statically, fully replacing the old dynamic sync mechanism.

- **Automatically Run:** Migrations run automatically on `docker compose up` before the API boots via `alembic upgrade head && uvicorn`.
- **Create a New Migration:** (Make sure the DB is running locally or bound):
  ```bash
  cd backend
  alembic revision --autogenerate -m "add_new_feature"
  ```
- **Run Migrations Manually:**
  ```bash
  cd backend
  alembic upgrade head
  ```

---


### 📱 Mobile App Setup (WiFi IP)

For the mobile app to connect to your local backend, you need to set your WiFi IP:

1. Copy the mobile example env:
   ```bash
   cp mobile/.env.example mobile/.env
   ```
2. Find your WiFi IP:
   - **Windows**: `ipconfig` → Look for "IPv4 Address"
   - **Mac/Linux**: `ifconfig`
3. Update `mobile/.env` with your IP:
   ```
   EXPO_PUBLIC_API_URL=http://your-ip-address:8000
   ```

---

## 🌟 Key Features

- 📍 **50m GPS Geofencing** — Enforced on all bin reports and collections
- 🤖 **Gemini AI Photo Analysis** — Detects fill level, waste type & urgency from photos
- 🗺️ **OR-Tools VRP Route Optimization** — Auto-generates optimal collector routes
- 🔥 **Live Waste Heatmap** — Real-time visualization of high-priority zones
- 📡 **Real-Time Collection Tracker** — Citizens can track collectors live
- 🔐 **5-Role JWT Authentication** — Secure role-based access control
- 🌍 **PostGIS Spatial Database** — Geo-queries, distance checks, and spatial indexing
- 🐳 **Docker One-Command Deploy** — Full stack up with `docker compose up --build`

---

## 👨‍💻 Team CodeX — Kalinga University

| Name | Role |
|------|------|
| **Jasleen Kaur Dhanjal** | Team Leader |
| **Himanshu Shekhar** | Full Stack Developer |
| **Vivek Kumar** | Backend & AI Integration |
| **Reetika Kumari** | UI/UX Design |
| **Ishanvi Isha** | Research & Documentation |

---

## 📄 License

This project is licensed under the **MIT License**.
