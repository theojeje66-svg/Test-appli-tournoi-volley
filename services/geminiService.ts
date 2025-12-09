import { GoogleGenAI, Type } from "@google/genai";
import { Match } from "../types";

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Chat with the Volleyball Rule Assistant
 */
export const askVolleyballAssistant = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: "Tu es un arbitre international de la FIVB et un expert en coaching de volley-ball. Tes réponses doivent être précises, faire référence aux règles officielles quand c'est nécessaire, mais rester accessibles. Tu es poli, encourageant et concis. Si on te demande de l'aide pour l'organisation, donne des conseils pratiques.",
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Désolé, je n'ai pas pu traiter votre demande.";
  } catch (error) {
    console.error("Erreur Chat:", error);
    return "Une erreur est survenue lors de la communication avec l'assistant.";
  }
};