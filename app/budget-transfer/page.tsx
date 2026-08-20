"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, ArrowRight, ArrowRightLeft, UploadCloud, Loader2, HelpCircle, Lightbulb, ShieldCheck, FileType, Copy, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import dynamic from 'next/dynamic';

const Xarrow = dynamic(() => import('react-xarrows'), { ssr: false });

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
  const [docFrom, setDocFrom] = useState('กรย.(ก3)');
  const [docTo, setDocTo] = useState('อฝ.วบ.(ก3)');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorLevel, setSupervisorLevel] = useState('');
  const [signer1Name, setSigner1Name] = useState('นายอนันต์ กาญจนอุปถัมภ์');
  const [signer1Title, setSigner1Title] = useState('รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)');
  const [signer2Preset, setSigner2Preset] = useState('metee');
  const [signer2Name, setSigner2Name] = useState('นายเมธี สุกก่ำ');
  const [signer2Title, setSigner2Title] = useState('อฝ.วบ.(ก3)');
  const [reasonText, setReasonText] = useState('ปัจจุบันงานก่อสร้างดังกล่าวได้ดำเนินการแล้วเสร็จและจ่ายไฟแล้ว แต่เนื่องจากในการดำเนินการก่อสร้างมีความจำเป็นต้องดับกระแสไฟและระดมชุดงานเพื่อปฏิบัติงานในวันอาทิตย์หลายครั้ง ซึ่งในการปฏิบัติงานวันอาทิตย์นั้น กฟภ.ต้องจ่ายค่าแรงงานเป็น 2 เท่าของค่าแรงงานปกติ จึงส่งผลให้ค่าใช้จ่ายหน้างานในบางส่วนไม่เพียงพอ');
  
  // AI Extracted Data
  const [networkDataList, setNetworkDataList] = useState<NetworkData[]>([]);
  
  // Calculated Transfers
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  
  // UI States
  const [step2View, setStep2View] = useState<'table' | 'flow'>('table');
  const [step3View, setStep3View] = useState<'memo' | 'approval'>('approval');
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
    let fieldDeficits: { network: string; category: string; amount: number }[] = [];
    let fieldSurpluses: { network: string; category: string; amount: number }[] = [];
    let opsSurpluses: { network: string; category: string; amount: number }[] = [];

    const fieldCategories = ["ค่าแรง", "ค่าควบคุมงาน", "ค่าขนส่ง", "ค่าเบ็ดเตล็ด"];

    data.forEach(net => {
      Object.entries(net.categories).forEach(([cat, vals]) => {
        let normalizedCat = cat.replace('งาน', ''); 
        if (cat.includes('แรง')) normalizedCat = 'ค่าแรง';
        if (cat.includes('ควบคุม')) normalizedCat = 'ค่าควบคุมงาน';
        if (cat.includes('ขนส่ง')) normalizedCat = 'ค่าขนส่ง';
        if (cat.includes('เบ็ดเตล็ด')) normalizedCat = 'ค่าเบ็ดเตล็ด';
        if (cat.includes('ดำเนินการ')) normalizedCat = 'ค่าดำเนินการ';
        if (cat.includes('พัสดุ')) normalizedCat = 'ค่าพัสดุ';

        if (normalizedCat === 'ค่าพัสดุ') return; // Cannot transfer material

        if (fieldCategories.includes(normalizedCat)) {
          if (vals.remaining < 0) {
            fieldDeficits.push({ network: net.network, category: normalizedCat, amount: Math.abs(vals.remaining) });
          } else if (vals.remaining > 0) {
            fieldSurpluses.push({ network: net.network, category: normalizedCat, amount: vals.remaining });
          }
        } else if (normalizedCat === 'ค่าดำเนินการ') {
          if (vals.remaining > 0) {
            opsSurpluses.push({ network: net.network, category: normalizedCat, amount: vals.remaining });
          }
        }
      });
    });

    const newTransfers: TransferItem[] = [];
    
    // Phase 1: Transfer from Field Surpluses to Field Deficits
    for (let d of fieldDeficits) {
      // Round up to the next 100 to ensure remaining balance is > 0
      let needed = (Math.floor(d.amount / 100) + 1) * 100;
      for (let s of fieldSurpluses) {
        if (needed <= 0.001) break;
        
        let maxTake = Math.floor(s.amount / 100) * 100;
        if (maxTake >= s.amount) maxTake -= 100;
        if (maxTake <= 0.001) continue;

        const transferAmount = Math.min(needed, maxTake);
        
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
      d.amount = needed; // Update remaining deficit
    }

    // Phase 2: If there are still field deficits, use Operations Surpluses
    for (let d of fieldDeficits) {
      // Round up to the next 100 to ensure remaining balance is > 0
      let needed = (Math.floor(d.amount / 100) + 1) * 100;
      if (needed <= 0.001) continue;
      
      for (let s of opsSurpluses) {
        if (needed <= 0.001) break;

        let maxTake = Math.floor(s.amount / 100) * 100;
        if (maxTake >= s.amount) maxTake -= 100;
        if (maxTake <= 0.001) continue;

        const transferAmount = Math.min(needed, maxTake);
        
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
      d.amount = needed;
    }
    
    setTransfers(newTransfers);
  };

  const handleSave = () => {
    window.print();
    alert('ระบบได้สั่งพิมพ์เอกสารเรียบร้อยแล้ว');
  };

  const handleCopyToWord = async () => {
    const el = document.querySelector('.print-only');
    if (!el) return;
    try {
      const html = el.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      // We also need plain text fallback
      const textBlob = new Blob([el.textContent || ''], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({ 
        'text/html': blob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([clipboardItem]);
      alert('คัดลอกสำเร็จ! สามารถกด Paste (Ctrl+V) ลงใน Word ได้เลยครับ');
    } catch (err) {
      alert('เบราว์เซอร์ของคุณอาจไม่รองรับฟังก์ชันนี้ กรุณาดาวน์โหลดเป็น Word แทนครับ');
    }
  };

  const handleCopyImage = async () => {
    const el = document.querySelector('#flow-chart-container') as HTMLElement;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', style: { padding: '20px' } });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const clipboardItem = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([clipboardItem]);
      alert('คัดลอกรูปภาพสำเร็จ! สามารถนำไป Paste (Ctrl+V) ได้เลยครับ');
    } catch (err) {
      alert('ไม่สามารถคัดลอกภาพได้ ลองดาวน์โหลดแทนครับ');
    }
  };

  const handleDownloadImage = async () => {
    const el = document.querySelector('#flow-chart-container') as HTMLElement;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', style: { padding: '20px' } });
      const link = document.createElement('a');
      link.download = 'budget-transfer-flow.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('ไม่สามารถบันทึกภาพได้');
    }
  };

  const exportToWord = () => {
    const el = document.querySelector('.print-only');
    if (!el) return;
    
    // Create a clone to manipulate for Word export
    const clone = el.cloneNode(true) as HTMLElement;
    
    // Replace .print-signatures flexbox with an HTML table for MS Word compatibility
    const sigContainers = clone.querySelectorAll('.print-signatures');
    sigContainers.forEach(container => {
      const boxes = Array.from(container.querySelectorAll('.signature-box'));
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.border = 'none';
      table.style.marginTop = '40px';
      
      const tr = document.createElement('tr');
      boxes.forEach(box => {
        const td = document.createElement('td');
        td.style.width = `${100 / (boxes.length || 1)}%`;
        td.style.textAlign = 'center';
        td.style.border = 'none';
        td.style.verticalAlign = 'top';
        td.innerHTML = box.innerHTML;
        tr.appendChild(td);
      });
      table.appendChild(tr);
      container.replaceWith(table);
    });

    // Replace flex headers (if any) with tables
    const flexHeaders = clone.querySelectorAll('div[style*="display: flex"]');
    flexHeaders.forEach(header => {
      if (header.children.length === 2 && !header.classList.contains('print-signatures')) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.border = 'none';
        const tr = document.createElement('tr');
        
        const td1 = document.createElement('td');
        td1.style.border = 'none';
        td1.style.width = '50%';
        td1.style.textAlign = 'left';
        td1.innerHTML = header.children[0].innerHTML;
        
        const td2 = document.createElement('td');
        td2.style.border = 'none';
        td2.style.width = '50%';
        td2.style.textAlign = 'right';
        td2.innerHTML = header.children[1].innerHTML;
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
        header.replaceWith(table);
      }
    });

    const content = clone.innerHTML;
    
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Export</title>
        <style>
          @font-family {
            font-family: 'TH Sarabun New';
            src: local('TH Sarabun New');
          }
          body { font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 4px; }
          .print-header { text-align: center; }
          .print-header-text { font-size: 16pt; font-weight: bold; text-align: left; }
          .print-meta-table { width: 100%; margin-bottom: 20px; }
          .print-meta-table td { border: none !important; padding: 2px; }
          .print-section-title { font-weight: bold; font-size: 16pt; margin-top: 20px; margin-bottom: 10px; }
          .print-paragraph { text-indent: 40px; margin-bottom: 15px; }
          .print-data-table { width: 100%; font-size: 14pt; margin-bottom: 20px; }
          .signature-box { text-align: center; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `เอกสารขออนุมัติโอนงบ_${docNo || 'Draft'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = async () => {
    const element = document.querySelector('.print-only') as HTMLElement;
    if (!element) return;
    
    try {
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;
      
      const isLandscape = step3View === 'approval';
      
      const opt = {
        margin:       10,
        filename:     `เอกสารขออนุมัติโอนงบ_${docNo || 'Draft'}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: (isLandscape ? 'landscape' : 'portrait') as 'landscape' | 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF กรุณาลองใหม่อีกครั้ง");
    }
  };

  const totalAmount = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Helper to translate network abbreviations to full names
  const getFullNetworkName = (abbr: string) => {
    const mapping: Record<string, string> = {
      'HT-C-E': 'แผนกก่อสร้างแรงสูงภายนอก',
      'HT-R-E': 'แผนกรื้อถอนแรงสูงภายนอก',
      'TR-C-E': 'แผนกก่อสร้างหม้อแปลงภายนอก',
      'TR-R-E': 'แผนกรื้อถอนหม้อแปลงภายนอก',
      'LT-C-E': 'แผนกก่อสร้างแรงต่ำภายนอก',
      'LT-R-E': 'แผนกรื้อถอนแรงต่ำภายนอก',
      'TL-C-E': 'แผนกก่อสร้างสายส่งภายนอก',
      'TL-R-E': 'แผนกรื้อถอนสายส่งภายนอก'
    };
    return mapping[abbr] || abbr;
  };

  // Helper for formatting currency
  const fmt = (num: number | undefined) => {
    if (num === undefined) return "0.00";
    if (Math.abs(num) < 0.01) return "-";
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

  const calculateBudgetByCategoryGroup = (groups: string[]) => {
    let total = 0;
    networkDataList.forEach(net => {
      Object.entries(net.categories).forEach(([catKey, vals]) => {
        if (groups.some(g => catKey.includes(g) || g.includes(catKey.replace('งาน','')))) {
          total += vals.budget;
        }
      });
    });
    return total;
  };

  const renderOfficialDocument = () => {
    return (
      <div className="print-document">
        <div className="print-header">
          <img src="/pea-logo.png" alt="PEA Logo" className="print-logo" />
          <div className="print-header-text">การไฟฟ้าส่วนภูมิภาค</div>
          <div className="print-header-text-eng">PROVINCIAL ELECTRICITY AUTHORITY</div>
        </div>

        <table className="print-meta-table">
          <tbody>
            <tr>
              <td style={{ width: '40px' }}>จาก</td>
              <td style={{ width: '40%' }}>{docFrom || '................................'}</td>
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
              <td colSpan={3}>{docTo || '................................'} ผ่าน รฝ.วบ.(ก3)</td>
            </tr>
          </tbody>
        </table>

        <div className="print-section-title">1. เรื่องเดิม</div>
        <p className="print-paragraph">
          ตามหนังสือ {refDocNo || '................................'} ลงวันที่ {refDocDate || '................................'} อนุมัติให้งาน{projectName || '................................'} หมายเลขงาน (WBS) {wbs || '................................'} โดยมีค่าใช้จ่ายทั้งสิ้นเป็นเงิน {fmt(calculateTotalProjectValue())}.- บาท แยกเป็นค่าพัสดุจำนวน {fmt(calculateBudgetByCategoryGroup(['พัสดุ']))}.- บาท ค่าใช้จ่ายหน้างาน เป็นเงิน {fmt(calculateBudgetByCategoryGroup(['แรง', 'ควบคุมงาน', 'ขนส่ง', 'เบ็ดเตล็ด']))}.- บาท และค่าดำเนินการ เป็นเงิน {fmt(calculateBudgetByCategoryGroup(['ดำเนินการ']))}.- บาท ซึ่งมี {supervisorName || '................................'} พชง.{supervisorLevel || '.....'} ผกร.กรย.(ก3) เป็นผู้ควบคุมงาน
        </p>

        <div className="print-section-title">2. ข้อมูล</div>
        <p className="print-paragraph">
          {reasonText}
        </p>

        {networkDataList.map((net, i) => {
          const num = i + 1;
          return (
          <div key={net.network}>
            <div className="print-table-title" style={{ textAlign: 'left', textIndent: '40px' }}>2.{num} {getFullNetworkName(net.networkName)} โครงข่าย {net.network}</div>
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
                      <td style={{ textAlign: 'left' }}>{cat}</td>
                      <td style={{ textAlign: 'center' }}>{fmt(vals.budget)}</td>
                      <td style={{ textAlign: 'center' }}>{fmt(vals.disbursed)}</td>
                      <td style={{ textAlign: 'center', color: vals.remaining < 0 ? 'red' : 'inherit' }}>{fmt(vals.remaining)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          );
        })}

        <div className="print-section-title" style={{ marginTop: '20px' }}>3. ข้อพิจารณา - สรุป</div>
        <p className="print-paragraph">จากรายละเอียดข้อมูลเบื้องต้น กรย.(ก3) พิจารณาแล้ว เพื่อให้งานก่อสร้าง{projectName ? `งาน${projectName}` : ''}ดังกล่าวข้างต้น สามารถดำเนินการปิดงานก่อสร้างเพื่อขึ้นทะเบียนทรัพย์สินได้ตามระเบียบ จึงเห็นควรอนุมัติค่าใช้จ่ายหน้างานเพิ่มเติม ดังนี้</p>
        
        {networkDataList.map((net, i) => {
          let netTransfers = transfers.filter(t => t.networkFrom === net.network || t.networkTo === net.network);
          if (netTransfers.length === 0) return null;
          
          const num = i + 1;

          return (
            <div key={net.network}>
              <div className="print-table-title" style={{ textAlign: 'left', textIndent: '40px' }}>3.{num} {getFullNetworkName(net.networkName)} โครงข่าย {net.network}</div>
              
              <div style={{ textIndent: '60px', marginBottom: '10px' }}>
                {netTransfers.map((t, idx) => {
                  const isGiving = t.networkFrom === net.network;
                  if (isGiving) {
                    return <div key={idx}>- โอน{t.categoryFrom} ไปเป็น{t.categoryTo} โครงข่าย {t.networkTo} จำนวน {fmt(t.amount)}.- บาท</div>;
                  } else {
                    return <div key={idx}>- รับโอน{t.categoryTo} จาก{t.categoryFrom} โครงข่าย {t.networkFrom} จำนวน {fmt(t.amount)}.- บาท</div>;
                  }
                })}
              </div>

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
                        <td style={{ textAlign: 'left' }}>{cat}</td>
                        <td style={{ textAlign: 'center' }}>{fmt(vals.budget)}</td>
                        <td style={{ textAlign: 'center' }}>{fmt(vals.disbursed)}</td>
                        <td style={{ textAlign: 'center', color: vals.remaining < 0 ? 'red' : 'inherit' }}>{fmt(vals.remaining)}</td>
                        <td style={{ textAlign: 'center' }}>{diffAmount !== 0 ? (diffAmount > 0 ? `+${fmt(diffAmount)}` : fmt(diffAmount)) : '-'}</td>
                        <td style={{ textAlign: 'center' }}>{fmt(finalBudget)}</td>
                        <td style={{ textAlign: 'center' }}>{fmt(finalRemaining)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {(() => {
          let maxNum = 0;
          networkDataList.forEach((net, i) => {
            let netTransfers = transfers.filter(t => t.networkFrom === net.network || t.networkTo === net.network);
            if (netTransfers.length > 0) maxNum = i + 1;
          });
          const section3Text = maxNum > 1 ? `ตามข้อ 3.1 - 3.${maxNum}` : `ตามข้อ 3.1`;
          return (
            <p className="print-paragraph" style={{ marginTop: '30px' }}>
              จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติโอนงบค่าใช้จ่ายต่างๆ {section3Text} พร้อมลงนามในแบบฟอร์มโอนค่าใช้จ่ายตามเอกสารแนบให้ต่อไป พร้อมนี้ได้แนบเรื่องเดิมมาเพื่อประกอบการพิจารณาด้วยแล้ว
            </p>
          );
        })()}

        <div className="print-signatures vertical">
          <div className="signature-box right">
            <div className="sig-name">(นายอนันต์ กาญจนอุปถัมภ์)</div>
            <div className="sig-title">รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)</div>
          </div>
          
          <div className="signature-box" style={{ textAlign: 'left', marginLeft: '10%' }}>
            <div className="sig-status">- ผจก.กฟจ.นฐ. ผจก.กฟส.กพส.</div>
            <div className="sig-status" style={{ paddingLeft: '20px' }}><strong>อนุมัติ</strong> และให้ดำเนินการในส่วนเกี่ยวข้องต่อไป</div>
          </div>
          
          <div className="signature-box right">
            <div className="sig-name">(นายเมธี สุกก่ำ)</div>
            <div className="sig-title">อฝ.วบ.(ก3)</div>
          </div>
        </div>

        <div className="sig-lines-container" style={{ display: 'none' }}>
        </div>

      </div>
    );
  };

  const renderVisualFlow = () => {
    if (transfers.length === 0) return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', background: '#f8fafc', borderRadius: '12px' }}>
        ยังไม่มีรายการโอนงบประมาณ
      </div>
    );
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px' }}>
          <button className="btn btn-outline" onClick={handleCopyImage} style={{ borderColor: '#2563eb', color: '#1d4ed8' }}>
            <Copy size={18} /> คัดลอกรูปภาพ
          </button>
          <button className="btn btn-outline" onClick={handleDownloadImage} style={{ borderColor: '#22c55e', color: '#16a34a' }}>
            <ImageIcon size={18} /> บันทึกเป็นภาพ
          </button>
        </div>
        <div id="flow-chart-container" style={{ position: 'relative', overflowX: 'auto', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>ตารางจำลองโอนงบ ZPSR018</h3>
          
          <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6', width: '3%' }}>ที่</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6', width: '10%' }}>เลขที่โครงข่าย<br/>(แผนก)</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6', width: '7%' }}>รายการ</th>
                <th colSpan={7} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', backgroundColor: '#f3f4f6', width: '80%' }}>ค่าใช้จ่ายจริง(บาท)</th>
              </tr>
              <tr>
                <th style={{ border: '1px solid #000' }}></th>
                <th style={{ border: '1px solid #000' }}></th>
                <th style={{ border: '1px solid #000' }}></th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ค่าพัสดุ</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>พัสดุเข้างาน</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ค่าแรงงาน<br/>/ค่าจ้างเหมา</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ค่าควบคุมงาน</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ค่าขนส่ง/<br/>ยานพาหนะ</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ค่าเบ็ดเตล็ด</th>
                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>ค่าดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {networkDataList.map((net, idx) => {
                const getVal = (catName: string, field: 'budget'|'disbursed'|'remaining') => {
                  const catKey = Object.keys(net.categories).find(k => k.includes(catName) || catName.includes(k.replace('งาน','')));
                  return catKey ? net.categories[catKey][field] : 0;
                };

                const cols = [
                   { name: 'พัสดุ', key: 'ค่าพัสดุ' }, 
                   { name: 'พัสดุเข้างาน', dummy: true },
                   { name: 'แรง', key: 'ค่าแรง' },
                   { name: 'ควบคุมงาน', key: 'ค่าควบคุมงาน' },
                   { name: 'ขนส่ง', key: 'ค่าขนส่ง' },
                   { name: 'เบ็ดเตล็ด', key: 'ค่าเบ็ดเตล็ด' },
                   { name: 'ดำเนินการ', key: 'ค่าดำเนินการ' }
                ];
                
                // Helper to format in ZPSR style (0.00 is just 0.00, negative has - at end)
                const fmtZpsr = (num: number) => {
                  if (!num || Math.abs(num) < 0.01) return "0.00";
                  let isNeg = num < 0;
                  let s = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return isNeg ? s + "-" : s;
                };

                return (
                  <React.Fragment key={net.network}>
                    {/* Row 1: Budget */}
                    <tr>
                      <td rowSpan={3} style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', verticalAlign: 'top' }}>{idx + 1}</td>
                      <td rowSpan={3} style={{ border: '1px solid #000', padding: '4px', verticalAlign: 'top' }}>{net.network}<br/>{getFullNetworkName(net.networkName).split(' ')[0]}</td>
                      <td style={{ border: '1px solid #000', padding: '4px', borderBottom: 'none' }}></td>
                      {cols.map((c, i) => (
                        <td key={i} style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', borderBottom: 'none' }}>
                           {c.dummy ? '0.00' : fmtZpsr(getVal(c.name, 'budget'))}
                        </td>
                      ))}
                    </tr>
                    {/* Row 2: Disbursed */}
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', borderTop: 'none', borderBottom: 'none' }}>ค่าจริง</td>
                      {cols.map((c, i) => (
                        <td key={i} style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', borderTop: 'none', borderBottom: 'none' }}>
                           {c.dummy ? '0.00' : fmtZpsr(getVal(c.name, 'disbursed'))}
                        </td>
                      ))}
                    </tr>
                    {/* Row 3: Remaining */}
                    <tr>
                      <td style={{ border: '1px solid #000', padding: '4px', borderTop: 'none' }}>ผลต่าง</td>
                      {cols.map((c, i) => {
                        const remaining = c.dummy ? 0 : getVal(c.name, 'remaining');
                        const cellId = `cell-${net.network}-${c.key}`;
                        return (
                          <td key={i} style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', borderTop: 'none' }}>
                             <div id={cellId} style={{ display: 'inline-block', padding: '2px', position: 'relative' }}>
                               {fmtZpsr(remaining)}
                             </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          
          {/* Draw Arrows */}
          {transfers.map((t, i) => {
            const fromId = `cell-${t.networkFrom}-${t.categoryFrom}`;
            const toId = `cell-${t.networkTo}-${t.categoryTo}`;
            
            // Generate robust distinct colors for arrows
            const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0ea5e9', '#65a30d'];
            const color = colors[i % colors.length];

            return (
              <Xarrow
                key={t.id}
                start={fromId}
                end={toId}
                color={color}
                strokeWidth={2}
                path="grid" // Uses orthogonal lines avoiding elements
                headSize={6}
                startAnchor="bottom"
                endAnchor="bottom"
                gridBreak="20%"
                labels={{ 
                  middle: (
                    <div style={{ 
                      background: 'white', 
                      padding: '2px 6px', 
                      border: `1.5px solid ${color}`, 
                      borderRadius: '6px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      color: color,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      zIndex: 10
                    }}>
                      โอน {fmt(t.amount)}
                    </div>
                  ) 
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const renderExpenseApprovalForm = () => {
    const allNetworks = Array.from(new Set([
      ...transfers.map(t => t.networkFrom),
      ...transfers.map(t => t.networkTo)
    ]));
    allNetworks.sort();

    return (
      <div className="print-document">
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15pt', marginBottom: '5px' }}>การไฟฟ้าส่วนภูมิภาค</div>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15pt', marginBottom: '20px' }}>แบบฟอร์มขออนุมัติค่าใช้จ่ายหน้างาน</div>
        
        <table className="print-meta-table">
          <tbody>
            <tr>
              <td style={{ width: '40px' }}>จาก</td>
              <td style={{ width: '40%' }}>{docFrom || '................................'}</td>
              <td style={{ width: '30px' }}>ถึง</td>
              <td>{docTo || '................................'}</td>
            </tr>
            <tr>
              <td>เรื่อง</td>
              <td colSpan={3}>ขออนุมัติโอนค่าใช้จ่ายหน้างาน</td>
            </tr>
            <tr>
              <td>เรียน</td>
              <td colSpan={3}>{docTo || '................................'} ผ่าน รฝ.วบ.(ก3)</td>
            </tr>
          </tbody>
        </table>

        <p className="print-paragraph" style={{ textIndent: '40px' }}>
          ตามหนังสือ {refDocNo || '................................'} ลงวันที่ {refDocDate || '................................'} อนุมัติให้งาน{projectName || '................................'} หมายเลขงาน (WBS) {wbs || '................................'} นั้น ในขั้นนี้เห็นควรอนุมัติค่าใช้จ่ายหน้างานในการก่อสร้าง (เพิ่มเติม) ดังรายการต่อไปนี้
        </p>

        <table className="print-data-table" style={{ marginTop: '10px' }}>
          <thead>
            <tr>
              <th style={{ width: '20%', textAlign: 'center' }}>งบ</th>
              {allNetworks.map(net => <th key={net} style={{ fontWeight: 'normal', textAlign: 'center' }}>กฟภ.</th>)}
            </tr>
            <tr>
              <th style={{ textAlign: 'center' }}>โครงข่าย</th>
              {allNetworks.map(net => <th key={net} style={{ fontWeight: 'normal', textAlign: 'center' }}>{net}</th>)}
            </tr>
            <tr>
              <th style={{ textAlign: 'center' }}>รายการ</th>
              {allNetworks.map(net => <th key={net} style={{ fontWeight: 'normal', textAlign: 'center' }}>{getFullNetworkName(networkDataList.find(n => n.network === net)?.networkName || '').replace('แผนก','')}</th>)}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const rowHasData = allNetworks.some(net => {
                return transfers.some(t => (t.networkFrom === net && t.categoryFrom === cat) || (t.networkTo === net && t.categoryTo === cat));
              });

              if (!rowHasData) return null;

              return (
                <tr key={cat}>
                  <td style={{ textAlign: 'left' }}>{cat}</td>
                  {allNetworks.map(net => {
                    const involved = transfers.filter(t => (t.networkFrom === net && t.categoryFrom === cat) || (t.networkTo === net && t.categoryTo === cat));
                    const totalForCell = involved.reduce((sum, t) => sum + t.amount, 0);
                    return (
                      <td key={net} style={{ textAlign: 'center' }}>
                        {totalForCell > 0 ? `${fmt(totalForCell)}.-` : '-'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 'bold' }}>รวม</td>
              {allNetworks.map(net => {
                const totalForNet = transfers.filter(t => t.networkFrom === net || t.networkTo === net).reduce((sum, t) => sum + t.amount, 0);
                return <td key={net} style={{ textAlign: 'center', fontWeight: 'bold' }}>{totalForNet > 0 ? `${fmt(totalForNet)}.-` : '-'}</td>;
              })}
            </tr>
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 'bold' }}>รวมทั้งสิ้น</td>
              <td colSpan={allNetworks.length} style={{ textAlign: 'left', fontWeight: 'bold', paddingLeft: '20px' }}>
                {fmt(totalAmount)}.- บาท
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ textIndent: '40px', margin: '20px 0 10px 0' }}>เปรียบเทียบค่าใช้จ่ายที่ขออนุมัติกับค่าใช้จ่ายตามประมาณการ</div>
        
        {allNetworks.map(net => {
          const networkObj = networkDataList.find(n => n.network === net);
          if (!networkObj) return null;
          return (
            <table key={net} className="print-data-table" style={{ marginBottom: '15px' }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: '25%' }}>รายการ</th>
                  <th colSpan={4}>{getFullNetworkName(networkObj.networkName).replace('แผนก', 'แผนก ')}</th>
                </tr>
                <tr>
                  <th style={{ fontWeight: 'normal' }}>ประมาณการ</th>
                  <th style={{ fontWeight: 'normal' }}>อนุมัติ 2 ครั้ง</th>
                  <th style={{ fontWeight: 'normal' }}>ร้อยละ</th>
                  <th style={{ fontWeight: 'normal' }}>คงเหลือ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const catKey = Object.keys(networkObj.categories).find(k => k.includes(cat) || cat.includes(k.replace('งาน','')));
                  if (!catKey) return null;
                  const vals = networkObj.categories[catKey];
                  if (vals.budget === 0 && vals.disbursed === 0) return null;
                  const percent = vals.budget > 0 ? (vals.disbursed / vals.budget) * 100 : 0;
                  
                  return (
                    <tr key={cat}>
                      <td style={{ textAlign: 'left' }}>{cat}</td>
                      <td style={{ textAlign: 'center' }}>{fmt(vals.budget)}</td>
                      <td style={{ textAlign: 'center' }}>{fmt(vals.disbursed)}</td>
                      <td style={{ textAlign: 'center' }}>{fmt(percent)}</td>
                      <td style={{ textAlign: 'center' }}>-</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })}
        
        <p className="print-paragraph" style={{ marginTop: '30px' }}>
          จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ ค่าใช้จ่ายหน้างาน(เพิ่มเติม)เป็น {fmt(totalAmount)}.- บาท 
          โดยให้ ผจก.กฟส. เป็นผู้เบิกและสั่งจ่ายจากเงินรายได้ของ ผจก.กฟส. ต่อไป
        </p>

        <div className="print-signatures" style={{ marginTop: '40px' }}>
          <div className="signature-box" style={{ marginTop: 'auto' }}>
            <div className="sig-line">..................................................</div>
            <div className="sig-name">({signer1Name || 'นายอนันต์ กาญจนอุปถัมภ์'})</div>
            <div className="sig-title">{signer1Title || 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)'}</div>
          </div>
          
          <div className="signature-box right" style={{ textAlign: 'center' }}>
            <div className="sig-status" style={{ fontWeight: 'bold', fontSize: '15pt', marginBottom: '40px' }}>อนุมัติ</div>
            <div className="sig-line">..................................................</div>
            <div className="sig-name">({signer2Name || 'นายเมธี สุกก่ำ'})</div>
            <div className="sig-title">{signer2Title || 'อฝ.วบ.(ก3)'}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="budget-transfer-container" style={{ height: '100%', overflowY: 'auto', padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">ชื่อผู้ควบคุมงาน</label>
                    <input type="text" className="form-control" placeholder="เช่น อุดมศักดิ์ จันทร์กลิ่น" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">ระดับ พชง.</label>
                    <input type="number" className="form-control" placeholder="เช่น 7" value={supervisorLevel} onChange={(e) => setSupervisorLevel(e.target.value)} />
                  </div>
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
                  <input type="text" className="form-control" value={docFrom} readOnly style={{ backgroundColor: '#f1f5f9' }} />
                </div>
                <div>
                  <label className="form-label">ถึง/เรียน (ผู้อนุมัติ)</label>
                  <input type="text" className="form-control" value={docTo} readOnly style={{ backgroundColor: '#f1f5f9' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">เหตุผลเพิ่มเติม (ข้อ 2. ข้อมูล)</label>
                  <textarea className="form-control" rows={3} value={reasonText} onChange={(e) => setReasonText(e.target.value)}></textarea>
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
                <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                  <label className="form-label">เลือกชุดผู้อนุมัติ</label>
                  <select 
                    className="form-control" 
                    value={signer2Preset}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSigner2Preset(val);
                      if (val === 'metee') {
                        setSigner2Name('นายเมธี สุกก่ำ');
                        setSigner2Title('อฝ.วบ.(ก3)');
                      } else if (val === 'sommai') {
                        setSigner2Name('นายสมหมาย ชื่นด้วง');
                        setSigner2Title('รฝ.วบ.(ก3) รักษาการแทน อฝ.วบ.(ก3)');
                      } else {
                        setSigner2Name('');
                        setSigner2Title('');
                      }
                    }}
                  >
                    <option value="metee">นายเมธี สุกก่ำ / อฝ.วบ.(ก3)</option>
                    <option value="sommai">นายสมหมาย ชื่นด้วง / รฝ.วบ.(ก3) รักษาการแทน อฝ.วบ.(ก3)</option>
                    <option value="custom">-- กำหนดเอง --</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">ชื่อผู้อนุมัติ</label>
                  <input type="text" className="form-control" placeholder="เช่น นายเมธี สุกก่ำ" value={signer2Name} onChange={(e) => { setSigner2Name(e.target.value); setSigner2Preset('custom'); }} />
                </div>
                <div>
                  <label className="form-label">ตำแหน่งผู้อนุมัติ</label>
                  <input type="text" className="form-control" placeholder="เช่น อฝ.วบ.(ก3)" value={signer2Title} onChange={(e) => { setSigner2Title(e.target.value); setSigner2Preset('custom'); }} />
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button 
                      className={`btn ${step2View === 'table' ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: '6px' }}
                      onClick={() => setStep2View('table')}
                    >
                      แบบตาราง
                    </button>
                    <button 
                      className={`btn ${step2View === 'flow' ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: '6px' }}
                      onClick={() => setStep2View('flow')}
                    >
                      แบบผังลูกศร
                    </button>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => { setStep2View('table'); setTransfers([...transfers, { id: Math.random().toString(36).substr(2,9), networkFrom: '', categoryFrom: '', networkTo: '', categoryTo: '', amount: 0 }]); }}>
                    <Plus size={16} /> เพิ่มรายการ
                  </button>
                </div>
              </div>

              {step2View === 'flow' ? renderVisualFlow() : (
                transfers.length === 0 ? (
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
                )
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
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button 
                      className={`btn ${step3View === 'memo' ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: '6px' }}
                      onClick={() => setStep3View('memo')}
                    >
                      บันทึกข้อความ (ขอโอนงบ)
                    </button>
                    <button 
                      className={`btn ${step3View === 'approval' ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', border: 'none', borderRadius: '6px' }}
                      onClick={() => setStep3View('approval')}
                    >
                      แบบฟอร์มขออนุมัติค่าใช้จ่าย
                    </button>
                  </div>

                  <button className="btn btn-outline" onClick={exportToWord} style={{ color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff' }}>
                    <Save size={18} /> ดาวน์โหลดเป็น Word
                  </button>
                  <button className="btn btn-outline" onClick={exportToPdf} style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}>
                    <FileType size={18} /> ดาวน์โหลด PDF
                  </button>
                  <button className="btn btn-outline" onClick={handleCopyToWord} style={{ color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
                    <Copy size={18} /> คัดลอกลง Word
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    <Save size={18} /> สั่งพิมพ์
                  </button>
                </div>
              </div>
              
              {/* Document Preview Box */}
              <div className="document-preview-container">
                {step3View === 'memo' ? renderOfficialDocument() : renderExpenseApprovalForm()}
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
        {step3View === 'memo' ? renderOfficialDocument() : renderExpenseApprovalForm()}
      </div>
      
    </div>
  );
}
