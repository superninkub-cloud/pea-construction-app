"use client";

import React, { useState, useEffect, Suspense } from 'react';
import {
  ArrowRightLeft,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
  Calendar,
  Check,
  Plus,
  Trash2,
  Building,
  UserCheck,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  UploadCloud,
  Table as TableIcon,
  RotateCcw
} from 'lucide-react';
import TopBar from '../components/TopBar';

type EditSectionKey = 'header' | 'project' | 'reason' | 'transfers' | 'signer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'project', title: '2. โครงการ & อ้างอิงอนุมัติเดิม', shortName: 'โครงการ & WBS', icon: Briefcase },
  { key: 'reason', title: '3. เหตุผลความจำเป็นในการโอนงบ', shortName: 'เหตุผลชี้แจง', icon: Building },
  { key: 'transfers', title: '4. รายการโอนงบประมาณระหว่างโครงข่าย', shortName: 'รายการโอนงบ', icon: ArrowRightLeft },
  { key: 'signer', title: '5. ผู้เสนอและผู้อนุมัติ (อก.รย. & อฝ.วบ.)', shortName: 'ผู้เสนอ & อนุมัติ', icon: UserCheck },
];

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

const CATEGORIES = [
  "ค่าแรง",
  "ค่าควบคุมงาน",
  "ค่าขนส่ง",
  "ค่าเบ็ดเตล็ด",
  "ค่าดำเนินการ"
];

