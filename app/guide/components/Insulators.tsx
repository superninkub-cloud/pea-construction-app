import React from "react";
import { Shield, Layers } from "lucide-react";

export default function Insulators() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Shield className="text-rose-500" /> ลูกถ้วยฉนวนไฟฟ้า และการประกอบ
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          ลูกถ้วยฉนวน (Insulators) ทำหน้าที่รองรับสายไฟฟ้าและป้องกันกระแสไฟฟ้ารั่วไหลลงสู่โครงสร้างเสา แบ่งตามวัสดุได้ 3 ชนิดหลัก
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
        {/* Porcelain */}
        <div style={{ backgroundColor: "#fef2f2", borderRadius: "12px", padding: "20px", border: "1px solid #fecdd3" }}>
          <h3 style={{ fontWeight: "bold", color: "#be123c", marginBottom: "10px" }}>ลูกถ้วยปอร์ซเลน (Porcelain)</h3>
          <p style={{ fontSize: "0.9rem", color: "#4c0519", lineHeight: "1.5" }}>
            กระเบื้องเคลือบ ทนต่อความเครียดทางไฟฟ้าได้ดี มักใช้ในงานแขวน (Suspension) เช่น แบบ 52-3 และ 52-8 เคลือบผิวมันเพื่อให้ฝนชะล้างสิ่งสกปรกได้ง่าย
          </p>
        </div>

        {/* Glass */}
        <div style={{ backgroundColor: "#f0fdf4", borderRadius: "12px", padding: "20px", border: "1px solid #bbf7d0" }}>
          <h3 style={{ fontWeight: "bold", color: "#15803d", marginBottom: "10px" }}>ลูกถ้วยแก้วเหนียว (Glass)</h3>
          <p style={{ fontSize: "0.9rem", color: "#14532d", lineHeight: "1.5" }}>
            สัมประสิทธิ์การขยายตัวต่อความร้อนต่ำ ไม่แตกร้าวหรือหดตัวในบริเวณที่อุณหภูมิเปลี่ยนมาก แข็งแรงทนทาน ใช้ทดแทนแบบปอร์ซเลนได้
          </p>
        </div>

        {/* Composite */}
        <div style={{ backgroundColor: "#eff6ff", borderRadius: "12px", padding: "20px", border: "1px solid #bfdbfe" }}>
          <h3 style={{ fontWeight: "bold", color: "#1d4ed8", marginBottom: "10px" }}>ลูกถ้วยคอมโพสิต (Composite)</h3>
          <p style={{ fontSize: "0.9rem", color: "#1e3a8a", lineHeight: "1.5" }}>
            ทำจากโพลิเมอร์ น้ำหนักเบามาก ทนทานมลภาวะสูง ทนไอเกลือ นิยมใช้ในพื้นที่ใกล้ชายทะเล หรือโรงงานอุตสาหกรรม
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden", marginTop: "10px" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={18} /> รูปแบบการประกอบลูกถ้วยแขวน (Suspension Assembly)
        </div>
        <div style={{ padding: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "10px" }}>รหัสแบบ</th>
                <th style={{ padding: "10px" }}>การใช้งาน</th>
                <th style={{ padding: "10px" }}>พิกัดแรงดัน</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>D-1, D-11</td>
                <td style={{ padding: "10px" }}>แขวนรับสายทางตรง (ห้อยลงแนวดิ่ง)</td>
                <td style={{ padding: "10px" }}>115 kV</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>D-2, D-12</td>
                <td style={{ padding: "10px" }}>สำหรับเสาทางโค้ง (รับแรงดึงแนวดิ่ง)</td>
                <td style={{ padding: "10px" }}>115 kV</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>D-3, D-13</td>
                <td style={{ padding: "10px" }}>เข้าปลายสายแนวนอน (Dead-End) เดี่ยว/คู่</td>
                <td style={{ padding: "10px" }}>115 kV</td>
              </tr>
              <tr>
                <td style={{ padding: "10px", fontWeight: "bold" }}>D-19A ถึง D-19J</td>
                <td style={{ padding: "10px" }}>กลุ่มชุดลูกถ้วยคอมโพสิต สำหรับทางตรง ทางโค้ง และเข้าปลายสาย</td>
                <td style={{ padding: "10px" }}>115 kV</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
