"use client";
import React, { useState, useRef, useEffect } from "react";
import TopBar from "../components/TopBar";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Activity, Ruler, Cpu, Zap, Shield, MapPin, Wrench, BookOpen } from "lucide-react";

import SagTension from "./components/SagTension";
import Clearances from "./components/Clearances";
import Structures from "./components/Structures";
import Conductors from "./components/Conductors";
import Insulators from "./components/Insulators";
import PolesGrounding from "./components/PolesGrounding";
import Hardware from "./components/Hardware";

export default function GuidePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "สวัสดีครับ! ผมคือผู้ช่วย AI ประจำคู่มือเทคนิคงานก่อสร้างระบบ 115 kV ของ กฟภ. \n\nมีอะไรให้ผมช่วยค้นหา หรือมีข้อสงสัยเกี่ยวกับมาตรฐานการก่อสร้าง หลักเกณฑ์ระบบสายส่ง สถานีไฟฟ้า 115 kV หรือคำนวณระยะ Sag & Tension พิมพ์ถามผมได้เลยครับ!" }
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
    { id: "sag", title: "การคำนวณแรงดึง/ระยะหย่อนยาน", desc: "Sag & Tension Calculator (AAC, ACSR, RTS)", icon: <Activity size={32} />, bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white" },
    { id: "clearance", title: "ระยะห่างทางไฟฟ้า", desc: "Clearances (ผนังเปิด/ปิด, แนวดิ่ง, ข้ามถนน)", icon: <Ruler size={32} />, bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" },
    { id: "structure", title: "แบบมาตรฐานโครงสร้างเสา", desc: "115 kV Pole Heads (SS-TG, SS-SA, SS-AS, LA, DD)", icon: <Cpu size={32} />, bg: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", color: "white" },
    { id: "conductor", title: "คุณสมบัติสายไฟฟ้า & แรงดึง", desc: "Conductors, RTS Tensile & Thermal Limits", icon: <Zap size={32} />, bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white" },
    { id: "insulator", title: "ลูกถ้วยและการประกอบชุด", desc: "Insulators & Assemblies (D-1 ถึง D-19)", icon: <Shield size={32} />, bg: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)", color: "white" },
    { id: "pole", title: "เสาคอนกรีตและการต่อลงดิน", desc: "22m Pole Holes, Grounding (GR, GS, GC, GW)", icon: <MapPin size={32} />, bg: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", color: "white" },
    { id: "hardware", title: "อุปกรณ์ประกอบฮาร์ดแวร์", desc: "Hardware Accessories & Installation", icon: <Wrench size={32} />, bg: "linear-gradient(135deg, #64748b 0%, #475569 100%)", color: "white" },
  ];

  const renderContent = () => {
    switch (selectedTopic) {
      case "full-pdf":
        return (
          <iframe
            src="https://pea-foundation-guide-c4e3.vercel.app/"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="คู่มือเทคนิคงานก่อสร้างระบบ 115 kV"
            allowFullScreen
          />
        );
      case "sag": return <SagTension />;
      case "clearance": return <Clearances />;
      case "structure": return <Structures />;
      case "conductor": return <Conductors />;
      case "insulator": return <Insulators />;
      case "pole": return <PolesGrounding />;
      case "hardware": return <Hardware />;
      default: return null;
    }
  };

  const getTopicTitle = () => {
    if (selectedTopic === "full-pdf") return "คู่มือฉบับเต็ม";
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.title : "";
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", position: "relative" }}>
      <TopBar title="ศูนย์รวมความรู้ระบบ 115 kV (Knowledge Hub)" />
      
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ marginBottom: "30px", textAlign: "center" }}>
            <h1 style={{ fontSize: "2.2rem", color: "#1e293b", marginBottom: "10px", fontWeight: "800" }}>คู่มือเทคนิคงานก่อสร้างระบบ 115 kV</h1>
            <p style={{ color: "#64748b", fontSize: "1.1rem" }}>หลักเกณฑ์ทางวิศวกรรม มาตรฐานการก่อสร้างสายส่งและอุปกรณ์ 115 kV กฟภ. (ตามเกณฑ์วางแผนระบบไฟฟ้า 2565)</p>
          </div>

          {!selectedTopic ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* PDF Full Guide Card */}
              <div 
                onClick={() => setSelectedTopic("full-pdf")}
                style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", borderRadius: "16px", padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
              >
                <div style={{ padding: "15px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "50%", marginBottom: "16px" }}>
                  <BookOpen size={40} />
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", textAlign: "center", marginBottom: "5px" }}>เปิดอ่านคู่มือฉบับเต็ม</h3>
                <p style={{ color: "#cbd5e1", textAlign: "center", fontSize: "0.9rem", margin: 0 }}>(PDF 313 หน้า / หลักเกณฑ์ กฟภ. ปี 2565)</p>
              </div>

              {topics.map((topic) => (
                <div 
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  style={{ background: topic.bg, color: topic.color, borderRadius: "16px", padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", minHeight: "160px", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
                >
                  <div style={{ padding: "12px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "12px", marginBottom: "16px" }}>
                    {topic.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "4px", lineHeight: "1.3" }}>{topic.title}</h3>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", margin: 0 }}>{topic.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", border: "1px solid #e2e8f0" }}>
              <div style={{ padding: "15px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b", padding: "5px" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  {getTopicTitle()}
                </h2>
              </div>
              <div style={{ height: "calc(100vh - 220px)", overflowY: "auto" }}>
                {renderContent()}
              </div>
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
