"use client";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import TopBar from "../components/TopBar";
import "./SafetyHub.css";
import { Upload, X, Download, Copy, CheckCircle2, Calendar, MapPin, FileText, User, Camera, ShieldCheck, Save, Clock, PenSquare, Eye, Trash2, Edit } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function SafetyHubPage() {
  const [images, setImages] = useState<string[]>([]);
  const [projName, setProjName] = useState("");
  const [location, setLocation] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  // Tabs and History
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [isSaving, setIsSaving] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      // We need to move fetchHistory up as well, or just declare it inside useEffect, or use supabase directly.
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const { data, error } = await supabase
            .from('safety_reports')
            .select('*')
            .order('report_date', { ascending: false });
            
          if (error) throw error;
          setHistoryData(data || []);
        } catch (err) {
          console.error("Error fetching history:", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      
      fetchHistory();
    }
  }, [activeTab]);
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
    
    try {
      if (sessionStorage.getItem("pea_role") === 'admin') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
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
        // Proxy images to avoid CORS issue with html2canvas
        const proxiedImages = data.images.map((imgUrl: string) => 
           imgUrl.startsWith('https://wesafe.pea.co.th') 
             ? `/api/proxy-image?url=${encodeURIComponent(imgUrl)}`
             : imgUrl
        );
        setImages(prev => [...prev, ...proxiedImages].slice(0, 4));
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
🏢 สถานที่ปฏิบัติงาน: ${location || "-"}
✅ การเตรียมความพร้อมก่อนปฏิบัติงาน:
- ประชุมชี้แจงอันตรายก่อนปฏิบัติงาน (KYT)
- เน้นย้ำผู้ปฏิบัติงานสวมใส่อุปกรณ์ PPE ครบถ้วน
- ติดตั้งป้ายเตือนและกรวยยางในพื้นที่การปฏิบัติงาน
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



  const saveToHistory = async () => {
    if (!collageRef.current) return;
    
    if (!projName || !location || !supervisor) {
      if (!confirm("ข้อมูลบางช่องยังไม่ครบถ้วน ต้องการบันทึกประวัติหรือไม่?")) {
        return;
      }
    }

    setIsSaving(true);
    try {
      // 1. Generate Image and compress to JPEG
      const canvas = await html2canvas(collageRef.current, { scale: 1.5, useCORS: true });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Compress to 70% quality JPEG
      
      // Convert DataURL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      // 2. Upload to Supabase Storage
      const fileName = `safety_hub_${new Date().getTime()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('project_images')
        .upload(fileName, blob, { contentType: 'image/jpeg' });
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('project_images')
        .getPublicUrl(fileName);
        
      // 3. Save to database
      const reportDate = new Date().toISOString().split('T')[0]; // Current date for sorting
      
      const { error: dbError } = await supabase
        .from('safety_reports')
        .insert({
          report_date: reportDate,
          date_str: dateStr,
          project_name: projName,
          location: location,
          supervisor: supervisor,
          report_text: generateReportText(),
          image_url: publicUrlData.publicUrl
        });
        
      if (dbError) throw dbError;
      
      alert("บันทึกประวัติเรียบร้อยแล้ว!");
      setActiveTab('history'); // Switch to history tab
      
    } catch (err: any) {
      console.error("Error saving history:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกประวัติ: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistory = async (id: string, imageUrl: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประวัตินี้?")) return;
    try {
      // Optionally delete from storage (extract filename from URL)
      if (imageUrl) {
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from('project_images').remove([fileName]);
      }
      
      const { error } = await supabase.from('safety_reports').delete().eq('id', id);
      if (error) throw error;
      
      setHistoryData(prev => prev.filter(r => r.id !== id));
      alert("ลบประวัติสำเร็จ");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาดในการลบ: " + err.message);
    }
  };

  const handleUpdateHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('safety_reports')
        .update({
          date_str: editingReport.date_str,
          project_name: editingReport.project_name,
          location: editingReport.location,
          supervisor: editingReport.supervisor,
          report_text: editingReport.report_text
        })
        .eq('id', editingReport.id);
        
      if (error) throw error;
      
      setHistoryData(prev => prev.map(r => r.id === editingReport.id ? editingReport : r));
      setEditingReport(null);
      alert("แก้ไขประวัติสำเร็จ! (หมายเหตุ: การแก้ไขนี้จะไม่เปลี่ยนรูปภาพที่ถูกสร้างไปแล้ว)");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาดในการแก้ไข: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Group history by month
  const groupedHistory = historyData.reduce((acc, curr) => {
    const date = new Date(curr.report_date);
    const monthYear = date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <TopBar title="ระบบรายงานความปลอดภัย (Safety Hub)" />
      <div className="safety-hub-container">
        
        <div className="safety-tabs">
          <button 
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <PenSquare className="w-4 h-4 inline-block mr-2" /> สร้างรายงาน
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock className="w-4 h-4 inline-block mr-2" /> ประวัติรายงาน
          </button>
        </div>

        {activeTab === 'create' && (
          <>
        <div className="safety-header">
          <h1>Safety Hub Report <span className="text-sm md:text-base font-normal text-slate-500 ml-2 inline-block">(ต้องใช้งานผ่านเว็บและเครื่อง host เท่านั้น)</span></h1>
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
                <label>สถานที่ปฏิบัติงาน</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="เช่น จ.กาญจนบุรี" list="locations-list" />
                <datalist id="locations-list">
                  <option value="จ.นครปฐม" />
                  <option value="จ.สุพรรณบุรี" />
                  <option value="จ.กาญจนบุรี" />
                  <option value="จ.สมุทรสาคร" />
                </datalist>
              </div>
              
              <div className="form-group">
                <label>ผู้ควบคุมงาน (Supervisor)</label>
                <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="ชื่อผู้ควบคุมงาน" list="personnel-list" />
                <datalist id="personnel-list">
                  <option value="พิสันติ์ จิตต์ปลื้ม หผ.กร." />
                  <option value="ชานินทร์ ศรีสวัสดิ์ ชผ.กร." />
                  <option value="อุดมศักดิ์ จันทร์กลิ่น พชง.7" />
                  <option value="ศราวุฒิ เกิดสีเล็ก พชง.6" />
                  <option value="ศุภวิชญ์ เกาะลอย พชง.6" />
                  <option value="วีรพัฒน์ นาคลมัย พชง.6" />
                  <option value="ขวัญนคร ศรีจันทร์อินทร์ พชง.5" />
                  <option value="กิตติพิชญ์ ประกอบทรัพย์ พชง.5" />
                  <option value="นฤเบศ ยันตรีสิงห์ พชง.5" />
                </datalist>
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
                <div className="flex gap-2">
                  <button onClick={saveToHistory} className="btn btn-secondary bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" disabled={isSaving}>
                    {isSaving ? "กำลังบันทึก..." : <><Save className="w-4 h-4" /> บันทึกประวัติ</>}
                  </button>
                  <button onClick={downloadCollage} className="btn btn-primary">
                    <Download className="w-4 h-4" /> บันทึกรูปลงเครื่อง
                  </button>
                </div>
              </div>

              {/* The actual element to capture */}
              <div ref={collageRef} className="collage-board">
                {/* Geometric background elements */}
                <div className="bg-shape bg-shape-1"></div>
                <div className="bg-shape bg-shape-2"></div>
                <img src="/crane.png" alt="Crane" className="deco-crane" />
                
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
                      <img src={src} alt={`Pic ${i+1}`} crossOrigin="anonymous" />
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
          </>
        )}

        {activeTab === 'history' && (
          <div className="history-container">
            <div className="safety-header mb-2">
              <h1>ประวัติการรายงานความปลอดภัย</h1>
              <p>คุณสามารถเรียกดูและคัดลอกรายงานย้อนหลังได้จากที่นี่</p>
            </div>

            {loadingHistory ? (
              <div className="text-center py-10 text-slate-500">กำลังโหลดประวัติ...</div>
            ) : Object.keys(groupedHistory).length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                ยังไม่มีประวัติการรายงาน
              </div>
            ) : (
              Object.entries(groupedHistory).map(([month, reports]) => (
                <div key={month} className="history-month-section">
                  <h2 className="history-month-title">{month}</h2>
                  <div className="history-grid">
                    {(reports as any[]).map((report: any) => (
                      <div key={report.id} className="history-card">
                        <div className="history-card-img-wrapper cursor-pointer" onClick={() => setViewingImage(report.image_url)}>
                          {report.image_url ? (
                            <img src={report.image_url} alt="Safety Report" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">ไม่มีรูปภาพ</div>
                          )}
                        </div>
                        <div className="history-card-content">
                          <div className="history-card-date">{report.date_str}</div>
                          <div className="history-card-title">{report.project_name || 'ไม่ระบุชื่องาน'}</div>
                          <div className="history-card-info">
                            <MapPin className="inline w-3 h-3 mr-1" />{report.location || '-'} <br/>
                            <User className="inline w-3 h-3 mr-1 mt-1" />{report.supervisor || '-'}
                          </div>
                          
                          <div className="history-card-actions mb-2">
                            <button 
                              className="btn-view"
                              onClick={() => setViewingImage(report.image_url)}
                            >
                              <Eye className="w-4 h-4" /> ดูรูป
                            </button>
                            <button 
                              className="btn-copy-text"
                              onClick={() => {
                                navigator.clipboard.writeText(report.report_text);
                                alert("คัดลอกข้อความแล้ว!");
                              }}
                            >
                              <Copy className="w-4 h-4" /> ก๊อปข้อความ
                            </button>
                          </div>
                          <div className="history-card-actions">
                            <button 
                              className="btn-view text-orange-600 border-orange-200 hover:bg-orange-50"
                              onClick={() => setEditingReport(report)}
                            >
                              <Edit className="w-4 h-4" /> แก้ไข
                            </button>
                            <button 
                              className="btn-copy-text text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDeleteHistory(report.id, report.image_url)}
                            >
                              <Trash2 className="w-4 h-4" /> ลบ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Full Image Viewer Modal */}
        {viewingImage && (
          <div className="image-modal-overlay" onClick={() => setViewingImage(null)}>
            <div className="image-modal-content" onClick={e => e.stopPropagation()}>
              <button className="image-modal-close" onClick={() => setViewingImage(null)}>
                <X className="w-5 h-5" />
              </button>
              <img src={viewingImage} className="image-modal-img" alt="Full Report" />
            </div>
          </div>
        )}

      </div>

        {/* Edit Report Modal */}
        {editingReport && (
          <div className="fixed inset-0 bg-slate-900/60 z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">แก้ไขประวัติรายงาน</h2>
                <button onClick={() => setEditingReport(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm mb-6 border border-amber-200">
                <b>หมายเหตุ:</b> การแก้ไขข้อมูลนี้จะอัปเดตเฉพาะข้อความเท่านั้น ไม่สามารถเปลี่ยนแปลงรายละเอียดในรูปภาพรายงานที่ถูกสร้างและฝังเนื้อหาไปแล้วได้
              </div>

              <form onSubmit={handleUpdateHistory} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่ (Date)</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-md" value={editingReport.date_str} onChange={e => setEditingReport({...editingReport, date_str: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่องาน (Project Name)</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-md" value={editingReport.project_name || ''} onChange={e => setEditingReport({...editingReport, project_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">สถานที่ปฏิบัติงาน</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-md" value={editingReport.location || ''} onChange={e => setEditingReport({...editingReport, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ผู้ควบคุมงาน</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded-md" value={editingReport.supervisor || ''} onChange={e => setEditingReport({...editingReport, supervisor: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ข้อความรายงาน (ที่ใช้ก๊อปปี้ส่งไลน์)</label>
                  <textarea className="w-full p-2 border border-slate-300 rounded-md h-40" value={editingReport.report_text} onChange={e => setEditingReport({...editingReport, report_text: e.target.value})} required />
                </div>
                
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setEditingReport(null)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
                    ยกเลิก
                  </button>
                  <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </>
  );
}
