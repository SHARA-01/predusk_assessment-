import mongoose from "mongoose";

const { Schema, model } = mongoose;

const LinkSchema = new Schema(
  {
    github: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
    twitter: { type: String },
    website: { type: String },
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String },
    field: { type: String },
    startYear: { type: Number },
    endYear: { type: Number },
    location: { type: String },
    details: { type: String },
  },
  { _id: false }
);

const WorkSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    location: { type: String },
    description: { type: String },
    skills: [{ type: String, index: true }],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String },
    links: [{ type: String }],
    skills: [{ type: String, index: true }],
  },
  { _id: false }
);

const ProfileSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    headline: { type: String },
    summary: { type: String },
    location: { type: String },
    skills: [{ type: String, index: true }],
    projects: [ProjectSchema],
    work: [WorkSchema],
    education: [EducationSchema],
    links: LinkSchema,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "profiles" }
);

ProfileSchema.index({
  name: "text",
  email: "text",
  summary: "text",
  "projects.title": "text",
  "projects.description": "text",
  skills: "text",
});

ProfileSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const ProfileModel = mongoose.models.Profile || model("Profile", ProfileSchema);
