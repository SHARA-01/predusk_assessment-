import { ProfileModel } from "../models/profile.js";
import { getMongoConnection } from "../db/mongo.js";
import { getMemoryProfile, setMemoryProfile } from "../data/memory.js";

export const getHealth = (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
};

export const getProfile = async (_req, res) => {
  const connected = !!getMongoConnection();
  if (connected) {
    const profile = await ProfileModel.findOne().lean();
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    return res.json(profile);
  }
  const mem = getMemoryProfile();
  if (!mem) return res.status(404).json({ error: "Profile not found" });
  return res.json(mem);
};

export const upsertProfile = async (req, res) => {
  const data = req.body;
  if (!data || !data.email || !data.name) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const connected = !!getMongoConnection();
  if (connected) {
    const updated = await ProfileModel.findOneAndUpdate(
      { email: data.email },
      { $set: data, $currentDate: { updatedAt: true } },
      { new: true, upsert: true }
    ).lean();
    return res.status(200).json(updated);
  }
  const updated = setMemoryProfile({ ...data, createdAt: new Date(), updatedAt: new Date() });
  return res.status(200).json(updated);
};

export const updateProfile = async (req, res) => {
  const data = req.body;
  const email = data?.email;
  if (!email) return res.status(400).json({ error: "email is required" });
  const connected = !!getMongoConnection();
  if (connected) {
    const updated = await ProfileModel.findOneAndUpdate(
      { email },
      { $set: data, $currentDate: { updatedAt: true } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: "Profile not found" });
    return res.json(updated);
  }
  const mem = getMemoryProfile();
  if (!mem) return res.status(404).json({ error: "Profile not found" });
  const updated = setMemoryProfile({ ...mem, ...data, updatedAt: new Date() });
  return res.json(updated);
};

export const getProjects = async (req, res) => {
  const skill = req.query.skill;
  const connected = !!getMongoConnection();
  const profile = connected ? await ProfileModel.findOne().lean() : getMemoryProfile();
  const projects = profile?.projects || [];
  const filtered = skill
    ? projects.filter(p => (p.skills || []).map(s => s.toLowerCase()).includes(String(skill).toLowerCase()))
    : projects;
  res.json(filtered);
};

export const getTopSkills = async (_req, res) => {
  const connected = !!getMongoConnection();
  const profile = connected ? await ProfileModel.findOne().lean() : getMemoryProfile();

  const counts = {};
  const add = (skills) => {
    skills?.forEach(skill => {
      const key = skill.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
  };

  add(profile?.skills);
  profile?.projects?.forEach(p => add(p.skills));
  profile?.work?.forEach(w => add(w.skills));

  const result = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  res.json(result);
};

export const searchAll = async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ profile: null, projects: [], hits: 0 });

  const connected = !!getMongoConnection();
  if (connected) {
    try {
      const doc = await ProfileModel.findOne({ $text: { $search: q } }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .lean();

      const projects = doc?.projects?.filter(p =>
        [p.title, p.description, ...(p.skills || [])]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      ) || [];

      return res.json({ profile: doc || null, projects, hits: projects.length + (doc ? 1 : 0) });
    } catch (err) {
      // You could log the error here if you want
    }
  }

  const doc = getMemoryProfile();
  const projects = doc?.projects?.filter(p =>
    [p.title, p.description, ...(p.skills || [])]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  ) || [];

  return res.json({ profile: doc || null, projects, hits: projects.length + (doc ? 1 : 0) });
};

