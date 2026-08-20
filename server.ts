import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 1. Gemini API Client Connection
function getGeminiClient(): GoogleGenAI | null {
  // Check for API Keys in Environment Variables
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 2. Phone Actions & Capabilities Declarations
const novaTools = [
  {
    functionDeclarations: [
      {
        name: "setAlarm",
        description: "Set an alarm on the user's phone.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING, description: "Alarm time e.g. '07:30 AM'" },
            label: { type: Type.STRING, description: "Alarm label" },
          },
          required: ["time"],
        },
      },
      {
        name: "setTimer",
        description: "Set a countdown timer.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            durationMinutes: { type: Type.NUMBER, description: "Minutes" },
            label: { type: Type.STRING, description: "Timer label" },
          },
          required: ["durationMinutes"],
        },
      },
      {
        name: "toggleDeviceSetting",
        description: "Toggle device flashlight/torch, Wi-Fi, Bluetooth, volume.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            setting: { type: Type.STRING, description: "'flashlight', 'wifi', 'bluetooth', 'volume'" },
            state: { type: Type.BOOLEAN, description: "True for ON, False for OFF" },
          },
          required: ["setting"],
        },
      },
      {
        name: "openApplication",
        description: "Open an installed app like Camera, YouTube, WhatsApp.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            appName: { type: Type.STRING, description: "App name" },
          },
          required: ["appName"],
        },
      },
      {
        name: "searchYouTube",
        description: "Search videos on YouTube.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Search term" },
          },
          required: ["query"],
        },
      },
    ],
  },
];

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 3. Main Chat Endpoint
app.post("/api/assistant/chat", async (req, res) => {
  const userMessage = req.body?.message || "";

  if (!userMessage.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const ai = getGeminiClient();

    // IF GEMINI API KEY IS MISSING OR NULL
    if (!ai) {
      return res.json({
        reply: `آپ نے فرمایا: "${userMessage}"۔ فی الحال API کی کنیکٹ نہیں ہے، لیکن میں آپ کا پیغام سمجھ گیا ہوں۔ Vercel میں API کی سیٹ کریں۔`,
        action: null,
      });
    }

    const systemInstruction = `You are Nova (نووا), an intelligent, warm, conversational Voice AI Assistant.
Always reply in the SAME language the user speaks (Urdu script, Roman Urdu, Hindi, or English).
Be interactive, smart, concise, and helpful. Never repeat generic canned error lines!`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: novaTools,
      },
    });

    let textResponse = response.text || "";
    let detectedAction = null;

    // Check for Function/Tool Calls (e.g. Torch, Alarm, Apps)
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const args = call.args as Record<string, any>;

      if (call.name === "toggleDeviceSetting" && args.setting === "flashlight") {
        detectedAction = {
          type: "phone_setting_toggle",
          title: "Flashlight",
          data: { setting: "flashlight", state: args.state },
          status: "executed",
        };
        textResponse = args.state ? "ٹارچ آن کر دی گئی ہے۔" : "ٹارچ بند کر دی گئی ہے۔";
      } else if (call.name === "openApplication") {
        detectedAction = {
          type: "phone_app_launch",
          title: `Open ${args.appName}`,
          data: { appName: args.appName },
          status: "executed",
        };
        textResponse = `${args.appName} کھولی جا رہی ہے۔`;
      } else if (call.name === "searchYouTube") {
        detectedAction = {
          type: "youtube_search",
          title: `YouTube: ${args.query}`,
          data: { query: args.query },
          status: "executed",
        };
        textResponse = `یوٹیوب پر "${args.query}" تلاش کیا جا رہا ہے۔`;
      }
    }

    if (!textResponse) {
      textResponse = "جی بالکل! میں آپ کی بات سن رہا ہوں۔ آپ مزید کیا جاننا چاہتے ہیں؟";
    }

    res.json({
      reply: textResponse,
      action: detectedAction,
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);

    // DYNAMIC FALLBACK (No more repeating lines!)
    res.json({
      reply: `میں نے آپ کی بات ("${userMessage}") سن لی ہے، لیکن اس وقت سرور کا AI سے رابطہ منقطع ہے۔ براہ کرم انٹرنیٹ یا API کی چیک کریں۔`,
      action: null,
    });
  }
});

// Start Server / Vite Middleware
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nova AI Server running on port ${PORT}`);
  });
}

startServer();
