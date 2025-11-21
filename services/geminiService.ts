import { GoogleGenAI } from "@google/genai";
import { Lead, MessageType, UserConfig } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_ID = "gemini-flash-latest";

export const optimizeServiceDescription = async (rawServices: string): Promise<string> => {
  try {
    if (!rawServices.trim()) return "";

    const prompt = `You are an expert copywriter for creative freelancers. 
    Rewrite the following video editing service description to be punchy, high-value, and attractive to business owners.
    Focus on "retention", "growth", and "quality".
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
    const orgName = userConfig?.orgName || "my video editing business";
    const services = userConfig?.services || "high-retention video editing";

    // Lead context
    const leadContext = `Recipient Business: ${lead.business_name}. Industry: ${lead.industry}. City: ${lead.city}.`;
    const senderContext = `Sender: Solo Video Editor (Name: ${orgName}). Services: ${services}.`;

    switch (type) {
      case MessageType.SMS:
        prompt = `
        Act as a professional solo video editor looking for clients.
        Write a single cold SMS message to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. STRICTLY under 160 characters.
        2. No "Hi" or "Hello". Jump straight into the hook.
        3. Hook: Mention their industry (${lead.industry}) and the need for better video content.
        4. Value: Mention "high-retention editing" or "viral shorts".
        5. End with a low-friction question (e.g., "Need help with reels?").
        6. Tone: Creative, energetic, direct.
        
        Output only the message text.
        `;
        break;

      case MessageType.WHATSAPP:
        prompt = `
        Act as a creative video editor.
        Write a WhatsApp message to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. Short and conversational (max 3 sentences).
        2. Start with a personalized hook (e.g., "Checked out your ${lead.industry} content...").
        3. Mention you are a *solo* editor (personal attention, better rates) offering ${services}.
        4. Use exactly 1 emoji (🎥, 🎬, or ✨).
        5. End with a soft Call to Action (e.g., "Can I send my portfolio?").
        
        Output only the message text.
        `;
        break;

      case MessageType.INSTAGRAM:
        prompt = `
        Act as a social media savvy video editor.
        Write a Direct Message (DM) for Instagram to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. Casual, friendly, "slide into DMs" vibe.
        2. Hook: SPECIFICALLY mention their niche/industry (${lead.industry}) and a common pain point or trend in that niche (e.g., if Real Estate, mention "property tours"; if Gym, mention "workout montages").
        3. Value: "I could make your Reels pop even more" or "Help you reach more ${lead.industry} clients".
        4. Mention you are a solo editor.
        5. End with a low-pressure question.
        6. Max 280 characters.
        7. NO hashtags. NO "Subject:". Just the message body.
        
        Output only the message text.
        `;
        break;

      case MessageType.EMAIL:
        prompt = `
        Act as a freelance video editor.
        Write a cold email to ${lead.business_name}.
        
        ${senderContext}
        ${leadContext}
        
        Constraints:
        1. Subject Line: Max 5 words, lowercase, relevant (e.g., "video editor for ${lead.business_name}", "content idea").
        2. Body: 
           - Max 75 words. 
           - Hook: Compliment their current work but suggest an improvement or opportunity (Reels/TikToks).
           - Bridge: How your editing saves time and increases engagement. Mention you are a solo pro.
           - Ask: "Open to seeing some samples?"
           - Tone: Authentic, not "agency-like".
        
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