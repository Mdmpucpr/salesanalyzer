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

    const apiUrl = "https://api.generativeai.google/v1beta2/models/gemini-3-large:generateText";

    const body = {
      prompt: `
Analyze the following sales call transcript and provide:

1. Strongest moments (what the rep did well)
2. Points that could be improved (constructive feedback only)
3. Opportunities the rep may have missed
4. Trends or patterns worth noting
5. A success score from 1–10

Transcript:
${transcript}
      `,
      temperature: 0.7,
      maxOutputTokens: 500
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Log the HTTP status if it’s not OK
    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API returned error:", errText);
      return res.status(500).json({ result: `Gemini API error: ${errText}` });
    }

    const data = await response.json();
    console.log("RAW GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    const finalText = data?.candidates?.[0]?.content || "No text returned from Gemini.";

    return res.status(200).json({ result: finalText });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ result: `Server Error: ${err.message || "Unknown error"}` });
  }
}
