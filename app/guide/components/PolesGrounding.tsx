import React from "react";
import { MapPin, ArrowDown } from "lucide-react";

export default function PolesGrounding() {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease-in-out" }}>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <MapPin className="text-teal-600" /> เสาคอนกรีตอัดแรง และระบบต่อลงดิน
        </h2>
        <p style={{ color: "#475569", lineHeight: "1.6" }}>
          มาตรฐานเสาคอนกรีตอัดแรง 22 เมตร และระบบ Grounding สำหรับสายส่ง 115 kV
        </p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#f0fdfa", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#0f766e" }}>
          เสาคอนกรีตอัดแรง (Prestressed Concrete Pole) 22 ม.
        </div>
        <div style={{ padding: "20px", color: "#475569", fontSize: "0.95rem" }}>
          <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li><b>ความต้านทานโมเมนต์ใช้งาน (Working Moment):</b> ไม่น้อยกว่า 18,000 กก.-ม. (ที่ระดับ 2.00 ม. จากโคนเสา)</li>
            <li><b>แรงอัดประลัยของคอนกรีต (Ultimate Compressive Strength):</b> ไม่น้อยกว่า 500 กก./ตร.ซม. (ทดสอบอายุ 28 วัน)</li>
            <li><b>สายดินในเสา:</b> ใช้เหล็กเส้นกลมขนาด 12 มม. ฝังในเสาคอนกรีต และเชื่อมต่อกราวด์เพลท (Ground Plate) 7 จุด</li>
            <li><b>หน้าตัดเสา:</b> ยอดเสา 25x25 ซม. / โคนเสา 44x44 ซม.</li>
          </ul>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "10px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ fontWeight: "bold", color: "#0d9488", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowDown size={18} /> Ground Rod (GR)
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
            แท่งกราวร็อดชุบสังกะสี ยาว 2 เมตร ตอกลึก 0.5 เมตร เหมาะสำหรับพื้นที่ดินอ่อน ดินเหนียว ที่มีความต้านทานจำเพาะ 1-174 โอห์ม-เมตร (ใช้ 1 ถึง 5 แท่ง)
          </p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <h3 style={{ fontWeight: "bold", color: "#0d9488", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowDown size={18} /> Ground Strip (GS)
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5" }}>
            แผ่นเหล็กชุบสังกะสีขนาด 30x3.5 มม. ยาว 10 เมตร ฝังลึก 0.5 เมตร เหมาะสำหรับพื้นที่ดินแข็ง หินปนทราย ที่มีความต้านทาน 175-262 โอห์ม-เมตร
          </p>
        </div>
      </div>
    </div>
  );
}