function BudgetTransferContent() {
  // Document State
  const [docFrom, setDocFrom] = useState('กรย.(ก3)');
  const [docTo, setDocTo] = useState('อฝ.วบ.(ก3)');
  const [docNo, setDocNo] = useState('ก.3 คชย.(ก3)-');
  const [docDate, setDocDate] = useState('๔ ตุลาคม ๒๕๖๙');
  const [subject, setSubject] = useState('ขออนุมัติโอนค่าใช้จ่ายหน้างาน');
  const [salutation, setSalutation] = useState('อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)');

  // Project Info
  const [projectName, setProjectName] = useState('งานปรับปรุงระบบจำหน่าย 22 เควี');
  const [wbs, setWbs] = useState('P-TDD02.3-I-LYAIA.0015');
  const [refDocNo, setRefDocNo] = useState('กวว.(วร) 380/2567');
  const [refDocDate, setRefDocDate] = useState('16 สิงหาคม 2567');
  const [peaOffice, setPeaOffice] = useState('กฟส.ลญ.');
  const [supervisorName, setSupervisorName] = useState('นายอุดมศักดิ์ จันทร์กลิ่น');
  const [supervisorLevel, setSupervisorLevel] = useState('พชง.7');

  // Reason
  const [reasonText, setReasonText] = useState('ปัจจุบันงานก่อสร้างดังกล่าวได้ดำเนินการแล้วเสร็จและจ่ายไฟแล้ว แต่เนื่องจากในการดำเนินการก่อสร้างมีความจำเป็นต้องดับกระแสไฟและระดมชุดงานเพื่อปฏิบัติงานในวันอาทิตย์หลายครั้ง ซึ่งในการปฏิบัติงานวันอาทิตย์นั้น กฟภ.ต้องจ่ายค่าแรงงานเป็น 2 เท่าของค่าแรงงานปกติ จึงส่งผลให้ค่าใช้จ่ายหน้างานในบางส่วนไม่เพียงพอ');

  // Signers
  const [signer1Name, setSigner1Name] = useState('นายอนันต์ กาญจนอุปถัมภ์');
  const [signer1Title, setSigner1Title] = useState('รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)');
  const [signer2Name, setSigner2Name] = useState('นายเมธี สุกก่ำ');
  const [signer2Title, setSigner2Title] = useState('อฝ.วบ.(ก3)');

  // Transfers List
  const [transfers, setTransfers] = useState<TransferItem[]>([
    {
      id: 't-1',
      networkFrom: '6001381477',
      categoryFrom: 'ค่าขนส่ง',
      networkTo: '6001381478',
      categoryTo: 'ค่าแรง',
      amount: 45000
    },
    {
      id: 't-2',
      networkFrom: '6001381477',
      categoryFrom: 'ค่าเบ็ดเตล็ด',
      networkTo: '6001381478',
      categoryTo: 'ค่าแรง',
      amount: 25000
    }
  ]);

  // UI state
  const [activeSheet, setActiveSheet] = useState<'memo' | 'approval'>('memo');
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // LocalStorage persist
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_budget_transfer_form_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.wbs) setWbs(parsed.wbs);
        if (parsed.docNo) setDocNo(parsed.docNo);
        if (parsed.docDate) setDocDate(parsed.docDate);
        if (parsed.refDocNo) setRefDocNo(parsed.refDocNo);
        if (parsed.refDocDate) setRefDocDate(parsed.refDocDate);
        if (parsed.peaOffice) setPeaOffice(parsed.peaOffice);
        if (parsed.supervisorName) setSupervisorName(parsed.supervisorName);
        if (parsed.reasonText) setReasonText(parsed.reasonText);
        if (parsed.signer1Name) setSigner1Name(parsed.signer1Name);
        if (parsed.signer2Name) setSigner2Name(parsed.signer2Name);
        if (parsed.transfers) setTransfers(parsed.transfers);
      }
    } catch (e) {
      console.warn('Could not load cached form', e);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = {
        projectName, wbs, docNo, docDate, refDocNo, refDocDate, peaOffice,
        supervisorName, reasonText, signer1Name, signer2Name, transfers
      };
      localStorage.setItem('pea_budget_transfer_form_v2', JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save form', e);
    }
  }, [projectName, wbs, docNo, docDate, refDocNo, refDocDate, peaOffice, supervisorName, reasonText, signer1Name, signer2Name, transfers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalAmount = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const fmt = (num: number) => num ? num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  const handleAddTransfer = () => {
    const newItem: TransferItem = {
      id: `t-${Date.now()}`,
      networkFrom: '',
      categoryFrom: 'ค่าขนส่ง',
      networkTo: '',
      categoryTo: 'ค่าแรง',
      amount: 0
    };
    setTransfers([...transfers, newItem]);
    showToast('✓ เพิ่มรายการโอนใหม่แล้ว');
  };

  const handleRemoveTransfer = (index: number) => {
    if (transfers.length <= 1) {
      showToast('⚠️ ต้องมีรายการโอนอย่างน้อย 1 รายการ');
      return;
    }
    setTransfers(transfers.filter((_, i) => i !== index));
  };

  const handleUpdateTransfer = (index: number, field: keyof TransferItem, val: any) => {
    const copy = [...transfers];
    copy[index] = { ...copy[index], [field]: val };
    setTransfers(copy);
  };

  const handleSetTodayDocDate = () => {
    const todayStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    setDocDate(todayStr);
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  const handleCopyWord = async () => {
    const el = document.getElementById('budget-print-area');
    if (!el) return;
    try {
      const html = el.innerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([el.innerText || ''], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('memo');
      showToast('✓ คัดลอกแล้ว! เปิด Microsoft Word แล้วกด Ctrl+V ได้ทันที');
    } catch (e) {
      showToast('✓ คัดลอกข้อความสำเร็จ');
    }
  };

  const handleResetToSample = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้นใช่หรือไม่?')) {
      setDocFrom('กรย.(ก3)');
      setDocTo('อฝ.วบ.(ก3)');
      setDocNo('ก.3 คชย.(ก3)-');
      setDocDate('๔ ตุลาคม ๒๕๖๙');
      setSubject('ขออนุมัติโอนค่าใช้จ่ายหน้างาน');
      setSalutation('อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)');
      setProjectName('งานปรับปรุงระบบจำหน่าย 22 เควี');
      setWbs('P-TDD02.3-I-LYAIA.0015');
      setRefDocNo('กวว.(วร) 380/2567');
      setRefDocDate('16 สิงหาคม 2567');
      setPeaOffice('กฟส.ลญ.');
      setSupervisorName('นายอุดมศักดิ์ จันทร์กลิ่น');
      setReasonText('ปัจจุบันงานก่อสร้างดังกล่าวได้ดำเนินการแล้วเสร็จและจ่ายไฟแล้ว แต่เนื่องจากในการดำเนินการก่อสร้างมีความจำเป็นต้องดับกระแสไฟและระดมชุดงานเพื่อปฏิบัติงานในวันอาทิตย์หลายครั้ง ซึ่งในการปฏิบัติงานวันอาทิตย์นั้น กฟภ.ต้องจ่ายค่าแรงงานเป็น 2 เท่าของค่าแรงงานปกติ จึงส่งผลให้ค่าใช้จ่ายหน้างานในบางส่วนไม่เพียงพอ');
      setSigner1Name('นายอนันต์ กาญจนอุปถัมภ์');
      setSigner2Name('นายเมธี สุกก่ำ');
      showToast('✓ รีเซ็ตเป็นตัวอย่างเริ่มต้นแล้ว');
    }
  };

  const currentSectionIndex = SECTIONS_META.findIndex(s => s.key === activeEditSection);
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setActiveEditSection(SECTIONS_META[currentSectionIndex - 1].key);
    }
  };
  const handleNextSection = () => {
    if (currentSectionIndex < SECTIONS_META.length - 1) {
      setActiveEditSection(SECTIONS_META[currentSectionIndex + 1].key);
    }
  };

  return (
    <>
      <TopBar title="โปรแกรมเอกสารใบขอเบิกค่าใช้จ่าย (โอนงบ)" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <ArrowRightLeft size={18} className="text-purple-300" />
              <span>เอกสารใบขอเบิกค่าใช้จ่าย / โอนงบ</span>
            </div>
            <div className="a4-preset-group">
              <span className="text-xs text-slate-300 font-medium">แผ่นเอกสาร:</span>
              <button
                type="button"
                className={`a4-preset-chip ${activeSheet === 'memo' ? 'active' : ''}`}
                onClick={() => setActiveSheet('memo')}
              >
                หน้า ๑: บันทึกข้อความ
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${activeSheet === 'approval' ? 'active' : ''}`}
                onClick={() => setActiveSheet('approval')}
              >
                หน้า ๒: แบบฟอร์มขออนุมัติ
              </button>
              <button
                type="button"
                className="a4-preset-chip"
                onClick={handleResetToSample}
                title="รีเซ็ตเป็นตัวอย่างเริ่มต้น"
              >
                <RotateCcw size={13} /> รีเซ็ต
              </button>
            </div>
          </div>

          <div className="a4-action-right">
            <button
              type="button"
              className="a4-action-btn a4-btn-muted"
              onClick={handleSetTodayDocDate}
              title="ใส่วันที่ปัจจุบันในเอกสาร"
            >
              <Calendar size={15} /> วันที่วันนี้
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-indigo"
              onClick={handleCopyWord}
              title="คัดลอกลง Word (Ctrl+V ได้ทันที)"
            >
              <Copy size={15} /> คัดลอกลง Word
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-amber"
              onClick={() => window.print()}
              title="สั่งพิมพ์หน้ากระดาษ A4"
            >
              <Printer size={15} /> พิมพ์ A4
            </button>
          </div>
        </div>

        {/* Section Quick Jump Bar */}
        <div className="a4-jump-bar no-print">
          <span className="text-xs text-slate-400 font-medium">จิ้มแก้ไขส่วน:</span>
          {SECTIONS_META.map((sec) => (
            <button
              key={sec.key}
              type="button"
              className={`a4-jump-chip ${activeEditSection === sec.key ? 'active' : ''}`}
              onClick={() => setActiveEditSection(sec.key)}
            >
              <sec.icon size={13} />
              <span>{sec.shortName}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* A4 PAPER CANVAS (LIVE EDITABLE)                                           */}
        {/* ========================================================================= */}
        <div className="a4-page-shadow" id="budget-print-area">
          {/* SHEET 1: MEMO */}
          {activeSheet === 'memo' && (
            <div className="a4-page">
              {/* 1. HEADER SECTION */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('header')}
                title="คลิกเพื่อแก้ไขส่วนหัวหนังสือ"
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขส่วนหัวหนังสือ
                </div>

                <div className="a4-pea-header">
                  <img
                    src="/pea-logo.png"
                    alt="PEA Logo"
                    style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                  />
                  <div style={{ marginLeft: '12px' }}>
                    <div style={{ fontSize: '20pt', fontWeight: 'bold', lineHeight: 1.15, fontFamily: 'var(--font-sarabun)' }}>
                      บันทึกข้อความ
                    </div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', letterSpacing: '0.4px', color: '#1e293b' }}>
                      การไฟฟ้าส่วนภูมิภาค
                    </div>
                  </div>
                </div>

                <table className="a4-info-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '10%', fontWeight: 'bold' }}>หน่วยงาน</td>
                      <td style={{ width: '40%' }}>
                        <input
                          type="text"
                          className="a4-live-input"
                          value={docFrom}
                          onChange={(e) => setDocFrom(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ width: '10%', fontWeight: 'bold' }}>โทร.</td>
                      <td style={{ width: '40%' }}>
                        <span style={{ color: '#475569' }}>-</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>ที่</td>
                      <td>
                        <input
                          type="text"
                          className="a4-live-input"
                          value={docNo}
                          onChange={(e) => setDocNo(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="เลขที่หนังสือ"
                        />
                      </td>
                      <td style={{ fontWeight: 'bold' }}>วันที่</td>
                      <td>
                        <input
                          type="text"
                          className="a4-live-input"
                          value={docDate}
                          onChange={(e) => setDocDate(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="เช่น ๔ ตุลาคม ๒๕๖๙"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                      <td colSpan={3}>
                        <input
                          type="text"
                          className="a4-live-input"
                          style={{ fontWeight: 'bold' }}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>เรียน</td>
                      <td colSpan={3}>
                        <input
                          type="text"
                          className="a4-live-input"
                          value={salutation}
                          onChange={(e) => setSalutation(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. PROJECT & REASON SECTION */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('project')}
                title="คลิกเพื่อแก้ไขข้อมูลโครงการและหนังสืออ้างอิง"
                style={{ marginTop: '12pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขข้อมูลโครงการ & อ้างอิง
                </div>

                <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                  ๑. ตามหนังสือ <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{refDocNo || '..................'}</span> ลงวันที่{' '}
                  <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{refDocDate || '..................'}</span> อนุมัติให้งาน{' '}
                  <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{projectName}</span> หมายเลขงาน (WBS){' '}
                  <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{wbs}</span> โดยมี{' '}
                  <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{supervisorName}</span> เป็นผู้ควบคุมงาน นั้น
                </p>

                <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginTop: '6pt' }}>
                  ๒. {reasonText}
                </p>
              </div>

              {/* 3. TRANSFERS SECTION */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('transfers')}
                title="คลิกเพื่อแก้ไขรายการโอนงบ"
                style={{ marginTop: '8pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขรายการโอนงบ ({transfers.length} รายการ)
                </div>

                <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                  ๓. กรย.(ก3) พิจารณาแล้ว เพื่อให้การเบิกจ่ายค่าใช้จ่ายหน้างานเป็นไปด้วยความเรียบร้อย จึงเห็นควรขออนุมัติโอนงบค่าใช้จ่ายหน้างาน ดังนี้
                </p>

                <div style={{ margin: '6pt 0 10pt 3.5cm', lineHeight: 1.6 }}>
                  {transfers.map((t, idx) => (
                    <div key={t.id} style={{ marginBottom: '4pt' }}>
                      ๓.{idx + 1} โอน{t.categoryFrom} โครงข่าย {t.networkFrom || '............'} ไปเป็น {t.categoryTo} โครงข่าย {t.networkTo || '............'} จำนวน <span style={{ fontWeight: 600, color: '#15803d' }}>{fmt(t.amount)}</span> บาท
                    </div>
                  ))}
                  <div style={{ fontWeight: 'bold', color: '#1e3a8a', marginTop: '6pt' }}>
                    รวมเป็นเงินทั้งสิ้น {fmt(totalAmount)} บาท
                  </div>
                </div>

                <p className="a4-text-indent" style={{ marginTop: '12pt', marginBottom: '24pt' }}>
                  จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติโอนงบค่าใช้จ่ายต่างๆ ตามเสนอ พร้อมลงนามในแบบฟอร์มโอนค่าใช้จ่ายตามเอกสารแนบต่อไป
                </p>
              </div>

              {/* 4. SIGNER & APPROVER SECTION */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('signer')}
                title="คลิกเพื่อแก้ไขผู้เสนอ & ผู้อนุมัติ"
                style={{ marginTop: '12pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขผู้เสนอ & ผู้อนุมัติ
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24pt' }}>
                  <div style={{ textAlign: 'center', minWidth: '270px' }}>
                    <div style={{ height: '36px' }}></div>
                    <div>({signer1Name})</div>
                    <div style={{ fontSize: '12pt', color: '#334155', marginTop: '2pt' }}>{signer1Title}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10pt', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '13pt' }}>
                    <div style={{ fontWeight: 600 }}>- ผจก.{peaOffice || '........................'}</div>
                    <div style={{ marginTop: '4pt', paddingLeft: '1cm' }}>อนุมัติ และให้ดำเนินการในส่วนเกี่ยวข้องต่อไป</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '250px' }}>
                    <div style={{ height: '30px' }}></div>
                    <div>({signer2Name})</div>
                    <div style={{ fontSize: '12pt', color: '#475569' }}>{signer2Title}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SHEET 2: EXPENSE APPROVAL FORM */}
          {activeSheet === 'approval' && (
            <div className="a4-page">
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('header')}
                title="คลิกเพื่อแก้ไขข้อมูลแบบฟอร์ม"
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขข้อมูลแบบฟอร์ม
                </div>

                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16pt', marginBottom: '4pt' }}>
                  การไฟฟ้าส่วนภูมิภาค
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '15pt', marginBottom: '16pt' }}>
                  แบบฟอร์มขออนุมัติค่าใช้จ่ายหน้างาน
                </div>

                <table className="a4-info-table" style={{ marginBottom: '14pt' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '10%', fontWeight: 'bold' }}>จาก</td>
                      <td style={{ width: '40%' }}>{docFrom}</td>
                      <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                      <td style={{ width: '40%' }}>ฝวบ.(ก3)</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                      <td colSpan={3}>ขออนุมัติโอนค่าใช้จ่ายหน้างาน</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>เรียน</td>
                      <td colSpan={3}>{docTo} ผ่าน รฝ.วบ.(ก3)</td>
                    </tr>
                  </tbody>
                </table>

                <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '12pt' }}>
                  ตามหนังสือ {refDocNo || '..................'} ลงวันที่ {refDocDate || '..................'} อนุมัติให้งาน {projectName} หมายเลขงาน (WBS) {wbs} นั้น ในขั้นนี้เห็นควรอนุมัติค่าใช้จ่ายหน้างานในการก่อสร้าง (เพิ่มเติม) ดังรายการต่อไปนี้
                </p>
              </div>

              {/* TABLE TRANSFERS */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('transfers')}
                title="คลิกเพื่อแก้ไขตารางโอนงบ"
                style={{ marginTop: '8pt', marginBottom: '14pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขตารางรายการโอน
                </div>

                <table className="a4-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%', textAlign: 'center' }}>ลำดับ</th>
                      <th style={{ width: '30%' }}>โครงข่ายต้นทาง (โอนออก)</th>
                      <th style={{ width: '30%' }}>โครงข่ายปลายทาง (รับโอน)</th>
                      <th style={{ width: '30%', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t, idx) => (
                      <tr key={t.id}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>{t.categoryFrom} ({t.networkFrom || '-'})</td>
                        <td>{t.categoryTo} ({t.networkTo || '-'})</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(t.amount)}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                      <td colSpan={3} style={{ textAlign: 'center' }}>รวมทั้งสิ้น</td>
                      <td style={{ textAlign: 'right', color: '#1e3a8a' }}>{fmt(totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('signer')}
                title="คลิกเพื่อแก้ไขผู้เสนอ & ผู้อนุมัติ"
                style={{ marginTop: '16pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขผู้ลงนาม
                </div>

                <p className="a4-text-indent" style={{ lineHeight: 1.6, marginBottom: '6pt' }}>
                  จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติค่าใช้จ่ายหน้างานเป็นเงิน {fmt(totalAmount)} บาท
                </p>
                <p style={{ textIndent: '2.5cm', marginBottom: '24pt' }}>
                  โดยให้ ผจก.{peaOffice || '........................'} เป็นผู้เบิกและสั่งจ่ายต่อไป
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20pt' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ height: '36px' }}></div>
                    <div>({signer1Name})</div>
                    <div style={{ fontSize: '12pt', color: '#475569' }}>{signer1Title}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14pt', marginBottom: '8pt' }}>อนุมัติ</div>
                    <div style={{ height: '24px' }}></div>
                    <div>({signer2Name})</div>
                    <div style={{ fontSize: '12pt', color: '#475569' }}>{signer2Title}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BIG SECTION POP-OUT EDITOR MODAL                                          */}
      {/* ========================================================================= */}
      {activeEditSection && (
        <div className="big-editor-overlay" onClick={() => setActiveEditSection(null)}>
          <div className="big-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="big-editor-header">
              <div className="big-editor-title">
                {(() => {
                  const meta = SECTIONS_META.find(s => s.key === activeEditSection);
                  const Icon = meta?.icon || FileText;
                  return (
                    <>
                      <Icon size={22} className="text-purple-400" />
                      <span>{meta?.title}</span>
                    </>
                  );
                })()}
              </div>
              <button
                type="button"
                className="big-editor-close"
                onClick={() => setActiveEditSection(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="big-editor-body">
              {/* SECTION 1: HEADER */}
              {activeEditSection === 'header' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">จาก (หน่วยงานเจ้าของเรื่อง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docFrom}
                        onChange={(e) => setDocFrom(e.target.value)}
                        placeholder="เช่น กรย.(ก3)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ถึง (หน่วยงานปลายทาง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docTo}
                        onChange={(e) => setDocTo(e.target.value)}
                        placeholder="เช่น อฝ.วบ.(ก3)"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่หนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docNo}
                        onChange={(e) => setDocNo(e.target.value)}
                        placeholder="เช่น ก.3 คชย.(ก3)-"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        placeholder="เช่น ๔ ตุลาคม ๒๕๖๙"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรื่อง</label>
                    <input
                      type="text"
                      className="big-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรียน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value)}
                      placeholder="เช่น อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: PROJECT & WBS */}
              {activeEditSection === 'project' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ชื่องานก่อสร้าง</label>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="เช่น งานปรับปรุงระบบจำหน่าย 22 เควี..."
                    />
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">หมายเลขงาน WBS</label>
                      <input
                        type="text"
                        className="big-input"
                        value={wbs}
                        onChange={(e) => setWbs(e.target.value)}
                        placeholder="เช่น P-TDD02.3-I-LYAIA.0015"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">กฟฟ. ที่ขออนุมัติเบิกจ่าย</label>
                      <input
                        type="text"
                        className="big-input"
                        value={peaOffice}
                        onChange={(e) => setPeaOffice(e.target.value)}
                        placeholder="เช่น กฟส.ลญ."
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">อ้างถึงหนังสือเลขที่</label>
                      <input
                        type="text"
                        className="big-input"
                        value={refDocNo}
                        onChange={(e) => setRefDocNo(e.target.value)}
                        placeholder="เช่น กวว.(วร) 380/2567"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่หนังสืออ้างอิง</label>
                      <input
                        type="text"
                        className="big-input"
                        value={refDocDate}
                        onChange={(e) => setRefDocDate(e.target.value)}
                        placeholder="เช่น 16 สิงหาคม 2567"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้ควบคุมงาน</label>
                      <input
                        type="text"
                        className="big-input"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                        placeholder="เช่น นายอุดมศักดิ์ จันทร์กลิ่น"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ตำแหน่ง / ระดับ พชง.</label>
                      <input
                        type="text"
                        className="big-input"
                        value={supervisorLevel}
                        onChange={(e) => setSupervisorLevel(e.target.value)}
                        placeholder="เช่น พชง.7"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: REASON */}
              {activeEditSection === 'reason' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">เหตุผลความจำเป็นในการขอโอนงบ (ข้อ ๒)</label>
                    <textarea
                      rows={5}
                      className="big-textarea"
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: TRANSFERS */}
              {activeEditSection === 'transfers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="big-label" style={{ marginBottom: 0 }}>
                      รายการโอนงบประมาณ ({transfers.length} รายการ)
                    </label>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-emerald"
                      onClick={handleAddTransfer}
                    >
                      <Plus size={15} /> เพิ่มรายการโอน
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transfers.map((t, idx) => (
                      <div key={t.id} className="big-table-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                            รายการโอนที่ {idx + 1}
                          </span>
                          {transfers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTransfer(idx)}
                              className="a4-action-btn"
                              style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px' }}
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          )}
                        </div>

                        <div className="big-grid-2">
                          {/* ต้นทาง */}
                          <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>โอนจาก (ต้นทาง)</div>
                            <div style={{ marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>เลขที่โครงข่ายต้นทาง</span>
                              <input
                                type="text"
                                className="big-input"
                                value={t.networkFrom}
                                onChange={(e) => handleUpdateTransfer(idx, 'networkFrom', e.target.value)}
                                placeholder="เช่น 6001381477"
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>หมวดค่าใช้จ่าย</span>
                              <select
                                className="big-input"
                                value={t.categoryFrom}
                                onChange={(e) => handleUpdateTransfer(idx, 'categoryFrom', e.target.value)}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* ปลายทาง */}
                          <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>ไปเป็น (ปลายทาง)</div>
                            <div style={{ marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>เลขที่โครงข่ายปลายทาง</span>
                              <input
                                type="text"
                                className="big-input"
                                value={t.networkTo}
                                onChange={(e) => handleUpdateTransfer(idx, 'networkTo', e.target.value)}
                                placeholder="เช่น 6001381478"
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>หมวดค่าใช้จ่าย</span>
                              <select
                                className="big-input"
                                value={t.categoryTo}
                                onChange={(e) => handleUpdateTransfer(idx, 'categoryTo', e.target.value)}
                              >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="big-field-group" style={{ marginTop: '8px', marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>จำนวนเงินที่โอน (บาท)</span>
                          <input
                            type="number"
                            className="big-input"
                            value={t.amount}
                            onChange={(e) => handleUpdateTransfer(idx, 'amount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#6d28d9' }}>
                      <span>รวมรายการโอนทั้งสิ้น:</span>
                      <span>{fmt(totalAmount)} บาท</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SIGNER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้เสนอขออนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer1Name}
                        onChange={(e) => setSigner1Name(e.target.value)}
                        placeholder="เช่น นายอนันต์ กาญจนอุปถัมภ์"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ตำแหน่งผู้เสนอ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer1Title}
                        onChange={(e) => setSigner1Title(e.target.value)}
                        placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้อนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer2Name}
                        onChange={(e) => setSigner2Name(e.target.value)}
                        placeholder="เช่น นายเมธี สุกก่ำ"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ตำแหน่งผู้อนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={signer2Title}
                        onChange={(e) => setSigner2Title(e.target.value)}
                        placeholder="เช่น อฝ.วบ.(ก3)"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="big-editor-footer">
              <button
                type="button"
                className="stepper-btn"
                onClick={handlePrevSection}
                disabled={currentSectionIndex === 0}
              >
                <ChevronLeft size={16} /> ส่วนก่อนหน้า
              </button>

              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {currentSectionIndex + 1} จาก {SECTIONS_META.length} ส่วน
              </div>

              {currentSectionIndex < SECTIONS_META.length - 1 ? (
                <button
                  type="button"
                  className="stepper-btn primary"
                  onClick={handleNextSection}
                >
                  ส่วนถัดไป <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="stepper-btn primary"
                  onClick={() => setActiveEditSection(null)}
                >
                  เสร็จสิ้น / บันทึก <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="a4-toast no-print">
          <Check size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default function BudgetTransferPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>กำลังโหลดแบบฟอร์ม...</div>}>
      <BudgetTransferContent />
    </Suspense>
  );
}
