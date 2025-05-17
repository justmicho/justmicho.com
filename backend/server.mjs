import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
console.log("✅ Loaded key:", process.env.OPENROUTER_KEY ? "YES" : "NO");
console.log("🔑 Key preview:", process.env.OPENROUTER_KEY?.slice(0, 10)); // for debug only

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const messages = req.body.messages;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // ✅ this one is free & works
        messages
      })
      
    });

    const data = await response.json();
    console.log("🔍 OpenRouter response:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend server running at http://localhost:3000");
});
