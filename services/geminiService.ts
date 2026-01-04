import { GoogleGenAI } from "@google/genai";

export const getStyleAdvice = async (query: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check configuration.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: `You are the Master Tailor and Stylist at 'Majeed Elite Tailor'. 
        You give sophisticated, practical advice on men's fashion, fabric choices, and color coordination.
        Keep answers concise (under 100 words), polite, and professional. 
        Always end by suggesting they book an appointment for a personalized consultation.`,
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, I am currently stitching another thought. Please ask again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Our style consultant is currently unavailable. Please try again later.";
  }
};