# ☕ TeaTalks

**Your Campus. Your Voice. Zero Judgment.**  

An anonymous student discussion platform where college students can post, comment, vote, and review professors — without revealing their identity.

---

## 🚀 Quick Start (For Team Members)

### Prerequisites

Make sure you have these installed on your computer:


- **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)
- **VS Code** (recommended) — [Download here](https://code.visualstudio.com/)

To check if you have them, open the terminal and run:

```bash
node --version
git --version
````

If both show version numbers, you are good to go.

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/HarshitPandey-2021/teatalks.git
cd teatalks
```

---

### Step 2 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

### Step 3 — Install Backend Dependencies

```bash
cd ../backend
npm install
```

---

### Step 4 — Run the Frontend

Open a terminal window:

```bash
cd frontend
npm run dev
```

The app will open at **[http://localhost:3000](http://localhost:3000)**

---

### Step 5 — Run the Backend

Open a **second** terminal window (keep the frontend running):

```bash
cd backend
node server.js
```

The API will run at **[http://localhost:5000](http://localhost:5000)**

> **Note:** The `server.js` file will be created soon. For now, focus on the frontend if you are working on UI pages.

---

## 📁 Project Structure

```text
teatalks/
├── frontend/                  # Next.js app (what users see)
│   ├── src/
│   │   ├── app/               # Pages
│   │   └── components/        # Reusable UI components
│   └── public/                # Images, icons
│
├── backend/                   # Express.js API (the brain)
│   ├── server.js              # Entry point
│   ├── models/                # Database schemas
│   ├── routes/                # API endpoints
│   └── middleware/            # Auth, moderation
│
├── .gitignore
└── README.md
```


---

## 🔀 How to Work (Git Workflow)

**IMPORTANT:** Never push directly to the `main` branch.

### When you want to work on something:

```bash
git checkout main
git pull origin main
git checkout -b your-name/feature-name
```

Example:

```bash
git checkout -b shakti/landing-page
```

### When you are done:

```bash
git add .
git commit -m "Add landing page with hero section and features"
git push origin shakti/landing-page
```

Then go to GitHub → click the yellow banner → **Create Pull Request**

Team members will review and merge it.

---

## 👥 Team

| Name    | Role                             |
| ------- | -------------------------------- |
| Harshit | Frontend Developer + Coordinator |
| Somesh  | Backend Developer + API Engineer |
| Shiva   | Database + AI Integration        |
| Shakti  | Content + Presentation Lead      |

---

## 🛠️ Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Next.js 14, React, Tailwind CSS     |
| Backend  | Node.js, Express.js                 |
| Database | MongoDB Atlas                       |
| AI       | Google Perspective API              |
| Hosting  | Vercel (frontend), Render (backend) |

---

## ⚡ First Tasks for Each Member

### Shakti

1. Clone the repo (follow steps above)
2. Run the frontend:

```bash
cd frontend
npm run dev
```

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


