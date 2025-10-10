import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://www.justmicho.com",
      "https://justmicho.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json());

/* ---------- Health Check ---------- */
app.get("/", (_req, res) => res.send("OK"));
app.get("/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));

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
