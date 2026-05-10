
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MessageRole, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponseStream = async (
  messages: ChatMessage[],
  onChunk: (text: string) => void
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Prepare history for Gemini
  // The first few messages are converted to the standard format
  const history = messages.map(m => ({
    role: m.role === MessageRole.USER ? 'user' : 'model',
    parts: m.parts.map(p => {
      if (p.text) return { text: p.text };
      if (p.inlineData) return { inlineData: p.inlineData };
      return { text: "" };
    })
  }));

  const lastMessage = history.pop();
  
  try {
    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [...history, lastMessage!],
      config: {
        systemInstruction: "You are KNChat AI, a helpful, friendly, and highly intelligent companion. You speak in a modern, professional, yet warm tone. If asked, your name is KNChat Assistant. You can help with coding, creative writing, analysis, and general conversation. If the user provides images, describe them or answer questions about them accurately.",
        temperature: 0.7,
        topP: 0.95,
      }
    });

    let fullText = "";
    for await (const chunk of streamResponse) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
    return fullText;
  } catch (error) {
    console.error("Gemini stream error:", error);
    throw error;
  }
};
