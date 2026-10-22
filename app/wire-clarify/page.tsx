"use client";

import React, { useState, useEffect } from 'react';
import {
  FileWarning,
  Calculator,
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
  ShieldCheck,
  Briefcase,
  Layers,
  Percent,
  Sliders,
  Info,
  HelpCircle,
  RotateCcw,
  HardHat,
  FileText
} from 'lucide-react';
import './wire-clarify.css';
import {
  WireClarifyFormData,
  WireItem,
  SAMPLE_WIRE_CLARIFY_DATA,
  POPULAR_WIRE_TYPES,
  PRESET_WIRE_REASONS,
  composeWireBackground,
  composeWireFacts,
  formatKg,
  calculateWirePercent,
  formatPercent,
  getTodayThaiDate,
  generateWireClarifyMemoPlainText,
  generateWireClarifyWordDocument
} from './wireClarifyUtils';
import TopBar from '../components/TopBar';

type EditSectionKey = 'header' | 'project' | 'table' | 'reason' | 'signer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileWarning },
  { key: 'project', title: '2. โครงการ & อ้างอิงอนุมัติรื้อถอน', shortName: 'โครงการ & WBS', icon: Briefcase },
  { key: 'table', title: '3. ตารางเปรียบเทียบเศษสายรื้อถอน (กก. / %)', shortName: 'ตารางเศษสาย', icon: Calculator },
  { key: 'reason', title: '4. ข้อเท็จจริงและเหตุผลที่คืนไม่ครบ', shortName: 'เหตุผลชี้แจง', icon: Building },
  { key: 'signer', title: '5. ผู้ลงนามและผู้อนุมัติ', shortName: 'ผู้ลงนาม & อนุมัติ', icon: UserCheck },
];

