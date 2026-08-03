# PeerConnect — Connect and Guide

**Helping You Settle, Connect, and Grow**

PeerConnect is a web-based student support platform that connects newly arrived university students with senior "helper" students who can guide them through settling into a new city while providing a city guide covering accommodation, transportation, food, and local essentials.

Built for the **Software Engineering Lab (CSE-3642)**, International Islamic University Chittagong.

---

## The Problem

A structured survey of 19–20 university students across Bangladesh (IIUC, BRAC, Dhaka University, NSTU, BUET, RUET, and others) found:

- **63%** struggled most with making friends/connections when they arrived in a new city.
- **56%** struggled with understanding their new university environment.
- Only **25%** had access to a senior student guide despite **69%** wanting one.
- **100%** of respondents were willing to help a newer student from their hometown.
- **88%** wanted a built-in city guide as a feature.
- **100%** expected to access the platform primarily from a phone.

PeerConnect exists to close that gap by pairing new students with senior "buddies" while giving everyone access to a shared, crowdsourced city guide.

---

## Core Features

- **Authentication** — Student signup/login with university and district information.
- **Verified Profiles** — Bio, interests, likes/dislikes, and verification badge.
- **Community Feed** — Post requests for help or offers to help, categorized by Housing, Transport, Study, Emergency, Campus, Food, and more.
- **Likes, Comments & Saved Posts** — Standard social interactions on posts.
- **Peer Search & Discovery** — Filter verified students by university, district, or role.
- **Notifications** — Alerts for likes and comments on posts.
- **Helper Contribution Tracking** — Posts resolved, help given, and contribution score.
- **Admin Tools** *(partial)* — Verification, moderation, and reporting.

---

## Tech Stack

- **Frontend:** React (Vite), CSS-in-JS styling, `lucide-react`
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT

---

## Project Structure

```text
peerconnect/
├── client/          # React frontend
│   └── src/
│       ├── pages/       # Dashboard, ProfilePage, SettingsPage, ChatPage, PostingPage
│       ├── components/  # Homepage sections (Hero, FAQ, Team, Impact, etc.)
│       └── context/     # Theme context (Dark/Light mode)
└── server/           # Express backend
    ├── controllers/     # Business logic
    ├── models/          # Mongoose schemas
    ├── routes/          # REST API routes
    └── middleware/      # JWT authentication middleware
```

---

## Development Roadmap — 7 Sprints

The project was planned and developed across seven sprints.

| Sprint | Focus | Key Deliverables |
|--------|-------|-------------------|
| **1** | Requirements & Planning | Survey, requirements analysis, role definitions |
| **2** | Authentication & Data Models | JWT authentication, User & Post schemas |
| **3** | Landing Page & Onboarding | Homepage, signup, verification |
| **4** | Feed & Posting | Create/view posts, categorization, comments |
| **5** | Social Features | Likes, saves, search/filter, profile editing |
| **6** | Notifications & Engagement | Notifications, contribution tracking, helper matching |
| **7** | Polish & QA | Dashboard, settings, theme, bug fixes, deployment |

> Not every planned feature was completed due to the time constraints of a semester-long Software Engineering Lab project.

---

## Known Limitations / Future Work

- Chat/messaging is currently a **UI mockup** with dummy data (backend integration pending).
- Admin dashboard has backend support but limited frontend functionality.
- Only manual helper selection is implemented (automatic matching is future work).
- Notifications use polling instead of WebSockets.
- Some prototype and experimental files remain in the repository.

---

## Deployment

PeerConnect uses a split deployment architecture, with the frontend and backend deployed as independent services communicating over HTTPS.

| Layer | Platform | Notes |
|-------|----------|-------|
| Database | MongoDB Atlas | Cloud-hosted MongoDB cluster |
| Backend (Express API) | Render | Free-tier service (`server/`) |
| Frontend (React) | Vercel | Static hosting (`client/`) |

### Live Application

- **Frontend:** https://peerconnect-rho.vercel.app
- **Backend API:** https://peerconnect-api.onrender.com

> **Note:** The backend is hosted on Render's free tier and may take 30–60 seconds to respond after periods of inactivity.

---

## Getting Started (Local Development)

### Backend

```bash
cd server
npm install

# Create a .env file with:
# MONGO_URI=<your_mongodb_connection_string>
# JWT_SECRET=<your_secret_key>
# PORT=5000

node server.js
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Contributors

- **Asliraf Samaylan** (C233446)
- **Nusrat Jahan** (C233464)
- **Samiha Akter** (C233467)

**Supervisor:**  
**Md. Sadman Hafiz**  
Lecturer, Department of Computer Science & Engineering  
International Islamic University Chittagong (IIUC)