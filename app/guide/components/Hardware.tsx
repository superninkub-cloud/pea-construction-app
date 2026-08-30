import React from "react";
import { Wrench, Settings } from "lucide-react";

export default function Hardware() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Wrench className="text-slate-500" /> อุปกรณ์ประกอบฮาร์ดแวร์
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          ฮาร์ดแวร์และอุปกรณ์ประกอบสายส่งต่างๆ ที่ใช้ร่วมกับลูกถ้วยและสายไฟฟ้า
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        
        {/* Hardware Items */}
        <HardwareItem 
          title="อาร์คซิ่งฮอร์น (Arcing Horn)" 
          desc="ป้องกันลูกถ้วยเสียหายจากการเกิด Flashover โดยให้ Flashover วิ่งผ่านอาร์คซิ่งฮอร์นแทนลูกถ้วย"
        />
        <HardwareItem 
          title="แคล้มป์แขวน (Suspension Clamp)" 
          desc="ใช้จับสายไฟฟ้า มีปรีฟอร์มพันทับสายก่อนเพื่อป้องกันการหักงอจากลมแกว่ง ทนแรงดึงได้ไม่น้อยกว่า 8,200 kg"
        />
        <HardwareItem 
          title="สเตรนด์แคล้มป์ (Strain Clamp)" 
          desc="สำหรับจับสายไฟฟ้าในแนวนอน (Dead-end) ปรับความตึงสายได้ ทนแรงดึง 8,200 kg (สำหรับ AAC 400)"
        />
        <HardwareItem 
          title="ไวร์เบรชั่นแดมเปอร์ (Vibration Damper)" 
          desc="ติดตั้งใกล้กับแคล้มป์ เพื่อลดการสั่นสะเทือนของสายที่เกิดจากลมพัด ป้องกันสายขาด"
        />
        <HardwareItem 
          title="ลูกบอลแสดงแนวสาย (Spherical Markers)" 
          desc="ลูกบอลสีขาวสลับส้ม ขนาดเส้นผ่านศูนย์กลาง 0.5 เมตร ติดบนสายกราวด์เพื่อเป็นจุดสังเกตสำหรับนักบิน"
        />
        <HardwareItem 
          title="กายทิมเบิ้ล & เคลวิส (Guy Thimble & Clevis)" 
          desc="อุปกรณ์เข้าปลายสายยึดโยงหรือสายกราวด์ ป้องกันการหักงอ หรือรอยถลอกของสาย"
        />
      </div>
    </div>
  );
}

function HardwareItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", gap: "15px", alignItems: "flex-start", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ backgroundColor: "#f1f5f9", padding: "10px", borderRadius: "8px", color: "#475569", flexShrink: 0 }}>
        <Settings size={20} />
      </div>
      <div>
        <h4 style={{ fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>{title}</h4>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5", margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}
