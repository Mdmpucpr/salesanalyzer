import { GoogleGenAI } from "@google/genai";

// Main handler function for the API route
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed." });
    }

    try {
        const { transcript } = req.body;
        if (!transcript) {
            return res.status(400).json({ error: "Transcript missing." });
        }

        const apiKey = process.env.GEMINI_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_KEY not found in environment." });
        }

        // 1. Initialize the SDK
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
            Analyze the following sales call transcript and provide:

            1. Strongest moments (what the rep did well)
            2. Points that could be improved (constructive feedback only)
            3. Opportunities the rep may have missed
            4. Trends or patterns worth noting
            5. A success score from 1–10

            Transcript:
            ${transcript}
        `;

        // 2. Use the correct model name with the SDK
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash", // <-- Using the latest working model name
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });

        // The SDK response structure is cleaner
        const finalText = response.text || "No text returned from Gemini.";

        return res.status(200).json({ result: finalText });

    } catch (error) {
        console.error("Gemini API error:", error);
        
        let errorMessage = "An unknown server error occurred.";
        
        // The SDK often wraps API errors nicely
        if (error.status && error.statusText) {
             errorMessage = `Gemini API Error: ${error.statusText}`;
        } else if (error.message) {
            errorMessage = `SDK Error: ${error.message}`;
        }

        return res.status(500).json({ result: errorMessage });
    }
}