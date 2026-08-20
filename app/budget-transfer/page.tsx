"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, ArrowRight, ArrowRightLeft, UploadCloud, Loader2, HelpCircle, Lightbulb, ShieldCheck, FileType } from 'lucide-react';

type BudgetCategory = {
  budget: number;
  disbursed: number;
  remaining: number;
};

type NetworkData = {
  network: string;
  networkName: string;
  categories: Record<string, BudgetCategory>;
};

type TransferItem = {
  id: string;
  networkFrom: string;
  categoryFrom: string;
  networkTo: string;
  categoryTo: string;
  amount: number;
};

export default function BudgetTransferPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 Form Data
  const [docNo, setDocNo] = useState('');
  const [date, setDate] = useState('');
  const [wbs, setWbs] = useState('');
  const [projectName, setProjectName] = useState('');
  
  // Additional Official Memo Fields
  const [refDocNo, setRefDocNo] = useState('');
  const [refDocDate, setRefDocDate] = useState('');
  const [docFrom, setDocFrom] = useState('กชย.(ก3)');
  const [docTo, setDocTo] = useState('ฝวบ.(ก3)');
  const [supervisorName, setSupervisorName] = useState('');
  const [signer1Name, setSigner1Name] = useState('');
  const [signer1Title, setSigner1Title] = useState('');
  const [signer2Name, setSigner2Name] = useState('');
  const [signer2Title, setSigner2Title] = useState('');
  
  // AI Extracted Data
  const [networkDataList, setNetworkDataList] = useState<NetworkData[]>([]);
  
  // Calculated Transfers
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  
  // UI States
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
          const text = await res.text();
          throw new Error(`Server Error (${res.status}): The request might have timed out or the file is too large.`);
        }
      }

      if (contentType && contentType.includes("application/json")) {
        const data: NetworkData[] = await res.json();
        setNetworkDataList(data);
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

  const autoCalculateTransfers = (data: NetworkData[]) => {
    let deficits: { network: string; category: string; amount: number }[] = [];
    let surpluses: { network: string; category: string; amount: number }[] = [];

    data.forEach(net => {
      Object.entries(net.categories).forEach(([cat, vals]) => {
        let normalizedCat = cat.replace('งาน', ''); 
        if (cat.includes('แรง')) normalizedCat = 'ค่าแรง';
        if (cat.includes('ควบคุม')) normalizedCat = 'ค่าควบคุมงาน';
        if (cat.includes('ขนส่ง')) normalizedCat = 'ค่าขนส่ง';
        if (cat.includes('เบ็ดเตล็ด')) normalizedCat = 'ค่าเบ็ดเตล็ด';
        if (cat.includes('ดำเนินการ')) normalizedCat = 'ค่าดำเนินการ';

        if (categories.includes(normalizedCat)) {
          if (vals.remaining < 0) {
            deficits.push({ network: net.network, category: normalizedCat, amount: Math.abs(vals.remaining) });
          } else if (vals.remaining > 0) {
            surpluses.push({ network: net.network, category: normalizedCat, amount: vals.remaining });
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

  const handleSave = () => {
    window.print();
    alert('ระบบได้สั่งพิมพ์เอกสารเรียบร้อยแล้ว');
  };

  const totalAmount = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Helper for formatting currency
  const fmt = (num: number | undefined) => {
    if (num === undefined) return "0.00";
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper to calculate total for a category after transfers
  const getCalculatedTotal = (network: string, category: string, field: 'budget' | 'disbursed' | 'remaining') => {
    const net = networkDataList.find(n => n.network === network);
    if (!net) return 0;
    
    // Find the closest matching category key in the extracted data
    const catKey = Object.keys(net.categories).find(k => k.includes(category) || category.includes(k.replace('งาน','')));
    const baseValue = catKey ? net.categories[catKey][field] : 0;

    if (field !== 'budget') return baseValue;

    // For Budget, we apply the transfers (Add if To, Subtract if From)
    let finalBudget = baseValue;
    transfers.forEach(t => {
      if (t.networkFrom === network && t.categoryFrom === category) {
        finalBudget -= Number(t.amount);
      }
      if (t.networkTo === network && t.categoryTo === category) {
        finalBudget += Number(t.amount);
      }
    });

    return finalBudget;
  };

  const calculateTotalProjectValue = () => {
    let total = 0;
    networkDataList.forEach(net => {
      Object.values(net.categories).forEach(vals => {
        total += vals.budget;
      });
    });
    return total;
  };

  const renderOfficialDocument = () => {
    return (
      <div className="print-document">
        <div className="print-header">
          <img src="/pea-logo.png" alt="PEA Logo" className="print-logo" />
          <div className="print-header-text">การไฟฟ้าส่วนภูมิภาค<br/>PROVINCIAL ELECTRICITY AUTHORITY</div>
        </div>

        <table className="print-meta-table">
          <tbody>
            <tr>
              <td style={{ width: '50px' }}>จาก</td>
              <td>{docFrom || '................................'}</td>
              <td style={{ width: '30px' }}>ถึง</td>
              <td>{docTo || '................................'}</td>
            </tr>
            <tr>
              <td>เลขที่</td>
              <td>{docNo || '................................'}</td>
              <td>วันที่</td>
              <td>{date || '................................'}</td>
            </tr>
            <tr>
              <td>เรื่อง</td>
              <td colSpan={3}>ขออนุมัติโอนค่าใช้จ่าย{projectName ? `งาน${projectName}` : '................................'}</td>
            </tr>
            <tr>
              <td>เรียน</td>
              <td colSpan={3}>{docTo || '................................'}</td>
            </tr>
          </tbody>
        </table>

        <div className="print-section-title">1. เรื่องเดิม</div>
        <p className="print-paragraph">
          ตามหนังสือ {refDocNo || '................................'} ลงวันที่ {refDocDate || '................................'} อนุมัติให้งาน{projectName || '................................'} หมายเลขงาน (WBS) {wbs || '................................'} โดยมีค่าใช้จ่ายทั้งสิ้นเป็นเงิน {fmt(calculateTotalProjectValue())} บาท ซึ่งมี {supervisorName || '................................'} เป็นผู้ควบคุมงาน
        </p>

        <div className="print-section-title">2. ข้อมูล</div>
        <p className="print-paragraph">
          ปัจจุบันงานก่อสร้างดังกล่าวได้ดำเนินการแล้วเสร็จและจ่ายไฟแล้ว แต่เนื่องจากในการดำเนินการก่อสร้างมีความจำเป็นต้อง... ส่งผลให้ค่าใช้จ่ายหน้างานในบางส่วนไม่เพียงพอ โดยปัจจุบันมีรายละเอียดการเบิกจ่าย ดังนี้
        </p>

        {networkDataList.map((net, i) => (
          <div key={net.network}>
            <div className="print-table-title">2.{i+1} {net.networkName || 'โครงข่าย'} โครงข่าย {net.network}</div>
            <table className="print-data-table">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>งบประมาณ</th>
                  <th>เบิกจ่ายแล้ว</th>
                  <th>คงเหลือ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const catKey = Object.keys(net.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน','')));
                  const vals = catKey ? net.categories[catKey] : { budget: 0, disbursed: 0, remaining: 0 };
                  if (vals.budget === 0 && vals.disbursed === 0) return null;
                  return (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(vals.budget)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(vals.disbursed)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(vals.remaining)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <div className="print-section-title" style={{ marginTop: '20px' }}>3. ข้อพิจารณา - สรุป</div>
        <p className="print-paragraph">จากรายละเอียดข้อมูลเบื้องต้น พิจารณาแล้ว เพื่อให้งานก่อสร้างดังกล่าวข้างต้น สามารถดำเนินการปิดงานก่อสร้างเพื่อขึ้นทะเบียนทรัพย์สินได้ตามระเบียบ จึงเห็นควรอนุมัติค่าใช้จ่ายหน้างานเพิ่มเติม ดังนี้</p>
        
        <div className="print-transfers-list">
          {transfers.map((t, i) => (
            <div key={t.id} className="transfer-list-item">
              3.{i+1} โอน{t.categoryFrom} โครงข่าย {t.networkFrom} ไปเป็น {t.categoryTo} โครงข่าย {t.networkTo} จำนวน {fmt(t.amount)} บาท
            </div>
          ))}
          <div className="transfer-list-item" style={{ marginTop: '8px' }}>
            3.{transfers.length + 1} เมื่อโอนตามข้อ 3.1 - 3.{transfers.length} แล้วทำให้รายละเอียดงบประมาณเปลี่ยนแปลงไป ดังนี้
          </div>
        </div>

        {networkDataList.map((net, i) => {
          let hasChanges = false;
          transfers.forEach(t => {
            if (t.networkFrom === net.network || t.networkTo === net.network) hasChanges = true;
          });
          if (!hasChanges) return null;

          return (
            <div key={net.network} className="print-page-break">
              <div className="print-table-title">{net.networkName || 'โครงข่าย'} โครงข่าย {net.network}</div>
              <table className="print-data-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>รายการ</th>
                    <th colSpan={3}>ประมาณการและผลการเบิกจ่าย</th>
                    <th rowSpan={2}>รายการเพิ่ม - ลด<br/>(4)</th>
                    <th colSpan={2}>รายละเอียดหลังเพิ่ม-ลด</th>
                  </tr>
                  <tr>
                    <th>ประมาณการ(1)</th>
                    <th>เบิกจ่ายจริง(2)</th>
                    <th>คงเหลือ<br/>(3) = (1) - (2)</th>
                    <th>อนุมัติครั้งนี้<br/>(5) = (1) + (4)</th>
                    <th>คงเหลือ<br/>(6) = (5) - (2)</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const catKey = Object.keys(net.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน','')));
                    const vals = catKey ? net.categories[catKey] : { budget: 0, disbursed: 0, remaining: 0 };
                    
                    let diffAmount = 0;
                    transfers.forEach(t => {
                      if (t.networkFrom === net.network && t.categoryFrom === cat) diffAmount -= Number(t.amount);
                      if (t.networkTo === net.network && t.categoryTo === cat) diffAmount += Number(t.amount);
                    });

                    if (vals.budget === 0 && vals.disbursed === 0 && diffAmount === 0) return null;

                    const finalBudget = vals.budget + diffAmount;
                    const finalRemaining = finalBudget - vals.disbursed;

                    return (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(vals.budget)}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(vals.disbursed)}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(vals.remaining)}</td>
                        <td style={{ textAlign: 'right' }}>{diffAmount !== 0 ? (diffAmount > 0 ? `+${fmt(diffAmount)}` : fmt(diffAmount)) : '-'}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(finalBudget)}</td>
                        <td style={{ textAlign: 'right' }}>{fmt(finalRemaining)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        <p className="print-paragraph" style={{ marginTop: '30px', textAlign: 'center' }}>
          จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติค่าใช้จ่ายหน้างานเป็นเงิน {fmt(totalAmount)} บาท 
          โดยให้ ผจก.กฟส. เป็นผู้เบิกและสั่งจ่ายจากเงินรายได้ของ กฟภ. ต่อไป
        </p>

        <div className="print-signatures">
          <div className="signature-box">
            <div className="sig-line">(..................................................)</div>
            <div className="sig-name">({signer1Name || '..................................................'})</div>
            <div className="sig-title">{signer1Title || '..................................................'}</div>
          </div>
          <div className="signature-box">
            <div className="sig-status">อนุมัติ และให้ดำเนินการในส่วนเกี่ยวข้องต่อไป</div>
            <div className="sig-line">(..................................................)</div>
            <div className="sig-name">({signer2Name || '..................................................'})</div>
            <div className="sig-title">{signer2Title || '..................................................'}</div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="budget-transfer-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
            โปรแกรมทำเอกสารโอนงบค่าใช้จ่ายหน้างาน
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            สร้างและพิมพ์เอกสารขออนุมัติโอนงบแบบอัตโนมัติ
          </p>
        </div>
        <button className="btn btn-outline">
          <HelpCircle size={18} />
          คู่มือการใช้งาน
        </button>
      </div>

      <div className="wizard-layout no-print">
        
        {/* Main Content Area */}
        <div className="wizard-main">
          
          {/* Stepper */}
          <div className="wizard-stepper">
            <div className={`stepper-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="stepper-circle">1</div>
              <span>ข้อมูลเอกสาร & อัพโหลด</span>
            </div>
            <div className={`stepper-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="stepper-circle">2</div>
              <span>จัดการรายการโอน</span>
            </div>
            <div className={`stepper-step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="stepper-circle">3</div>
              <span>พิมพ์เอกสารราชการ</span>
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
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">ชื่องาน</label>
                  <input type="text" className="form-control" placeholder="เช่น งานปรับปรุงระบบจำหน่าย 2..." value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">หมายเลขงาน (WBS)</label>
                  <input type="text" className="form-control" placeholder="เช่น P-TDD02.3-I-LYAIA.0015" value={wbs} onChange={(e) => setWbs(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">ผู้ควบคุมงาน</label>
                  <input type="text" className="form-control" placeholder="เช่น นายสมชาย รักดี" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">เลขที่เอกสาร</label>
                  <input type="text" className="form-control" placeholder="เช่น ก.3 คชย.(ก3)-" value={docNo} onChange={(e) => setDocNo(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">วันที่เอกสาร</label>
                  <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">อ้างถึงหนังสือเลขที่</label>
                  <input type="text" className="form-control" placeholder="เช่น กวว.(วร) 380/2567" value={refDocNo} onChange={(e) => setRefDocNo(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">วันที่หนังสืออ้างอิง</label>
                  <input type="date" className="form-control" value={refDocDate} onChange={(e) => setRefDocDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">จาก (ผู้เสนอ)</label>
                  <input type="text" className="form-control" placeholder="เช่น กชย.(ก3)" value={docFrom} onChange={(e) => setDocFrom(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">ถึง/เรียน (ผู้อนุมัติ)</label>
                  <input type="text" className="form-control" placeholder="เช่น ฝวบ.(ก3)" value={docTo} onChange={(e) => setDocTo(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div>
                  <label className="form-label">ชื่อผู้เสนอขออนุมัติ</label>
                  <input type="text" className="form-control" placeholder="เช่น นายอนันต์ กาญจนอุปถัมภ์" value={signer1Name} onChange={(e) => setSigner1Name(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">ตำแหน่งผู้เสนอ</label>
                  <input type="text" className="form-control" placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)" value={signer1Title} onChange={(e) => setSigner1Title(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">ชื่อผู้อนุมัติ</label>
                  <input type="text" className="form-control" placeholder="เช่น นายเมธี สุกกำ" value={signer2Name} onChange={(e) => setSigner2Name(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">ตำแหน่งผู้อนุมัติ</label>
                  <input type="text" className="form-control" placeholder="เช่น อฝ.วบ.(ก3)" value={signer2Title} onChange={(e) => setSigner2Title(e.target.value)} />
                </div>
              </div>

              <label className="form-label" style={{ marginBottom: '12px' }}>อัพโหลดไฟล์ PDF ZPSR018 (เพื่อคำนวณอัตโนมัติ)</label>
              <label className="dropzone" style={{ opacity: isUploading ? 0.5 : 1 }}>
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                <div className="dropzone-icon">
                  {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                </div>
                <div style={{ fontWeight: '600' }}>{isUploading ? 'กำลังประมวลผล AI และดึงข้อมูลงบประมาณ...' : 'ลากไฟล์ PDF มาวางที่นี่'}</div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>หรือคลิกเพื่อเลือกไฟล์</div>
                <div style={{ color: 'var(--pea-purple)', background: 'white', border: '1px solid var(--border-color)', padding: '6px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', marginTop: '8px' }}>
                  <UploadCloud size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  เลือกไฟล์ PDF
                </div>
              </label>

              <div className="wizard-footer">
                <button className="btn btn-outline" onClick={() => { setDocNo(''); setDate(''); setWbs(''); setProjectName(''); }}>ล้างข้อมูล</button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                  ข้ามไปจัดการรายการโอน <ArrowRight size={18} />
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
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setTransfers([...transfers, { id: Math.random().toString(36).substr(2,9), networkFrom: '', categoryFrom: '', networkTo: '', categoryTo: '', amount: 0 }])}>
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
                            <input type="text" className="form-control" placeholder="เช่น 6001381477" value={t.networkFrom} onChange={(e) => setTransfers(transfers.map(tr => tr.id === t.id ? { ...tr, networkFrom: e.target.value } : tr))} />
                          </td>
                          <td>
                            <select className="form-select" value={t.categoryFrom} onChange={(e) => setTransfers(transfers.map(tr => tr.id === t.id ? { ...tr, categoryFrom: e.target.value } : tr))}>
                              <option value="">-- เลือก --</option>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td>
                            <input type="text" className="form-control" placeholder="เช่น 6001381477" value={t.networkTo} onChange={(e) => setTransfers(transfers.map(tr => tr.id === t.id ? { ...tr, networkTo: e.target.value } : tr))} />
                          </td>
                          <td>
                            <select className="form-select" value={t.categoryTo} onChange={(e) => setTransfers(transfers.map(tr => tr.id === t.id ? { ...tr, categoryTo: e.target.value } : tr))}>
                              <option value="">-- เลือก --</option>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td>
                            <input type="number" className="form-control" style={{ textAlign: 'right' }} placeholder="0.00" value={t.amount || ''} onChange={(e) => setTransfers(transfers.map(tr => tr.id === t.id ? { ...tr, amount: parseFloat(e.target.value) } : tr))} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => setTransfers(transfers.filter(tr => tr.id !== t.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>รวมเป็นเงินทั้งสิ้น</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--pea-purple)', fontSize: '1.1rem' }}>{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="wizard-footer">
                <button className="btn btn-outline" onClick={() => setCurrentStep(1)}>กลับ</button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  สร้างเอกสารบันทึกข้อความ <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Print Preview */}
          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pea-purple)' }}>
                  <Save size={20} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>ดูตัวอย่างและพิมพ์เอกสาร</h2>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={18} /> สั่งพิมพ์เอกสาร
                </button>
              </div>
              
              {/* Document Preview Box */}
              <div className="document-preview-container">
                {renderOfficialDocument()}
              </div>

              <div className="wizard-footer">
                <button className="btn btn-outline" onClick={() => setCurrentStep(2)}>กลับไปแก้ไขรายการโอน</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="wizard-sidebar no-print">
          <div className="info-card info-card-blue">
            <div className="info-card-header">
              <Lightbulb className="info-card-icon" size={20} />
              คำแนะนำ
            </div>
            <ul className="info-list">
              <li>กรอกข้อมูลเอกสารและผู้ลงนามให้ครบถ้วนก่อนอัพโหลด</li>
              <li>อัพโหลดไฟล์ PDF จากระบบ ERP ZPSR018</li>
              <li>ระบบจะคำนวณยอดโอนเงินอัตโนมัติ</li>
              <li>ตารางเปรียบเทียบเพิ่ม-ลด จะถูกสร้างให้โดยอัตโนมัติในขั้นตอนที่ 3</li>
            </ul>
          </div>
        </div>

      </div>
      
      {/* Actual Print Content (Rendered again strictly for printing) */}
      <div className="print-only">
        {renderOfficialDocument()}
      </div>
      
    </div>
  );
}
