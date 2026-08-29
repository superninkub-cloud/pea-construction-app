"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";

export default function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = prompt;
    setPrompt("");
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage })
      });

      const data = await res.json();
      if (data.error) {
        setHistory(prev => [...prev, { role: 'ai', content: `❌ Error: ${data.error}` }]);
      } else {
        setHistory(prev => [...prev, { role: 'ai', content: data.response }]);
      }
    } catch (error) {
      setHistory(prev => [...prev, { role: 'ai', content: "❌ Network error, please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--pea-purple), #9333ea)",
          color: "white",
          border: "none",
          boxShadow: "0 10px 25px -5px rgba(126, 34, 206, 0.5)",
          display: isOpen ? "none" : "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 9999,
          transition: "transform 0.2s"
        }}
        className="copilot-toggle"
      >
        <Bot size={32} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "380px",
          height: "550px",
          backgroundColor: "white",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, var(--pea-purple), #9333ea)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Bot size={24} />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>PEA Copilot</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "#f8fafc"
          }}>
            {history.length === 0 && (
              <div style={{ textAlign: "center", color: "#64748b", marginTop: "40px", fontSize: "0.95rem" }}>
                <Bot size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
                <p style={{ margin: "0 0 8px" }}>สวัสดีครับ! ผมคือ <b>PEA Copilot</b></p>
                <p style={{ margin: 0 }}>ผู้ช่วยส่วนตัวของคุณ สามารถถามข้อมูลโครงการ งบประมาณ หรือสถานะงานต่างๆ ได้เลยครับ</p>
              </div>
            )}
            
            {history.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? "flex-end" : "flex-start",
                maxWidth: "85%"
              }}>
                <div style={{
                  background: msg.role === 'user' ? "var(--pea-purple)" : "white",
                  color: msg.role === 'user' ? "white" : "#1e293b",
                  padding: "12px 16px",
                  borderRadius: msg.role === 'user' ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  boxShadow: msg.role === 'user' ? "none" : "0 2px 4px rgba(0,0,0,0.05)",
                  border: msg.role === 'user' ? "none" : "1px solid #e2e8f0",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize: "0.85rem" }}>กำลังค้นหาข้อมูล...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} style={{
            padding: "16px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "white",
            display: "flex",
            gap: "12px"
          }}>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "24px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "0.95rem"
              }}
            />
            <button 
              type="submit" 
              disabled={loading || !prompt.trim()}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: (!prompt.trim() || loading) ? "#cbd5e1" : "var(--pea-purple)",
                color: "white",
                border: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: (!prompt.trim() || loading) ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
