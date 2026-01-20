require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "IsItAScam API is running" });
});

app.post("/api/check-ai", async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing 'message' in request body." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "OPENAI_API_KEY is not set on the server. Add it to a .env file next to index.js."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a security assistant that helps people spot scam and phishing messages. " +
              "Explain in simple, calm language why a message is risky or probably safe. Never ask the user to click unknown links."
          },
          {
            role: "user",
            content:
              "Please analyse this message and tell me if it is likely a scam, why or why not, and what I should do:\n\n" +
              message
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      return res.status(502).json({ error: "OpenAI API error" });
    }

    const data = await response.json();
    const summary =
      (data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "The AI could not provide a clear summary.";

    return res.json({ summary: summary.trim() });
  } catch (err) {
    console.error("AI check failed:", err);
    return res.status(500).json({ error: "Failed to contact OpenAI" });
  }
});

app.listen(PORT, () => {
  console.log(`IsItAScam API listening on http://localhost:${PORT}`);
});