export default function WireClarifyPage() {
  const [formData, setFormData] = useState<WireClarifyFormData>(SAMPLE_WIRE_CLARIFY_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [reasonMode, setReasonMode] = useState<'guided' | 'freeform'>('guided');
  const [selectedReasonKey, setSelectedReasonKey] = useState<string>('short_pieces');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_wire_clarify_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          const fixedDocTo = parsed.docTo === 'ผวบ.(ก3)' ? 'ฝวบ.(ก3)' : (parsed.docTo || 'ฝวบ.(ก3)');
          const fixedSalutation = parsed.salutation?.includes('อผ.วบ.')
            ? 'อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)'
            : (parsed.salutation || 'อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)');
          const fixedSignerTitle = (parsed.signerTitle?.includes('กรย.') || !parsed.signerTitle)
            ? 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)'
            : parsed.signerTitle;
          const fixedApproverTitle = (parsed.approverTitle === 'อผ.วบ.(ก3)' || !parsed.approverTitle)
            ? 'อฝ.วบ.(ก3)'
            : parsed.approverTitle;
          const fixedConsideration = parsed.memoConsideration?.includes('ตามสภาพหน้างาน ดังนี้ ทั้งนี้')
            ? parsed.memoConsideration.replace('ตามสภาพหน้างาน ดังนี้ ทั้งนี้', 'ตามสภาพหน้างาน ทั้งนี้')
            : (parsed.memoConsideration || SAMPLE_WIRE_CLARIFY_DATA.memoConsideration);
          const fixedApproverEndorsement = (parsed.approverEndorsementTo === '- กรย.(ก3)' || !parsed.approverEndorsementTo)
            ? '- อก.รย.(ก3)'
            : parsed.approverEndorsementTo;
          const fixedApproverName = (parsed.approverName === 'นายเมธี สุกก่ำ' || parsed.approverName === 'นายเมธี สุภาก่า' || !parsed.approverName)
            ? 'นายเมธี สุภาก่ำ'
            : parsed.approverName;

          setFormData({
            ...SAMPLE_WIRE_CLARIFY_DATA,
            ...parsed,
            docTo: fixedDocTo,
            salutation: fixedSalutation,
            signerTitle: fixedSignerTitle,
            approverTitle: fixedApproverTitle,
            memoConsideration: fixedConsideration,
            approverEndorsementTo: fixedApproverEndorsement,
            approverName: fixedApproverName,
          });
        }
      }
    } catch (e) {
      console.error('Error loading stored wire clarify form:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pea_wire_clarify_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetToSample = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นแบบฟอร์มตัวอย่างเริ่มต้นใช่หรือไม่?')) {
      setFormData(SAMPLE_WIRE_CLARIFY_DATA);
      try {
        localStorage.removeItem('pea_wire_clarify_form');
      } catch (e) {}
      showToast('✓ รีเซ็ตเป็นแบบฟอร์มตัวอย่างแล้ว');
    }
  };

  const handleSetTodayDocDate = () => {
    const todayStr = getTodayThaiDate('short');
    setFormData(prev => ({
      ...prev,
      docDate: todayStr,
      signerDate: todayStr
    }));
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  // Synchronize 4 dynamic variables with formal paragraphs
  const handleUpdateVariable = (
    field: 'approvalDocRef' | 'projectName' | 'wbsNo' | 'supervisorName' | 'supervisorPosition',
    value: string
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const newBackground = composeWireBackground({
        approvalDocRef: updated.approvalDocRef,
        projectName: updated.projectName,
        wbsNo: updated.wbsNo,
        supervisorName: updated.supervisorName,
        supervisorPosition: updated.supervisorPosition
      });
      const preset = PRESET_WIRE_REASONS.find(r => r.key === selectedReasonKey);
      const newFacts = composeWireFacts({
        projectName: updated.projectName,
        dept: 'ผกร.กรย.(ก3)',
        factsDetail: preset?.factsDetail
      });
      return {
        ...updated,
        memoBackground: newBackground,
        memoFacts: newFacts
      };
    });
  };

  const handleSelectPresetWireReason = (preset: typeof PRESET_WIRE_REASONS[0]) => {
    setSelectedReasonKey(preset.key);
    setFormData(prev => {
      const newFacts = composeWireFacts({
        projectName: prev.projectName,
        dept: 'ผกร.กรย.(ก3)',
        factsDetail: preset.factsDetail
      });
      return {
        ...prev,
        memoFacts: newFacts
      };
    });
    showToast(`✓ เลือกสาเหตุ: ${preset.badge}`);
  };

  // Render on-screen 1. เรื่องเดิม with interactive color highlights
  const renderScreenBackgroundText = () => {
    const ref = formData.approvalDocRef || 'ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 สิงหาคม 2567';
    const proj = formData.projectName || 'ปรับปรุงระบบจำหน่าย 22 เควี';
    const wbs = formData.wbsNo || 'P-TDD02.3-I-LYAIA.0016';
    const name = formData.supervisorName || 'นายอุดมศักดิ์ จันทร์กลั่น';
    const pos = formData.supervisorPosition || 'หชง.4 ผกร.กรย.(ก3)';

    return (
      <>
        <span>ตามหนังสือที่ </span>
        <span
          className="a4-var-spot"
          title="🟡 จุดที่ 1: หนังสืออนุมัติงานเดิม (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {ref.replace(/^ตามหนังสือที่\s*/, '')}
        </span>{' '}
        <span>อนุมัติให้</span>{' '}
        <span
          className="a4-var-spot blue"
          title="🔵 จุดที่ 2: ชื่องานและสถานที่ก่อสร้าง (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {proj}
        </span>{' '}
        <span>หมายเลขงาน (WBS) : </span>{' '}
        <span
          className="a4-var-spot orange"
          title="🟠 จุดที่ 3: หมายเลขงาน WBS (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {wbs}
        </span>{' '}
        <span>โดยมี</span>{' '}
        <span
          className="a4-var-spot green"
          title="🟢 จุดที่ 4: ผู้ควบคุมงาน (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {name} {pos}
        </span>{' '}
        <span>เป็นผู้ควบคุมงาน นั้น</span>
      </>
    );
  };


  // Calculations
  const totalEstimatedKg = formData.items.reduce((sum, item) => sum + (Number(item.estimatedKg) || 0), 0);
  const totalActualKg = formData.items.reduce((sum, item) => sum + (Number(item.actualKg) || 0), 0);
  const totalPercentage = calculateWirePercent(totalActualKg, totalEstimatedKg);

  const handleAddItem = () => {
    const newItem: WireItem = {
      id: `wire-${Date.now()}`,
      wireType: POPULAR_WIRE_TYPES[0],
      estimatedKg: 0,
      actualKg: 0,
      remarks: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    showToast('✓ เพิ่มรายการสายใหม่แล้ว');
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) {
      showToast('⚠️ ต้องมีรายการสายอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: keyof WireItem, value: any) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleCopyMemo = async () => {
    const plainText = generateWireClarifyMemoPlainText(formData);
    const html = generateWireClarifyWordDocument(formData);
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('memo');
      showToast('✓ คัดลอกแล้ว! เปิด Microsoft Word แล้วกด Ctrl+V ได้ทันที');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('memo');
      showToast('✓ คัดลอกข้อความแล้ว (Plain Text)');
    }
  };

  const handleDownloadWordFile = () => {
    const content = generateWireClarifyWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanWbs = formData.wbsNo?.replace(/[^a-zA-Z0-9]/g, '_') || 'PEA';
    link.download = `บันทึกชี้แจงส่งคืนเศษสายไม่ครบ_${cleanWbs}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) สำเร็จ');
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
      <TopBar title="โปรแกรมชี้แจงส่งคืนเศษสายไม่ครบ" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <Percent size={18} className="text-orange-400" />
              <span>ชี้แจงส่งคืนเศษสายไม่ครบ (ผกร.กรย.ก3)</span>
            </div>
            <div className="a4-preset-group">
              <button
                type="button"
                className={`a4-preset-chip ${formData.docLevel === 'division_memo' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, docLevel: 'division_memo' }))}
              >
                บันทึกกอง (กรย. เสนอ ผวบ.)
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${formData.docLevel === 'supervisor_report' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, docLevel: 'supervisor_report' }))}
              >
                บันทึกผู้คุมงาน (รายงาน ผกร.)
              </button>
              <button
                type="button"
                className="a4-preset-chip"
                onClick={handleResetToSample}
                title="รีเซ็ตเป็นตัวอย่างเริ่มต้น"
              >
                คืนค่าตัวอย่าง
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
              onClick={handleCopyMemo}
              title="คัดลอกลง Word (Ctrl+V ได้ทันที)"
            >
              <Copy size={15} /> คัดลอกลง Word
            </button>
            <button
              type="button"
              className="a4-action-btn a4-btn-emerald"
              onClick={handleDownloadWordFile}
              title="ดาวน์โหลดไฟล์ .doc"
            >
              <Download size={15} /> ดาวน์โหลด Word
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
        <div className="a4-page-shadow">
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
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น กรย.(ก3)"
                      />
                    </td>
                    <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                    <td style={{ width: '40%' }}>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น ฝวบ.(ก3)"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>ที่</td>
                    <td>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เลขที่หนังสือ เช่น มท 5309.16/..."
                      />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>วันที่</td>
                    <td>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น 4 ตุลาคม 2569"
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
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                        value={formData.salutation}
                        onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2 & 4. BODY CONTENT */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('reason')}
              title="คลิกเพื่อแก้ไขเนื้อหาและเหตุผลความจำเป็น"
              style={{ marginTop: '12pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขข้อความและเหตุผลชี้แจง
              </div>

              {formData.docLevel === 'division_memo' ? (
                <>
                  {/* Dynamic Variable Hint on Screen */}
                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      📌 ตัวแปรประจำงานนี้: [WBS: {formData.wbsNo}] [ผู้ควบคุมงาน: {formData.supervisorName}]
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      (ส่วนที่มีสีไฮไลท์คือจุดที่เปลี่ยนแต่ละงาน • เมื่อสั่งพิมพ์หรือก๊อปปี้จะเป็นสีดำทางการปกติ)
                    </span>
                  </div>

                  <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>1. เรื่องเดิม</p>
                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '8pt' }}>
                    <span className="wc-print-only">{formData.memoBackground}</span>
                    <span className="no-print">{renderScreenBackgroundText()}</span>
                  </p>

                  <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>2. ข้อเท็จจริง</p>
                  {(formData.memoFacts || '').split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => (
                    <p key={idx} className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '6pt', textIndent: '2.5cm' }}>
                      {line}
                    </p>
                  ))}
                </>
              ) : (
                <>
                  {(formData.supervisorBody || '').split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => (
                    <p key={idx} className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '6pt', textIndent: '2.5cm' }}>
                      {line}
                    </p>
                  ))}
                </>
              )}
            </div>

            {/* 3. WIRE TABLE SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('table')}
              title="คลิกเพื่อแก้ไขตารางเศษสาย"
              style={{ marginTop: '8pt', marginBottom: '12pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขตารางเศษสาย ({formData.items.length} รายการ)
              </div>

              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13pt', marginBottom: '6pt' }}>
                ตารางเปรียบเทียบปริมาณเศษสายรื้อถอน
              </div>

              <table className="a4-table">
                <thead>
                  <tr>
                    <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                    <th style={{ width: '42%' }}>ชนิดสาย</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>ประมาณการ (กก.)</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>ส่งคืนจริง (กก.)</th>
                    <th style={{ width: '14%', textAlign: 'right' }}>ร้อยละ (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => {
                    const pct = calculateWirePercent(item.actualKg, item.estimatedKg);
                    return (
                      <tr key={item.id}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>{item.wireType}</td>
                        <td style={{ textAlign: 'right' }}>{formatKg(item.estimatedKg)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatKg(item.actualKg)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: pct < 100 ? '#b91c1c' : '#15803d' }}>
                          {formatPercent(pct)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                    <td colSpan={2} style={{ textAlign: 'center' }}>รวมทั้งสิ้น</td>
                    <td style={{ textAlign: 'right' }}>{formatKg(totalEstimatedKg)}</td>
                    <td style={{ textAlign: 'right' }}>{formatKg(totalActualKg)}</td>
                    <td style={{ textAlign: 'right', color: totalPercentage < 100 ? '#b91c1c' : '#15803d' }}>
                      {formatPercent(totalPercentage)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CONSIDERATION & CLOSING */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('reason')}
              title="คลิกเพื่อแก้ไขข้อพิจารณาและคำลงท้าย"
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขข้อพิจารณา
              </div>

              {formData.docLevel === 'division_memo' ? (
                <>
                  <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>3. ข้อพิจารณา</p>
                  <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '8pt' }}>
                    {formData.memoConsideration}
                  </p>
                  <p className="a4-text-indent" style={{ marginTop: '12pt', marginBottom: '24pt' }}>
                    {formData.memoClosing}
                  </p>
                </>
              ) : (
                <p className="a4-text-indent" style={{ marginTop: '12pt', marginBottom: '24pt' }}>
                  {formData.supervisorClosing}
                </p>
              )}
            </div>

            {/* 5. SIGNER & APPROVER SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('signer')}
              title="คลิกเพื่อแก้ไขผู้ลงนาม"
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10pt', marginBottom: '24pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้ลงนาม
              </div>

              <div style={{ textAlign: 'center', minWidth: '270px' }}>
                <div style={{ height: '36px' }}></div>
                <div>({formData.signerName || '...................................................'})</div>
                <div style={{ fontSize: '13pt', color: '#334155', marginTop: '2pt' }}>{formData.signerTitle}</div>
                {formData.signerDate && (
                  <div style={{ fontSize: '12pt', color: '#64748b', marginTop: '2pt' }}>{formData.signerDate}</div>
                )}
              </div>
            </div>

            {/* APPROVAL STAMPS / FOOTER */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('signer')}
              title="คลิกเพื่อแก้ไขผู้อนุมัติ & ท้ายกระดาษ"
              style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10pt', marginTop: '14pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้อนุมัติ & ท้ายกระดาษ
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12pt' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{formData.approverEndorsementTo || '- อก.รย.(ก3)'}</div>
                  <div style={{ marginTop: '3pt', color: '#475569' }}>อนุมัติ ดำเนินการตามเสนอ</div>
                  <div style={{ height: '30px' }}></div>
                  <div>({formData.approverName})</div>
                  <div style={{ fontSize: '11pt', color: '#64748b' }}>{formData.approverTitle}</div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11pt', color: '#475569' }}>
                  <div>รฝ.วบ.(ก3) ............................ วันที่ ....../....../......</div>
                  <div style={{ marginTop: '8pt' }}>ผห.กร.(ก3) ............................ วันที่ ....../....../......</div>
                  <div style={{ marginTop: '8pt' }}>ชผ.กร.(ก3) ............................ วันที่ ....../....../......</div>
                </div>
              </div>

              <div style={{ marginTop: '14pt', fontSize: '10pt', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '6pt' }}>
                {formData.contactDepartment} โทรศัพท์ {formData.contactPhone}
              </div>
            </div>
          </div>
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
                  const Icon = meta?.icon || FileWarning;
                  return (
                    <>
                      <Icon size={22} className="text-orange-400" />
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
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        placeholder="เช่น กรย.(ก3)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ถึง (หน่วยงานปลายทาง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="เช่น ฝวบ.(ก3)"
                      />
                      <div className="var-quick-options" style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'ฝวบ.(ก3)' })}
                        >
                          📌 ฝวบ.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'ผกร.กรย.(ก3)' })}
                        >
                          📌 ผกร.กรย.(ก3)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่หนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="เช่น มท 5309.16/..."
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        placeholder="เช่น 4 ตุลาคม 2569"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรื่อง</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรียน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="เช่น อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)"
                    />
                    <div className="var-quick-options" style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)' })}
                      >
                        📌 อฝ.วบ.(ก3) ผ่าน รฝ.วบ.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'ผห.กร.(ก3) ผ่าน ชผ.กร.(ก3)' })}
                      >
                        📌 ผห.กร.(ก3) ผ่าน ชผ.กร.(ก3)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: PROJECT & WBS */}
              {activeEditSection === 'project' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">หมายเลขงาน WBS</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.wbsNo}
                        onChange={(e) => setFormData({ ...formData, wbsNo: e.target.value })}
                        placeholder="เช่น P-TDD02.3-I-LYAIA.0016"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">หนังสืออนุมัติงานรื้อถอนเดิม</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approvalDocRef}
                        onChange={(e) => setFormData({ ...formData, approvalDocRef: e.target.value })}
                        placeholder="เช่น ก.3 กวว.(วร) 1847/2567 ลงวันที่ 16 สิงหาคม 2567"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ชื่องานและสถานที่ก่อสร้าง</label>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="เช่น ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">หมายเลขโครงข่ายรื้อถอน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.networkNo}
                      onChange={(e) => setFormData({ ...formData, networkNo: e.target.value })}
                      placeholder="เช่น โครงข่ายรื้อถอนแรงสูงภายนอก 6001381478"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: WIRE TABLE */}
              {activeEditSection === 'table' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="big-label" style={{ marginBottom: 0 }}>
                      รายการเศษสาย ({formData.items.length} รายการ)
                    </label>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-emerald"
                      onClick={handleAddItem}
                    >
                      <Plus size={15} /> เพิ่มชนิดสาย
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.items.map((item, idx) => {
                      const pct = calculateWirePercent(item.actualKg, item.estimatedKg);
                      return (
                        <div key={item.id} className="big-table-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 600, color: '#c2410c' }}>
                              รายการที่ {idx + 1}: ร้อยละ {formatPercent(pct)}
                            </span>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(idx)}
                                className="a4-action-btn"
                                style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px' }}
                              >
                                <Trash2 size={13} /> ลบ
                              </button>
                            )}
                          </div>

                          <div className="big-field-group">
                            <span style={{ fontSize: '11px', color: '#64748b' }}>ชนิดสาย</span>
                            <input
                              type="text"
                              className="big-input"
                              value={item.wireType}
                              onChange={(e) => handleUpdateItem(idx, 'wireType', e.target.value)}
                              placeholder="เช่น เศษสายอลูมิเนียมแกนเหล็ก"
                            />
                          </div>

                          <div className="big-grid-2">
                            <div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>ประมาณการ (กก.)</span>
                              <input
                                type="number"
                                className="big-input"
                                value={item.estimatedKg}
                                onChange={(e) => handleUpdateItem(idx, 'estimatedKg', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>ส่งคืนจริง (กก.)</span>
                              <input
                                type="number"
                                className="big-input"
                                value={item.actualKg}
                                onChange={(e) => handleUpdateItem(idx, 'actualKg', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#c2410c' }}>
                      <span>รวมประมาณการ: {formatKg(totalEstimatedKg)} กก.</span>
                      <span>รวมคืนจริง: {formatKg(totalActualKg)} กก.</span>
                      <span>คิดเป็น: {formatPercent(totalPercentage)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: REASON & CONSIDERATION (GUIDED VARIABLE BUILDER + FREEFORM) */}
              {activeEditSection === 'reason' && (
                <div>
                  {/* Mode switcher */}
                  <div className="wire-mode-toggle">
                    <button
                      type="button"
                      className={`wire-mode-btn ${reasonMode === 'guided' ? 'active' : ''}`}
                      onClick={() => setReasonMode('guided')}
                    >
                      <Sparkles size={15} /> โหมดกรอกตัวแปรเฉพาะจุด (แนะนำ - แก้ไขง่าย)
                    </button>
                    <button
                      type="button"
                      className={`wire-mode-btn ${reasonMode === 'freeform' ? 'active' : ''}`}
                      onClick={() => setReasonMode('freeform')}
                    >
                      <Edit3 size={15} /> โหมดแก้ไขข้อความอิสระ (Freeform)
                    </button>
                  </div>

                  {reasonMode === 'guided' ? (
                    <div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        💡 <strong>ระบบสร้างข้อความอัตโนมัติ:</strong> แก้ไขตัวแปรทั้ง 5 จุดด้านล่างนี้ ระบบจะนำไปประกอบเข้าเป็นย่อหน้า <strong>1. เรื่องเดิม</strong> และ <strong>2. ข้อเท็จจริง</strong> ในเอกสารให้อัตโนมัติทันที
                      </div>

                      {/* Card 1: หนังสืออ้างอิงเดิม */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-yellow">จุดที่ 1</span>
                          <strong style={{ fontSize: '14px', color: '#b45309' }}>หนังสืออนุมัติงานเดิม (ที่อ้างถึง)</strong>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.approvalDocRef}
                          onChange={(e) => handleUpdateVariable('approvalDocRef', e.target.value)}
                          placeholder="เช่น ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 สิงหาคม 2567"
                        />
                        <div className="var-quick-options">
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('approvalDocRef', 'ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 สิงหาคม 2567')}
                          >
                            ตัวอย่าง 1: ก.3 กวว.(ว) 1847/2567 ลงวันที่ 12 ส.ค. 67
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('approvalDocRef', 'ก.3 กวว.(วร) 1847/2567 ลงวันที่ 16 สิงหาคม 2567')}
                          >
                            ตัวอย่าง 2: ก.3 กวว.(วร) 1847/2567 ลงวันที่ 16 ส.ค. 67
                          </button>
                        </div>
                      </div>

                      {/* Card 2: ชื่องานและสถานที่ก่อสร้าง */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-blue">จุดที่ 2</span>
                          <strong style={{ fontSize: '14px', color: '#1d4ed8' }}>ชื่องานและสถานที่ก่อสร้าง</strong>
                        </div>
                        <textarea
                          rows={2}
                          className="big-textarea"
                          value={formData.projectName}
                          onChange={(e) => handleUpdateVariable('projectName', e.target.value)}
                          placeholder="เช่น ปรับปรุงระบบจำหน่าย 22 เควี ช่วงแยกเข้าอำเภอ ถึง อบต.นาสวน ช่วง 2 อ.ศรีสวัสดิ์ จ.กาญจนบุรี"
                        />
                      </div>

                      {/* Card 3: หมายเลขงาน WBS */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-orange">จุดที่ 3</span>
                          <strong style={{ fontSize: '14px', color: '#c2410c' }}>หมายเลขงาน WBS</strong>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.wbsNo}
                          onChange={(e) => handleUpdateVariable('wbsNo', e.target.value)}
                          placeholder="เช่น P-TDD02.3-I-LYAIA.0016"
                        />
                      </div>

                      {/* Card 4: ผู้ควบคุมงาน */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-green">จุดที่ 4</span>
                          <strong style={{ fontSize: '14px', color: '#15803d' }}>ผู้ควบคุมงาน (ชื่อและตำแหน่ง)</strong>
                        </div>
                        <div className="big-grid-2">
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ชื่อ-นามสกุล</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.supervisorName}
                              onChange={(e) => handleUpdateVariable('supervisorName', e.target.value)}
                              placeholder="เช่น นายอุดมศักดิ์ จันทร์กลั่น"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>ตำแหน่ง/แผนก</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.supervisorPosition}
                              onChange={(e) => handleUpdateVariable('supervisorPosition', e.target.value)}
                              placeholder="เช่น หชง.4 ผกร.กรย.(ก3)"
                            />
                          </div>
                        </div>
                        <div className="var-quick-options">
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('supervisorPosition', 'หชง.4 ผกร.กรย.(ก3)')}
                          >
                            📌 หชง.4 ผกร.กรย.(ก3)
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('supervisorPosition', 'พชง.7 ผกร.กรย.(ก3)')}
                          >
                            📌 พชง.7 ผกร.กรย.(ก3)
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('supervisorPosition', 'วศก.4 ผกร.กรย.(ก3)')}
                          >
                            📌 วศก.4 ผกร.กรย.(ก3)
                          </button>
                        </div>
                      </div>

                      {/* Card 5: สาเหตุที่ส่งคืนไม่ครบ */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num" style={{ background: '#7c3aed', color: '#fff' }}>จุดที่ 5</span>
                          <strong style={{ fontSize: '14px', color: '#7c3aed' }}>สาเหตุ/เหตุผลความจำเป็นที่ส่งคืนเศษสายไม่ครบ</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                          เลือกสาเหตุสำเร็จรูปที่ตรงกับสภาพหน้างานจริง:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                          {PRESET_WIRE_REASONS.map((preset) => (
                            <button
                              key={preset.key}
                              type="button"
                              className="var-quick-opt-btn"
                              style={{
                                textAlign: 'left',
                                padding: '8px 10px',
                                border: selectedReasonKey === preset.key ? '2px solid #ea580c' : '1px solid #cbd5e1',
                                backgroundColor: selectedReasonKey === preset.key ? '#fff7ed' : '#ffffff',
                                color: selectedReasonKey === preset.key ? '#c2410c' : '#334155',
                                fontWeight: selectedReasonKey === preset.key ? 600 : 400
                              }}
                              onClick={() => handleSelectPresetWireReason(preset)}
                            >
                              {preset.badge}
                            </button>
                          ))}
                        </div>

                        <span style={{ fontSize: '12px', color: '#64748b' }}>ข้อความข้อเท็จจริง (ปรับแต่งเพิ่มเติมได้ตามต้องการ):</span>
                        <textarea
                          rows={4}
                          className="big-textarea"
                          value={formData.memoFacts}
                          onChange={(e) => setFormData({ ...formData, memoFacts: e.target.value })}
                        />
                      </div>

                      {/* Card 6: 3. ข้อพิจารณา (วรรคสุดท้าย) */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num" style={{ background: '#0284c7', color: '#fff' }}>ข้อ 3</span>
                          <strong style={{ fontSize: '14px', color: '#0369a1' }}>ข้อพิจารณา (วรรคสรุปก่อนตาราง)</strong>
                        </div>
                        <textarea
                          rows={3}
                          className="big-textarea"
                          value={formData.memoConsideration}
                          onChange={(e) => setFormData({ ...formData, memoConsideration: e.target.value })}
                        />
                      </div>

                      {/* Live Compiled Preview */}
                      <div className="var-live-preview-box">
                        <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} /> ตัวอย่างข้อความที่จะปรากฏในบันทึกข้อความ (Live Preview):
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px' }}>
                          <strong>1. เรื่องเดิม:</strong> {formData.memoBackground}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px' }}>
                          <strong>2. ข้อเท็จจริง:</strong> {formData.memoFacts}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e293b' }}>
                          <strong>3. ข้อพิจารณา:</strong> {formData.memoConsideration}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Freeform Editor */}
                      <div className="big-field-group">
                        <label className="big-label">1. เรื่องเดิม</label>
                        <textarea
                          rows={3}
                          className="big-textarea"
                          value={formData.memoBackground}
                          onChange={(e) => setFormData({ ...formData, memoBackground: e.target.value })}
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">2. ข้อเท็จจริง (เหตุผลความจำเป็นที่ส่งคืนไม่ครบ)</label>
                        <textarea
                          rows={5}
                          className="big-textarea"
                          value={formData.memoFacts}
                          onChange={(e) => setFormData({ ...formData, memoFacts: e.target.value })}
                          placeholder="ระบุข้อเท็จจริง เช่น สายมีสภาพเปื่อย ขาดเป็นท่อนเล็กท่อนน้อย..."
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">3. ข้อพิจารณา</label>
                        <textarea
                          rows={3}
                          className="big-textarea"
                          value={formData.memoConsideration}
                          onChange={(e) => setFormData({ ...formData, memoConsideration: e.target.value })}
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">คำลงท้าย</label>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.memoClosing}
                          onChange={(e) => setFormData({ ...formData, memoClosing: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: SIGNER & APPROVER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ชื่อผู้ลงนามหลัก (ขวากลาง)</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerName}
                      onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                      placeholder="เช่น นายอนันต์ กาญจนอุปถัมภ์"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตำแหน่งผู้ลงนาม</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerTitle}
                      onChange={(e) => setFormData({ ...formData, signerTitle: e.target.value })}
                      placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                    />
                    <div className="var-quick-options" style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerTitle: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)' })}
                      >
                        📌 รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerTitle: 'อก.รย.(ก3)' })}
                      >
                        📌 อก.รย.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerTitle: 'รก.รย.(ก3)' })}
                      >
                        📌 รก.รย.(ก3)
                      </button>
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">วันที่ลงนาม</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.signerDate}
                        onChange={(e) => setFormData({ ...formData, signerDate: e.target.value })}
                        placeholder="เช่น 4 ตุลาคม 2569"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">เบอร์โทรศัพท์ติดต่อ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="เช่น 10391"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    <div className="big-grid-2">
                      <div className="big-field-group">
                        <label className="big-label">ชื่อผู้อนุมัติ (ซ้ายล่าง)</label>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.approverName}
                          onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                          placeholder="เช่น นายเมธี สุกก่ำ"
                        />
                      </div>
                      <div className="big-field-group">
                        <label className="big-label">ตำแหน่งผู้อนุมัติ</label>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.approverTitle}
                          onChange={(e) => setFormData({ ...formData, approverTitle: e.target.value })}
                          placeholder="เช่น อฝ.วบ.(ก3)"
                        />
                        <div className="var-quick-options" style={{ marginTop: '6px' }}>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => setFormData({ ...formData, approverTitle: 'อฝ.วบ.(ก3)' })}
                          >
                            📌 อฝ.วบ.(ก3)
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => setFormData({ ...formData, approverTitle: 'รฝ.วบ.(ก3)' })}
                          >
                            📌 รฝ.วบ.(ก3)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="big-field-group" style={{ marginTop: '12px' }}>
                      <label className="big-label">ข้อความสั่งการถึง (หัวตรายางอนุมัติของ อฝ.วบ.)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverEndorsementTo || '- อก.รย.(ก3)'}
                        onChange={(e) => setFormData({ ...formData, approverEndorsementTo: e.target.value })}
                        placeholder="เช่น - อก.รย.(ก3)"
                      />
                      <div className="var-quick-options" style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, approverEndorsementTo: '- อก.รย.(ก3)' })}
                        >
                          📌 - อก.รย.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, approverEndorsementTo: '- กรย.(ก3)' })}
                        >
                          📌 - กรย.(ก3)
                        </button>
                      </div>
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
