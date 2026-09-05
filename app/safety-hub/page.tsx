"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import TopBar from "../components/TopBar";
import "./SafetyHub.css";
import { Upload, X, Download, Copy, CheckCircle2, Calendar, MapPin, FileText, User, Camera } from "lucide-react";

export default function SafetyHubPage() {
  const [images, setImages] = useState<string[]>([]);
  const [projName, setProjName] = useState("");
  const [location, setLocation] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // States for API scraping
  const [wesafeUrl, setWesafeUrl] = useState("");
  const [username, setUsername] = useState("504540"); // Default provided by user
  const [password, setPassword] = useState("Cha16072534--"); // Default provided by user
  const [isScraping, setIsScraping] = useState(false);

  const collageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set default date to today
    const d = new Date();
    const thaiDate = `${d.getDate()} ${["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."][d.getMonth()]} ${d.getFullYear() + 543}`;
    setDateStr(thaiDate);
    
    if (sessionStorage.getItem("pea_role") === 'admin') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  if (isAuthorized === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 h-screen">
        <ShieldCheck size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง (Access Denied)</h1>
        <p className="text-slate-600 text-lg">เมนู <b>รายงาน Safety Hub</b> สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น</p>
      </div>
    );
  }

  if (isAuthorized === null) {
    return <div className="flex-1 bg-slate-50 h-screen"></div>;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleScrape = async () => {
    if (!wesafeUrl || !username || !password) {
      alert("กรุณากรอกลิงก์ WeSafe, รหัสพนักงาน และรหัสผ่านให้ครบถ้วน");
      return;
    }

    // Extract URL if user pasted the entire message text
    const urlMatch = wesafeUrl.match(/https?:\/\/[^\s]+/);
    const finalUrl = urlMatch ? urlMatch[0] : wesafeUrl;

    if (!finalUrl.includes('detail.aspx?WebGetReqNO=')) {
        alert("ลิงก์ไม่ถูกต้อง! ต้องเป็นลิงก์ detail.aspx ที่มี WebGetReqNO");
        return;
    }

    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape-wesafe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        let errMsg = data.error || "เกิดข้อผิดพลาดในการดึงรูป";
        if (data.debug) {
           errMsg += `\n\nDebug Info:\nStatus: ${data.debug.status}\nCookies Sent: ${data.debug.cookieSent ? "YES" : "NO"}`;
           console.log("Debug Info from API:", data.debug);
        }
        throw new Error(errMsg);
      }
      
      if (data.images && data.images.length > 0) {
        // Use direct WeSafe URLs - img tags don't need CORS headers
        setImages(prev => [...prev, ...data.images].slice(0, 4));
        alert(`ดึงรูปสำเร็จ ${data.images.length} รูป`);
      } else {
        const dbg = data.debug ? '\n\nDebug:\n' + data.debug.join('\n') : '';
        alert("ไม่พบรูปภาพในลิงก์นี้ หรืออาจจะยังไม่ได้อัปโหลดรูป" + dbg);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsScraping(false);
    }
  };

  const generateReportText = () => {
    return `📅 วันที่: ${dateStr}
📢 กรย.(ก3) ดำเนินการกิจกรรม SafetyTalk ชี้แจงแผนงาน และพูดคุยเน้นย้ำความปลอดภัย
👷 ผู้ควบคุมงาน: ${supervisor || "-"}
📍 ชื่องาน: ${projName || "-"}
🏢 ในพื้นที่: ${location || "-"}
✅ การเตรียมความพร้อมก่อนปฏิบัติงาน:
- ประชุมชี้แจงอันตรายก่อนปฏิบัติงาน (KYT)
- เน้นย้ำผู้ปฏิบัติงานสวมใส่อุปกรณ์ PPE ครบถ้วน
- ติดตั้งป้ายเตือนและกรวยจราจรในพื้นที่การปฏิบัติงาน
- ตรวจสอบเครื่องมือและอุปกรณ์ก่อนใช้งาน`;
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
                <label>วันที่ (Date)</label>
                <input type="text" value={dateStr} onChange={e => setDateStr(e.target.value)} placeholder="เช่น 5 ก.ย. 2569" />
              </div>

              <div className="form-group">
                <label>ชื่องาน (Project Name)</label>
                <input type="text" value={projName} onChange={e => setProjName(e.target.value)} placeholder="เช่น งานก่อสร้างระบบ 115kV..." />
              </div>
              
              <div className="form-group">
                <label>พื้นที่รับผิดชอบ</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="เช่น กฟจ.กาญจนบุรี" />
              </div>
              
              <div className="form-group">
                <label>ผู้ควบคุมงาน (Supervisor)</label>
                <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="ชื่อผู้ควบคุมงาน" />
              </div>
              
              </div>

            <div className="safety-form mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">ดึงรูปอัตโนมัติ (จาก WeSafe)</h3>
              <p className="text-sm text-slate-500 mb-4">คุณสามารถ Copy ข้อความจาก Webex มาวางในช่องนี้ได้เลย</p>
              
              <div className="form-group">
                <label>ลิงก์ระบบ WeSafe (หรือข้อความจาก Webex)</label>
                <input 
                  type="text" 
                  value={wesafeUrl} 
                  onChange={e => setWesafeUrl(e.target.value)} 
                  placeholder="วางลิงก์ https://wesafe.pea.co.th/admin/detail.aspx?..." 
                />
              </div>
              <div className="flex gap-4">
                <div className="form-group flex-1">
                  <label>รหัสพนักงาน</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username" 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>รหัสผ่าน</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password" 
                  />
                </div>
              </div>
              <button 
                className="btn btn-primary w-full justify-center mt-2"
                onClick={handleScrape}
                disabled={isScraping}
              >
                {isScraping ? "กำลังดึงข้อมูล..." : "ดึงรูปภาพอัตโนมัติ"}
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
                {/* Geometric background elements */}
                <div className="bg-shape bg-shape-1"></div>
                <div className="bg-shape bg-shape-2"></div>
                <img src="/crane.jpg" alt="Crane" className="deco-crane" />
                
                <div className="collage-header-new">
                  <h2>การดำเนินงานด้านความปลอดภัย</h2>
                  <div className="subtitle-en">Safety Report</div>
                  <div className="subtitle-th">แผนกก่อสร้างระบบไฟฟ้า (ผกร.กรย.(ก3))</div>
                </div>

                <div className="collage-info-cards">
                  <div className="info-card">
                    <div className="icon-wrapper"><Calendar className="w-6 h-6 text-white" /></div>
                    <div className="info-text">
                      <span className="info-label">วันที่</span>
                      <span className="info-value">{dateStr}</span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="icon-wrapper"><MapPin className="w-6 h-6 text-white" /></div>
                    <div className="info-text">
                      <span className="info-label">สถานที่</span>
                      <span className="info-value">{location || "-"}</span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="icon-wrapper"><FileText className="w-6 h-6 text-white" /></div>
                    <div className="info-text">
                      <span className="info-label">ชื่องาน</span>
                      <span className="info-value">{projName || "-"}</span>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="icon-wrapper"><User className="w-6 h-6 text-white" /></div>
                    <div className="info-text">
                      <span className="info-label">ผู้ควบคุมงาน</span>
                      <span className="info-value">{supervisor || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="section-divider">
                  <div className="section-title">
                    <div className="icon-camera"><Camera className="w-5 h-5 text-white" /></div>
                    <span>ภาพการปฏิบัติงาน</span>
                  </div>
                  <div className="line-divider"></div>
                  <div className="polygon-deco"></div>
                </div>

                <div className={`collage-photos-dynamic layout-${images.length || 0}`}>
                  {images.map((src, i) => (
                    <div key={i} className="photo-slot">
                      <img src={src} alt={`Pic ${i+1}`} />
                    </div>
                  ))}
                  {images.length === 0 && (
                     <div className="photo-slot empty"><p>เพิ่มรูปภาพเพื่อแสดงผล (1-4 รูป)</p></div>
                  )}
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
