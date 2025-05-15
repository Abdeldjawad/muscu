const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1", // ✅ OpenRouter URL
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:4200", // ou ton site déployé
    "X-Title": "MuscuApp IA Forum"
  }
});

exports.askMuscuAI = async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ message: "❌ Question manquante." });

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct", // ✅ modèle gratuit
      messages: [
        { role: "system", content: "Tu es un coach expert en musculation. Réponds de manière claire et motivante." },
        { role: "user", content: question }
      ],
      max_tokens: 200,
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ Erreur OpenRouter :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la réponse." });
  }
};
