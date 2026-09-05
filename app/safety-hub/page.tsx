"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import TopBar from "../components/TopBar";
import "./SafetyHub.css";
import { Upload, X, Download, Copy, CheckCircle2 } from "lucide-react";

export default function SafetyHubPage() {
  const [images, setImages] = useState<string[]>([]);
  const [projName, setProjName] = useState("");
  const [location, setLocation] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [workerCount, setWorkerCount] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default date to today
    const d = new Date();
    const thaiDate = `${d.getDate()} ${["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."][d.getMonth()]} ${d.getFullYear() + 543}`;
    setDateStr(thaiDate);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateReportText = () => {
    return `📢 รายงานความปลอดภัยประจำวัน (Safety Report)
📅 วันที่: ${dateStr}
📍 ชื่องาน: ${projName || "-"}
🏢 สถานที่: ${location || "-"}
👷 ผู้ควบคุมงาน: ${supervisor || "-"}
👥 จำนวนผู้ปฏิบัติงาน: ${workerCount || "0"} คน

✅ การเตรียมความพร้อมก่อนปฏิบัติงาน:
- มีการประชุมชี้แจงอันตรายก่อนปฏิบัติงาน (KYT)
- ผู้ปฏิบัติงานสวมใส่อุปกรณ์ PPE ครบถ้วน
- ติดตั้งป้ายเตือนและกรวยจราจรในพื้นที่การทำงานเรียบร้อย
- ตรวจสอบเครื่องมือและอุปกรณ์ก่อนใช้งาน

สถานการณ์ปกติ ไม่มีอุบัติเหตุเกิดขึ้น
จึงเรียนมาเพื่อโปรดทราบ`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReportText());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadCollage = async () => {
    if (collageRef.current) {
      try {
        const canvas = await html2canvas(collageRef.current, { scale: 2, useCORS: true });
        const link = document.createElement("a");
        link.download = `Safety-Report-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Error generating collage:", err);
        alert("เกิดข้อผิดพลาดในการสร้างรูปภาพ");
      }
    }
  };

  return (
    <>
      <TopBar title="ระบบรายงานความปลอดภัย (Safety Hub)" />
      <div className="safety-hub-container">
        <div className="safety-header">
          <h1>Safety Hub Report</h1>
          <p>ระบบสร้างภาพรายงานความปลอดภัยและข้อความอัตโนมัติ สำหรับ ผกร.กรย.(ก3)</p>
        </div>

        <div className="safety-grid">
          {/* Left Column: Form & Upload */}
          <div className="safety-sidebar">
            <div className="safety-form mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">ข้อมูลรายงาน</h3>
              
              <div className="form-group">
                <label>ชื่องาน (Project Name)</label>
                <input type="text" value={projName} onChange={e => setProjName(e.target.value)} placeholder="เช่น งานก่อสร้างระบบ 115kV..." />
              </div>
              
              <div className="form-group">
                <label>สถานที่ (Location)</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="เช่น บริเวณสามแยก..." />
              </div>
              
              <div className="form-group">
                <label>ผู้ควบคุมงาน (Supervisor)</label>
                <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="ชื่อผู้ควบคุมงาน" />
              </div>
              
              <div className="form-group">
                <label>จำนวนผู้ปฏิบัติงาน (คน)</label>
                <input type="number" value={workerCount} onChange={e => setWorkerCount(e.target.value)} placeholder="เช่น 5" />
              </div>
            </div>

            <div className="safety-form mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">ดึงรูปอัตโนมัติ (จาก WeSafe)</h3>
              
              <div className="form-group">
                <label>ลิงก์ระบบ WeSafe</label>
                <input type="url" placeholder="https://..." />
              </div>
              <div className="flex gap-4">
                <div className="form-group flex-1">
                  <label>รหัสพนักงาน</label>
                  <input type="text" placeholder="Username" />
                </div>
                <div className="form-group flex-1">
                  <label>รหัสผ่าน</label>
                  <input type="password" placeholder="Password" />
                </div>
              </div>
              <button 
                className="btn btn-primary w-full justify-center mt-2"
                onClick={() => alert('กำลังพัฒนาระบบดูดรูปอัตโนมัติ (กรุณารอข้อมูล URL ของ WeSafe เพื่อเชื่อมต่อ API)')}
              >
                ดึงรูปภาพอัตโนมัติ
              </button>
            </div>

            <div className="safety-form">
              <h3 className="text-lg font-bold text-slate-800 mb-4">อัปโหลดรูปภาพ (สูงสุด 4 รูป)</h3>
              
              <label className="upload-zone block">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={images.length >= 4} />
                <Upload className="w-8 h-8 mx-auto" />
                <p>คลิกเพื่อเลือกรูปภาพจาก WeSafe<br/><span className="text-xs text-slate-400">(หรือรูปจากกล้องของคุณ)</span></p>
              </label>

              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((src, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={src} alt={`upload-${i}`} />
                      <button onClick={() => removeImage(i)} className="remove-btn">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview & Collage */}
          <div className="canvas-section">
            <div className="collage-container flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">ตัวอย่างรูปรายงาน</h3>
                <button onClick={downloadCollage} className="btn btn-primary">
                  <Download className="w-4 h-4" /> บันทึกรูปภาพ
                </button>
              </div>

              {/* The actual element to capture */}
              <div ref={collageRef} className="collage-board">
                <div className="collage-header">
                  <img src="/PEA-Logo.png" alt="PEA Logo" className="collage-logo" crossOrigin="anonymous" />
                  <div className="collage-title">
                    <h2>รายงานความปลอดภัย (Safety Report)</h2>
                    <p>แผนกกอสร้างระบบไฟฟ้า (ผกร.กรย.(ก3))</p>
                  </div>
                </div>

                <div className="collage-info">
                  <div className="info-item"><span className="info-label">วันที่:</span><span className="info-value">{dateStr}</span></div>
                  <div className="info-item"><span className="info-label">สถานที่:</span><span className="info-value">{location || "-"}</span></div>
                  <div className="info-item" style={{ gridColumn: 'span 2' }}><span className="info-label">ชื่องาน:</span><span className="info-value">{projName || "-"}</span></div>
                  <div className="info-item"><span className="info-label">ผู้ควบคุมงาน:</span><span className="info-value">{supervisor || "-"}</span></div>
                  <div className="info-item"><span className="info-label">จำนวนคนงาน:</span><span className="info-value">{workerCount ? workerCount + ' คน' : "-"}</span></div>
                </div>

                <div className="collage-photos">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`photo-slot ${!images[i] ? 'empty' : ''}`}>
                      {images[i] ? (
                        <img src={images[i]} alt={`Pic ${i+1}`} crossOrigin="anonymous" />
                      ) : (
                        <span>รูปภาพที่ {i+1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="report-text-section">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">ข้อความรายงานประจำวัน</h3>
                <button onClick={copyToClipboard} className="btn btn-secondary">
                  {isCopied ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> คัดลอกแล้ว</> : <><Copy className="w-4 h-4" /> คัดลอกข้อความ</>}
                </button>
              </div>
              <div className="report-text-box">
                {generateReportText()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
