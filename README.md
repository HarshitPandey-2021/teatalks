# ☕ TeaTalks

**Your Campus. Your Voice. Zero Judgment.**

An anonymous student discussion platform where college students can post,
comment, vote, and review professors — without revealing their identity.

---

## 🚀 Quick Start (For Team Members)

### Prerequisites

Make sure you have these installed on your computer:

- **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)
- **VS Code** (recommended) — [Download here](https://code.visualstudio.com/)

To check if you have them, open terminal and run:
node --version
git --version

text


If both show version numbers, you are good.

---

### Step 1 — Clone the Repository

Open your terminal and run:
git clone https://github.com/YOUR_USERNAME/teatalks.git
cd teatalks

text


Replace `YOUR_USERNAME` with the actual GitHub username.

---

### Step 2 — Install Frontend Dependencies
cd frontend
npm install

text


---

### Step 3 — Install Backend Dependencies
cd ..
cd backend
npm install

text


---

### Step 4 — Run the Frontend

Open a terminal window:
cd frontend
npm run dev

text


The app will open at **http://localhost:3000**

---

### Step 5 — Run the Backend

Open a **second** terminal window (keep the first one running):
cd backend
node server.js

text


The API will run at **http://localhost:5000**

**Note:** The backend server.js file will be created soon. For now, focus on
frontend if you are working on UI pages.

---

## 📁 Project Structure
teatalks/
├── frontend/ ← Next.js app (what users see)
│ ├── src/
│ │ ├── app/ ← Pages
│ │ └── components/ ← Reusable UI components
│ └── public/ ← Images, icons
│
├── backend/ ← Express.js API (the brain)
│ ├── server.js ← Entry point
│ ├── models/ ← Database schemas
│ ├── routes/ ← API endpoints
│ └── middleware/ ← Auth, moderation
│
├── .gitignore
└── README.md

text


---

## 🔀 How to Work (Git Workflow)

**IMPORTANT: Never push directly to the `main` branch.**

### When you want to work on something:
git checkout main
git pull origin main
git checkout -b your-name/what-you-are-building

text


Example:
git checkout -b shakti/landing-page

text


### When you are done:
git add .
git commit -m "Add landing page with hero section and features"
git push origin shakti/landing-page

text


Then go to GitHub → you will see a yellow banner → click **"Create Pull Request"**

Harshit will review and merge it.

---

## 👥 Team

| Name    | Role                          |
|---------|-------------------------------|
| Harshit | Frontend Developer + Coordinator |
| Somesh  | Backend Developer + API Engineer |
| Shiva   | Database + AI Integration     |
| Shakti  | Content + Presentation Lead   |

---

## 🛠️ Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | Next.js 14, React, Tailwind CSS |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB Atlas                 |
| AI         | Google Perspective API        |
| Hosting    | Vercel (frontend), Render (backend) |

---

## ⚡ What Each Person Should Do First

### Shakti
1. Clone the repo (follow steps above)
2. Run the frontend (`cd frontend && npm run dev`)
3. Open `frontend/src/app/page.js` — this is the Landing Page
4. Start building the Landing Page
5. Create branch: `shakti/landing-page`

### Somesh
1. Clone the repo
2. Create `backend/server.js` with basic Express setup
3. Set up MongoDB Atlas account and get connection string
4. Create branch: `somesh/server-setup`

### Shiva
1. Clone the repo
2. Get Google Perspective API key
3. Test it with sample text
4. Start designing Mongoose schemas in `backend/models/`
5. Create branch: `shiva/database-schemas`

### Harshit
1. Set up auth context and API client in frontend
2. Build Signup and Login pages
3. Create branch: `harshit/auth-pages`
Save and close notepad.