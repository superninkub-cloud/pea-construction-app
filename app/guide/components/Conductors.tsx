import React from "react";
import { Zap, Info } from "lucide-react";

export default function Conductors() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Zap className="text-amber-500" /> คุณสมบัติสายไฟฟ้า และ Thermal Limit
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          ข้อมูลสายไฟฟ้าที่ใช้ในระบบสายส่ง 115 kV ของ กฟภ. รวมถึงขีดจำกัดกระแสตามอุณหภูมิใช้งานสูงสุด
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        
        {/* ACSR Card */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
          <div style={{ padding: "15px 20px", backgroundColor: "#fffbeb", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#b45309" }}>
            สาย ACSR (Aluminium Conductor Steel Reinforced)
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", color: "#475569", fontSize: "0.95rem" }}>
            <p>สายอลูมิเนียมตีเกลียวแกนเหล็ก รับแรงดึงได้สูง นิยมใช้พาดข้ามแม่น้ำหรือหุบเหวที่มีช่วงเสายาว (Long Span)</p>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>ทนแรงดึงสูง</li>
              <li>ไม่ควรใช้ใกล้ชายทะเล (กันการกัดกร่อนจากไอเกลือ)</li>
              <li>ระบบ 115 kV นิยมใช้ขนาด <b>380/50 sq.mm.</b></li>
            </ul>
          </div>
        </div>

        {/* AAC & AA Card */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
          <div style={{ padding: "15px 20px", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#334155" }}>
            สาย AAC & AA (All Aluminium Conductor)
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", color: "#475569", fontSize: "0.95rem" }}>
            <p>สายอลูมิเนียมล้วน และ อลูมิเนียมเจือ (AA) สำหรับการใช้งานทั่วไปและพื้นที่ชายทะเล</p>
            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
              <li>AAC ใช้กับช่วงเสาสั้นๆ (Short Span) ขนาด <b>400 sq.mm.</b></li>
              <li>AA (Aluminium Alloy) ทนการกัดกร่อน ทนไอเกลือ เหมาะกับชายทะเล</li>
            </ul>
          </div>
        </div>

      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden", marginTop: "10px" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#fef2f2", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#e11d48", display: "flex", alignItems: "center", gap: "10px" }}>
          <Info size={18} /> ขีดจำกัดอุณหภูมิของสาย (Thermal Limit)
        </div>
        <div style={{ padding: "20px", color: "#475569", fontSize: "0.95rem" }}>
          <p style={{ marginBottom: "15px", lineHeight: "1.6" }}>
            เมื่อมีกระแสไฟฟ้าไหลผ่าน สายจะเกิดความร้อน หากร้อนเกินไปจะทำให้สายหย่อน (Sag เพิ่มขึ้น) จนอาจทำให้ระยะ Clearance ไม่ผ่านเกณฑ์ และสูญเสียความแข็งแรง (Annealing effect) ที่อุณหภูมิประมาณ 100°C
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "10px" }}>ขนาดสายไฟ</th>
                <th style={{ padding: "10px" }}>พิกัดกระแส (A)</th>
                <th style={{ padding: "10px" }}>Thermal Limit @115kV (MVA)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px" }}>795 MCM</td>
                <td style={{ padding: "10px" }}>900</td>
                <td style={{ padding: "10px", fontWeight: "bold", color: "#0ea5e9" }}>179</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px" }}>1033 MCM</td>
                <td style={{ padding: "10px" }}>1060</td>
                <td style={{ padding: "10px", fontWeight: "bold", color: "#0ea5e9" }}>211</td>
              </tr>
              <tr>
                <td style={{ padding: "10px" }}>1272 MCM</td>
                <td style={{ padding: "10px" }}>1200</td>
                <td style={{ padding: "10px", fontWeight: "bold", color: "#0ea5e9" }}>239</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "10px" }}>*อ้างอิงอุณหภูมิอากาศแวดล้อม 40°C และอุณหภูมิสูงสุดสาย 90°C</p>
        </div>
      </div>
    </div>
  );
}
