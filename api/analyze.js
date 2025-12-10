export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed." });
    }

    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript missing." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `
Analyze the following sales call transcript and provide:

1. Strongest moments (what the rep did well)
2. Points that could be improved (constructive feedback only)
3. Opportunities the rep may have missed
4. Trends or patterns worth noting
5. A success score from 1–10

Transcript:
${transcript}
        `
      })
    });

    const data = await response.json();

    console.log("RAW OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    let finalText = "";

    // Responses API extraction
    if (data.output?.[0]?.content?.[0]?.text) {
      finalText = data.output[0].content[0].text;
    } else if (data.output_text) {
      finalText = data.output_text;
    } else if (data.choices?.[0]?.text) {
      finalText = data.choices[0].text;
    } else {
      finalText = JSON.stringify(data, null, 2);
    }

    if (typeof finalText !== "string") {
      finalText = JSON.stringify(finalText);
    }

    return res.status(200).json({ result: finalText });

  } catch (err) {
    console.error("Server error:", err);

    return res.status(500).json({
      result: `Server Error: ${err.message || "Unknown error"}`
    });
  }
}
