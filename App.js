import { useState, useRef, useEffect } from "react";

// ============================================================
// HIKIMA AI — Created by Haruna
// ============================================================

const SYSTEM_PROMPT = `You are Hikima, a highly intelligent, versatile, and helpful AI assistant created by Haruna. Your primary mission is to provide accurate, insightful, and comprehensive answers to any question across all domains, including software engineering (Python, C++, JavaScript, Solidity), digital agriculture, science, business, and everyday life. You are empathetic, concise, and highly analytical. You can converse fluently in both English and Hausa. Always adapt your tone to the user's needs—be highly technical when discussing code, and simple when explaining general concepts. Never claim to be human, but always maintain a friendly, encouraging, and collaborative demeanor.

When writing code, always format it inside markdown code blocks with the language specified.
When responding in Hausa, maintain natural Hausa grammar and tone.`;

const SUGGESTIONS = [
  { icon: "🐍", text: "Write a Python script to read sensor data from Arduino" },
  { icon: "🌾", text: "How to start a smart digital farming business?" },
  { icon: "💬", text: "Bayyana AI da Hausa ta sauƙi" },
  { icon: "⛓️", text: "Explain Solidity smart contracts for beginners" },
];

// ── API Call ──────────────────────────────────────────────────
async function callHikima(messages) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-calls": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.map((b) => b.text || "").join("") || "";
}

