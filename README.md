# 🎓 EduGuard AI — Intelligent Academic Monitoring, Prediction & Intervention System

> **Production-grade AI-powered academic intelligence platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://postgresql.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Features

### 🤖 Advanced AI
- **Explainable AI** — Feature contribution breakdown (grades, attendance, activity)
- **Time-Series Analysis** — Performance trend detection
- **Multi-Target Predictions** — Dropout, graduation delay, scholarship eligibility
- **What-If Engine** — Simulate hypothetical scenarios

### 🚨 Early Warning System
- Real-time risk alerts
- GPA drop detection
- Attendance monitoring
- Engagement tracking

### 👥 Role-Based Dashboards
- **Admin** — Institution-wide analytics, department reports
- **Professor** — Course risk heatmap, student rankings
- **Advisor** — Intervention management, progress tracking
- **Student** — Personal dashboard, gamification, simulations

### 📝 Quiz System
- Multiple question types (MCQ, True/False, Short Answer)
- Auto & manual grading
- Shuffle & randomize options
- Performance analytics

### 🔔 Smart Notifications
- Priority-based alerts
- Real-time triggers
- In-app notification center

---

## 🚀 Quick Start

```bash
# 1. Database
createdb eduguard
psql -d eduguard -f database/schema.sql

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Frontend
cd frontend
npm install
npm run dev
```

**Open** `http://localhost:5173` and login with any credentials (demo mode).

---

## 🎨 Design

**White & Red** theme with clean, modern aesthetics:
- Primary: `#DC2626` (Red-600)
- Clean white backgrounds
- Dark mode support
- Fully responsive

---

## 📁 Project Structure

```
eduguard-ai/
├── frontend/     # React + Vite + Tailwind + Recharts
├── backend/      # FastAPI + SQLAlchemy + JWT
├── database/     # PostgreSQL schema + sample data
└── docs/         # API docs & setup guide
```

---

## 📚 Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Recharts, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, JWT, Pydantic |
| AI | Custom explainable risk model |
| Database | PostgreSQL 15 with partitioning & materialized views |

---

## 📄 License

MIT © 2025 EduGuard AI
