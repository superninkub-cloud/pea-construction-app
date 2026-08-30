import React from "react";
import { Cpu } from "lucide-react";

export default function Structures() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Cpu className="text-purple-600" /> แบบมาตรฐานโครงสร้างสายส่ง 115 kV
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          รหัสแบบมาตรฐานและมุมเบี่ยงเบนที่อนุญาต สำหรับเสาโครงสร้างประเภทต่างๆ ในระบบ 115 kV กฟภ.
        </p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#f3e8ff", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#6b21a8" }}>
          โครงสร้างเสาทางตรงและทางโค้ง (วงจรเดี่ยว / สายเดี่ยว)
        </div>
        <div style={{ padding: "20px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "10px" }}>รหัสแบบโครงสร้าง</th>
                <th style={{ padding: "10px" }}>การใช้งาน</th>
                <th style={{ padding: "10px" }}>มุมเบี่ยงเบน (องศา)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>SS-TG-2 ถึง SS-TG-6</td>
                <td style={{ padding: "10px" }}>ทางตรง / ก่อนเสาเข้าปลายสาย</td>
                <td style={{ padding: "10px" }}>ไม่เกิน 2 องศา</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>SS-AS-4</td>
                <td style={{ padding: "10px" }}>เข้าปลายสายสองข้าง ก่อนเสาโค้ง</td>
                <td style={{ padding: "10px" }}>ไม่เกิน 2 องศา</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>SS-SA-2</td>
                <td style={{ padding: "10px" }}>เสาสำหรับทางโค้ง</td>
                <td style={{ padding: "10px" }}>ไม่เกิน 30 องศา</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: "bold" }}>SS-LA-1, SS-LA-2</td>
                <td style={{ padding: "10px" }}>เสาหัวมุมสำหรับข้ามทางสัญจร</td>
                <td style={{ padding: "10px" }}>45° - 135°</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#fdf4ff", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#86198f" }}>
          โครงสร้างสำหรับเสาแยกสาย (Tap-line)
        </div>
        <div style={{ padding: "20px", overflowX: "auto", fontSize: "0.9rem", color: "#475569" }}>
          <p style={{ marginBottom: "15px" }}>รหัสโครงสร้างสำหรับแยกสาย มักจะมีคำว่า <b>TL</b> (Tap Line) อยู่ในรหัส เช่น:</p>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><b>SS-TL-1:</b> เสาทางตรงสำหรับแทปแยกสายข้ามทางสัญจร (มุม 45° - 135°)</li>
            <li><b>SD-TL-1:</b> วงจรเดี่ยวสายไฟคู่ เสาเดี่ยว สำหรับแยกสายข้ามทางสัญจร</li>
            <li><b>DD-TL-2:</b> วงจรคู่สายคู่ เสาคู่ สำหรับแยกสายข้ามทางสัญจร</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
