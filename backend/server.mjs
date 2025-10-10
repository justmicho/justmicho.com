import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// If you’re on Node 18/20+, fetch is global (no node-fetch import needed)
dotenv.config();

const app = express();

/* -----------------------------
   CORS: strict, explicit, robust
-------------------------------- */
const ALLOW_LIST = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost",            // some dev servers show just “localhost”
  "https://justmicho.com",
  "https://www.justmicho.com",
]);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || "";
  // If the request has an Origin, reflect it back *only* if whitelisted
  if (ALLOW_LIST.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin"); // make caches aware CORS varies by Origin
    // Only set credentials if you actually need cookies/auth:
    // res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    // Fallback (optional). If you prefer to reject unknown origins, omit this.
    res.setHeader("Access-Control-Allow-Origin", "https://www.justmicho.com");
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, X-Requested-With"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

// CORS for every request
app.use((req, res, next) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    // Important: immediately answer preflight
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

/* -----------------------------
   Chat (OpenAI)
-------------------------------- */
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status).json({ error: data });
    }

    // Set CORS headers again on the actual response (some proxies strip)
    setCorsHeaders(req, res);
    res.json(data);
  } catch (err) {
    console.error("Server error (/chat):", err);
    setCorsHeaders(req, res);
    res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------
   Suggestion (Supabase)
-------------------------------- */
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

    setCorsHeaders(req, res);
    if (r.ok) return res.status(200).json({ success: true });
    const txt = await r.text();
    console.error("Supabase error:", txt);
    return res.status(500).json({ error: txt });
  } catch (err) {
    console.error("Server error (/submit-suggestion):", err);
    setCorsHeaders(req, res);
    return res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------
   Health checks
-------------------------------- */
app.get("/", (req, res) => {
  setCorsHeaders(req, res);
  res.send("✅ justmicho-backend is live and sending proper CORS headers.");
});

// Explicit OPTIONS for good measure (some hosts route differently)
app.options("*", (req, res) => {
  setCorsHeaders(req, res);
  res.status(204).end();
});

/* -----------------------------
   Start server
-------------------------------- */
const PORT = process.env.PORT || 3000;
// bind 0.0.0.0 for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend listening on http://0.0.0.0:${PORT}`);
});