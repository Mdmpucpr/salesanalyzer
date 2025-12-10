import { useState } from "react";

function App() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  async function analyze() {
    setLoading(true);
    setOutput(null);

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      // If backend responds with non-JSON (like 404 HTML), catch it
      const text = await resp.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        setOutput("Error: Server returned non-JSON response.");
        setLoading(false);
        return;
      }

      setOutput(data.result || data.error || "No output.");
    } catch (err) {
      setOutput("Network error. API unreachable.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h1>Sales Analyzer</h1>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste your call transcript here..."
        style={{ width: "100%", height: "220px", padding: "10px", fontSize: "16px" }}
      />

      <button
        onClick={analyze}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        {loading ? "Analyzing..." : "Analyze Call"}
      </button>

      {output && (
        <pre style={{ marginTop: "30px", background: "#eee", padding: "20px" }}>
          {output}
        </pre>
      )}
    </div>
  );
}

export default App;
