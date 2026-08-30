import React from "react";
import { Ruler, AlertTriangle } from "lucide-react";

export default function Clearances() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Ruler className="text-emerald-600" /> ระยะห่างทางไฟฟ้า (Clearances)
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          สรุประยะห่างเพื่อความปลอดภัยตามแนวดิ่ง ระหว่างสายไฟฟ้า 115 kV กับสิ่งปลูกสร้าง, แหล่งน้ำ, หรือทางสัญจร
        </p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#ecfdf5", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#065f46" }}>
          ตารางระยะห่างต่ำสุดในแนวดิ่ง (เมตร)
        </div>
        <div style={{ padding: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "12px 15px", fontWeight: "bold" }}>ลักษณะการพาดผ่าน (115 kV)</th>
                <th style={{ padding: "12px 15px", fontWeight: "bold" }}>ระยะต่ำสุด (เมตร)</th>
                <th style={{ padding: "12px 15px", fontWeight: "bold" }}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 15px", color: "#334155" }}>ทางสัญจรสำหรับรถยนต์/รถบรรทุก</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#059669" }}>7.50</td>
                <td style={{ padding: "12px 15px", color: "#64748b" }}>ผ่านเหนือทางหลวง</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 15px", color: "#334155" }}>ข้ามทางรถไฟ (เหนือสันราง)</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#059669" }}>h1 + 4.40</td>
                <td style={{ padding: "12px 15px", color: "#64748b" }}>h1 = ความสูงขบวนรถไฟ</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 15px", color: "#334155" }}>แหล่งน้ำที่มีเรือแล่นผ่าน (กว้าง {"<"} 50 ม.)</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#059669" }}>8.20</td>
                <td style={{ padding: "12px 15px", color: "#64748b" }}>เรือสูงไม่เกิน 4.9 เมตร</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 15px", color: "#334155" }}>แหล่งน้ำที่มีเรือแล่นผ่าน (50 - 500 ม.)</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#059669" }}>10.70</td>
                <td style={{ padding: "12px 15px", color: "#64748b" }}>เรือสูงไม่เกิน 7.3 เมตร</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 15px", color: "#334155" }}>สะพานลอยคนเดินข้ามที่มีหลังคา</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#059669" }}>≥ 3.60</td>
                <td style={{ padding: "12px 15px", color: "#64748b" }}>จากหลังคาสะพาน</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ padding: "15px", backgroundColor: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a", display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
        <div>
          <h4 style={{ fontWeight: "bold", color: "#92400e", marginBottom: "5px" }}>ข้อควรระวัง</h4>
          <p style={{ color: "#b45309", fontSize: "0.9rem", lineHeight: "1.5", margin: 0 }}>
            ระยะห่างที่แสดงเป็นค่าระยะต่ำสุด (Minimum Clearance) ในทางปฏิบัติควรออกแบบเผื่อระยะปลอดภัย (Safety Margin) ให้มากขึ้นเพื่อรองรับการหย่อนตัวของสายไฟในสภาพอุณหภูมิสูง (Maximum Sag)
          </p>
        </div>
      </div>
    </div>
  );
}
