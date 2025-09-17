import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

import {
  getHealth,
  getProfile,
  upsertProfile,
  updateProfile,
  getProjects,
  getTopSkills,
  searchAll,
  seedIfEmpty,
} from "./routes/me.js";
import { connectMongo } from "./db/mongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- Connect to MongoDB ---
connectMongo().catch(() => {
  console.warn("⚠️ Running without MongoDB connection. Set MONGODB_URI to enable persistence.");
});

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.get("/health", getHealth);

// Profile routes
app.get("/api/profile", getProfile);
app.post("/api/profile", upsertProfile);
app.put("/api/profile", updateProfile);

// Other "profile" routes
app.get("/api/projects", getProjects);
app.get("/api/skills/top", getTopSkills);
app.get("/api/search", searchAll);
app.post("/api/seed", seedIfEmpty);

app.listen(3000, ()=> console.log("server is running on port 3000..."))