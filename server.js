const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = 3000;

// ── Replace these with your Supabase project values ──
// Find them at: supabase.com → your project → Settings → API
const SUPABASE_URL = process.env.SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "your-anon-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Calculate lead score based on visit data
function calcLeadScore(data) {
  let score = 30;
  if ((data.url || "").includes("pricing")) score += 30;
  if ((data.url || "").includes("demo")) score += 25;
  if ((data.url || "").includes("signup")) score += 20;
  if (data.referrer && data.referrer !== "Direct") score += 10;
  if (data.device === "Desktop") score += 5;
  return Math.min(score, 99);
}

// POST /track — receive pixel data and save to Supabase
app.post("/track", async (req, res) => {
  try {
    const { domain_id, user_id, ...rest } = req.body;

    const entry = {
      domain_id: domain_id || null,
      user_id: user_id || null,
      url: rest.url,
      title: rest.title,
      referrer: rest.referrer || "Direct",
      browser: rest.browser,
      os: rest.os,
      device: rest.device,
      screen: rest.screen,
      language: rest.language,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      lead_score: calcLeadScore(rest),
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from("visitors").insert(entry);
    if (error) throw error;

    res.json({ ok: true });
  } catch (err) {
    console.error("Track error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /visitors — fetch visitor logs for a user
app.get("/visitors", async (req, res) => {
  try {
    const { user_id, domain_id, limit = 100 } = req.query;

    let query = supabase
      .from("visitors")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(Number(limit));

    if (user_id) query = query.eq("user_id", user_id);
    if (domain_id) query = query.eq("domain_id", domain_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /stats — summary stats for a user
app.get("/stats", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.json({});

    const today = new Date().toISOString().split("T")[0];

    const { data: all } = await supabase
      .from("visitors")
      .select("id, url, lead_score, timestamp")
      .eq("user_id", user_id);

    const total = all?.length || 0;
    const todayN = all?.filter(v => v.timestamp?.startsWith(today)).length || 0;
    const hot = all?.filter(v => v.lead_score >= 70).length || 0;
    const unique = new Set(all?.map(v => v.url)).size;
    const avgScore = total ? Math.round(all.reduce((s, v) => s + v.lead_score, 0) / total) : 0;

    res.json({ total, today: todayN, hot, unique, avgScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /visitors — clear all visitor logs for a user
app.delete("/visitors", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const { error } = await supabase
      .from("visitors")
      .delete()
      .eq("user_id", user_id);

    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ VisitorTrack server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`\n⚠️  Make sure to set your Supabase credentials:`);
  console.log(`   SUPABASE_URL and SUPABASE_ANON_KEY environment variables\n`);
});
