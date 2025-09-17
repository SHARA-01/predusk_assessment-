import { useEffect, useMemo, useState } from "react";

export default function Index() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({ name: "", email: "", headline: "", location: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [projects, setProjects] = useState([]);
  const [skill, setSkill] = useState("");
  const [topSkills, setTopSkills] = useState([]);
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:3000";

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditProfile({
        name: profile.name || "",
        email: profile.email || "",
        headline: profile.headline || "",
        location: profile.location || "",
      });
    }
  }, [profile]);
  async function handleEditProfile(e) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfile),
      });
      if (!res.ok) {
        const err = await res.json();
        setEditError(err.error || "Failed to update profile");
      } else {
        const updated = await res.json();
        setProfile(updated);
        setEditMode(false);
      }
    } catch (e) {
      setEditError("Network error");
    } finally {
      setEditLoading(false);
    }
  }

  async function refresh() {
    try {
      const [p, s] = await Promise.all([
        fetch(`${BASE_URL}/api/profile`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${BASE_URL}/api/skills/top`).then((r) => r.json()),
      ]);

      if (!p) {
        // Seed if empty for first-time UX
        const seeded = await fetch(`${BASE_URL}/api/seed`, { method: "POST" }).then((r) => r.json());
        setProfile(seeded.profile || null);
        setProjects(seeded.profile?.projects || []);
      } else {
        setProfile(p);
        setProjects(p.projects || []);
      }

      setTopSkills(Array.isArray(s) ? s : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
      setSearchResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function filterBySkill(s) {
    setSkill(s);
    try {
      const res = await fetch(`${BASE_URL}/api/projects?skill=${encodeURIComponent(s)}`).then((r) => r.json());
      setProjects(res);
    } catch (e) {
      console.error(e);
    }
  }

  const skillChips = useMemo(() => (topSkills || []).slice(0, 12), [topSkills]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
          {/* Projects Panel */}
          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-8">
              <h1 className="text-3xl font-extrabold tracking-tight">{profile?.name}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {profile?.headline}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {skillChips.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => filterBySkill(s.name)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      skill === s.name ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                    }`}
                  >
                    {s.name} <span className="opacity-60">· {s.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div id="projects" className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Projects {skill && <span className="text-primary">· {skill}</span>}
                </h2>
                <input
                  placeholder="Filter by skill (e.g. react)"
                  value={skill}
                  onChange={(e) => filterBySkill(e.target.value)}
                  className="h-9 w-56 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {projects.map((p, i) => (
                  <li key={p.title + i} className="rounded-lg border p-4 hover:shadow">
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(p.skills || []).map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs">{s}</span>
                      ))}
                    </div>
                    {(p.links || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        {p.links.map((l, idx) => (
                          <a key={idx} href={l} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                            Link {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full rounded-lg border p-6 text-center text-sm text-muted-foreground">
                    No projects found for this filter.
                  </div>
                )}
              </ul>
            </div>
          </div>

          {/* Sidebar - Profile & Search */}
          <aside id="profile" className="space-y-6">
            {/* Profile */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Profile</h2>
              {profile && !editMode ? (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{profile.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                      {profile.email}
                    </a>
                  </div>
                  {profile.headline && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Headline</span>
                      <span>{profile.headline}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.links && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {profile.links.github && (
                        <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" href={profile.links.github}>
                          GitHub
                        </a>
                      )}
                      {profile.links.linkedin && (
                        <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" href={profile.links.linkedin}>
                          LinkedIn
                        </a>
                      )}
                      {profile.links.portfolio && (
                        <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" href={profile.links.portfolio}>
                          Portfolio
                        </a>
                      )}
                    </div>
                  )}
                  {profile.summary && <p className="pt-3 text-muted-foreground">{profile.summary}</p>}
                  {(profile.skills || []).length > 0 && (
                    <div className="pt-3">
                      <div className="text-xs font-medium text-muted-foreground">Skills</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.skills.map((s) => (
                          <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 border"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              ) : profile && editMode ? (
                <form className="mt-3 space-y-3 text-sm" onSubmit={handleEditProfile}>
                  <div>
                    <label className="block text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={e => setEditProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={editProfile.email}
                      onChange={e => setEditProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Headline</label>
                    <input
                      type="text"
                      value={editProfile.headline}
                      onChange={e => setEditProfile(p => ({ ...p, headline: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Location</label>
                    <input
                      type="text"
                      value={editProfile.location}
                      onChange={e => setEditProfile(p => ({ ...p, location: e.target.value }))}
                      className="w-full rounded-md border px-3 py-2"
                    />
                  </div>
                  {editError && <div className="text-red-500 text-xs">{editError}</div>}
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                      disabled={editLoading}
                    >
                      {editLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                      onClick={() => setEditMode(false)}
                      disabled={editLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">
                  No profile yet. Use the Search or seed endpoint to create one.
                </div>
              )}
            </div>

            {/* Search */}
            <div id="search" className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Search</h2>
              <div className="mt-3 flex gap-2">
                <input
                  placeholder="Try: react, mongodb, Me-API"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={search}
                  className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  {loading ? "Searching…" : "Search"}
                </button>
              </div>
              {searchResults && (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="text-muted-foreground">Hits: {searchResults.hits}</div>
                  {searchResults.profile && (
                    <div className="rounded-md border p-3">
                      <div className="font-medium">{searchResults.profile.name}</div>
                      {searchResults.profile.summary && (
                        <div className="text-muted-foreground">{searchResults.profile.summary}</div>
                      )}
                    </div>
                  )}
                  {(searchResults.projects || []).map((p, i) => (
                    <div key={p.title + i} className="rounded-md border p-3">
                      <div className="font-medium">{p.title}</div>
                      {p.description && <div className="text-muted-foreground">{p.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        API endpoints: /api/profile, /api/projects?skill=, /api/skills/top, /api/search?q= ·{" "}
        <a href="/health" className="underline">
          /health
        </a>
      </footer>
    </div>
  );
}
