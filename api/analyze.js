export default async function handler(req, res) {
  try {
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
        `,
      }),
    });

    const data = await response.json();

    // 🔥 Log the full raw response for debugging
    console.log("FULL OPENAI RAW RESPONSE:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("OpenAI error:", data.error);
      return res.status(500).json({ error: data.error });
    }

    // 🔥 Extract text safely (covers every response shape)
    let outputText = "";

    try {
      outputText =
        data.output?.[0]?.content?.[0]?.text ??
        data.output_text ??
        data.choices?.[0]?.text ??
        JSON.stringify(data);
    } catch (err) {
      console.error("Failed extracting output text:", err);
      outputText = "No valid text returned from OpenAI.";
    }

    // 🔥 Log final text you will return
    console.log("FINAL OUTPUT TEXT:", outputText);

    res.status(200).json({ analysis: outputText });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
