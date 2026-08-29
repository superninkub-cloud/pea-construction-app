"use client";

import { useState, useRef, useEffect } from "react";
import TopBar from "../components/TopBar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from "../../lib/supabaseClient";
import { Project } from "../../lib/types";

export default function TecoChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedWbs, setSelectedWbs] = useState<string>("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('wbs, name, scrap_wires_data')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProjects((data as unknown as Project[]) || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setSelectedWbs("");
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const checkDocument = async () => {
    if (!selectedWbs) {
      setError("กรุณาเลือกโครงการก่อสร้างก่อน");
      return;
    }
    if (!file) {
      setError("กรุณาเลือกไฟล์เอกสาร ZPSR018 (PDF)");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const selectedProject = projects.find(p => p.wbs === selectedWbs);
    const projectName = selectedProject?.name || "";
    const scrapData = selectedProject?.scrap_wires_data ? JSON.stringify(selectedProject.scrap_wires_data) : "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("wbs", selectedWbs);
    formData.append("projectName", projectName);
    formData.append("scrapData", scrapData);

    try {
      const response = await fetch("/api/check-teco", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการวิเคราะห์เอกสาร");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar title="ตรวจสอบ TECO (ZPSR018)" />
      
      <div className="content-area">
        <div className="budget-transfer-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
          <div className="modern-card">
            <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', borderRadius: '12px', color: 'var(--pea-purple)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <span className="gradient-text">ระบบ AI ตรวจสอบเอกสารก่อนปิดงาน</span>
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
              เลือกโครงการและอัปโหลดไฟล์เอกสาร ZPSR018 (PDF) ระบบจะใช้ AI วิเคราะห์ความครบถ้วนของการเบิก-คืนพัสดุ งบประมาณ และ PR/PO อัตโนมัติ
            </p>

            {/* Project Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                1. เลือกโครงการ (WBS)
              </label>
              <select 
                className="input-field" 
                value={selectedWbs} 
                onChange={(e) => setSelectedWbs(e.target.value)}
                disabled={loading}
              >
                <option value="">-- เลือกโครงการ --</option>
                {projects.map(p => (
                  <option key={p.wbs} value={p.wbs}>
                    {p.wbs} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              2. อัปโหลดไฟล์ ZPSR018
            </label>

            {/* Upload Area */}
            {!file ? (
              <div 
                className={`modern-upload-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }} 
                />
                <div className="icon-circle">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <h3 style={{ marginBottom: '8px', color: '#1e293b' }}>ลากไฟล์ PDF มาวางที่นี่</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>หรือคลิกเพื่อเลือกไฟล์เอกสาร ZPSR018 (ส่วนที่ 2)</p>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--pea-purple)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f5f3ff',
                boxShadow: '0 4px 12px rgba(116, 56, 163, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pea-purple)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.05rem', marginBottom: '2px' }}>{file.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {(file.size / 1024).toFixed(1)} KB • เอกสารพร้อมตรวจสอบ
                    </div>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  style={{ 
                    background: 'white', border: '1px solid #e2e8f0', color: '#64748b', 
                    cursor: 'pointer', padding: '10px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            {error && (
              <div style={{ 
                marginTop: '16px', padding: '12px 16px', 
                backgroundColor: '#fef2f2', color: '#ef4444', 
                borderRadius: '8px', fontSize: '0.9rem' 
              }}>
                {error}
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary modern-btn" 
                onClick={checkDocument}
                disabled={!file || loading}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px',
                  opacity: (!file || loading) ? 0.7 : 1,
                  padding: '12px 24px',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, var(--pea-purple) 0%, #9f7aea 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"></circle>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                    กำลังประมวลผลด้วย AI...
                  </>
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    เริ่มตรวจสอบเอกสาร
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="result-card" style={{ marginTop: '32px', animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px',
                  color: 'var(--pea-purple)',
                  margin: 0,
                  fontSize: '1.25rem'
                }}>
                  <div style={{ padding: '8px', background: '#f5f3ff', borderRadius: '10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </div>
                  ผลวิเคราะห์จาก AI
                </h3>
                
                <div style={{ display: 'flex', gap: '12px' }} className="no-print">
                  <button 
                    className="modern-btn" 
                    onClick={() => {
                      const shareText = encodeURIComponent(`แจ้งผลการตรวจสอบเอกสาร ZPSR018 (WBS: ${selectedWbs})\nกรุณาเข้าระบบเพื่อดูรายงาน AI แบบเต็ม`);
                      const currentUrl = encodeURIComponent(window.location.href);
                      window.open(`https://social-plugins.line.me/lineit/share?url=${currentUrl}&text=${shareText}`, '_blank');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#00B900', color: 'white', border: 'none' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    แชร์ LINE
                  </button>
                  <button 
                    className="modern-btn" 
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#334155' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    พิมพ์รายงาน
                  </button>
                </div>
              </div>
              
              <div 
                style={{ 
                  backgroundColor: 'white', 
                  padding: '32px', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
                }}
                className="markdown-content"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
