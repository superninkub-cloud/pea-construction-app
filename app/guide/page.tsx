"use client";
import React, { useState, useRef, useEffect } from "react";
import TopBar from "../components/TopBar";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Activity, Ruler, Cpu, Zap, Shield, MapPin, Wrench, BookOpen } from "lucide-react";

export default function GuidePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
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
  }, [messages, isChatOpen]);

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

  const topics = [
    { id: "sag", title: "ทฤษฎีและการคำนวณแรงดึง/ระยะหย่อนยาน", icon: <Activity size={24} />, color: "bg-blue-100 text-blue-700" },
    { id: "clearance", title: "ระยะห่างทางไฟฟ้า (Clearances)", icon: <Ruler size={24} />, color: "bg-emerald-100 text-emerald-700" },
    { id: "structure", title: "แบบมาตรฐานโครงสร้างสายส่ง 115 kV", icon: <Cpu size={24} />, color: "bg-purple-100 text-purple-700" },
    { id: "conductor", title: "คุณสมบัติสายไฟฟ้าและ Thermal Limit", icon: <Zap size={24} />, color: "bg-amber-100 text-amber-700" },
    { id: "insulator", title: "ลูกถ้วยฉนวนไฟฟ้าและการประกอบชุดลูกถ้วย", icon: <Shield size={24} />, color: "bg-rose-100 text-rose-700" },
    { id: "pole", title: "เสาคอนกรีตอัดแรง 22 ม. และระบบต่อลงดิน", icon: <MapPin size={24} />, color: "bg-teal-100 text-teal-700" },
    { id: "hardware", title: "อุปกรณ์ประกอบฮาร์ดแวร์", icon: <Wrench size={24} />, color: "bg-slate-100 text-slate-700" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", position: "relative" }}>
      <TopBar title="ศูนย์รวมความรู้ 115 kV (Knowledge Hub)" />
      
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ marginBottom: "30px", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", color: "#1e293b", marginBottom: "10px", fontWeight: "bold" }}>คู่มือมาตรฐานการก่อสร้างสายส่ง 115 kV</h1>
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>เลือกหัวข้อที่คุณต้องการศึกษา หรือสอบถามข้อมูลเพิ่มเติมผ่านผู้ช่วย AI ของเรา</p>
          </div>

          {!selectedTopic ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {/* PDF Full Guide Card */}
              <div 
                onClick={() => setSelectedTopic("full-pdf")}
                style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "transform 0.2s, box-shadow 0.2s", border: "1px solid #e2e8f0" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; }}
              >
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", backgroundColor: "#fef2f2", color: "#ef4444" }}>
                  <BookOpen size={32} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#334155", textAlign: "center" }}>เปิดอ่านคู่มือฉบับเต็ม</h3>
                <p style={{ color: "#64748b", textAlign: "center", marginTop: "8px", fontSize: "0.9rem" }}>(เอกสาร PDF ความยาว 313 หน้า)</p>
              </div>

              {topics.map((topic) => (
                <div 
                  key={topic.id}
                  onClick={() => alert("กำลังพัฒนาฟีเจอร์สำหรับหัวข้อ: " + topic.title)}
                  style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "16px", transition: "transform 0.2s, box-shadow 0.2s", border: "1px solid #e2e8f0" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; }}
                >
                  <div className={topic.color} style={{ width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {topic.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>{topic.title}</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>คลิกเพื่อดูสรุปข้อมูลและเครื่องมือคำนวณที่เกี่ยวข้อง</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: "calc(100vh - 180px)", display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#334155", margin: 0 }}>คู่มือฉบับเต็ม</h2>
                <button 
                  onClick={() => setSelectedTopic(null)}
                  style={{ padding: "6px 12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem" }}
                >
                  ย้อนกลับ
                </button>
              </div>
              <iframe
                src="https://pea-foundation-guide-c4e3.vercel.app/"
                style={{ width: "100%", height: "100%", border: "none" }}
                title="คู่มืองานก่อสร้าง 115kV"
                allowFullScreen
              />
            </div>
          )}

        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: "absolute",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          backgroundColor: "#4f46e5",
          color: "white",
          border: "none",
          boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
          zIndex: 1000
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Floating Chat Window */}
      {isChatOpen && (
        <div style={{
          position: "absolute",
          bottom: "100px",
          right: "30px",
          width: "380px",
          height: "550px",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          zIndex: 1000
        }}>
          <div style={{ padding: "15px", backgroundColor: "#4f46e5", color: "white", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "10px", fontSize: "1.3rem" }}>🤖</span> 
              ผู้ช่วย AI กฟภ. (115kV)
            </div>
            <button onClick={() => setIsChatOpen(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc" }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#4f46e5" : "white",
                  color: msg.role === "user" ? "white" : "#334155",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "12px",
                  borderBottomLeftRadius: msg.role === "user" ? "12px" : "4px",
                  maxWidth: "85%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  lineHeight: "1.5",
                  fontSize: "0.95rem",
                  border: msg.role !== "user" ? "1px solid #e2e8f0" : "none"
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
              <div style={{ alignSelf: "flex-start", backgroundColor: "white", padding: "10px 14px", borderRadius: "12px", color: "#64748b", border: "1px solid #e2e8f0", fontSize: "0.95rem" }}>
                <span className="animate-pulse">กำลังคิดคำตอบ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: "12px", borderTop: "1px solid #e2e8f0", backgroundColor: "white" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์คำถามเกี่ยวกับงาน 115 kV..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #cbd5e1", outline: "none", fontSize: "0.95rem", backgroundColor: "#f8fafc" }}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                style={{ 
                  width: "40px",
                  height: "40px",
                  borderRadius: "20px",
                  backgroundColor: isLoading || !input.trim() ? "#e2e8f0" : "#4f46e5", 
                  color: isLoading || !input.trim() ? "#94a3b8" : "white", 
                  border: "none", 
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
