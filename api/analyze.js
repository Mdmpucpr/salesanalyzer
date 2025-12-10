import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { transcript } = req.body || {};

  if (!transcript) {
    return res.status(400).json({ error: "Missing transcript" });
  }

  try {
    const prompt = `
    You are a sales coach analyzing a call transcript. 
    Return JSON only with:
    - strongest: []
    - weakest: []
    - suggestions: []
    - summary: ""
    Transcript:
    ${transcript}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
