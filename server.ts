import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON payloads securely
app.use(express.json());

// Initialize Gemini client lazily to avoid startup crashes if key is omitted initially
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please define it in your AI Studio Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. AI Tutor Chat Endpoint
app.post("/api/tutor/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing message parameter" });
      return;
    }

    const ai = getGeminiClient();
    
    // Construct system instructions emphasizing helpfulness, clarity, step-by-step pedagogical guidance, and clean markdown rendering
    const systemInstruction = 
      "You are a friendly, highly encouraging AI Mathematics Tutor. " +
      "Your goal is to guide students through mathematics topics (counting tables, multiplication, algebra, calculus, geometry, trigonometry) " +
      "using interactive, conversational tutoring. Instead of just giving the answer, guide them step-by-step. " +
      "Use clear formulas formatted in MathJax/LaTeX style or elegant plain text/monospace blocks. Always use helpful examples.";

    // Convert history format to fit Gemini or build a structured prompt
    const formattedHistory = (history || []).map((h: { sender: string; text: string }) => {
      return `${h.sender === "user" ? "Student" : "Tutor"}: ${h.text}`;
    }).join("\n");

    const prompt = formattedHistory 
      ? `${formattedHistory}\nStudent: ${message}\nTutor:` 
      : `Student asked: ${message}\nTutor:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "I was unable to formulate an answer. Could you rephrase your question?" });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI Tutor service" });
  }
});

// 2. Step-by-step Problem Solver Endpoint
app.post("/api/tutor/solve", async (req, res) => {
  try {
    const { problem, topic } = req.body;
    if (!problem) {
      res.status(400).json({ error: "No mathematics problem provided to solve" });
      return;
    }

    const ai = getGeminiClient();
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        problem: { type: Type.STRING, description: "The original problem cleaned up." },
        topic: { type: Type.STRING, description: "Identified mathematical topic." },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title or operation rule of this mathematical step." },
              explanation: { type: Type.STRING, description: "Verbose explanation of what was computed." },
              equation: { type: Type.STRING, description: "Mathematical expression resulting from this step." }
            },
            required: ["title", "explanation", "equation"]
          },
          description: "Chronological logical steps to solve the problem."
        },
        finalAnswer: { type: Type.STRING, description: "The exact final answer or simplified outcome." },
        confidenceLevel: { type: Type.STRING, description: "Tutor confidence (High, Moderate, Review Required)." }
      },
      required: ["problem", "topic", "steps", "finalAnswer", "confidenceLevel"]
    };

    const systemInstruction = 
      "You are a structured Mathematical Solver. Break down the provided expression or word problem into logical, simple chronological steps of computations. " +
      "Identify the mathematical rules used (e.g., FOIL, commutative law, Pythagorean theorem, factoring). Return a JSON object matching the requested schema.";

    const prompt = `Solve this mathematical problem: ${problem} ${topic ? `(context/topic: ${topic})` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const solvedPayload = JSON.parse(response.text || "{}");
    res.json(solvedPayload);
  } catch (error: any) {
    console.error("Gemini Solver Error:", error);
    res.status(500).json({ error: error.message || "Unable to solve this problem. Check mathematical syntax." });
  }
});

// 3. Dynamic Practice Drills & Quiz Trivia Generator
app.post("/api/tutor/drills", async (req, res) => {
  try {
    const { category, level } = req.body; // e.g. fractions, algebraic_identities, geometry
    const ai = getGeminiClient();

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique string id (e.g., q1, q2)." },
          question: { type: Type.STRING, description: "The math question text." },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Four logical multiple-choice options."
          },
          correctAnswer: { type: Type.STRING, description: "Exactly matches the correct entry in the options list." },
          stepByStepHint: { type: Type.STRING, description: "A tutoring hint that guides the user towards compiling the answer." },
          conceptExplanation: { type: Type.STRING, description: "The underlying algebraic, geometric, or arithmetic concept or formula explained clearly." }
        },
        required: ["id", "question", "options", "correctAnswer", "stepByStepHint", "conceptExplanation"]
      }
    };

    const systemInstruction = 
      "You are a test generator creating professional mathematical exercises and exam preparations. " +
      "Generate exactly 5 distinct multiple-choice questions for the requested mathematical category and difficulty level. " +
      "Ensure logical option values that trap common math mistakes. Choose options structured as strings. Return a JSON array matching the schema.";

    const prompt = `Generate exercises for category: ${category || "general math"} at level: ${level || "intermediate"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.8,
      },
    });

    const drills = JSON.parse(response.text || "[]");
    res.json({ drills });
  } catch (error: any) {
    console.error("Gemini Drills Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate dynamic practice items." });
  }
});

// Integrate Vite middleware for development or serve built files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Mathematics App server listening on port ${PORT}`);
  });
}

startServer();
