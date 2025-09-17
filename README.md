# Predusk Assessment — Basic API Playground

This project is a simple **profile API + minimal frontend** built as part of the **Predusk Intern – Software & AI Developer** assessment.

It stores my personal candidate profile in a **MongoDB database**, exposes it via a small **Node.js/Express API**, and provides a minimal **React + Tailwind frontend** to query and view the data.

---

## 🚀 Live Demo

Frontend + API hosted at:  
👉 [https://predusk-assement-basic-api.vercel.app/](https://predusk-assement-basic-api.vercel.app/)

---

## 🛠 Tech Stack

- **Backend**: Node.js + Express  
- **Database**: MongoDB (Mongoose ODM)  
- **Frontend**: React (Vite) + Tailwind CSS  
- **Hosting**: Vercel (frontend + backend)  

---

## 📌 Features

- Create, Read, Update candidate profile  
- Profile contains:
  - Name, Email, Education  
  - Skills (array)  
  - Projects (title, description, links)  
  - Work history (company, role, dates, description)  
  - Links (GitHub, LinkedIn, Portfolio)  
- Query endpoints:
  - `GET /api/projects?skill=...` → filter projects by skill  
  - `GET /api/skills/top` → return top skills  
  - `GET /api/search?q=...` → search across profile, skills, projects  
- Health check endpoint: `GET /api/health`  

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Liveness check (`{ status: "ok" }`) |
| `GET`  | `/api/profile` | Fetch full profile |
| `POST` | `/api/profile` | Create or update profile |
| `GET`  | `/api/projects` | List projects (supports `?skill=...`) |
| `GET`  | `/api/skills/top` | Get top skills |
| `GET`  | `/api/search?q=...` | Search across profile, skills, projects |

---

## 🗄 Example Data Model (MongoDB)

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "education": "B.Tech - Computer Science",
  "skills": ["javascript", "nodejs", "react", "mongodb"],
  "projects": [
    {
      "title": "Lone Town",
      "description": "Intelligent matchmaking system",
      "links": { "github": "https://github.com/you/lone-town" }
    },
    {
      "title": "Task Manager",
      "description": "Animated task manager UI",
      "links": { "live": "https://your-site.com" }
    }
  ],
  "work": [
    {
      "company": "Mobzway Technology LLP",
      "role": "Software Trainee",
      "start_date": "2024-07-01",
      "end_date": "2025-01-01",
      "description": "Worked on game backend systems"
    }
  ],
  "links": {
    "github": "https://github.com/you",
    "linkedin": "https://linkedin.com/in/you",
    "portfolio": "https://your-portfolio-url.com"
  }
}