// ── Typing Dots ───────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#4ade80", display: "inline-block",
            animation: `bounce 1.2s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Code Block ────────────────────────────────────────────────
function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{
      background: "#0d1117", border: "1px solid #30363d",
      borderRadius: 10, margin: "10px 0", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 14px", background: "#161b22", borderBottom: "1px solid #30363d",
      }}>
        <span style={{ fontSize: 12, color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>
          {lang || "code"}
        </span>
        <button onClick={copy} style={{
          background: "none", border: "1px solid #30363d", color: "#8b949e",
          borderRadius: 6, padding: "2px 10px", fontSize: 11, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre style={{
        padding: "14px 16px", overflowX: "auto", margin: 0,
        fontSize: 13, lineHeight: 1.6, color: "#e6edf3",
        fontFamily: "'Space Mono', monospace",
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Message Renderer ──────────────────────────────────────────
function MessageContent({ content }) {
  // Parse markdown-style code blocks
  const parts = [];
  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1], content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  return (
    <div>
      {parts.map((p, i) =>
        p.type === "code" ? (
          <CodeBlock key={i} code={p.content} lang={p.lang} />
        ) : (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>{p.content}</span>
        )
      )}
    </div>
  );
}

// ── Single Message ────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 20, gap: 10, alignItems: "flex-end",
      animation: "fadeInUp 0.3s ease",
    }}>
      {!isUser && (
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #166534 0%, #15803d 60%, #4ade80 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, animation: "pulse-glow 3s ease-in-out infinite",
          boxShadow: "0 0 12px #4ade8044",
        }}>🌿</div>
      )}
      <div style={{
        maxWidth: "72%", padding: "13px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #14532d 0%, #166534 100%)"
          : "rgba(255,255,255,0.05)",
        border: isUser ? "1px solid #4ade8044" : "1px solid rgba(255,255,255,0.09)",
        color: isUser ? "#d1fae5" : "#e5e7eb",
        fontSize: 14.5, lineHeight: 1.7,
        fontFamily: "'Source Serif 4', Georgia, serif",
        boxShadow: isUser ? "0 2px 16px #4ade8022" : "0 2px 12px rgba(0,0,0,0.25)",
        wordBreak: "break-word",
      }}>
        {msg.typing ? <TypingDots /> : <MessageContent content={msg.content} />}
      </div>
      {isUser && (
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>👤</div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Sannu da zuwa! Ni ne Hikima, mataimakin AI ɗin da Haruna ya ƙirƙira. Zan iya taimaka maka da coding (Python, JavaScript, Solidity), noma na zamani, kimiyya, kasuwanci, da sauran abubuwa — a Turanci ko Hausa.\n\nMe kake so mu yi yau? 🌿",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "", typing: true }]);

    try {
      const reply = await callHikima(newMessages);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError("⚠️ Hikima ta samu matsala: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat ya farfado! Yau me kake son mu tattauna? 🌿",
    }]);
    setError("");
  };

  const showSuggestions = messages.length === 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #030712 0%, #0a1628 45%, #071910 100%)",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
    }}>
      {/* Ambient background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-15%", left: "-10%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, #14532d33 0%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, #05291433 0%, transparent 70%)",
          filter: "blur(100px)",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "50%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, #0c4a6e22 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: "translateX(-50%)",
        }} />
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(3,7,18,0.88)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(74,222,128,0.1)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "linear-gradient(135deg, #14532d, #4ade80)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, animation: "pulse-glow 3s ease-in-out infinite",
          }}>🌿</div>
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontWeight: 700,
              fontSize: 21, color: "#4ade80", letterSpacing: "0.05em",
              background: "linear-gradient(90deg, #4ade80, #86efac, #4ade80)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
            }}>HIKIMA</div>
            <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em" }}>
              by Haruna · AI Assistant
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#4ade80",
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 20, padding: "5px 12px",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#4ade80", display: "inline-block",
            }} />
            Online
          </div>
          <button onClick={clearChat} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#9ca3af", borderRadius: 8,
            padding: "6px 14px", fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
          }}
            onMouseEnter={(e) => { e.target.style.color = "#fff"; e.target.style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={(e) => { e.target.style.color = "#9ca3af"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            Clear Chat
          </button>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <main style={{
        flex: 1, overflowY: "auto", padding: "28px 16px",
        zIndex: 1, position: "relative",
        maxWidth: 800, width: "100%", margin: "0 auto",
      }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}

        {/* Suggestion chips */}
        {showSuggestions && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 10, marginTop: 20,
            animation: "fadeInUp 0.5s ease 0.2s both",
          }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s.text)} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(74,222,128,0.15)",
                borderRadius: 12, padding: "12px 16px",
                color: "#9ca3af", fontSize: 13, cursor: "pointer",
                textAlign: "left", lineHeight: 1.5, transition: "all 0.2s",
                fontFamily: "'Source Serif 4', Georgia, serif",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(74,222,128,0.08)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.35)";
                  e.currentTarget.style.color = "#d1fae5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.15)";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10, padding: "12px 16px", color: "#fca5a5",
            fontSize: 13, margin: "8px 0", fontFamily: "'DM Sans', sans-serif",
          }}>{error}</div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* ── INPUT AREA ── */}
      <footer style={{
        position: "sticky", bottom: 0, zIndex: 10,
        background: "rgba(3,7,18,0.92)", backdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(74,222,128,0.1)", padding: "16px",
      }}>
        <div style={{
          maxWidth: 800, margin: "0 auto",
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(74,222,128,0.22)",
          borderRadius: 16, padding: "10px 14px",
        }}>
          <textarea
            ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Tambayi Hikima komai… (English ko Hausa)"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", resize: "none",
              color: "#f3f4f6", fontSize: 14.5, fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6, maxHeight: 140, overflowY: "auto", paddingTop: 2,
              outline: "none",
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 42, height: 42, borderRadius: 12, border: "none",
              background: loading || !input.trim()
                ? "rgba(74,222,128,0.12)"
                : "linear-gradient(135deg, #15803d, #4ade80)",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, transition: "all 0.2s", flexShrink: 0,
              boxShadow: loading || !input.trim() ? "none" : "0 2px 18px #4ade8055",
              color: "#fff",
            }}
          >
            {loading ? "⏳" : "↑"}
          </button>
        </div>
        <div style={{
          textAlign: "center", fontSize: 11, color: "#374151",
          marginTop: 8, fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em",
        }}>
          HIKIMA AI · Created by Haruna · Enter = Send · Shift+Enter = New Line
        </div>
      </footer>
    </div>
  );
}
