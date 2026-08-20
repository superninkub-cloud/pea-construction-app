"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, ArrowRight, ArrowRightLeft, UploadCloud, Loader2, HelpCircle, Lightbulb, ShieldCheck, FileType } from 'lucide-react';

type TransferItem = {
  id: string;
  networkFrom: string;
  categoryFrom: string;
  networkTo: string;
  categoryTo: string;
  amount: number;
};

type NetworkDiff = {
  network: string;
  networkName: string;
  differences: Record<string, number>;
};

export default function BudgetTransferPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [docNo, setDocNo] = useState('');
  const [date, setDate] = useState('');
  const [wbs, setWbs] = useState('');
  const [projectName, setProjectName] = useState('');
  
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const categories = [
    "ค่าแรง",
    "ค่าควบคุมงาน",
    "ค่าขนส่ง",
    "ค่าเบ็ดเตล็ด",
    "ค่าดำเนินการ"
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('wbs', wbs);

    try {
      const res = await fetch('/api/extract-budget-transfer', {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to extract data');
        } else {
          // Fallback if Vercel returns HTML (e.g. 504 Timeout or 413 Payload Too Large)
          const text = await res.text();
          throw new Error(`Server Error (${res.status}): The request might have timed out or the file is too large.`);
        }
      }

      if (contentType && contentType.includes("application/json")) {
        const data: NetworkDiff[] = await res.json();
        autoCalculateTransfers(data);
        setCurrentStep(2);
      } else {
        throw new Error('Invalid response from server. Expected JSON.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const autoCalculateTransfers = (data: NetworkDiff[]) => {
    let deficits: { network: string; category: string; amount: number }[] = [];
    let surpluses: { network: string; category: string; amount: number }[] = [];

    data.forEach(net => {
      Object.entries(net.differences).forEach(([cat, amount]) => {
        let normalizedCat = cat.replace('งาน', ''); 
        if (cat.includes('แรง')) normalizedCat = 'ค่าแรง';
        if (cat.includes('ควบคุม')) normalizedCat = 'ค่าควบคุมงาน';
        if (cat.includes('ขนส่ง')) normalizedCat = 'ค่าขนส่ง';
        if (cat.includes('เบ็ดเตล็ด')) normalizedCat = 'ค่าเบ็ดเตล็ด';
        if (cat.includes('ดำเนินการ')) normalizedCat = 'ค่าดำเนินการ';

        if (categories.includes(normalizedCat)) {
          if (amount < 0) {
            deficits.push({ network: net.network, category: normalizedCat, amount: Math.abs(amount) });
          } else if (amount > 0) {
            surpluses.push({ network: net.network, category: normalizedCat, amount: amount });
          }
        }
      });
    });

    const newTransfers: TransferItem[] = [];
    
    for (let d of deficits) {
      let needed = d.amount;
      for (let s of surpluses) {
        if (needed <= 0.001) break;
        if (s.amount <= 0.001) continue;

        const transferAmount = Math.min(needed, s.amount);
        
        newTransfers.push({
          id: Math.random().toString(36).substr(2, 9),
          networkFrom: s.network,
          categoryFrom: s.category,
          networkTo: d.network,
          categoryTo: d.category,
          amount: Number(transferAmount.toFixed(2))
        });

        needed -= transferAmount;
        s.amount -= transferAmount;
      }
    }
    
    setTransfers(newTransfers);
  };

  const addTransfer = () => {
    setTransfers([
      ...transfers,
      {
        id: Math.random().toString(36).substr(2, 9),
        networkFrom: '',
        categoryFrom: '',
        networkTo: '',
        categoryTo: '',
        amount: 0
      }
    ]);
  };

  const handleSave = () => {
    window.print();
    alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
    setDocNo('');
    setDate('');
    setWbs('');
    setProjectName('');
    setTransfers([]);
    setUploadError('');
    setCurrentStep(1);
  };

  const updateTransfer = (id: string, field: keyof TransferItem, value: string | number) => {
    setTransfers(transfers.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const removeTransfer = (id: string) => {
    setTransfers(transfers.filter(t => t.id !== id));
  };

  const totalAmount = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
            โปรแกรมทำเอกสารโอนงบค่าใช้จ่ายหน้างาน
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            สร้างและจัดการเอกสารโอนงบประมาณอย่างมีประสิทธิภาพ
          </p>
        </div>
        <button className="btn btn-outline">
          <HelpCircle size={18} />
          คู่มือการใช้งาน
        </button>
      </div>

      <div className="wizard-layout">
        
        {/* Main Content Area */}
        <div className="wizard-main">
          
          {/* Stepper */}
          <div className="wizard-stepper">
            <div className={`stepper-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="stepper-circle">1</div>
              <span>ข้อมูลเอกสาร</span>
            </div>
            <div className={`stepper-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="stepper-circle">2</div>
              <span>รายการโอนงบประมาณ</span>
            </div>
            <div className={`stepper-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="stepper-circle">3</div>
              <span>ตรวจสอบและบันทึก</span>
            </div>
          </div>

          {uploadError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              {uploadError}
            </div>
          )}

          {/* Step 1: Info & Upload */}
          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--pea-purple)' }}>
                <FileText size={20} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>ข้อมูลเอกสาร</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div>
                  <label className="form-label">เลขที่เอกสาร</label>
                  <input type="text" className="form-control" placeholder="เช่น ก.3 คชย.(ก3)-" value={docNo} onChange={(e) => setDocNo(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">วันที่เอกสาร</label>
                  <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">หมายเลขงาน (WBS)</label>
                  <input type="text" className="form-control" placeholder="เช่น P-TDD02.3-I-LYAIA.0015" value={wbs} onChange={(e) => setWbs(e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">ชื่องาน</label>
                  <input type="text" className="form-control" placeholder="เช่น งานปรับปรุงระบบจำหน่าย 2..." value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </div>
              </div>

              <label className="form-label" style={{ marginBottom: '12px' }}>อัพโหลดไฟล์ PDF ZPSR018 (เพื่อคำนวณอัตโนมัติ)</label>
              <label className="dropzone" style={{ opacity: isUploading ? 0.5 : 1 }}>
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                <div className="dropzone-icon">
                  {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                </div>
                <div style={{ fontWeight: '600' }}>{isUploading ? 'กำลังประมวลผล AI...' : 'ลากไฟล์ PDF มาวางที่นี่'}</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>หรือคลิกเพื่อเลือกไฟล์</div>
                <div style={{ color: 'var(--pea-purple)', background: 'white', border: '1px solid var(--border-color)', padding: '6px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', marginTop: '8px' }}>
                  <UploadCloud size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  เลือกไฟล์ PDF
                </div>
              </label>

              <div className="wizard-footer">
                <button className="btn btn-outline" onClick={() => { setDocNo(''); setDate(''); setWbs(''); setProjectName(''); }}>ล้างข้อมูล</button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                  ถัดไป <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Transfers Table */}
          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pea-purple)' }}>
                  <ArrowRightLeft size={20} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>รายการโอนงบประมาณ</h2>
                </div>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={addTransfer}>
                  <Plus size={16} /> เพิ่มรายการ
                </button>
              </div>

              {transfers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', background: '#f8fafc', borderRadius: '12px' }}>
                  ยังไม่มีรายการโอน กรุณากลับไปอัพโหลด PDF หรือกด &quot;เพิ่มรายการ&quot;
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th colSpan={2} style={{ textAlign: 'center', background: '#f1f5f9' }}>โอนจาก (Surplus)</th>
                        <th colSpan={2} style={{ textAlign: 'center', background: '#f8fafc' }}>ไปเป็น (Deficit)</th>
                        <th rowSpan={2} style={{ textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                        <th rowSpan={2} style={{ textAlign: 'center' }}>จัดการ</th>
                      </tr>
                      <tr>
                        <th style={{ background: '#f1f5f9' }}>โครงข่าย</th>
                        <th style={{ background: '#f1f5f9' }}>ค่าใช้จ่าย</th>
                        <th style={{ background: '#f8fafc' }}>โครงข่าย</th>
                        <th style={{ background: '#f8fafc' }}>ค่าใช้จ่าย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <input type="text" className="form-control" placeholder="เช่น 6001381477" value={t.networkFrom} onChange={(e) => updateTransfer(t.id, 'networkFrom', e.target.value)} />
                          </td>
                          <td>
                            <select className="form-select" value={t.categoryFrom} onChange={(e) => updateTransfer(t.id, 'categoryFrom', e.target.value)}>
                              <option value="">-- เลือก --</option>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td>
                            <input type="text" className="form-control" placeholder="เช่น 6001381477" value={t.networkTo} onChange={(e) => updateTransfer(t.id, 'networkTo', e.target.value)} />
                          </td>
                          <td>
                            <select className="form-select" value={t.categoryTo} onChange={(e) => updateTransfer(t.id, 'categoryTo', e.target.value)}>
                              <option value="">-- เลือก --</option>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td>
                            <input type="number" className="form-control" style={{ textAlign: 'right' }} placeholder="0.00" value={t.amount || ''} onChange={(e) => updateTransfer(t.id, 'amount', parseFloat(e.target.value))} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => removeTransfer(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>รวมเป็นเงินทั้งสิ้น</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--pea-purple)', fontSize: '1.1rem' }}>{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="wizard-footer">
                <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>กลับ</button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  ตรวจสอบและบันทึก <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--pea-purple)' }}>
                <Save size={20} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>สรุปข้อพิจารณา (สำหรับพิมพ์เอกสาร)</h2>
              </div>
              
              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', lineHeight: '1.8' }}>
                {transfers.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>ไม่มีข้อมูลรายการโอน</p>
                ) : (
                  <>
                    <p style={{ marginBottom: '16px' }}>
                      <strong>เรื่อง:</strong> ขออนุมัติโอนค่าใช้จ่ายหน้างาน<br/>
                      <strong>หมายเลขงาน:</strong> {wbs || '-'}<br/>
                      <strong>ชื่องาน:</strong> {projectName || '-'}
                    </p>
                    <p style={{ marginBottom: '8px' }}>เห็นควรอนุมัติค่าใช้จ่ายหน้างานเพิ่มเติม ดังนี้</p>
                    {transfers.map((t, index) => (
                      <div key={t.id} style={{ paddingLeft: '16px' }}>
                        3.{index + 1} โอน{t.categoryFrom} โครงข่าย {t.networkFrom} ไปเป็น {t.categoryTo} โครงข่าย {t.networkTo} จำนวน {Number(t.amount).toLocaleString('th-TH')} บาท
                      </div>
                    ))}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontWeight: 'bold' }}>
                      รวมเป็นเงินโอนทั้งสิ้น {totalAmount.toLocaleString('th-TH')} บาท
                    </div>
                  </>
                )}
              </div>

              <div className="wizard-footer no-print">
                <button className="btn btn-outline" onClick={() => setCurrentStep(2)}>กลับ</button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={18} /> บันทึกและเสร็จสิ้น
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (Info Panels) */}
        <div className="wizard-sidebar">
          <div className="info-card info-card-blue">
            <div className="info-card-header">
              <Lightbulb className="info-card-icon" size={20} />
              คำแนะนำ
            </div>
            <ul className="info-list">
              <li>กรอกข้อมูลเอกสารให้ครบถ้วน</li>
              <li>อัพโหลดไฟล์ PDF ของเอกสารต้นฉบับ</li>
              <li>ตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก</li>
              <li>สามารถเพิ่มรายการโอนงบประมาณในขั้นตอนถัดไป</li>
            </ul>
          </div>

          <div className="info-card info-card-green">
            <div className="info-card-header">
              <ShieldCheck className="info-card-icon" size={20} />
              ความปลอดภัย
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.5' }}>
              ระบบเข้ารหัสข้อมูล และจัดเก็บเอกสารอย่างปลอดภัยตามมาตรฐานสากล
            </p>
          </div>

          <div className="info-card info-card-purple">
            <div className="info-card-header">
              <FileType className="info-card-icon" size={20} />
              ประเภทไฟล์ที่รองรับ
            </div>
            <ul className="info-list" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
              <li style={{ display: 'list-item' }}>PDF เท่านั้น</li>
              <li style={{ display: 'list-item' }}>ขนาดไฟล์ไม่เกิน 50MB</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
