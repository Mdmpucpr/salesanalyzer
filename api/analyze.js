export default async function handler(req, res) {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript missing." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a sales call analysis assistant.",
          },
          {
            role: "user",
            content: `
Analyze the following sales call transcript and provide:

1. Strongest moments (what the rep did well)
2. Points that could be improved 
3. Opportunities the rep may have missed
4. Trends or patterns worth noting
5. A success score from 1–10

Transcript:
${transcript}
`
          }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({ analysis: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error." });
  }
}
