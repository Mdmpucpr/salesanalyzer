export default async function handler(req, res) {
  try {
    // 1. Method Check
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed." });
    }

    // 2. Input Validation
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: "Transcript missing." });
    }

    // 3. Environment Variable Check
    if (!process.env.GEMINI_KEY) {
      return res.status(500).json({ error: "GEMINI_KEY not found in environment." });
    }

    // 4. Correct API Configuration
    // ----------------------------------------------------------------------
    // *** CRITICAL FIX: Reverting model to the working V1 model ***
    const modelName = "gemini-2.5-flash"; // This model is supported on the V1 Beta endpoint
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    const finalUrl = `${baseUrl}?key=${process.env.GEMINI_KEY}`;
    // ----------------------------------------------------------------------

    // 5. Standard Gemini Request Body
    const body = {
      contents: [{
        role: "user",
        parts: [{
          text: `
Analyze the following sales call transcript and provide:

1. Strongest moments (what the rep did well)
2. Points that could be improved (constructive feedback only)
3. Opportunities the rep may have missed
4. Trends or patterns worth noting
5. A success score from 1–10

Transcript:
${transcript}
          `
        }]
      }],
      
      // Parameters must be inside 'generationConfig'
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    // 6. Send Request
    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // 7. Error Handling (Check for 4xx/5xx from Gemini API)
    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API returned error:", errText);
      return res.status(500).json({ result: `Gemini API error: ${errText}` });
    }

    // 8. Success Response Parsing
    const data = await response.json();
    console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    // The text is correctly nested in the standard response structure: 
    // candidates[0].content.parts[0].text
    const finalText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned from Gemini.";

    return res.status(200).json({ result: finalText });

  } catch (err) {
    // 9. Catch any unexpected server errors (e.g., local network failure)
    console.error("Server error:", err);
    return res.status(500).json({ result: `Server Error: ${err.message || "Unknown error"}` });
  }
}