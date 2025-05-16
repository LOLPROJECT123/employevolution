# Streamline

Streamline is a fullstack platform and browser extension designed to revolutionize your job search and application process. Its mission is to automate, optimize, and support every step of your career journey.

---

## Features

### Chrome Extension
- **Auto-fill job applications** on supported sites (LinkedIn, Indeed, GitHub Jobs, Handshake, etc.)
- **Optimize resume and cover letters** based on job requirements
- **Track applied jobs** and sync with the main app
- **Detect job postings** automatically
- **Extension manager** (ChromeExtensionManager) in the web app for easy install/management

### Web App

#### Profile & Resume
- ProfileHeader, Resume, Work Experience, Education, Projects, Social Links, Languages, Skills, Preferences, Equal Employment, Settings

#### Job Search & Application
- Scrape jobs from LinkedIn, Indeed, GitHub jobs, simplify.jobs, offerpilot.ai, jobright.ai, Handshake (using [crawl4ai](https://github.com/unclecode/crawl4ai) and [AutomatedHandshake.py](https://github.com/Pernell43/HandShake-QuickApply-Bot/blob/main/AutomatedHandshake.py))
- Track applied jobs
- One-click apply (with extension)

#### Interview Practice
- Coding practice (LeetCode-style: 2 easy, 2 medium, 2 hard per data structure/algorithm)
- Behavioral interviews (video/screen share)

#### Resume Tools
- Resume templates
- Resume forum for feedback/tips
- ATS (Applicant Tracking System) Optimization

#### Salary & Negotiation
- Forum for negotiation advice
- Salary data from levels.fyi, glassdoor, and other databases

#### Networking
- Recruiter/researcher discovery
- Networking forum/tab

---

## Architecture

- **Frontend:** React + TypeScript (see `/src/frontend/components`)
- **Backend:** Node.js + Express + TypeScript (`/src/backend`)
- **Browser Extension:** Manifest v3, JS/TS (`/src/extension`)
- **Job Scraping:** Integrates crawl4ai and Handshake bot
- **Data Sync:** Extension <-> Web app via API and local storage

---

## Development

1. Install dependencies: `npm install`
2. Start frontend: `npm run dev`
3. Start backend: `npm run start:backend`
4. Build extension: `npm run build:extension`
5. See `/src/frontend/components` for UI, `/src/backend/api` for endpoints.

---

## Contribution

- Open an issue or pull request for feedback or features!
