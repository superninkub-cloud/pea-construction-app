import React, { useState } from "react";
import { Ruler, AlertTriangle, Building2, Eye, EyeOff, ShieldAlert, CheckCircle, Car, Train, Ship, Compass } from "lucide-react";

export default function Clearances() {
  const [activeTab, setActiveTab] = useState<"building" | "vertical" | "horizontal">("building");

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.3s ease-in-out" }}>
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #065f46 0%, #10b981 100%)", borderRadius: "16px", padding: "24px 28px", color: "white", boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "12px" }}>
            <Ruler size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "bold", margin: 0 }}>ระยะห่างทางไฟฟ้าที่ปลอดภัย (Clearances Standard 115 kV)</h2>
            <p style={{ color: "#d1fae5", fontSize: "0.95rem", margin: "4px 0 0 0" }}>
              มาตรฐานระยะห่างทางไฟฟ้าแนวดิ่งและแนวราบ ระหว่างสายส่ง 115 kV กับอาคาร ผนังเปิด/ปิด ถนน ทางรถไฟ และแหล่งน้ำ
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("building")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "building" ? "#10b981" : "#f1f5f9",
            color: activeTab === "building" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Building2 size={18} /> ระยะห่างอาคาร & สิ่งปลูกสร้าง (ผนังปิด/เปิด)
        </button>
        <button
          onClick={() => setActiveTab("vertical")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "vertical" ? "#10b981" : "#f1f5f9",
            color: activeTab === "vertical" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Compass size={18} /> ระยะห่างแนวดิ่ง (ข้ามถนน/ทางรถไฟ/แม่น้ำ)
        </button>
        <button
          onClick={() => setActiveTab("horizontal")}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: activeTab === "horizontal" ? "#10b981" : "#f1f5f9",
            color: activeTab === "horizontal" ? "white" : "#475569",
            transition: "all 0.2s"
          }}
        >
          <Ruler size={18} /> สรุปตารางระยะแนวราบทั้งหมด
        </button>
      </div>

      {/* Tab Content 1: Building & Wall Clearances (Focus on Closed vs Open Walls) */}
      {activeTab === "building" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Comparison Cards: Closed Wall vs Open Wall */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
            
            {/* Closed Wall Card */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ backgroundColor: "#64748b", color: "white", padding: "8px", borderRadius: "8px" }}>
                  <EyeOff size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
                    ผนังปิด / ผนังทึบ (Blind / Solid Wall)
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>ผนังที่ไม่มีหน้าต่าง ประตู หรือช่องเปิดที่คนเอื้อมถึง</span>
                </div>
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", display: "block" }}>สภาวะสายไฟนิ่ง (ปกติ)</span>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f766e", margin: "4px 0" }}>2.30</div>
                    <span style={{ fontSize: "0.85rem", color: "#0f766e", fontWeight: "bold" }}>เมตร</span>
                  </div>

                  <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", display: "block" }}>สภาวะสายแกว่ง (ลมแรง)</span>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#334155", margin: "4px 0" }}>1.50</div>
                    <span style={{ fontSize: "0.85rem", color: "#334155", fontWeight: "bold" }}>เมตร</span>
                  </div>
                </div>

                <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                  <div style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>ลักษณะทางกายภาพ:</div>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>ผนังก่ออิฐฉาบปูนทึบ ผนังคอนกรีตล้วน</li>
                    <li>ไม่มีระเบียง ไม่มีบันไดหนีไฟภายนอก</li>
                    <li>คนไม่สามารถยื่นมือหรือใช้วัตถุสัมผัสสายไฟได้โดยง่าย</li>
                  </ul>
                </div>

                <div style={{ padding: "10px 14px", backgroundColor: "#f0fdfa", borderRadius: "8px", border: "1px solid #ccfbf1", fontSize: "0.85rem", color: "#0f766e", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={18} />
                  <span>ระยะห่างในแนวราบขั้นต่ำต้องไม่น้อยกว่า <b>2.30 เมตร</b></span>
                </div>

              </div>
            </div>

            {/* Open Wall Card */}
            <div style={{ backgroundColor: "white", borderRadius: "16px", border: "2px solid #fb7185", boxShadow: "0 4px 12px rgba(244, 63, 94, 0.1)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", backgroundColor: "#fff1f2", borderBottom: "1px solid #fecdd3", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ backgroundColor: "#e11d48", color: "white", padding: "8px", borderRadius: "8px" }}>
                  <Eye size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#9f1239", margin: 0 }}>
                    ผนังเปิด / ช่องเปิด (Open Wall / Openings)
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#e11d48" }}>ผนังที่มีหน้าต่าง ประตู ระเบียง หรือพื้นที่คนเข้าถึงได้</span>
                </div>
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ backgroundColor: "#fff1f2", padding: "16px", borderRadius: "12px", border: "1px solid #fecdd3", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#9f1239", fontWeight: "bold", display: "block" }}>สภาวะสายไฟนิ่ง (ปกติ)</span>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#e11d48", margin: "4px 0" }}>3.10</div>
                    <span style={{ fontSize: "0.85rem", color: "#e11d48", fontWeight: "bold" }}>เมตร</span>
                  </div>

                  <div style={{ backgroundColor: "#fff1f2", padding: "16px", borderRadius: "12px", border: "1px solid #fecdd3", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#9f1239", fontWeight: "bold", display: "block" }}>สภาวะสายแกว่ง (ลมแรง)</span>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#be123c", margin: "4px 0" }}>2.30</div>
                    <span style={{ fontSize: "0.85rem", color: "#be123c", fontWeight: "bold" }}>เมตร</span>
                  </div>
                </div>

                <div style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                  <div style={{ fontWeight: "bold", color: "#1e293b", marginBottom: "4px" }}>ลักษณะทางกายภาพ:</div>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>ผนังที่มีหน้าต่างบานเปิด บานเลื่อน บานกระทุ้ง หรือช่องระบายอากาศ</li>
                    <li>ระเบียงห้อง ดาดฟ้า หรือระเบียงทางเดินที่คนเดินเข้าถึงได้</li>
                    <li>มีความเสี่ยงที่คนจะยื่นมือหรือไม้/อุปกรณ์ออกไปสัมผัสสายไฟ</li>
                  </ul>
                </div>

                <div style={{ padding: "10px 14px", backgroundColor: "#fff1f2", borderRadius: "8px", border: "1px solid #fecdd3", fontSize: "0.85rem", color: "#be123c", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={18} />
                  <span>ระยะห่างในแนวราบขั้นต่ำต้องไม่น้อยกว่า <b>3.10 เมตร</b></span>
                </div>

              </div>
            </div>

          </div>

          {/* Roof and Building Top Clearances */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#1e293b", fontSize: "1rem" }}>
              🏠 ระยะห่างแนวดิ่งเหนือหลังคาและสิ่งปลูกสร้าง (115 kV)
            </div>
            
            <div style={{ padding: "20px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", color: "#334155", borderBottom: "2px solid #cbd5e1" }}>
                    <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ตำแหน่งสิ่งปลูกสร้าง</th>
                    <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ระยะห่างแนวดิ่งขั้นต่ำ (เมตร)</th>
                    <th style={{ padding: "12px 16px", fontWeight: "bold" }}>คำอธิบาย / เงื่อนไข</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#1e293b" }}>หลังคาที่คนขึ้นไปไม่ได้ (Non-accessible Roof)</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>3.80 - 4.00</td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>หลังคาลาดเอียง หลังคากระเบื้อง/สังกะสีที่ไม่มีบันไดขึ้น</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#1e293b" }}>หลังคาดาดฟ้า / ระเบียงที่คนเดินได้ (Accessible Roof)</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#dc2626", fontSize: "1.1rem" }}>4.60 - 5.00</td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>ดาดฟ้าคอนกรีต ระเบียงตากผ้า หรือพื้นที่พักผ่อน</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#1e293b" }}>ป้ายโฆษณา / ป้ายร้านค้า / เสาธง (Signboards / Billboards)</td>
                    <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>3.10 (แนวราบ) / 4.00 (แนวดิ่ง)</td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>วัดจากขอบป้ายหรือจุดสูงสุดของโครงสร้างป้าย</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Vertical Crossings */}
      {activeTab === "vertical" && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#ecfdf5", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#065f46", fontSize: "1.05rem" }}>
            🚗 ตารางระยะห่างต่ำสุดในแนวดิ่ง (Vertical Clearance) สำหรับการพาดข้ามจุดต่างๆ
          </div>
          <div style={{ padding: "20px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ลักษณะการพาดผ่าน (ระบบ 115 kV)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ระยะต่ำสุด (เมตร)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>หมายเหตุ / เกณฑ์มาตรฐาน</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Car size={20} className="text-blue-600" />
                    <span><b>ทางสัญจรสำหรับรถยนต์ / ทางหลวงแผ่นดิน</b></span>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>7.50</td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>วัดที่จุดท้องสายตกต่ำสุด (Max Sag @90°C)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Train size={20} className="text-amber-600" />
                    <span><b>ข้ามทางรถไฟ (เหนือสันราง)</b></span>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>h₁ + 4.40</td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>h₁ = ความสูงของขบวนรถไฟหรือตู้สินค้า</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Ship size={20} className="text-cyan-600" />
                    <span><b>แหล่งน้ำที่มีเรือแล่นผ่าน (ความกว้างน้ำ &lt; 50 ม.)</b></span>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>8.20</td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>สำหรับเรือที่มีความสูงไม่เกิน 4.90 เมตร</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Ship size={20} className="text-cyan-600" />
                    <span><b>แหล่งน้ำที่มีเรือแล่นผ่าน (ความกว้างน้ำ 50 - 500 ม.)</b></span>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>10.70</td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>สำหรับเรือที่มีความสูงไม่เกิน 7.30 เมตร</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "14px 16px", color: "#334155", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Building2 size={20} className="text-purple-600" />
                    <span><b>สะพานลอยคนเดินข้ามที่มีหลังคา</b></span>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "bold", color: "#059669", fontSize: "1.1rem" }}>≥ 3.60</td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>วัดจากหลังคาสะพานลอย</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 3: All Horizontal Clearances */}
      {activeTab === "horizontal" && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#1e293b", fontSize: "1.05rem" }}>
            📐 สรุปตารางระยะห่างในแนวราบ (Horizontal Clearances) ทั้งหมด
          </div>
          <div style={{ padding: "20px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", color: "#334155", borderBottom: "2px solid #cbd5e1" }}>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ประเภทโครงสร้าง / สิ่งกีดขวาง</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ระยะสายนิ่ง (ปกติ)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>ระยะสายแกว่ง (ลมแรง)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "bold" }}>การพิจารณา / หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#0f766e" }}>ผนังปิด / ผนังทึบ (ไม่มีหน้าต่าง)</td>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#059669" }}>2.30 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>1.50 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>ผนังทึบที่คนไม่สามารถเอื้อมถึง</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#e11d48" }}>ผนังเปิด / มีหน้าต่าง ประตู ระเบียง</td>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#dc2626" }}>3.10 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>2.30 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>บริเวณที่คนสามารถยื่นมือหรือวัตถุออกไปได้</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#334155" }}>ป้ายโฆษณา / ป้ายประชาสัมพันธ์</td>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#2563eb" }}>3.10 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>2.30 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>ป้องกันคนขึ้นไปซ่อมบำรุงหรือเปลี่ยนป้าย</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#334155" }}>เสาไฟฟ้าแรงต่ำ / เสาสื่อสาร / เสาอื่น</td>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#2563eb" }}>2.30 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>1.50 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>ระหว่างสาย 115 kV กับเสาโครงสร้างอื่น</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#334155" }}>ต้นไม้ใหญ่ / กิ่งไม้ (Tree Clearance)</td>
                  <td style={{ padding: "12px 16px", fontWeight: "bold", color: "#16a34a" }}>3.00 - 4.00 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>2.50 เมตร</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>ระยะรอนสิทธิ์และตัดแต่งกิ่งไม้ตามแนวเขตสายส่ง</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engineering Safety Alert */}
      <div style={{ padding: "18px 20px", backgroundColor: "#fffbeb", borderRadius: "12px", border: "1px solid #fde68a", display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={26} />
        <div>
          <h4 style={{ fontWeight: "bold", color: "#92400e", marginBottom: "4px", fontSize: "1rem" }}>
            ข้อกำหนดความปลอดภัยและการเผื่อระยะ (Safety Margins)
          </h4>
          <p style={{ color: "#b45309", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
            1. <b>การคำนวณระยะหย่อนตัว (Sag):</b> ระยะห่างในแนวดิ่งต้องคิดที่สภาวะอุณหภูมิสายสูงสุด (Maximum Operating Temperature เช่น 75°C - 90°C) ซึ่งสายจะหย่อนตัวลงมามากที่สุด
            <br />
            2. <b>การคำนวณระยะสายแกว่ง (Wind Sway):</b> ระยะห่างในแนวราบต้องคิดที่สภาวะลมพัดปะทะสายแรงสุด (Wind Pressure) เพื่อไม่ให้สายที่แกว่งเข้าใกล้อาคารเกินระยะปลอดภัย
          </p>
        </div>
      </div>

    </div>
  );
}