export const seedIfEmpty = async (_req, res) => {
  const connected = !!getMongoConnection();

  if (connected) {
    const existing = await ProfileModel.findOne().lean();
    if (existing) return res.json({ seeded: false, message: "Profile already exists" });
  } else if (getMemoryProfile()) {
    return res.json({ seeded: false, message: "Profile already exists" });
  }
  
  // const sample = {
  //   name: "Gulab Chand Meena",
  //   email: "chndshara@gmail.com",
  //   headline: "Intern - Software & Web Developer",
  //   summary: "Candidate profile for Me-API Playground showcasing skills, projects, and work.",
  //   location: "Jaipur",
  //   skills: ["javascript", "react", "node", "mongodb", "tailwind"],
  //   projects: [
  //     {
  //       title: "Me-API Playground",
  //       description: "Personal API with MongoDB, Node.js, and a minimal React frontend to search by skill, list projects, and view profile.",
  //       links: ["/"],
  //       skills: ["node", "express", "react", "vite", "mongodb", "tailwind"],
  //     },
  //     {
  //       title: "AI Notes",
  //       description: "Lightweight notes app with semantic search.",
  //       links: ["https://example.com"],
  //       skills: ["react", "typescript", "embedding", "pinecone"],
  //     },
  //   ],
  //   work: [
  //     {
  //       company: "Open Source",
  //       role: "Contributor",
  //       startDate: "2023",
  //       endDate: "2024",
  //       description: "Contributed to JS tooling.",
  //       skills: ["javascript", "testing"],
  //     },
  //   ],
  //   education: [
  //     {
  //       institution: "Example University",
  //       degree: "B.S.",
  //       field: "Computer Science",
  //       startYear: 2020,
  //       endYear: 2024,
  //     },
  //   ],
  //   links: {
  //     github: "https://github.com/",
  //     linkedin: "https://linkedin.com/",
  //     portfolio: "https://example.com",
  //   },
  // };
  // 
  
  const sample = {
  "name": "Gulab Chand Meena",
  "email": "chndshara@gmail.com",
  "headline": "Software Developer Trainee",
  "summary": "A passionate developer with hands-on experience in full-stack development, database integration, and game development.",
  "location": "Jaipur, Rajasthan",
  "skills": [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "Express.js",
    "Redis",
    "CSS",
    "Tailwind",
    "GraphQL",
    "C++"
  ],
  "projects": [
    {
      "title": "Poker Game",
      "description": "Developed the backend for a real-time multiplayer poker game using Node.js. Implemented Socket.IO for seamless communication, Redis for caching, and MongoDB for storing user data and game sessions.",
      "links": [
        "https://github.com/your-repo/poker-game"
      ],
      "skills": [
        "Node.js",
        "Redis",
        "MongoDB",
        "Socket.IO"
      ]
    },
    {
      "title": "Alumni Connect: Bridging Futures",
      "description": "Developed a full-stack web application to connect college students with alumni, enabling advice sharing and job referral opportunities.",
      "links": [
        "https://github.com/your-repo/alumni-connect"
      ],
      "skills": [
        "React.js",
        "Node.js",
        "MongoDB",
        "Express.js",
        "Cloudinary",
        "CSS",
        "HTML",
        "JavaScript",
        "Axios"
      ]
    },
    {
      "title": "Task Scheduling Web Application",
      "description": "Built a task scheduling web app with secure authentication, drag-and-drop functionality for task prioritization, and task list management.",
      "links": [
        "https://github.com/your-repo/task-scheduler"
      ],
      "skills": [
        "React.js",
        "Node.js",
        "MongoDB",
        "Express.js",
        "JWT"
      ]
    }
  ],
  "work": [
    {
      "company": "Mobzway Technology",
      "role": "Software Developer Trainee",
      "startDate": "May 2024",
      "endDate": "Jan 2025",
      "description": "Integrated MongoDB Atlas for cloud-based data storage solutions, optimized database queries for high-traffic applications, and developed interactive user interfaces using React.",
      "skills": [
        "MongoDB",
        "React.js",
        "Node.js",
        "Phaser",
        "Redis"
      ]
    },
    {
      "company": "Navaodita Infotech",
      "role": "Full-Stack Developer Intern",
      "startDate": "Mar 2024",
      "endDate": "Apr 2024",
      "description": "Developed a responsive admin panel using React and worked with RESTful APIs to ensure smooth data flow across the application.",
      "skills": [
        "React.js",
        "Node.js",
        "Redux",
        "Context API",
        "RESTful APIs"
      ]
    }
  ],
  "education": [
    {
      "institution": "Jaipur Engineering College, Jaipur",
      "degree": "Bachelor of Technology",
      "field": "Computer Science Engineering",
      "startYear": 2020,
      "endYear": 2024
    },
    {
      "institution": "Rajasthan Board of Secondary Education",
      "degree": "Class 12th",
      "field": "PCM",
      "year": 2018
    },
    {
      "institution": "Rajasthan Board of Secondary Education",
      "degree": "Class 10th",
      "year": 2016
    }
  ],
  "links": {
    "github": "https://github.com/your-username",
    "linkedin": "https://linkedin.com/in/your-profile",
    "portfolio": "https://yourportfolio.com"
  }
  };
  
  

  if (connected) {
    const created = await ProfileModel.create(sample);
    return res.json({ seeded: true, profile: created });
  }

  const created = setMemoryProfile(sample);
  return res.json({ seeded: true, profile: created });
};
