# EduGuard AI — Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Git

---

## 📦 Installation

### 1. Clone & Navigate
```bash
cd eduguard-ai
```

### 2. Database Setup
```bash
# Create database
createdb eduguard

# Run schema
psql -d eduguard -f database/schema.sql
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eduguard
SECRET_KEY=your-super-secret-key-change-in-production
DEBUG=True
EOF

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🎨 Design System

### Colors (White & Red Theme)
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#DC2626` | Buttons, badges, highlights |
| Primary Light | `#EF4444` | Hover states |
| Primary Dark | `#B91C1C` | Active states |
| Primary Muted | `#FEE2E2` | Light backgrounds |
| Primary Subtle | `#FEF2F2` | Subtle backgrounds |

### Status Colors
| Status | Color |
|--------|-------|
| Normal | `#10B981` (Emerald) |
| Low Risk | `#F59E0B` (Amber) |
| High Risk | `#F97316` (Orange) |
| Critical | `#DC2626` (Red) |
| Info | `#3B82F6` (Blue) |

---

## 🧪 Demo Credentials

The system uses demo mode — you can login with any email/password.

Select a role to see the corresponding dashboard:
- **Admin** — Full system access, analytics, all students
- **Professor** — Course management, risk heatmap, student rankings
- **Advisor** — Intervention management, student progress tracking
- **Student** — Personal dashboard, risk score, simulation mode

---

## 🏗️ Architecture

```
eduguard-ai/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/ui/     # Reusable UI components
│   │   ├── components/charts/ # Chart components
│   │   ├── components/layout/ # Layout components
│   │   ├── context/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities & mock data
│   │   └── types/             # TypeScript types
│   ├── index.html
│   └── package.json
│
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/       # API routers
│   │   ├── core/      # Config & security
│   │   ├── models/    # SQLAlchemy models
│   │   ├── db/        # Database setup
│   │   ├── ai/        # Risk prediction model
│   │   └── services/  # Business logic
│   ├── main.py
│   └── requirements.txt
│
├── database/          # PostgreSQL schema
│   └── schema.sql
│
└── docs/              # Documentation
    ├── API.md
    └── SETUP.md
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/eduguard
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=True
MODEL_PATH=./models
```

---

## 📝 Features Checklist

### ✅ Implemented
- [x] Role-based dashboards (Admin, Professor, Advisor, Student)
- [x] Risk assessment with explainable AI
- [x] Time-series performance tracking
- [x] What-If simulation engine
- [x] Intervention plan management
- [x] Quiz builder with analytics
- [x] Notification system
- [x] Gamification (points, streaks, badges)
- [x] White & Red design theme
- [x] Dark mode support
- [x] Responsive design
- [x] Full PostgreSQL schema
- [x] FastAPI backend with JWT auth
- [x] AI risk prediction model

### 🔄 Future Development
- [ ] Real-time WebSocket updates
- [ ] Email/SMS notifications
- [ ] LSTM time-series model
- [ ] Mobile app (React Native)
- [ ] Advanced report generation
- [ ] Integration with LMS (Canvas, Blackboard)
- [ ] Multi-language support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License — EduGuard AI Team
