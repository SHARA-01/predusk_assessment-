// Simple in-memory fallback for environments without MongoDB access.
// This is not persistent and only used to avoid failures during preview.

let profile = null;

export function getMemoryProfile() {
  return profile;
}

export function setMemoryProfile(p) {
  profile = p;
  return profile;
}
