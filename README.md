# PeerConnect — Connect and Guide

**Helping You Settle, Connect, and Grow**

PeerConnect is a web-based student support platform that connects newly arrived university students with senior "helper" students who can guide them through settling into a new city — and provides a city guide covering accommodation, transportation, food, and local essentials.

Built for the Software Engineering Lab (CSE-3642), International Islamic University Chittagong.

## The Problem

A structured survey of 19–20 university students across Bangladesh (IIUC, BRAC, Dhaka University, NSTU, BUET, RUET, and others) found:

- **63%** struggled most with making friends/connections when they arrived in a new city
- **56%** struggled with understanding their new university environment
- Only **25%** had access to a senior student guide — despite **69%** wanting one
- **100%** of respondents were willing to help a newer student from their hometown
- **88%** wanted a built-in city guide as a feature
- **100%** expected to access the platform primarily from a phone

PeerConnect exists to close that gap: pairing new students with senior "buddies," while giving everyone a shared, crowdsourced city guide.

## Core Features

- **Authentication** — student signup/login with university & district info
- **Verified profiles** — bio, interests, likes/dislikes, verification badge
- **Community feed** — post requests for help or offers to help, categorized (Housing, Transport, Study, Emergency, Campus, Food, Other)
- **Likes, comments, saved posts** — standard social interactions on posts
- **Peer search & discovery** — filter verified students by university, district, or role
- **Notifications** — real-time-ish alerts for likes/comments on your posts
- **Helper contribution tracking** — posts resolved, help given, contribution score
- **Admin tools** *(partial)* — verification, moderation, reporting

## Tech Stack

- **Frontend:** React (Vite), plain CSS-in-JS styling, `lucide-react` icons
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT-based

## Project Structure

```
peerconnect/
├── client/          # React frontend
│   └── src/
│       ├── pages/       # Dashboard, ProfilePage, SettingsPage, ChatPage, PostingPage
│       ├── components/  # Homepage sections (Hero, FAQ, Team, Impact, etc.)
│       └── context/     # Theme context (dark/light mode)
└── server/           # Express backend
    ├── controllers/     # post, user, notification, admin, auth logic
    ├── models/           # User, Post, Notification (Mongoose schemas)
    ├── routes/           # REST endpoints
    └── middleware/       # JWT auth guard
```

## Development Roadmap — 7 Sprints

The project was planned and built across 7 sprints:

| Sprint | Focus | Key Deliverables |
|--------|-------|-------------------|
| **1** | Requirements & Planning | Survey design & distribution, requirements analysis report, role definitions (User/Helper/Admin) |
| **2** | Auth & Core Data Models | User registration/login, JWT auth middleware, MongoDB schemas for User & Post |
| **3** | Landing Page & Onboarding | Public homepage (Hero, FAQ, Team, Impact, Contact sections), signup/verification flow |
| **4** | Feed & Posting | Create/view posts, categorize by type (seeking/helping/both) and topic, comments |
| **5** | Social Interactions | Likes, saves, peer search/filtering, user profile pages, edit profile (bio/interests/likes/dislikes) |
| **6** | Notifications & Engagement | Notification system (likes/comments), contribution tracking, helper matching (mark resolved) |
| **7** | Polish, Dashboard & QA | Unified dashboard shell (sidebar/navbar), settings page, dark/light theme, bug fixes, deployment prep |

> Not every planned feature made it in fully (see **Known Limitations** below) — some sprints ran into scope/time constraints typical of a lab project timeline.

## Known Limitations / Future Work

- Chat/messaging is currently a **UI mockup** with dummy data (no real backend wiring yet)
- Admin dashboard exists at the API level but has limited frontend UI
- Manual vs. auto-match helper selection (both were requested in the survey — only manual "browse and post" is implemented)
- Real-time notifications currently use polling, not WebSockets
- Some legacy/experimental files remain in the repo from features that were prototyped but not completed due to time constraints

## Getting Started (Local Development)

**Backend:**
```bash
cd server
npm install
# create a .env file with MONGO_URI, JWT_SECRET, PORT
node server.js
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Contributors

- Asliraf Samaylan (C233446)
- Nusrat Jahan (C233464)
- Tahasina Tasnim Afra (C233456) / Samiha Akter (C233467)

Supervised by Md Sadman Hafiz, Lecturer, Dept. of CSE, IIUC.