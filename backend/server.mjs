import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - more permissive for debugging
app.use(
  cors({
    origin: true, // Allow all origins temporarily
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Add manual CORS headers as backup
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

/* ---------- Health Check ---------- */
app.get("/", (_req, res) => {
  console.log("Health check hit");
  res.send("OK");
});

app.get("/ping", (_req, res) => {
  console.log("Ping hit from origin:", _req.headers.origin);
  res.json({ ok: true, ts: Date.now() });
});

/* ---------- Chat ---------- */
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
      body: JSON.stringify({ model: "gpt-4o-mini", messages }),
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) return res.status(response.status).json(data);
    return res.json(data);
  } catch (error) {
    console.error("CHAT ROUTE ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 http://0.0.0.0:${PORT} - CORS open`)
);
