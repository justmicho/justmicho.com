// server.mjs
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// --- CORS (put this BEFORE routes) ---
const ALLOWED_ORIGINS = [
  "https://www.justmicho.com",
  "https://justmicho.com",
  "http://localhost:3000",   // your local backend
  "http://localhost:5173",   // common local front-end dev ports (optional)
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin(origin, cb) {
    // allow non-browser requests (curl/postman) with no Origin
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,       // set true only if you use cookies/auth headers that require it
  maxAge: 86400             // cache preflight for a day
}));

// Respond to preflight quickly
app.options("*", cors());

// --- Body parsing ---
app.use(express.json());

// --- Health checks ---
app.get("/", (_req, res) => res.send("OK"));
app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// --- Chat endpoint ---
app.post("/chat", async (req, res) => {
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

    const ct = (r.headers.get("content-type") || "");
    const data = ct.includes("application/json") ? await r.json() : { error: await r.text() };
    if (!r.ok) return res.status(r.status).json(data);

    return res.json(data);
  } catch (e) {
    console.error("CHAT ROUTE ERROR:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- Suggestions endpoint ---
app.post("/submit-suggestion", async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 http://0.0.0.0:${PORT} - CORS open`)
);
