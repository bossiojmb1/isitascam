import { useState } from "react";
import "./App.css";

type Verdict = "likely_scam" | "maybe_scam" | "likely_safe" | null;

interface AnalysisReason {
  id: string;
  label: string;
  weight: number;
}

function App() {
  const [message, setMessage] = useState("");
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [reasons, setReasons] = useState<AnalysisReason[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setError(null);
    setAiSummary(null);
    const trimmed = message.trim();
    if (!trimmed) {
      setVerdict(null);
      setReasons([]);
      setError("Paste a message or email to analyse.");
      return;
    }

    setIsChecking(true);
    try {
      const { verdict: localVerdict, reasons: localReasons } = analyseMessage(trimmed);
      setVerdict(localVerdict);
      setReasons(localReasons);

      if (useAi) {
        try {
          const res = await fetch("http://localhost:4000/api/check-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: trimmed })
          });
          if (!res.ok) {
            throw new Error(`Server error: ${res.status}`);
          }
          const data = (await res.json()) as { summary: string };
          setAiSummary(data.summary);
        } catch (e) {
          setError(
            "Rule-based check completed. AI check is unavailable (server not running or API key not set)."
          );
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const verdictLabel =
    verdict === "likely_scam"
      ? "Likely scam"
      : verdict === "maybe_scam"
      ? "Possibly a scam"
      : verdict === "likely_safe"
      ? "Probably safe, but stay cautious"
      : "No verdict yet";

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="title">IsItAScam</h1>
        <p className="subtitle">
          Paste a message or email and get an instant safety check. This tool cannot guarantee
          safety, but it can highlight red flags.
        </p>
      </header>

      <main className="layout">
        <section className="panel main-panel">
          <label className="field-label" htmlFor="message">
            Message or email text
          </label>
          <textarea
            id="message"
            className="message-input"
            placeholder="Paste the full message here, including any links or instructions you received."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
          />

          <div className="options-row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
              />
              <span>Also ask AI (requires local server + OpenAI key, optional)</span>
            </label>

            <button
              type="button"
              className="primary-button"
              onClick={handleCheck}
              disabled={isChecking}
            >
              {isChecking ? "Checking..." : "Check message"}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}
        </section>

        <aside className="panel results-panel">
          <h2 className="panel-title">Result</h2>
          <p className={`verdict verdict--${verdict ?? "none"}`}>{verdictLabel}</p>

          {reasons.length > 0 && (
            <div className="reasons">
              <h3>Why this verdict?</h3>
              <ul>
                {reasons.map((r) => (
                  <li key={r.id}>{r.label}</li>
                ))}
              </ul>
            </div>
          )}

          {aiSummary && (
            <div className="ai-summary">
              <h3>AI opinion</h3>
              <p>{aiSummary}</p>
            </div>
          )}

          <div className="disclaimer">
            <strong>Important:</strong> This tool cannot guarantee something is safe. If money,
            passwords, or personal info are involved, double-check with someone you trust.
          </div>
        </aside>
      </main>
    </div>
  );
}

function analyseMessage(text: string): { verdict: Verdict; reasons: AnalysisReason[] } {
  const lowered = text.toLowerCase();
  const reasons: AnalysisReason[] = [];

  const addReason = (id: string, label: string, weight: number) => {
    reasons.push({ id, label, weight });
  };

  // Strong scam indicators
  if (/\bgift\s*cards?\b/.test(lowered)) {
    addReason("gift_cards", "Asks you to pay with gift cards, which is a very common scam method.", 3);
  }
  if (/(bitcoin|crypto|cryptocurrency)/.test(lowered)) {
    addReason(
      "crypto",
      "Asks for cryptocurrency payments, which are hard to trace or reverse.",
      2
    );
  }
  if (/(wire transfer|western union|moneygram)/.test(lowered)) {
    addReason(
      "wire_transfer",
      "Requests wire transfers or similar payment methods that offer little protection.",
      2
    );
  }
  if (/(ssn|social security number|passport number|bank account)/.test(lowered)) {
    addReason(
      "sensitive_info",
      "Asks for highly sensitive personal information (e.g. SSN, passport, bank account).",
      3
    );
  }

  // Pressure and urgency
  if (/(act now|urgent|immediately|right away|today only)/.test(lowered)) {
    addReason(
      "urgency",
      "Uses urgent language to pressure you into acting quickly without thinking.",
      2
    );
  }
  if (/(do not tell anyone|keep this secret|confidential)/.test(lowered)) {
    addReason(
      "secrecy",
      "Tells you to keep things secret from others, which scammers often do.",
      2
    );
  }

  // Too-good-to-be-true offers
  if (/(you (have)? won|winner|congratulations|prize|lottery)/.test(lowered)) {
    addReason(
      "prize",
      "Claims you won a prize or lottery, which is a very common scam hook.",
      2
    );
  }
  if (/(guaranteed returns?|risk[- ]free|no risk)/.test(lowered)) {
    addReason(
      "guarantees",
      "Promises guaranteed or risk-free returns, which is unrealistic and often a scam sign.",
      2
    );
  }

  // Impersonation
  if (/(irs|revenue service|tax office|police|fbi|bank)/.test(lowered)) {
    addReason(
      "authority",
      "Claims to be from a government agency, police, or bank. Scammers often impersonate authorities.",
      2
    );
  }
  if (/(verify your account|click the link below to login|reset your password)/.test(lowered)) {
    addReason(
      "account_verify",
      "Asks you to verify or log in through a link, which may be a phishing attempt.",
      2
    );
  }

  // Language quality
  const hasManyTypos = /([a-z]{3,}\s){6,}/.test(lowered) && /[^a-z0-9\s.,'!?$]/i.test(text);
  if (hasManyTypos) {
    addReason(
      "language",
      "Contains many typos or unusual wording, which is common in scam messages.",
      1
    );
  }

  const totalWeight = reasons.reduce((sum, r) => sum + r.weight, 0);

  let verdict: Verdict = null;
  if (totalWeight >= 6) {
    verdict = "likely_scam";
  } else if (totalWeight >= 3) {
    verdict = "maybe_scam";
  } else if (totalWeight > 0) {
    verdict = "likely_safe";
  } else {
    verdict = "likely_safe";
  }

  return { verdict, reasons };
}

export default App;

