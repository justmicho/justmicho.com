import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

/* -----------------------------
   ✅ CORS: Multi-layer approach
-------------------------------- */
// Layer 1: Manual CORS middleware (runs first)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} from ${req.get('origin') || 'no origin'}`);
  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Max-Age", "86400"); // 24 hours
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    console.log("✅ Preflight request handled");
    return res.status(204).end();
  }
  
  next();
});

// Layer 2: cors package as backup
app.use(cors({
  origin: '*',
  credentials: false
}));

app.use(express.json());

/* -----------------------------
   💬 Chat Endpoint (OpenAI GPT-4o-mini)
-------------------------------- */
app.post("/chat", async (req, res) => {
  console.log("💬 Chat endpoint hit");
  const messages = req.body.messages;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
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
      console.error("❌ OpenAI error:", data);
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("⚠️ Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------
   💡 Suggestion Submission (Supabase)
-------------------------------- */
app.post("/submit-suggestion", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/suggestions`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error("🧱 Supabase error:", errorText);
      return res.status(500).json({ error: errorText });
    }
  } catch (err) {
    console.error("⚠️ Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* -----------------------------
   🩵 Health Check
-------------------------------- */
app.get("/", (_req, res) => {
  res.send("✅ justmicho-backend is live and CORS-* ready!");
});

/* -----------------------------
   🚀 Start Server
-------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
  console.log("🔑 OpenAI Key Loaded:", !!process.env.OPENAI_API_KEY);
});