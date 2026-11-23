# खेतसूत्र (KhetSutra) — Smart Farming. Smarter Decisions.
> **AI-Powered Farm Management & Agricultural Decision Support Platform for Indian Farmers**

(https://khet-sutra.vercel.app/)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Design%20System-Forest%20Green%20%23166534-166534.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57.svg)](https://sqlite.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌾 1. Application Identity & Vision

**KhetSutra (खेतसूत्र)** is a comprehensive, production-ready farm management and agricultural decision-support platform designed specifically for small and medium-scale Indian farmers.

Traditional weather apps merely report raw metrics (*"32°C, 40% chance of rain"*). **KhetSutra** translates real-time meteorology, crop phenology, and soil drainage properties into **actionable, crop-specific, financial, and agronomic decisions**:

> *"Don't just tell farmers what the weather is. Tell them what to do on their farm, when to do it, why it matters, and how it impacts their income."*

### Supported Languages (Strictly Bilingual)
1. **हिन्दी (Hindi)**
2. **English**

*(No colloquial Hinglish mix; every page, button, navigation item, audio readout, and advisory strictly supports both languages with a one-click toggle).*

---

## 🚀 2. Quickstart — Run Locally in 1 Minute

### Prerequisites
- Python 3.10+ (Installed with pip)
- Node.js 18+ (Installed with npm)

### Option A: Windows 1-Click Launch
Double-click `start.bat` or run:
```cmd
python run.py
```
This automatically boots:
- **FastAPI Backend** on `http://127.0.0.1:8000`
- **Next.js Frontend** on `http://localhost:3000`
- Opens your browser to `http://localhost:3000`

### Option B: Manual Terminal Execution

#### 1. Backend Setup
```bash
# Navigate to project root
cd KisanMitra

# Install Python requirements
pip install -r requirements.txt

# Run FastAPI Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend Swagger API Docs available at: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend/
cd frontend

# Install Node dependencies
npm install

# Start Next.js Development Server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 3. Core Modules & Feature Architecture

KhetSutra implements a **14-section unified agricultural operating system**:

| # | Module | Route | Key Capabilities |
|---|---|---|---|
| **1** | **Farm Command Center** | `/` | Daily primary farm action (Safe/Caution/Critical), urgency banner, multi-field growth overview, live weather metrics, risk alerts. |
| **2** | **My Farms & Fields** | `/farms` | Multi-field acreage management, crop varieties, sowing dates, soil classifications, visual progress bars from sowing to harvest. |
| **3** | **AI Crop Doctor** | `/crop-doctor` | Visual leaf & fruit disease diagnosis, symptom pathology, confidence scoring, ICAR bio-preventive protocols, KVK expert verification disclaimers. |
| **4** | **Weather & Risk** | `/weather` | 7-day high resolution forecast, precipitation probability, daily agricultural implications, microclimatic disease pressure indicators. |
| **5** | **Seasonal Planner** | `/seasonal` | Season-wise intelligence across **Rabi, Kharif, and Zaid** covering 5 growth phases: Pre-sowing, Sowing, Vegetative, Flowering, and Harvest. |
| **6** | **Smart Irrigation Planner** | `/irrigation` | Field-by-field water scheduling combining 48h rain forecast with soil retention capacity (Loamy, Clay, Sandy, Black soil). |
| **7** | **Harvest Planning Assistant** | `/harvest` | Crop physiological maturity predictor, rain-free 3-day dry harvesting windows, drying & storage recommendations. |
| **8** | **Farm Finance Manager** | `/finance` | Expense categorizer (Seeds, Fertilizers, Machinery, Labour, Diesel), cost-per-acre analysis, projected revenue, net profit margin tracker. |
| **9** | **Mandi Price Intelligence** | `/mandi` | Latest reported government mandi prices, filtered to the farmer's profile district/state, with an estimated gross value for a selected quantity. |
| **10** | **Farm Digital Diary** | `/diary` | Historical activity journal logging irrigation, spraying, fertilizer top-dressing, and pest observations. |
| **11** | **Government Schemes** | `/schemes` | Central & state schemes (PM-KISAN, PMFBY, KCC, PMKSY, SMAM) with official eligibility checklists, document requirements, and portal links. |
| **12** | **AI Farm Copilot** | `/chat` | Context-aware bilingual voice & text chatbot backed by real farm profile tools, Web Speech API (speech-to-text & text-to-speech). |
| **13** | **Farm Audit Reports** | `/reports` | Printable/PDF-ready seasonal executive summary of crop holdings, expense breakdown, and risk index. |
| **14** | **Profile & Settings** | `/profile` | Farmer location, village, total acreage, soil profile, preferred irrigation methods, and language preferences. |

---

## 🎨 4. Visual Design System

The UI follows high-contrast agricultural fintech design principles:
- **Primary Color:** Forest Green (`#166534`) — Represents agricultural vitality & trust.
- **Secondary Color:** Fresh Green (`#22C55E`) — Dynamic accent for active statuses and growth progress.
- **Accent Color:** Golden Yellow (`#EAB308`) — Signifies maturity, harvest, and premium highlights.
- **Background:** Soft Off-White (`#F8FAFC`) — Reduces glare in outdoor daylight viewing.
- **Typography:**
  - **Inter** for crisp English alphanumeric rendering.
  - **Noto Sans Devanagari** for legible, accessible Hindi typography.
- **Farmers-First Accessibility:**
  - Every icon is paired with a clear textual label.
  - High-touch targets for thumb usability on budget smartphones.
  - Audio playback on all AI advice and briefings.

---

## 🧠 5. AI Engineering & Agronomic Decision Architecture

KhetSutra implements a **grounded tool-calling agent pipeline** with zero-cost fallback:

```
[Farmer Voice / Text Question]
           │
           ▼
[FastAPI /api/chat Controller]
           │
           ▼
[KhetSutra Agentic Orchestrator]
   ├── Tool 1: get_weather_forecast (Open-Meteo, 7-day parameters)
   ├── Tool 2: get_crop_phenology (Days since sowing -> Phenological stage)
   ├── Tool 3: get_soil_water_retention (Infiltration & drainage rules)
   ├── Tool 4: evaluate_agronomy_rules (Rain > 40% -> Postpone irrigation)
   └── Tool 5: get_farm_diary_history (Previous sprays & top dressings)
           │
           ▼
[LLM Reasoning Layer: Gemini 1.5 Flash / OpenAI GPT-4o-mini]
   └── Injects grounded tool findings + farmer profile context
           │ (If LLM offline or key absent)
           ▼
[Deterministic Agronomy Fallback Engine]
   └── Evaluates ICAR/IMD rules deterministically with 100% uptime
           │
           ▼
[Structured Bilingual JSON Response]
   ├── answer (Clear actionable advice in chosen language)
   ├── voice_text (Natural sentence for Web Speech synthesis)
   ├── why_this_advice (Transparent reasoning & weather parameters)
   ├── confidence (High / Medium / Low)
   └── disclaimer (Official extension verification guidance)
```

---

## 📊 6. Supported Crops & Agronomic Parameters

KhetSutra provides phenological models and growth stage rules for 10 major Indian crops:
1. **Wheat (गेहूँ)** — 135-day cycle (Sowing -> CRI -> Tillering -> Jointing -> Flowering -> Milking -> Harvest)
2. **Mustard (सरसों)** — 120-day cycle (Sowing -> Vegetative -> Branching -> Flowering -> Siliqua Formation -> Maturity)
3. **Rice (धान)** — 140-day cycle (Nursery -> Transplanting -> Tillering -> Panicle Initiation -> Grain Filling -> Maturity)
4. **Cotton (कपास)** — 170-day cycle (Germination -> Square Formation -> Flowering -> Boll Development -> Picking)
5. **Potato (आलू)** — 100-day cycle (Sprouting -> Vegetative -> Tuber Initiation -> Tuber Bulking -> Dehaulming & Harvest)
6. **Tomato (टमाटर)** — 120-day cycle (Transplanting -> Vegetative -> Flowering -> Fruit Setting -> Ripening)
7. **Onion (प्याज)** — 130-day cycle (Seedling -> Vegetative -> Bulb Initiation -> Bulb Development -> Curing)
8. **Maize (मक्का)** — 105-day cycle (Knee-high -> Tasseling -> Silking -> Milking -> Maturity)
9. **Chickpea (चना)** — 115-day cycle (Germination -> Branching -> Flowering -> Pod Formation -> Harvesting)
10. **Sugarcane (गन्ना)** — 360-day cycle (Germination -> Tillering -> Grand Growth -> Ripening & Crushing)

---

## 🔒 7. Data Privacy & Ethical AI Principles

- **No Fabricated Dosages:** Pesticide or fungicide chemical dosages are never invented. The platform emphasizes bio-preventives (Neem seed kernel extract, Trichoderma) and directs farmers to verified Krishi Vigyan Kendra (KVK) officers and product labels.
- **Transparent Weather Sourcing:** Weather data comes from Open-Meteo with caching and offline demo fallbacks clearly labeled.
- **Tenant Data Isolation:** Each farmer's landholdings, financial expenses, and activity diary remain strictly isolated.

---

## 👨‍💻 8. Technology Stack Summary

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 3, Lucide React icons |
| **Voice / Speech** | Web Speech API (webkitSpeechRecognition + SpeechSynthesis) |
| **Charts & Graphs** | Recharts, Tailwind CSS progress meters |
| **Backend Framework** | FastAPI (Python 3.11+ / 3.14), Uvicorn ASGI Server |
| **Data Validation** | Pydantic v2 |
| **Database & ORM** | SQLite 3, SQLAlchemy 2.0+ (PostgreSQL migration-ready) |
| **HTTP Client** | HTTPX (Async/Await) |
| **AI Models** | Google Gemini 1.5 Flash / OpenAI GPT-4o-mini |

---

## 📜 9. License

This project is licensed under the **MIT License**. Built for Indian farmers to modernize smallholder agricultural decision making.

---

## 🚀 Deploy to Render and Vercel

The repository includes a Render Blueprint in `render.yaml`. The backend Blueprint uses a persistent disk for SQLite, which requires a paid Render web service. Review the plan and pricing in Render before creating the service.

### 1. Deploy the backend

1. Push this project to a GitHub repository and connect that repository in Render.
2. Create a new **Blueprint** from the repository. Render reads `render.yaml` and creates the FastAPI service.
3. When prompted for `ALLOWED_ORIGINS`, enter the exact deployed frontend origin, for example `https://your-app.vercel.app` (no trailing slash).
4. Wait for the service health check at `/api/health` to pass. Render generates `SECRET_KEY`; the SQLite database is stored on the mounted persistent disk.
5. Add `GEMINI_API_KEY` in the Render service environment only if the AI provider is enabled.
6. Add `DATA_GOV_IN_API_KEY` in Render to enable mandi prices. Request a key through the [data.gov.in developer portal](https://data.gov.in/user/register); never place it in a frontend variable. Without this key, the mandi endpoint returns a clear unavailable response rather than invented sample prices.

### 2. Deploy the frontend

1. Import the same GitHub repository in Vercel.
2. Set the project **Root Directory** to `frontend`.
3. Add `API_PROXY_TARGET` as a Vercel environment variable with the Render backend origin, for example `https://your-api.onrender.com` (no trailing slash).
4. Leave `NEXT_PUBLIC_API_URL` unset. The frontend calls its own origin and Next.js proxies `/api/*` to Render, so the browser session cookie remains first-party.
5. Deploy and update Render's `ALLOWED_ORIGINS` to the final Vercel URL if it changed.

### 3. Production checklist

- Use HTTPS for both services and test register, login, refresh, logout, and protected API routes.
- Keep `SECRET_KEY`, `DATABASE_URL`, and `GEMINI_API_KEY` only in Render environment settings. Never use a `NEXT_PUBLIC_` prefix for secrets.
- Do not commit `.env`, `.env.local`, database files, or backups. If a key was ever committed, revoke and regenerate it; deleting the file alone is insufficient.
- Configure a managed database and backup policy before storing production farmer data. The SQLite disk is suitable only for a single backend instance.
- Mandi reports are official records from data.gov.in and may be delayed or absent for some crops/markets. Verify the quoted rate at the mandi.
- Password recovery is intentionally unavailable until a real email/SMS verification provider is configured.
