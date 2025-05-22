import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ✅ Set allowed origins for CORS
const allowedOrigins = ['https://www.justmicho.com', 'http://localhost:3000'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

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
        model: "mistralai/mistral-7b-instruct", 
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

app.post("/submit-suggestion", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/suggestions`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ message }),
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error("Supabase error:", errorText);
      return res.status(500).json({ error: errorText });
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend server running at http://localhost:3000");
});
