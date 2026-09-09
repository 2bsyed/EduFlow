# EduFlow - Modern Institute & Coaching Management SaaS

EduFlow is an all-in-one multi-tenant management system for schools, colleges, and coaching centers. It features role-based access for Owners/Admins, Teachers, and Students, supporting batch management, attendance tracking, exam results, and fee collection.

---

## 📁 Repository Structure

The repository is organized into production deployment services and auxiliary project resources:

```
EduFlow/
├── frontend/             # Next.js 16 (App Router) + React 19 + Tailwind CSS Frontend
│   ├── src/              # Application source (app, components, actions, lib, types)
│   ├── public/           # Static assets, fonts, icons
│   ├── messages/         # i18n translation files (en, bn)
│   ├── Dockerfile        # Production container build
│   └── package.json      # Frontend scripts & dependencies
│
├── backend/              # FastAPI + SQLAlchemy 2.0 + PostgreSQL Backend
│   ├── app/              # API endpoints, models, schemas, services, security
│   ├── alembic/          # Database migrations
│   ├── tests/            # Automated test suite
│   ├── Dockerfile        # Production container build
│   └── requirements.txt  # Pinned Python dependencies
│
├── others/               # Non-deployment resources, design tokens & archived tooling
│   ├── docs/             # Architecture documentation, PRDs, and conversion reports
│   ├── design/           # Stitch design system tokens, foundation specs, and image assets
│   ├── scripts/          # Audit scripts, E2E puppeteer suites, and migration utilities
│   ├── screenshots/      # UI and automated test run screenshots
│   └── legacy/           # Historical Prisma schemas and SQLite database
│
├── docker-compose.yml    # Multi-container orchestration (Postgres + Backend + Frontend)
├── package.json          # Root developer convenience scripts
└── .env.example          # Environment variable template
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: >= 20.x
- **Python**: >= 3.11
- **PostgreSQL**: >= 15.x

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will be available at [http://localhost:8000](http://localhost:8000) (Swagger docs at `/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at [http://localhost:3000](http://localhost:3000).

### 4. Docker Deployment
To run the entire stack with a single command:
```bash
docker-compose up --build
```

---

## 👥 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Owner / Admin** | `owner@eduflow.bd` | `password123` |
| **Teacher** | `kamrul@eduflow.bd` | `password123` |
| **Student** | `student1@eduflow.bd` | `password123` |
