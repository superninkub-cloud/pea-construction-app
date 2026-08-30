import React, { useState } from "react";
import { Calculator, ArrowRight, BookOpen } from "lucide-react";

export default function SagTension() {
  const [w, setW] = useState<number | "">("");
  const [l, setL] = useState<number | "">("");
  const [t0, setT0] = useState<number | "">("");
  
  const [result, setResult] = useState<number | null>(null);

  const calculateSag = (e: React.FormEvent) => {
    e.preventDefault();
    if (w !== "" && l !== "" && t0 !== "" && t0 > 0) {
      const sag = (w * Math.pow(l, 2)) / (8 * t0);
      setResult(sag);
    }
  };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "30px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <ActivityIcon /> ทฤษฎีและการคำนวณแรงดึง / ระยะหย่อนยาน (Sag & Tension)
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          การพาดสายไฟฟ้าบนโครงสร้างเสาที่มีความสูงระดับเดียวกัน จะทำให้แรงดึงในสายบนหัวเสามีลักษณะสมดุล (เท่ากัน) และระยะหย่อนยานต่ำสุดของสายจะอยู่ตรงกึ่งกลางเสาพอดี
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
        {/* Calculator Card */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
          <div style={{ padding: "15px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
            <Calculator size={20} className="text-blue-600" /> โปรแกรมคำนวณระยะหย่อนยาน (Sag)
          </div>
          <div style={{ padding: "20px" }}>
            <form onSubmit={calculateSag} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", color: "#475569", fontSize: "0.9rem" }}>น้ำหนักสายต่อความยาว (W) [kg/m]</label>
                <input 
                  type="number" step="any" required
                  value={w} onChange={(e) => setW(parseFloat(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="เช่น 1.075 สำหรับ ACSR 400"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", color: "#475569", fontSize: "0.9rem" }}>ระยะช่วงเสา (L) [m]</label>
                <input 
                  type="number" step="any" required
                  value={l} onChange={(e) => setL(parseFloat(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="เช่น 80"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", color: "#475569", fontSize: "0.9rem" }}>แรงดึงในแนวราบที่จุดต่ำสุด (T₀) [kgf]</label>
                <input 
                  type="number" step="any" required
                  value={t0} onChange={(e) => setT0(parseFloat(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  placeholder="เช่น 1476.56"
                />
              </div>
              <button type="submit" style={{ padding: "12px", backgroundColor: "#3b82f6", color: "white", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer", marginTop: "10px" }}>
                คำนวณระยะ Sag
              </button>
            </form>

            {result !== null && (
              <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", textAlign: "center" }}>
                <p style={{ color: "#1e3a8a", fontSize: "0.9rem", marginBottom: "5px" }}>ระยะหย่อนยานต่ำสุดของสาย (Y)</p>
                <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "#2563eb", margin: 0 }}>
                  {result.toFixed(3)} <span style={{ fontSize: "1rem" }}>เมตร</span>
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* Theory Card */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
          <div style={{ padding: "15px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
            <BookOpen size={20} className="text-emerald-600" /> สรุปสูตรที่สำคัญ
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ padding: "15px", backgroundColor: "#f1f5f9", borderRadius: "8px" }}>
              <h4 style={{ fontWeight: "bold", color: "#334155", marginBottom: "10px", fontSize: "1rem" }}>สูตรหาระยะหย่อนยานของสาย (Sag)</h4>
              <p style={{ fontFamily: "monospace", fontSize: "1.2rem", color: "#0f172a", textAlign: "center", backgroundColor: "white", padding: "10px", borderRadius: "6px", border: "1px dashed #cbd5e1" }}>
                Y = (W × L²) / (8 × T₀)
              </p>
              <ul style={{ marginTop: "15px", paddingLeft: "20px", fontSize: "0.9rem", color: "#475569" }}>
                <li><b>Y</b> = ระยะหย่อนยาน (m)</li>
                <li><b>W</b> = น้ำหนักสายต่อความยาว (kg/m)</li>
                <li><b>L</b> = ระยะช่วงเสา (m)</li>
                <li><b>T₀</b> = แรงดึงในแนวราบที่จุดต่ำสุด (kgf)</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: "bold", color: "#334155", marginBottom: "10px", fontSize: "1rem" }}>ผลกระทบจากอุณหภูมิและลม</h4>
              <p style={{ fontSize: "0.95rem", color: "#475569", lineHeight: "1.6" }}>
                - <b>อุณหภูมิลดลง (หนาว):</b> สายจะหดตัว ทำให้ Sag ลดลง และแรงดึง (Tension) เพิ่มขึ้น
                <br/>
                - <b>อุณหภูมิสูงขึ้น (ร้อน):</b> สายจะยืดตัว ทำให้ Sag เพิ่มขึ้น และแรงดึงลดลง
                <br/>
                - <b>ลมพัดปะทะสาย:</b> ทำให้สายเบี่ยงเบนจากแนวดิ่ง เกิดแรงตึงที่หัวเสามากขึ้น
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <div style={{ backgroundColor: "#dbeafe", color: "#2563eb", padding: "8px", borderRadius: "8px", display: "flex" }}>
      <Activity size={24} />
    </div>
  );
}
