"use client";

import React from "react";
import TopBar from "../components/TopBar";
import { AlertTriangle, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function ImportantTasksPage() {
  const projects = [
    {
      id: 1,
      name: "ปป.22kVใต้แนวสายส่ง ช่วง สฟฟ.กพส. ถึง แยกตลาดกำแพงแสน",
      wbs: "I-68-I-KPN03.19.3918",
      distance: "1.555 วงจร-กม.",
      target: "พฤศจิกายน 2569",
      status: "อยู่ระหว่างก่อสร้าง",
      progress: 21.72,
      note: "ต้องเร่งรัดการก่อสร้างและการเบิกจ่ายให้สอดคล้องกับแผนงานที่ตั้งไว้อย่างเร่งด่วน (เบิกจ่ายล่าช้า 3.13% - 21.72%)",
      type: "urgent",
    },
    {
      id: 2,
      name: "ปป.เชื่อมโยง อ่างเก็บน้ำเขื่อนเขาแหลม (รองรับการแก้ไขปัญหาไฟดับ กฟส.สังขละบุรี)",
      wbs: "P-TDD02.3-I-TPMNA.0015",
      distance: "2.590 กม.",
      target: "ภายในปี 2569",
      status: "รอทำราคากลาง",
      progress: null,
      note: "E-bidding ให้ กฟฟ.หน้างาน ดำเนินการต่อเอง (ต้องเร่งรัดดำเนินการ)",
      type: "urgent",
    },
    {
      id: 3,
      name: "สายส่ง TAB LINE สฟ.พนมทวน-กาญจนบุรี2 - สฟ.กาญจนบุรี 5 (ชั่วคราว)",
      wbs: "I-69-I-KCI02.19.3907",
      distance: "3.120 กม.",
      target: "ภายในปี 2569",
      status: "ผรม.เริ่มเข้าทำฐาน",
      progress: null,
      note: "โรงหล่อผลิตซองฐานรากให้ยังไม่ทัน (เจรจาขอพื้นที่ทำงานก่อสร้างกับกรมทางหลวงสำเร็จแล้ว ทีมงานสามารถเข้าดำเนินการต่อได้ทันที)",
      type: "urgent",
    },
    {
      id: 4,
      name: "งานก่อสร้างย้ายแนว 115 เควี บริเวณแยกเทียนดัด และแยกโรมัน",
      wbs: "I-69-I-KCI02.19.3908",
      distance: "1.152 กม.",
      target: "รอดำเนินการ",
      status: "ติดข้อจำกัดกรมทางหลวง",
      progress: null,
      note: "แนวตอกเสาเข็ม/ฐานราก ทับซ้อนแนวสายเคเบิลใต้ดิน 115kV (ผศร. จะสามารถดำเนินการย้ายแนว 115kV ได้ก็ต่อเมื่อกรมทางหลวงตอกเสาเข็มและก่อสร้างฐานรากเสร็จสิ้นเท่านั้น)",
      type: "warning",
    },
    {
      id: 5,
      name: "งานก่อสร้างระบบจำหน่ายรองรับ สถานีไฟฟ้าสุพรรณบุรี 2",
      wbs: "P-TDD02.3-I-SPINA.0001 - .0013",
      distance: "หลายช่วง",
      target: "ไตรมาส 4/69",
      status: "ดำเนินการตามแผน",
      progress: 100,
      note: "หลายช่วงดำเนินการเสร็จสิ้น (100%) และบางส่วนรอปิดงาน",
      type: "normal",
    },
    {
      id: 6,
      name: "ย้ายแนว 115 เควี บริเวณแยกแก่งเสี้ยน จ.กาญจนบุรี",
      wbs: "รอ กวว. Interphase งาน",
      distance: "0.285 กม.",
      target: "ยกเลิก",
      status: "ยกเลิกไม่ทำ",
      progress: null,
      note: "กรมทางหลวงยังเวนคืนที่ดินไม่เรียบร้อย กรมที่ดินมาวัดแนวเขตวันที่ 8 เม.ย.69 (ยกเลิกไฟแดง และก่อสร้างถนนวงเวียน)",
      type: "cancelled",
    },
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle size={24} className="text-red-600" />;
      case "warning":
        return <AlertCircle size={24} className="text-yellow-600" />;
      case "normal":
        return <CheckCircle2 size={24} className="text-green-600" />;
      case "cancelled":
        return <XCircle size={24} className="text-gray-500" />;
      default:
        return null;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case "urgent":
        return { borderTop: "4px solid #ef4444", backgroundColor: "#fef2f2" };
      case "warning":
        return { borderTop: "4px solid #eab308", backgroundColor: "#fefce8" };
      case "normal":
        return { borderTop: "4px solid #22c55e", backgroundColor: "#f0fdf4" };
      case "cancelled":
        return { borderTop: "4px solid #6b7280", backgroundColor: "#f9fafb" };
      default:
        return {};
    }
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "0 0 40px 0" }}>
      <TopBar title="ระบบติดตามงานสำคัญ (ปี 2569)" />
      
      <div style={{ padding: "24px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
            ภาพรวมงานที่ต้องเร่งรัด
          </h2>
          <p style={{ color: "#64748b" }}>
            ข้อมูลอ้างอิงจากแฟ้มการประชุม แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา (กฟต.3)
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", 
          gap: "24px" 
        }}>
          {projects.map((proj) => (
            <div 
              key={proj.id} 
              style={{
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                display: "flex",
                flexDirection: "column",
                ...getCardStyle(proj.type)
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {getStatusIcon(proj.type)}
                  <span style={{ 
                    fontWeight: "600", 
                    fontSize: "0.9rem",
                    color: proj.type === "urgent" ? "#b91c1c" : 
                           proj.type === "warning" ? "#a16207" : 
                           proj.type === "normal" ? "#15803d" : "#4b5563",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {proj.type === "urgent" ? "ต้องเร่งรัดด่วน" : 
                     proj.type === "warning" ? "ติดอุปสรรค" : 
                     proj.type === "normal" ? "ปกติ" : "ยกเลิก"}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500", backgroundColor: "#fff", padding: "4px 8px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  เป้าหมาย: {proj.target}
                </div>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#0f172a", marginBottom: "12px", lineHeight: "1.4" }}>
                {proj.name}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", flex: 1 }}>
                <div style={{ display: "flex", fontSize: "0.9rem" }}>
                  <span style={{ color: "#64748b", width: "90px" }}>WBS:</span>
                  <span style={{ fontWeight: "500", color: "#334155" }}>{proj.wbs}</span>
                </div>
                <div style={{ display: "flex", fontSize: "0.9rem" }}>
                  <span style={{ color: "#64748b", width: "90px" }}>ระยะทาง:</span>
                  <span style={{ fontWeight: "500", color: "#334155" }}>{proj.distance}</span>
                </div>
                <div style={{ display: "flex", fontSize: "0.9rem" }}>
                  <span style={{ color: "#64748b", width: "90px" }}>สถานะ:</span>
                  <span style={{ fontWeight: "600", color: "#0f172a" }}>{proj.status}</span>
                </div>
              </div>

              {proj.progress !== null && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b", fontWeight: "500" }}>ความคืบหน้า</span>
                    <span style={{ fontWeight: "600", color: "#0f172a" }}>{proj.progress}%</span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ 
                      height: "100%", 
                      width: `${proj.progress}%`, 
                      backgroundColor: proj.progress === 100 ? "#22c55e" : "#3b82f6",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                </div>
              )}

              <div style={{ 
                backgroundColor: "rgba(255,255,255,0.6)", 
                padding: "12px", 
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.05)",
                fontSize: "0.85rem",
                color: "#475569",
                lineHeight: "1.5"
              }}>
                <span style={{ fontWeight: "600", color: "#334155", display: "block", marginBottom: "4px" }}>ข้อสังเกต / อุปสรรค:</span>
                {proj.note}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
