# RoleWeaver CV

> **AI-powered resume tailoring system** — Upload your resume once, paste any job description, and get a fully rewritten, ATS-optimized resume in seconds.

![RoleWeaver CV](https://img.shields.io/badge/Stack-MERN-blue?style=flat-square) ![AI](https://img.shields.io/badge/AI-OpenRouter%20%7C%20Llama%203.3-purple?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## What is RoleWeaver CV?

Most resume tools give you a generic template. RoleWeaver CV acts like a **senior recruiter at your target company** — it reads your resume, reads the job description, and rewrites your resume to make your value impossible to ignore.

**The core idea:** Upload your resume once → paste any job description or URL → get a tailored, keyword-aligned, ATS-optimized resume with a downloadable 2-column PDF.

---

## Features

### AI Pipeline (5-Step)
| Step | What it does |
|------|-------------|
| 1 | **Hiring Manager Critique** — Brutal honest feedback: red flags, weak points, missing elements |
| 2 | **ATS Gap Analysis** — Missing keywords, ATS score (0–100), restructuring advice |
| 3 | **Bullet Rewriting** — Every bullet rewritten as `Action Verb + Task + Measurable Result` |
| 4 | **Tone Alignment** — Rewrites summary to match company culture, values, and industry language |
| 5 | **Final Polish** — Removes clichés ("team player", "hardworking"), fixes tense, adds power language |

### Resume Intelligence
- Captures **every section** from your uploaded resume — certifications, accomplishments, publications, projects, awards, patents, volunteer work — nothing is dropped
- Preserves all sections through the tailoring pipeline
- Keyword highlighting (bold) in both web preview and downloaded PDF

### UI / UX
- Dark-themed, modern interface built with React + TypeScript + Tailwind CSS + Framer Motion
- Side-by-side **Before / After bullet diff** view
- **Keyword match badges** with animated score bar
- Live **5-step progress indicator** while AI processes
- Profile photo upload — appears in downloaded PDF

### PDF Export
- **2-column professional PDF** — dark navy sidebar (photo, contact, skills, certifications) + clean white main column (summary, experience, accomplishments, education)
- Matched keywords appear **bold** in PDF
- Download tailored resume as PDF with one click

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| React Router v7 | Routing |
| @react-pdf/renderer | PDF generation |
| React Dropzone | File upload |
| Lucide React | Icons |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 5 | REST API |
| MongoDB + Mongoose | Database |
| OpenRouter API | AI inference (Llama 3.3 / Claude) |
| pdf-parse | PDF text extraction |
| Cheerio + Axios | Job description scraping from URL |
| JWT + bcryptjs | Authentication |
| Multer | File upload handling |

### Infrastructure (All Free Tier)
| Service | What |
|---------|------|
| MongoDB Atlas | Database (512MB free) |
| Render.com | Backend hosting |
| Vercel | Frontend hosting |
| OpenRouter | AI API (free models available) |

---

## Project Structure

```
RoleWeaverCV/
├── client/                          # React + TypeScript frontend
│   └── src/
│       ├── components/
│       │   ├── layout/              # Navbar
│       │   ├── resume/              # ResumeUploader, ResumePreview, ResumePDF, DownloadPDFButton
│       │   ├── tailor/              # BulletDiff, KeywordBadges, AnalysisPanel
│       │   └── ui/                  # Button, Input, Card
│       ├── pages/                   # Landing, Auth, Dashboard, Tailor
│       ├── services/                # API calls (auth, resume, tailor)
│       ├── store/                   # AuthContext (JWT auth state)
│       └── types/                   # TypeScript interfaces
│
└── server/                          # Express backend
    └── src/
        ├── config/                  # MongoDB connection
        ├── middleware/              # JWT auth middleware
        ├── models/                  # User, Resume (Mongoose)
        ├── routes/                  # /auth, /resumes, /tailor
        ├── services/
        │   ├── aiService.js         # 5-step AI pipeline
        │   ├── pdfParser.js         # PDF → structured JSON
        │   └── jdScraper.js         # Scrape JD from URL
        └── utils/                   # Multer upload config
```

---

## Getting Started

### Prerequisites
- Node.js v20.19+ or v24+
- MongoDB Atlas account (free)
- OpenRouter API key (free)

### 1. Clone the repo

```bash
git clone https://github.com/prathiba7/roleWeaverCv.git
cd roleWeaverCv
```

### 2. Setup the server

```bash
cd server
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/roleweavercv
JWT_SECRET=your_random_secret_here
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
AI_MODEL=meta-llama/llama-3.3-70b-instruct:free
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Setup the client

```bash
cd ../client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `MONGO_URI` | MongoDB connection string | [MongoDB Atlas](https://mongodb.com/atlas) |
| `JWT_SECRET` | Random secret for JWT signing | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `OPENROUTER_API_KEY` | AI API key | [openrouter.ai](https://openrouter.ai) |
| `AI_MODEL` | Model to use | Any `:free` model from OpenRouter |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` in dev |

### Free AI Models (OpenRouter)

```
meta-llama/llama-3.3-70b-instruct:free   # Best quality, free
google/gemma-3-27b-it:free
deepseek/deepseek-r1-0528:free
mistralai/mistral-7b-instruct:free
```

---

## API Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
GET    /api/auth/me                Get current user

POST   /api/resumes/upload         Upload + parse PDF resume
GET    /api/resumes                Get all resumes for user
GET    /api/resumes/:id            Get single resume
DELETE /api/resumes/:id            Delete resume
PATCH  /api/resumes/:id/photo      Upload profile photo (base64)

POST   /api/tailor                 Run 5-step AI tailoring pipeline
```

---

## How the AI Pipeline Works

```
Upload PDF
    ↓
pdf-parse extracts raw text
    ↓
AI parses text → structured JSON (captures ALL sections dynamically)
    ↓
User pastes Job Description URL or text
    ↓
Step 1: Hiring manager critique (red flags, weak points)
Step 2: ATS keyword gap analysis (score, missing keywords)
Step 3: Bullet rewriting (Action + Task + Measurable Result)
Step 4: Tone alignment (match company culture & language)
Step 5: Final polish (remove clichés, fix tense, power language)
    ↓
Returns: tailored resume JSON + analysis + keywords matched
    ↓
Frontend renders: Before/After diff, keyword badges, ATS score
    ↓
Download as 2-column PDF with bold keywords
```

---

## What Makes This Different

| Feature | RoleWeaver CV | Generic Resume Tools |
|---------|--------------|---------------------|
| Captures ALL resume sections | ✅ Dynamic | ❌ Fixed fields only |
| 5-step AI pipeline | ✅ | ❌ Single prompt |
| Honest hiring manager critique | ✅ | ❌ |
| ATS score + gap analysis | ✅ | ❌ |
| Bullet rewriting with metrics | ✅ | ❌ |
| Tone alignment to company culture | ✅ | ❌ |
| Cliché removal + final polish | ✅ | ❌ |
| Before/After bullet diff | ✅ | ❌ |
| Profile photo in PDF | ✅ | ❌ |
| 100% free to run | ✅ | ❌ |
| Open source | ✅ | ❌ |

---

## Deployment

### Backend → Render.com
1. Push to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Connect your repo, set root to `server/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`

### Frontend → Vercel
1. Create new project on [vercel.com](https://vercel.com)
2. Connect your repo, set root to `client/`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Built by **Prathiba** as a full-stack portfolio project showcasing:
- MERN stack architecture
- AI integration with OpenRouter
- TypeScript + React modern frontend
- PDF generation with @react-pdf/renderer
- JWT authentication
- MongoDB Atlas deployment
