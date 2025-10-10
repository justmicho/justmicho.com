import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // <-- use 3000 to match frontend

/* ---------- CORS ---------- */
const PROD_ORIGINS = new Set([
  "https://www.justmicho.com",
  "https://justmicho.com",
]);

const corsMw = cors({
  origin(origin, cb) {
    console.log(`CORS check for origin: ${origin}`); // Debug logging

    // Allow non-browser clients
    if (!origin) return cb(null, true);

    // Allow any localhost / 127.* origin (any port) in dev
    const isLocalhost =
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:");

    if (isLocalhost || PROD_ORIGINS.has(origin)) {
      console.log(`CORS: Allowing origin ${origin}`);
      return cb(null, true);
    }

    console.log(`CORS: Rejecting origin ${origin}`);
    return cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  maxAge: 86400,
});

app.use(corsMw);
app.use(express.json());

// Fallback CORS headers for debugging
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/* ---------- Health ---------- */
app.get("/", (_req, res) => res.send("OK"));
app.options("/ping", corsMw);
app.get("/ping", corsMw, (_req, res) => res.json({ ok: true, ts: Date.now() }));

/* ---------- Chat ---------- */
app.options("/chat", corsMw);
app.post("/chat", corsMw, async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages }),
    });

    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const data = ct.includes("application/json")
      ? await r.json()
      : { error: await r.text() };

    if (!r.ok) return res.status(r.status).json(data);
    return res.json(data);
  } catch (e) {
    console.error("CHAT ROUTE ERROR:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ---------- Suggestions ---------- */
app.options("/submit-suggestion", corsMw);
app.post("/submit-suggestion", corsMw, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message is required" });

    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/suggestions`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ message }),
    });

    if (r.ok) return res.json({ success: true });
    return res.status(500).json({ error: await r.text() });
  } catch (e) {
    console.error("SUGGESTIONS ROUTE ERROR:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 http://0.0.0.0:${PORT} - CORS open`)
);
