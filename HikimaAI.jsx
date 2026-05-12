import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are Hikima, a highly intelligent, versatile, and helpful AI assistant created by Haruna. Your primary mission is to provide accurate, insightful, and comprehensive answers to any question across all domains, including software engineering (Python, C++, JavaScript, Solidity), digital agriculture, science, business, and everyday life. You are empathetic, concise, and highly analytical. You can converse fluently in both English and Hausa. Always adapt your tone to the user's needs—be highly technical when discussing code, and simple when explaining general concepts. Never claim to be human, but always maintain a friendly, encouraging, and collaborative demeanor.`;

const SUGGESTIONS = [
  "Write a Python script to read sensor data",
  "Explain machine learning in simple terms",
  "Taimaka ni da code a JavaScript",
  "How to start a digital farming business?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#4ade80",
            display: "inline-block",
            animation: `bounce 1.2s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 18,
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #166534 0%, #15803d 60%, #4ade80 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
            boxShadow: "0 0 12px #4ade8066",
          }}
        >
          🌿
        </div>
      )}
      <div
        style={{
          maxWidth: "70%",
          padding: "13px 18px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #14532d 0%, #166534 100%)"
            : "rgba(255,255,255,0.06)",
          border: isUser ? "1px solid #4ade8044" : "1px solid rgba(255,255,255,0.1)",
          color: isUser ? "#d1fae5" : "#e5e7eb",
          fontSize: 14.5,
          lineHeight: 1.65,
          fontFamily: "'Source Serif 4', Georgia, serif",
          boxShadow: isUser
            ? "0 2px 16px #4ade8022"
            : "0 2px 12px rgba(0,0,0,0.3)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.typing ? <TypingDots /> : msg.content}
      </div>
      {isUser && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          👤
        </div>
      )}
    </div>
  );
}

export default function HikimaApp() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Sannu! I'm Hikima, your intelligent AI assistant created by Haruna. I can help you with coding, agriculture, science, business, and much more — in English or Hausa. What would you like to explore today? 🌿",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    // Add typing indicator
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", typing: true },
    ]);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const reply =
        data.content?.map((b) => b.text || "").join("") || "No response.";

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError("Hikima encountered an error: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Sannu! I'm Hikima, your intelligent AI assistant created by Haruna. I can help you with coding, agriculture, science, business, and much more — in English or Hausa. What would you like to explore today? 🌿",
      },
    ]);
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #030712 0%, #0a1628 40%, #071910 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4ade8044; border-radius: 2px; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 24px #4ade8033; }
          50% { box-shadow: 0 0 48px #4ade8066; }
        }
        @keyframes grain {
          0%,100% { transform: translate(0,0); }
          25% { transform: translate(-1px,1px); }
          50% { transform: translate(1px,-1px); }
          75% { transform: translate(-1px,-1px); }
        }
        textarea:focus { outline: none; }
        textarea { resize: none; }
      `}</style>

      {/* Grain overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
          zIndex: 0,
          animation: "grain 0.5s steps(1) infinite",
        }}
      />

      {/* Ambient blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, #14532d44 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, #052e1644 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(3,7,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(74,222,128,0.12)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #14532d, #4ade80)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          >
            🌿
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 20,
                color: "#4ade80",
                letterSpacing: "0.04em",
              }}
            >
              HIKIMA
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.08em" }}>
              by Haruna · AI Assistant
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#4ade80",
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: 20,
              padding: "4px 12px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
              }}
            />
            Online
          </span>
          <button
            onClick={clearChat}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#9ca3af",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#fff")}
            onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
          >
            Clear
          </button>
        </div>
      </header>

      {/* Messages */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 16px",
          zIndex: 1,
          position: "relative",
          maxWidth: 780,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ animation: "fadeInUp 0.3s ease" }}>
            <Message msg={msg} />
          </div>
        ))}

        {/* Suggestions (only at start) */}
        {messages.length === 1 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 16,
              animation: "fadeInUp 0.5s ease 0.2s both",
            }}
          >
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "#9ca3af",
                  fontSize: 13,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  lineHeight: 1.5,
                  transition: "all 0.2s",
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
                {s}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#fca5a5",
              fontSize: 13,
              margin: "8px 0",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          background: "rgba(3,7,18,0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(74,222,128,0.1)",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: 16,
            padding: "10px 14px",
            transition: "border-color 0.2s",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Hikima anything... (English ko Hausa)"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f3f4f6",
              fontSize: 14.5,
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.6,
              maxHeight: 120,
              overflowY: "auto",
              paddingTop: 2,
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background:
                loading || !input.trim()
                  ? "rgba(74,222,128,0.15)"
                  : "linear-gradient(135deg, #15803d, #4ade80)",
              border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              transition: "all 0.2s",
              flexShrink: 0,
              boxShadow:
                loading || !input.trim() ? "none" : "0 2px 16px #4ade8044",
            }}
          >
            {loading ? "⏳" : "↑"}
          </button>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#374151",
            marginTop: 8,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.05em",
          }}
        >
          HIKIMA AI · Created by Haruna · Press Enter to send
        </div>
      </footer>
    </div>
  );
}
