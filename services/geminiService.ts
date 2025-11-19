import { GoogleGenAI } from "@google/genai";
import { Lead, MessageType, UserConfig } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_ID = "gemini-flash-latest";

export const optimizeServiceDescription = async (rawServices: string): Promise<string> => {
  try {
    if (!rawServices.trim()) return "";
    
    const prompt = `You are an expert copywriter. 
    Rewrite the following service description to be more professional, concise, and compelling for B2B cold outreach. 
    Keep it under 2 sentences.
    
    Input: "${rawServices}"
    
    Output only the rewritten text.`;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
    });

    return response.text?.trim() || rawServices;
  } catch (error) {
    console.error("Error optimizing services:", error);
    return rawServices;
  }
};

export const generateOutreachMessage = async (
  lead: Lead, 
  type: MessageType, 
  userConfig?: UserConfig
): Promise<{ subject?: string; body: string }> => {
  try {
    let prompt = "";
    
    // Construct sender context
    const orgName = userConfig?.orgName || "our agency";
    const services = userConfig?.services || "premium services";
    
    // Lead context
    const leadContext = `Recipient Business: ${lead.business_name}. Industry: ${lead.industry}. City: ${lead.city}.`;
    const senderContext = `Sender Organization: ${orgName}. Services: ${services}.`;

    switch (type) {
      case MessageType.SMS:
        prompt = `
        Act as a top-tier B2B sales copywriter.
        Write a single cold SMS message to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. STRICTLY under 160 characters.
        2. No "Hi" or "Hello". Jump straight into the hook.
        3. Use a specific "hook" related to their industry (${lead.industry}).
        4. Briefly mention the value prop of ${services}.
        5. End with a quick, low-friction question (e.g., "Open to a chat?").
        6. Tone: Casual, direct, professional.
        
        Output only the message text.
        `;
        break;

      case MessageType.WHATSAPP:
        prompt = `
        Act as a B2B growth expert.
        Write a WhatsApp message to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. Short and conversational (max 3 sentences).
        2. Start with a personalized hook (e.g., "Saw your gym in Surat...").
        3. Mention how ${orgName} can help with ${services}.
        4. Use exactly 1 emoji to keep it friendly but not childish.
        5. End with a soft Call to Action.
        
        Output only the message text.
        `;
        break;

      case MessageType.EMAIL:
        prompt = `
        Act as a cold email specialist.
        Write a high-converting cold email to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. Subject Line: Max 5 words, all lowercase, intriguing (e.g., "question about ${lead.business_name}").
        2. Body: 
           - Max 75 words. 
           - Structure: Hook (observation about their industry) -> Bridge (how ${services} helps) -> Ask (soft CTA).
           - Tone: Helpful, not salesy.
        
        Output Format: JSON object with keys "subject" and "body". Body must be plain text.
        `;
        break;
    }

    if (type === MessageType.EMAIL) {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const jsonText = response.text;
      if (!jsonText) throw new Error("No response from AI");
      return JSON.parse(jsonText);
    } else {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
      });
      return { body: response.text?.trim() || "" };
    }

  } catch (error) {
    console.error("Error generating message:", error);
    return { body: "Could not generate message. Please try again." };
  }
};