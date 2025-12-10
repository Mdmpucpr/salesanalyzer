export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed." });
    }

    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript missing." });
    }

    if (!process.env.GEMINI_KEY) {
      return res.status(500).json({ error: "GEMINI_KEY not found in environment." });
    }

    // FIX APPLIED HERE:
    // The correct hostname for the Google Generative AI API is 'generativeai.googleapis.com'.
    // The old URL 'https://api.generativeai.google/...' caused the ENOTFOUND error.
    const apiUrl = "https://generativeai.googleapis.com/v1beta/models/gemini-3-large:generateContent";

    // NOTE: The endpoint for Gemini has been standardized to use ':generateContent', 
    // and the authorization method has been changed from 'Bearer' to an API key parameter.
    // However, since your current code seems to be based on an older/different service
    // or a proxy, let's prioritize the hostname fix first.
    // For the official Google Gen AI SDK, this fetch logic would be different.
    
    const body = {
      // The Gemini API usually expects 'contents' instead of 'prompt', but
      // we'll stick to 'prompt' if you are using a proxy or custom setup.
      // A safer, more standard prompt structure for a clean API call is:
      contents: [{ role: "user", parts: [{ text: `
Analyze the following sales call transcript and provide:

1. Strongest moments (what the rep did well)
2. Points that could be improved (constructive feedback only)
3. Opportunities the rep may have missed
4. Trends or patterns worth noting
5. A success score from 1–10

Transcript:
${transcript}
      `}]}],
      // The API uses max_output_tokens, not maxOutputTokens
      config: {
          temperature: 0.7,
          maxOutputTokens: 500, // Sticking to your original for now
      }
    };
    
    // ----------------------------------------------------------------------
    // IMPORTANT: The standard way to call the Gemini API is with an API Key 
    // as a query parameter, not an Authorization header.
    // ----------------------------------------------------------------------
    const finalUrl = `${apiUrl}?key=${process.env.GEMINI_KEY}`;

    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The Authorization header is now removed.
      },
      // Using the more standard 'contents' structure
      body: JSON.stringify(body),
    });

    // Log the HTTP status if it’s not OK
    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API returned error:", errText);
      // Include the error text in the response to the client for better debugging
      return res.status(500).json({ result: `Gemini API error: ${errText}` });
    }

    const data = await response.json();
    console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    // The response structure for the standard API is different (e.g., 'candidates[0].content.parts[0].text')
    // We'll try to find the text in the response:
    const finalText = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.text || "No text returned from Gemini.";

    return res.status(200).json({ result: finalText });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ result: `Server Error: ${err.message || "Unknown error"}` });
  }
}