import React, { useState } from "react";
import "./App.css"; 

// Helper component for the content area (Transcript Analyzer)
const TranscriptAnalyzer = ({ transcript, setTranscript, analyze, loading, output }) => (
    <div className="transcript-container">
        <div className="transcript-header">Analyze New Call Transcript</div>
        
        {/* Text Area for Transcript Input */}
        <textarea
            className="transcript-text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your call transcript here..."
        />

        {/* Analyze Button */}
        <div className="analyze-button-group">
            <button
                className="btn-primary"
                onClick={analyze}
                disabled={loading}
            >
                {loading ? "Analyzing..." : "Analyze Call"}
            </button>
        </div>

        {/* Output/Error Display */}
        {output && (
            <div className="error-message-box" style={{ 
                backgroundColor: output.startsWith('Error') || output.startsWith('Gemini API error') 
                    ? '#f8d7da' 
                    : '#e9f7ef',
                color: output.startsWith('Error') || output.startsWith('Gemini API error') 
                    ? 'var(--color-failure)' 
                    : 'var(--color-text-dark)',
            }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {output}
                </pre>
            </div>
        )}
    </div>
);


// Placeholder component for the main application content
const DashboardContent = () => {
    return (
        <div className="content-area">
            <h1 className="dashboard-title">Welcome to Your Sales Dashboard</h1>
            <p className="dashboard-subtitle">Track your performance, analyze patterns, and continuously improve your sales skills.</p>

            {/* Data Cards Grid with ZEROED DATA */}
            <div className="data-cards-grid">
                <div className="card">
                    <div className="card-label">Total Calls</div>
                    <div className="card-value">0</div>
                    <div className="card-subtext">Uploaded</div>
                </div>
                <div className="card">
                    <div className="card-label">Success Rate</div>
                    <div className="card-value" style={{color: 'var(--color-text-dark)'}}>0%</div>
                    <div className="card-subtext">0 of 0 closed</div>
                </div>
                <div className="card">
                    <div className="card-label">Closed Deals</div>
                    <div className="card-value">0</div>
                    <div className="card-subtext">Successful</div>
                </div>
                <div className="card">
                    <div className="card-label">Conversion Potential</div>
                    <div className="card-value">0</div>
                    <div className="card-subtext">Estimated wins per 100 calls</div>
                </div>
            </div>
        </div>
    );
};


// Main App Component
function App() {
    const [activeTab, setActiveTab] = useState('Calls'); 
    
    // State for the API functionality
    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState(null);

    // Existing API analysis function (omitted for brevity, assume it's the same)
    async function analyze() {
        setLoading(true);
        setOutput(null);

        try {
            const resp = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript }),
            });

            const text = await resp.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch {
                setOutput(`Error: Server returned non-JSON response. (Status: ${resp.status})`);
                setLoading(false);
                return;
            }
            
            setOutput(data.result || data.error || "No output.");

        } catch (err) {
            setOutput("Network error. API unreachable.");
        }

        setLoading(false);
    }

    // Function to render content based on the active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return <DashboardContent />;
            case 'Calls':
                return (
                    <>
                        <h1 className="dashboard-title">Call Library</h1>
                        <p className="dashboard-subtitle">View and analyze all your uploaded call transcripts.</p>
                        
                        {/* Generic Placeholder for Empty Call List */}
                        <div className="card" style={{marginBottom: '20px', padding: '15px', textAlign: 'center'}}>
                            <p style={{fontSize: '14px', color: 'var(--color-text-muted)'}}>No calls uploaded yet. Use the "Send Transcript" button to analyze your first call.</p>
                        </div>
                        
                        <TranscriptAnalyzer 
                            transcript={transcript}
                            setTranscript={setTranscript}
                            analyze={analyze}
                            loading={loading}
                            output={output}
                        />
                    </>
                );
            case 'Analytics':
                return (
                    <>
                        <h1 className="dashboard-title">Detailed Analytics</h1>
                        <p className="dashboard-subtitle">Deep insights into your sales performance, patterns, and trends.</p>
                        <DashboardContent />
                    </>
                );
            case 'Upload':
                return <h1 className="dashboard-title">Upload New Data</h1>;
            default:
                return <DashboardContent />;
        }
    }


    return (
        <>
            {/* 1. NAVIGATION BAR STRUCTURE */}
            <header className="navbar">
                {/* Use navbar-inner to spread content and control padding */}
                <div className="navbar-inner"> 
                    <div className="logo-section">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-6h2v6zm0-8h-2V7h2v1z" fill="currentColor"/>
                        </svg>
                        <span className="logo-text">Sales Analyzer</span>
                    </div>

                    <nav className="nav-links">
                        {['Dashboard', 'Calls', 'Analytics', 'Upload'].map(tab => (
                            <a
                                key={tab}
                                href="#"
                                className={activeTab === tab ? 'active' : ''}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(tab);
                                }}
                            >
                                {tab}
                            </a>
                        ))}
                    </nav>
                    
                    <div className="user-section">
                        <button className="btn-primary">Send Transcript</button>
                        <div className="user-avatar">J</div>
                    </div>
                </div>
            </header>

            {/* 2. MAIN APPLICATION CONTENT AREA */}
            <div className="app-container">
                {renderContent()} 
            </div>
        </>
    );
}

export default App;