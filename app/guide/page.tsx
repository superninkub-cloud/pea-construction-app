"use client";
import React, { useState, useRef, useEffect } from "react";
import TopBar from "../components/TopBar";
import ReactMarkdown from "react-markdown";

export default function GuidePage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "สวัสดีครับ! ผมคือผู้ช่วย AI ประจำคู่มืองานก่อสร้างสายส่ง 115 kV ของ กฟภ. \n\nมีอะไรให้ผมช่วยค้นหา หรือมีข้อสงสัยเกี่ยวกับมาตรฐานการก่อสร้างตรงไหน พิมพ์ถามผมได้เลยครับ!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistically add user message
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="คู่มืองานก่อสร้าง 115kV พร้อมผู้ช่วย AI อัจฉริยะ" />
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        
        {/* Left Side: Original Guide */}
        <div style={{ flex: 1, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 15px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e5e7eb", fontWeight: "bold", color: "#334155" }}>
            📄 คู่มือมาตรฐานการก่อสร้าง 115 kV
          </div>
          <iframe
            src="https://pea-foundation-guide-c4e3.vercel.app/"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="คู่มืองานก่อสร้าง 115kV"
            allowFullScreen
          />
        </div>

        {/* Right Side: AI Chat Assistant */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#fff", maxWidth: "50%" }}>
          <div style={{ padding: "10px 15px", backgroundColor: "#6366f1", color: "white", fontWeight: "bold", display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "10px", fontSize: "1.2rem" }}>🤖</span> 
            ผู้ช่วย AI กฟภ. (ถาม-ตอบ 115kV)
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#4f46e5" : "#f1f5f9",
                  color: msg.role === "user" ? "white" : "#334155",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "12px",
                  borderBottomLeftRadius: msg.role === "user" ? "12px" : "4px",
                  maxWidth: "85%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  lineHeight: "1.5"
                }}
              >
                {msg.role === "user" ? (
                  <div>{msg.content}</div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: "flex-start", backgroundColor: "#f1f5f9", padding: "12px 16px", borderRadius: "12px", color: "#64748b" }}>
                กำลังคิดคำตอบ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "15px", borderTop: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์คำถามเกี่ยวกับงานก่อสร้าง 115 kV..."
                style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem" }}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                style={{ 
                  padding: "0 20px", 
                  backgroundColor: isLoading || !input.trim() ? "#94a3b8" : "#4f46e5", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  transition: "background-color 0.2s"
                }}
              >
                ส่ง
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
