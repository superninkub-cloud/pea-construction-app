"use client";

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  ShoppingBag,
  Truck,
  Printer,
  Copy,
  Sparkles,
  Download,
  Calendar,
  Check,
  UserCheck,
  Building,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import './procurement.css';
import {
  ProcurementFormData,
  ProcurementType,
  SAMPLE_BUY_DATA,
  SAMPLE_HIRE_DATA,
  DEFAULT_DELEGATION_ORDER,
  composeProcurementBackground,
  composeProcurementProposal,
  composeProcurementSubject,
  COMMON_PROCUREMENT_SUBJECT_PRESETS,
  SubjectPreset,
  getTodayThaiDate,
  generateProcurementMemoPlainText,
  generateProcurementWordDocument
} from './procurementUtils';
import TopBar from '../components/TopBar';

type EditSectionKey = 'header' | 'project' | 'item' | 'body' | 'signer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileCheck },
  { key: 'project', title: '2. อ้างอิงโครงการ & WBS', shortName: 'โครงการ & WBS', icon: Briefcase },
  { key: 'item', title: '3. รายละเอียดพัสดุ/บริการที่ขอจัดหา', shortName: 'สิ่งของ/บริการ', icon: ShoppingBag },
  { key: 'body', title: '4. เนื้อหา ๓ ตอน (เรื่องเดิม-ข้อเท็จจริง-ข้อเสนอ)', shortName: 'เนื้อหา ๓ ตอน', icon: Building },
  { key: 'signer', title: '5. ผู้ลงนามและผู้อนุมัติ', shortName: 'ผู้ลงนาม & อนุมัติ', icon: UserCheck },
];

export default function ProcurementPrinciplePage() {
  const [formData, setFormData] = useState<ProcurementFormData>(SAMPLE_BUY_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [bodyMode, setBodyMode] = useState<'guided' | 'freeform'>('guided');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_procurement_principle_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.subject) {
          if (parsed.docNo && (parsed.docNo.includes('๑๑๗๘') || parsed.docNo.includes('๒๔๒๖'))) {
            parsed.docNo = '';
          }
          if (parsed.docDate && (parsed.docDate.includes('พ.ย.') || parsed.docDate.includes('ต.ค.'))) {
            parsed.docDate = '';
          }
          const fixedDocTo = (parsed.docTo === 'ผวบ.(ก๓)' || !parsed.docTo) ? 'ฝวบ.(ก๓)' : parsed.docTo;
          const fixedSalutation = parsed.salutation?.includes('อผ.วบ.')
            ? 'อฝ.วบ.(ก๓) ผ่าน รฝ.วบ.(ก๓)'
            : (parsed.salutation || 'อฝ.วบ.(ก๓) ผ่าน รฝ.วบ.(ก๓)');
          const fixedApproverTitle = (parsed.approverTitle === 'อผ.วบ.(ก๓)' || !parsed.approverTitle)
            ? 'อฝ.วบ.(ก๓)'
            : parsed.approverTitle;
          const fixedApproverName = (parsed.approverName === 'นายเมธี สุกก่ำ' || !parsed.approverName)
            ? 'นายเมธี สุภาก่ำ'
            : parsed.approverName;
          const fixedApproverEndorsement = (parsed.approverEndorsementTo === '- กรย.(ก๓)' || !parsed.approverEndorsementTo)
            ? '- อก.รย.(ก๓)'
            : parsed.approverEndorsementTo;

          setFormData({
            ...parsed,
            docTo: fixedDocTo,
            salutation: fixedSalutation,
            approverTitle: fixedApproverTitle,
            approverName: fixedApproverName,
            approverEndorsementTo: fixedApproverEndorsement
          });
        }
      }
    } catch (e) {
      console.error('Error loading stored procurement form:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pea_procurement_principle_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectMode = (type: ProcurementType) => {
    if (type === 'buy') {
      setFormData(SAMPLE_BUY_DATA);
      showToast('✓ สลับเป็นแบบฟอร์ม: ขออนุมัติหลักการจัดซื้อพัสดุ/อุปกรณ์');
    } else {
      setFormData(SAMPLE_HIRE_DATA);
      showToast('✓ สลับเป็นแบบฟอร์ม: ขออนุมัติหลักการจัดจ้างเครื่องจักร/บริการ');
    }
  };

  const handleToggleProcurementType = (type: ProcurementType) => {
    setFormData(prev => {
      const newSubject = composeProcurementSubject({
        procurementType: type,
        itemDescription: prev.itemDescription,
        procurementMethod: prev.procurementMethod
      });
      const updated = {
        ...prev,
        procurementType: type,
        subject: newSubject
      };
      const newProposal = composeProcurementProposal({
        procurementType: type,
        projectName: updated.projectName,
        itemDescription: updated.itemDescription,
        targetDateOrPeriod: updated.targetDateOrPeriod,
        wbsNo: updated.wbsNo,
        networkNo: updated.networkNo,
        activityNo: updated.activityNo,
        dept: updated.docFrom || 'กรย.(ก๓)'
      });
      return {
        ...updated,
        proposalText: newProposal
      };
    });
    showToast(`✓ สลับเป็น: ${type === 'buy' ? 'ขออนุมัติจัดซื้อพัสดุ/อุปกรณ์' : 'ขออนุมัติจัดจ้างบริการ/เครื่องจักร'}`);
  };

  const handleApplySubjectPreset = (preset: SubjectPreset) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        procurementType: preset.type,
        subject: preset.subject,
        itemDescription: preset.itemDescription,
        procurementMethod: preset.method
      };
      const newProposal = composeProcurementProposal({
        procurementType: updated.procurementType,
        projectName: updated.projectName,
        itemDescription: updated.itemDescription,
        targetDateOrPeriod: updated.targetDateOrPeriod,
        wbsNo: updated.wbsNo,
        networkNo: updated.networkNo,
        activityNo: updated.activityNo,
        dept: updated.docFrom || 'กรย.(ก๓)'
      });
      return {
        ...updated,
        proposalText: newProposal
      };
    });
    showToast(`✓ นำเข้าแม่แบบ: ${preset.label}`);
  };

  const handleAutoCompileSubject = () => {
    const newSubject = composeProcurementSubject({
      procurementType: formData.procurementType,
      itemDescription: formData.itemDescription,
      procurementMethod: formData.procurementMethod
    });
    setFormData(prev => ({ ...prev, subject: newSubject }));
    showToast('✓ ประกอบชื่อเรื่องอัตโนมัติเรียบร้อย');
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

  const handleUpdateVariable = (
    field: 'approvalDocRef' | 'projectName' | 'workOpenerName' | 'wbsNo' | 'networkNo' | 'activityNo' | 'itemDescription' | 'targetDateOrPeriod',
    value: string
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const newBackground = composeProcurementBackground({
        approvalDocRef: updated.approvalDocRef,
        projectName: updated.projectName,
        workOpenerName: updated.workOpenerName,
        dept: updated.docFrom || 'กรย.(ก๓)'
      });
      const newProposal = composeProcurementProposal({
        procurementType: updated.procurementType,
        projectName: updated.projectName,
        itemDescription: updated.itemDescription,
        targetDateOrPeriod: updated.targetDateOrPeriod,
        wbsNo: updated.wbsNo,
        networkNo: updated.networkNo,
        activityNo: updated.activityNo,
        dept: updated.docFrom || 'กรย.(ก๓)'
      });
      return {
        ...updated,
        backgroundText: newBackground,
        proposalText: newProposal
      };
    });
  };

  // Render on-screen ๑. เรื่องเดิม with interactive color highlights
  const renderScreenBackgroundText = () => {
    const ref = formData.approvalDocRef || 'ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙';
    const proj = formData.projectName || 'แผนงานพาดเพิ่ม ๒๒ เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม';
    const opener = formData.workOpenerName || 'นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)';

    return (
      <>
        <span>ตามอนุมัติเลขที่ </span>
        <span
          className="a4-var-spot"
          title="🟡 จุดที่ ๑: หนังสืออนุมัติงานเดิม (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
        >
          {ref.replace(/^(ตามอนุมัติเลขที่|ตามหนังสือที่)\s*/, '')}
        </span>{' '}
        <span>ด้วย {formData.docFrom || 'กรย.(ก๓)'} มี</span>{' '}
        <span
          className="a4-var-spot blue"
          title="🔵 จุดที่ ๒: ชื่องานและสถานที่ก่อสร้าง (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
        >
          {proj}
        </span>{' '}
        <span>โดยมี</span>{' '}
        <span
          className="a4-var-spot green"
          title="🟢 จุดที่ ๓: ผู้เปิดงาน (คลิกเพื่อแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
        >
          {opener}
        </span>{' '}
        <span>เป็นผู้เปิดงาน</span>
      </>
    );
  };

  // Render on-screen ๓. ข้อเสนอเพื่อพิจารณา with interactive color highlights
  const renderScreenProposalText = () => {
    const isHire = formData.procurementType === 'hire';
    const dept = formData.docFrom || 'กรย.(ก๓)';
    const proj = formData.projectName || 'งานก่อสร้าง';
    const item = formData.itemDescription || 'พัสดุ/บริการ';
    const targetDate = formData.targetDateOrPeriod ? ` ${formData.targetDateOrPeriod}` : '';
    const wbs = formData.wbsNo ? `หมายเลขงาน WBS: ${formData.wbsNo}` : '';
    const net = formData.networkNo ? ` โครงข่าย ${formData.networkNo}` : '';
    const act = formData.activityNo ? ` กิจกรรม ${formData.activityNo}` : '';
    const accountInfo = [wbs, net, act].filter(Boolean).join('');

    return (
      <>
        <span>{dept} พิจารณาแล้ว </span>
        {isHire ? (
          <>
            <span>เพื่อให้งานก่อสร้างเป็นไปด้วยความเรียบร้อย และแล้วเสร็จทันตามกำหนดตามแผนงานที่กำหนดไว้ จึงขออนุมัติหลักการจ้าง</span>{' '}
            <span
              className="a4-var-spot purple"
              title="🟣 จุดที่ ๕: รายการบริการที่ขอจัดจ้าง (คลิกเพื่อแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
            >
              {item}{targetDate}
            </span>{' '}
            <span>โดยเบิกค่าใช้จ่ายจาก</span>{' '}
            <span
              className="a4-var-spot blue"
              title="🔵 จุดที่ ๒: ชื่องาน (คลิกเพื่อแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
            >
              {proj}
            </span>{' '}
            <span
              className="a4-var-spot orange"
              title="🟠 จุดที่ ๔: บัญชีและหมายเลขงาน WBS (คลิกเพื่อแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
            >
              {accountInfo}
            </span>
          </>
        ) : (
          <>
            <span>เพื่อให้การก่อสร้างเป็นไปตามแผนงานและไม่กระทบงานก่อสร้าง</span>{' '}
            <span
              className="a4-var-spot blue"
              title="🔵 จุดที่ ๒: ชื่องาน (คลิกเพื่อแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
            >
              {proj}
            </span>{' '}
            <span>เห็นควรให้อนุมัติจัดซื้อ</span>{' '}
            <span
              className="a4-var-spot purple"
              title="🟣 จุดที่ ๕: รายการพัสดุที่ขอจัดซื้อ (คลิกเพื่อแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
            >
              {item}{targetDate}
            </span>{' '}
            <span>โดยให้เบิกจ่ายจาก</span>{' '}
            <span
              className="a4-var-spot orange"
              title="🟠 จุดที่ ๔: บัญชีและหมายเลขงาน WBS (คลิกเพื่อแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('body'); }}
            >
              {accountInfo}
            </span>
          </>
        )}
      </>
    );
  };

  const handleCopyMemo = async () => {
    const plainText = generateProcurementMemoPlainText(formData);
    const html = generateProcurementWordDocument(formData);
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
    const content = generateProcurementWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanSubject = formData.procurementType === 'buy' ? 'ขออนุมัติจัดซื้อ' : 'ขออนุมัติจัดจ้าง';
    const cleanWbs = formData.wbsNo || 'PEA';
    link.download = `บันทึกข้อความ_${cleanSubject}_${cleanWbs}.doc`;
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
      <TopBar title="โปรแกรมอนุมัติหลักการจัดซื้อจัดจ้าง" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <FileCheck size={18} className="text-teal-400" />
              <span>อนุมัติหลักการจัดซื้อจัดจ้าง (กรย.ก3)</span>
            </div>
            <div className="a4-preset-group">
              <span className="text-xs text-slate-300 font-medium">ประเภท:</span>
              <button
                type="button"
                className={`a4-preset-chip ${formData.procurementType === 'buy' ? 'active' : ''}`}
                onClick={() => handleSelectMode('buy')}
              >
                <ShoppingBag size={13} /> ขออนุมัติจัดซื้อพัสดุ
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${formData.procurementType === 'hire' ? 'active' : ''}`}
                onClick={() => handleSelectMode('hire')}
              >
                <Truck size={13} /> ขออนุมัติจัดจ้างเครื่องจักร
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
                        placeholder="เช่น กรย.(ก๓)"
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
                        placeholder="เช่น ฝวบ.(ก๓)"
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
                        placeholder="เช่น มท ๕๓๐๙.๑๖/..."
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
                        placeholder="เช่น ๔ ตุลาคม ๒๕๖๙"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                    <td colSpan={3}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="no-print"
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: formData.procurementType === 'buy' ? '#e0f2fe' : '#ffedd5',
                            color: formData.procurementType === 'buy' ? '#0369a1' : '#c2410c',
                            border: formData.procurementType === 'buy' ? '1px solid #bae6fd' : '1px solid #fed7aa',
                            cursor: 'pointer',
                            userSelect: 'none',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleProcurementType(formData.procurementType === 'buy' ? 'hire' : 'buy');
                          }}
                          title="คลิกเพื่อสลับระหว่าง จัดซื้อ ↔ จัดจ้าง"
                        >
                          {formData.procurementType === 'buy' ? '🛒 ขออนุมัติจัดซื้อ' : '🚜 ขออนุมัติจัดจ้าง'}
                        </span>
                        <input
                          type="text"
                          className="a4-live-input a4-var-spot subject"
                          style={{ fontWeight: 'bold', flex: 1 }}
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="เช่น ขออนุมัติหลักการจัดซื้อ... หรือ ขออนุมัติหลักการจัดจ้าง..."
                          title="ชื่อเรื่องบันทึกข้อความ (พิมพ์แก้ไขได้ทันที หรือกดปุ่ม ⚡ เพื่อเลือกแม่แบบ)"
                        />
                        <button
                          type="button"
                          className="no-print var-quick-opt-btn"
                          style={{ whiteSpace: 'nowrap', fontSize: '11px', padding: '3px 8px', backgroundColor: '#f1f5f9' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEditSection('header');
                          }}
                          title="เปิดหน้าต่างเลือกแม่แบบจัดซื้อ / จัดจ้าง"
                        >
                          ⚡ แม่แบบจัดซื้อ/จัดจ้าง
                        </button>
                      </div>
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
                        placeholder="เช่น อฝ.วบ.(ก๓) ผ่าน รฝ.วบ.(ก๓)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2 & 3 & 4. 3-PARAGRAPH MEMO BODY */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('body')}
              title="คลิกเพื่อแก้ไขเนื้อหา ๓ ตอน"
              style={{ marginTop: '14pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขเนื้อหา ๓ ตอน (เรื่องเดิม-ข้อเท็จจริง-ข้อเสนอ)
              </div>

              {/* Dynamic Variable Hint on Screen */}
              <div className="pp-no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  📌 ตัวแปรประจำงานนี้: [WBS: {formData.wbsNo}] [ผู้เปิดงาน: {formData.workOpenerName}]
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  (ส่วนที่มีสีไฮไลท์คือจุดที่เปลี่ยนแต่ละงาน • เมื่อสั่งพิมพ์หรือก๊อปปี้จะเป็นสีดำทางการปกติ)
                </span>
              </div>

              {/* ๑. เรื่องเดิม */}
              <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>๑. เรื่องเดิม</p>
              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '8pt' }}>
                <span className="pp-print-only">{formData.backgroundText}</span>
                <span className="pp-no-print">{renderScreenBackgroundText()}</span>
              </p>

              {/* ๒. ข้อเท็จจริง */}
              <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>๒. ข้อเท็จจริง</p>
              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', whiteSpace: 'pre-line', marginBottom: '8pt' }}>
                {formData.factsText}
              </p>

              {/* ๓. ข้อเสนอเพื่อพิจารณา */}
              <p style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4pt' }}>๓. ข้อเสนอเพื่อพิจารณา</p>
              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '6pt' }}>
                <span className="pp-print-only">{formData.proposalText}</span>
                <span className="pp-no-print">{renderScreenProposalText()}</span>
              </p>
              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '8pt' }}>
                {formData.delegationOrderText}
              </p>

              <p className="a4-text-indent" style={{ marginTop: '12pt', marginBottom: '20pt' }}>
                {formData.closingText || 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป'}
              </p>
            </div>

            {/* 5. SIGNER SECTION (ขวากลาง) */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('signer')}
              title="คลิกเพื่อแก้ไขผู้ลงนาม"
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10pt', marginBottom: '24pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้ลงนาม
              </div>

              <div style={{ textAlign: 'center', minWidth: '260px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ fontWeight: 'normal' }}>({formData.signerName || '...................................................'})</div>
                <div style={{ fontSize: '13pt', color: '#334155', marginTop: '2pt' }}>{formData.signerTitle}</div>
                {formData.signerDate && (
                  <div style={{ fontSize: '12pt', color: '#64748b', marginTop: '2pt' }}>{formData.signerDate}</div>
                )}
              </div>
            </div>

            {/* APPROVAL & ROUTING STAMPS TABLE (ล่างสุด) */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('signer')}
              title="คลิกเพื่อแก้ไขผู้อนุมัติ & เกษียนหนังสือ"
              style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12pt', marginTop: '16pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้อนุมัติ & เกษียนหนังสือ
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                <div style={{ fontSize: '13pt' }}>
                  <div style={{ fontWeight: 600 }}>{formData.approverEndorsementTo || '- อก.รย.(ก๓)'}</div>
                  <div style={{ marginTop: '4pt', color: '#1e293b' }}>
                    {formData.approverDivisionText || 'อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง'}
                  </div>
                  <div style={{ height: '36px' }}></div>
                  <div>({formData.approverName || 'นายเมธี สุภาก่ำ'})</div>
                  <div style={{ fontSize: '12pt', color: '#475569' }}>{formData.approverTitle}</div>
                </div>

                <div style={{ fontSize: '11pt', border: '1px solid #94a3b8', borderRadius: '4px', padding: '8pt 10pt' }}>
                  <div style={{ marginBottom: '6pt' }}>รฝ.วบ.(ก๓) ................... วันที่ ....../....../......</div>
                  <div style={{ marginBottom: '6pt' }}>ผห.กร.(ก๓) ................... วันที่ ....../....../......</div>
                  <div>ชผ.กร.(ก๓) ................... วันที่ ....../....../......</div>
                </div>
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
                  const Icon = meta?.icon || FileCheck;
                  return (
                    <>
                      <Icon size={22} className="text-teal-400" />
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
                        placeholder="เช่น กรย.(ก๓)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ถึง (หน่วยงานปลายทาง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="เช่น ฝวบ.(ก๓)"
                      />
                      <div className="var-quick-options" style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'ฝวบ.(ก๓)' })}
                        >
                          📌 ฝวบ.(ก๓)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'ผกร.กรย.(ก๓)' })}
                        >
                          📌 ผกร.กรย.(ก๓)
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
                        placeholder="เช่น มท ๕๓๐๙.๑๖/..."
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        placeholder="เช่น ๔ ตุลาคม ๒๕๖๙"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <label className="big-label" style={{ marginBottom: 0 }}>
                        เรื่อง (ชื่อเรื่องบันทึกข้อความ)
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          style={{
                            backgroundColor: formData.procurementType === 'buy' ? '#0284c7' : '#f1f5f9',
                            color: formData.procurementType === 'buy' ? '#ffffff' : '#475569',
                            fontWeight: 600,
                            border: formData.procurementType === 'buy' ? '1px solid #0284c7' : '1px solid #cbd5e1'
                          }}
                          onClick={() => handleToggleProcurementType('buy')}
                        >
                          🛒 จัดซื้อพัสดุ/อุปกรณ์
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          style={{
                            backgroundColor: formData.procurementType === 'hire' ? '#ea580c' : '#f1f5f9',
                            color: formData.procurementType === 'hire' ? '#ffffff' : '#475569',
                            fontWeight: 600,
                            border: formData.procurementType === 'hire' ? '1px solid #ea580c' : '1px solid #cbd5e1'
                          }}
                          onClick={() => handleToggleProcurementType('hire')}
                        >
                          🚜 จัดจ้างบริการ/เครื่องจักร
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      className="big-input"
                      style={{ fontWeight: 600 }}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="เช่น ขออนุมัติหลักการจัดซื้อ... หรือ ขออนุมัติหลักการจัดจ้าง..."
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        💡 เลือกแม่แบบจัดซื้อ/จัดจ้าง หรือกดประกอบชื่อเรื่องอัตโนมัติจากสิ่งของที่กรอกไว้:
                      </span>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 600 }}
                        onClick={handleAutoCompileSubject}
                      >
                        <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        ประกอบชื่อเรื่องอัตโนมัติ
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px', marginTop: '8px' }}>
                      {COMMON_PROCUREMENT_SUBJECT_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          className="var-quick-opt-btn"
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: '12px',
                            backgroundColor: formData.subject === preset.subject ? '#fff7ed' : '#ffffff',
                            borderColor: formData.subject === preset.subject ? '#ea580c' : '#e2e8f0',
                            color: formData.subject === preset.subject ? '#c2410c' : '#334155',
                            fontWeight: formData.subject === preset.subject ? 600 : 400
                          }}
                          onClick={() => handleApplySubjectPreset(preset)}
                        >
                          {preset.badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">เรียน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="เช่น อฝ.วบ.(ก๓) ผ่าน รฝ.วบ.(ก๓)"
                    />
                    <div className="var-quick-options" style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อฝ.วบ.(ก๓) ผ่าน รฝ.วบ.(ก๓)' })}
                      >
                        📌 อฝ.วบ.(ก๓) ผ่าน รฝ.วบ.(ก๓)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'ผห.กร.(ก๓) ผ่าน ชผ.กร.(ก๓)' })}
                      >
                        📌 ผห.กร.(ก๓) ผ่าน ชผ.กร.(ก๓)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: PROJECT & WBS */}
              {activeEditSection === 'project' && (
                <div>
                  <div className="big-grid-3">
                    <div className="big-field-group">
                      <label className="big-label">หมายเลขงาน WBS</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.wbsNo}
                        onChange={(e) => handleUpdateVariable('wbsNo', e.target.value)}
                        placeholder="เช่น I-69-I-PSCXX.19.3909"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">โครงข่าย (Network)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.networkNo}
                        onChange={(e) => handleUpdateVariable('networkNo', e.target.value)}
                        placeholder="เช่น 7001210932"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">กิจกรรม (Activity)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.activityNo}
                        onChange={(e) => handleUpdateVariable('activityNo', e.target.value)}
                        placeholder="เช่น 0050"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตามอนุมัติเลขที่ (หนังสืออ้างอิงเดิม)</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.approvalDocRef}
                      onChange={(e) => handleUpdateVariable('approvalDocRef', e.target.value)}
                      placeholder="เช่น ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ชื่องานและสถานที่ก่อสร้าง</label>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={formData.projectName}
                      onChange={(e) => handleUpdateVariable('projectName', e.target.value)}
                      placeholder="เช่น แผนงานพาดเพิ่ม ๒๒ เควี รองรับสถานีอัดประจุ ต.พระประโทน อ.เมือง จ.นครปฐม"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ผู้เปิดงาน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.workOpenerName}
                      onChange={(e) => handleUpdateVariable('workOpenerName', e.target.value)}
                      placeholder="เช่น นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)"
                    />
                    <div className="var-quick-options" style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => handleUpdateVariable('workOpenerName', 'นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)')}
                      >
                        📌 นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => handleUpdateVariable('workOpenerName', 'นายอุดมศักดิ์ จันทร์กลั่น หชง.๔ ผกร.กรย.(ก๓)')}
                      >
                        📌 นายอุดมศักดิ์ จันทร์กลั่น หชง.๔ ผกร.กรย.(ก๓)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: ITEM & METHOD */}
              {activeEditSection === 'item' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">รายละเอียดสิ่งของหรือบริการที่จัดซื้อ/จัดจ้าง</label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.itemDescription}
                      onChange={(e) => handleUpdateVariable('itemDescription', e.target.value)}
                      placeholder="เช่น ดอกสว่าน BDS HKK-N ๐๒๒ ดอกเจ็ทบอช ๒๒ mm. จำนวน ๒ ดอก"
                    />
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">วิธีจัดหา</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.procurementMethod}
                        onChange={(e) => setFormData({ ...formData, procurementMethod: e.target.value })}
                        placeholder="เช่น โดยวิธีเฉพาะเจาะจง"
                      />
                      <div className="var-quick-options" style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, procurementMethod: 'โดยวิธีเฉพาะเจาะจง' })}
                        >
                          📌 โดยวิธีเฉพาะเจาะจง
                        </button>
                      </div>
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันเวลาดำเนินการ (ถ้ามี)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.targetDateOrPeriod || ''}
                        onChange={(e) => handleUpdateVariable('targetDateOrPeriod', e.target.value)}
                        placeholder="เช่น ในวันจันทร์ที่ ๑๙ ตุลาคม ๒๕๖๙"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: BODY 3 PARAGRAPHS (GUIDED VARIABLE BUILDER + FREEFORM) */}
              {activeEditSection === 'body' && (
                <div>
                  {/* Mode switcher */}
                  <div className="var-mode-toggle">
                    <button
                      type="button"
                      className={`var-mode-btn ${bodyMode === 'guided' ? 'active' : ''}`}
                      onClick={() => setBodyMode('guided')}
                    >
                      <Sparkles size={15} /> โหมดกรอกตัวแปรเฉพาะจุด (แนะนำ - แก้ไขง่าย)
                    </button>
                    <button
                      type="button"
                      className={`var-mode-btn ${bodyMode === 'freeform' ? 'active' : ''}`}
                      onClick={() => setBodyMode('freeform')}
                    >
                      <Edit3 size={15} /> โหมดแก้ไขข้อความอิสระ (Freeform)
                    </button>
                  </div>

                  {bodyMode === 'guided' ? (
                    <div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        💡 <strong>ระบบสร้างข้อความอัตโนมัติ:</strong> แก้ไขตัวแปรในแต่ละจุดด้านล่างนี้ ระบบจะนำไปประกอบเข้าเป็นชื่อเรื่อง, ย่อหน้า <strong>๑. เรื่องเดิม</strong> และ <strong>๓. ข้อเสนอเพื่อพิจารณา</strong> ในเอกสารให้อัตโนมัติทันที
                      </div>

                      {/* Card 0: เรื่อง (ขออนุมัติหลักการจัดซื้อ / จัดจ้าง) */}
                      <div className="variable-card" style={{ border: '1.5px solid #f59e0b', background: '#fffbeb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="variable-badge-num" style={{ background: '#d97706', color: '#fff' }}>เรื่อง</span>
                            <strong style={{ fontSize: '14px', color: '#b45309' }}>ชื่อเรื่องบันทึกข้อความ (จัดซื้อ / จัดจ้าง)</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="var-quick-opt-btn"
                              style={{
                                backgroundColor: formData.procurementType === 'buy' ? '#0284c7' : '#ffffff',
                                color: formData.procurementType === 'buy' ? '#ffffff' : '#475569',
                                fontWeight: 600,
                                border: formData.procurementType === 'buy' ? '1px solid #0284c7' : '1px solid #cbd5e1'
                              }}
                              onClick={() => handleToggleProcurementType('buy')}
                            >
                              🛒 จัดซื้อพัสดุ/อุปกรณ์
                            </button>
                            <button
                              type="button"
                              className="var-quick-opt-btn"
                              style={{
                                backgroundColor: formData.procurementType === 'hire' ? '#ea580c' : '#ffffff',
                                color: formData.procurementType === 'hire' ? '#ffffff' : '#475569',
                                fontWeight: 600,
                                border: formData.procurementType === 'hire' ? '1px solid #ea580c' : '1px solid #cbd5e1'
                              }}
                              onClick={() => handleToggleProcurementType('hire')}
                            >
                              🚜 จัดจ้างบริการ/เครื่องจักร
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          className="big-input"
                          style={{ fontWeight: 600 }}
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="เช่น ขออนุมัติหลักการจัดซื้อ... หรือ ขออนุมัติหลักการจัดจ้าง..."
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            เลือกแม่แบบจัดซื้อ/จัดจ้าง หรือกดประกอบชื่อเรื่องอัตโนมัติ:
                          </span>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', fontWeight: 600 }}
                            onClick={handleAutoCompileSubject}
                          >
                            <Sparkles size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            ประกอบชื่อเรื่องอัตโนมัติ
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '6px', marginTop: '8px' }}>
                          {COMMON_PROCUREMENT_SUBJECT_PRESETS.map((preset) => (
                            <button
                              key={preset.key}
                              type="button"
                              className="var-quick-opt-btn"
                              style={{
                                textAlign: 'left',
                                padding: '6px 10px',
                                fontSize: '12px',
                                backgroundColor: formData.subject === preset.subject ? '#fff7ed' : '#ffffff',
                                borderColor: formData.subject === preset.subject ? '#ea580c' : '#e2e8f0',
                                color: formData.subject === preset.subject ? '#c2410c' : '#334155',
                                fontWeight: formData.subject === preset.subject ? 600 : 400
                              }}
                              onClick={() => handleApplySubjectPreset(preset)}
                            >
                              {preset.badge}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card 1: จุดที่ ๑: หนังสืออนุมัติงานเดิม */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-yellow">จุดที่ ๑</span>
                          <strong style={{ fontSize: '14px', color: '#b45309' }}>หนังสืออนุมัติงานเดิม (ที่อ้างถึง)</strong>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.approvalDocRef}
                          onChange={(e) => handleUpdateVariable('approvalDocRef', e.target.value)}
                          placeholder="เช่น ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙"
                        />
                        <div className="var-quick-options">
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('approvalDocRef', 'ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ มกราคม ๒๕๖๙')}
                          >
                            ตัวอย่าง ๑: ก.๓ กวว.(วร) ๓๓๒/๒๕๖๙ ลงวันที่ ๒๙ ม.ค. ๖๙
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('approvalDocRef', 'ก.๓ กวว.(ว) ๑๘๔๗/๒๕๖๗ ลงวันที่ ๑๒ สิงหาคม ๒๕๖๗')}
                          >
                            ตัวอย่าง ๒: ก.๓ กวว.(ว) ๑๘๔๗/๒๕๖๗ ลงวันที่ ๑๒ ส.ค. ๖๗
                          </button>
                        </div>
                      </div>

                      {/* Card 2: จุดที่ ๒: ชื่องานและสถานที่ก่อสร้าง */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-blue">จุดที่ ๒</span>
                          <strong style={{ fontSize: '14px', color: '#1d4ed8' }}>ชื่องานและสถานที่ก่อสร้าง</strong>
                        </div>
                        <textarea
                          rows={2}
                          className="big-textarea"
                          value={formData.projectName}
                          onChange={(e) => handleUpdateVariable('projectName', e.target.value)}
                          placeholder="เช่น แผนงานพาดเพิ่ม ๒๒ เควี รองรับสถานีอัดประจุ สถานที่ก่อสร้าง ต.พระประโทน อ.เมือง จ.นครปฐม"
                        />
                      </div>

                      {/* Card 3: จุดที่ ๓: ผู้เปิดงาน */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-green">จุดที่ ๓</span>
                          <strong style={{ fontSize: '14px', color: '#15803d' }}>ผู้เปิดงาน (ชื่อและตำแหน่ง)</strong>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.workOpenerName}
                          onChange={(e) => handleUpdateVariable('workOpenerName', e.target.value)}
                          placeholder="เช่น นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)"
                        />
                        <div className="var-quick-options">
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('workOpenerName', 'นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)')}
                          >
                            📌 นายพิสันติ์ จิตต์ปลื้ม ผห.กร.กรย.(ก๓)
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('workOpenerName', 'นายอุดมศักดิ์ จันทร์กลั่น หชง.๔ ผกร.กรย.(ก๓)')}
                          >
                            📌 นายอุดมศักดิ์ จันทร์กลั่น หชง.๔ ผกร.กรย.(ก๓)
                          </button>
                        </div>
                      </div>

                      {/* Card 4: จุดที่ ๔: บัญชีและหมายเลขงาน WBS / โครงข่าย / กิจกรรม */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-orange">จุดที่ ๔</span>
                          <strong style={{ fontSize: '14px', color: '#c2410c' }}>บัญชีและหมายเลขงาน WBS / โครงข่าย / กิจกรรม</strong>
                        </div>
                        <div className="big-grid-3">
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>หมายเลขงาน WBS</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.wbsNo}
                              onChange={(e) => handleUpdateVariable('wbsNo', e.target.value)}
                              placeholder="เช่น I-69-I-PSCXX.19.3909"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>โครงข่าย (Network)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.networkNo}
                              onChange={(e) => handleUpdateVariable('networkNo', e.target.value)}
                              placeholder="เช่น 7001210932"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>กิจกรรม (Activity)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.activityNo}
                              onChange={(e) => handleUpdateVariable('activityNo', e.target.value)}
                              placeholder="เช่น 0050"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 5: จุดที่ ๕: สิ่งของหรือบริการที่จัดซื้อ/จัดจ้าง */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-purple">จุดที่ ๕</span>
                          <strong style={{ fontSize: '14px', color: '#7c3aed' }}>
                            {formData.procurementType === 'buy' ? 'พัสดุ/อุปกรณ์ที่ขอจัดซื้อ' : 'งานจ้าง/เครื่องจักรที่ขอจัดจ้าง'}
                          </strong>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>รายละเอียดสิ่งของหรือบริการ:</span>
                          <textarea
                            rows={3}
                            className="big-textarea"
                            value={formData.itemDescription}
                            onChange={(e) => handleUpdateVariable('itemDescription', e.target.value)}
                            placeholder={formData.procurementType === 'buy' ? 'เช่น ดอกสว่าน BDS HKK-N ๐๒๒ ดอกเจ็ทบอช ๒๒ mm. เจาะลึก ๓๐ mm. จำนวน ๒ ดอก' : 'เช่น รถเครนขนาด ๒๕ ตัน พร้อมพนักงานขับรถ จำนวน ๑ คัน'}
                          />
                        </div>
                        <div className="big-grid-2">
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>วิธีจัดหา</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.procurementMethod}
                              onChange={(e) => setFormData({ ...formData, procurementMethod: e.target.value })}
                              placeholder="เช่น โดยวิธีเฉพาะเจาะจง"
                            />
                            <div className="var-quick-options" style={{ marginTop: '6px' }}>
                              <button
                                type="button"
                                className="var-quick-opt-btn"
                                onClick={() => setFormData({ ...formData, procurementMethod: 'โดยวิธีเฉพาะเจาะจง' })}
                              >
                                📌 โดยวิธีเฉพาะเจาะจง
                              </button>
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>วันเวลาดำเนินการ (ถ้ามี)</span>
                            <input
                              type="text"
                              className="big-input"
                              value={formData.targetDateOrPeriod || ''}
                              onChange={(e) => handleUpdateVariable('targetDateOrPeriod', e.target.value)}
                              placeholder="เช่น ในวันจันทร์ที่ ๑๙ ตุลาคม ๒๕๖๙"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 6: ๒. ข้อเท็จจริง (เหตุผลความจำเป็น) */}
                      <div className="variable-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="variable-badge-num badge-teal">ข้อ ๒</span>
                          <strong style={{ fontSize: '14px', color: '#0f766e' }}>๒. ข้อเท็จจริง (เหตุผลความจำเป็นในการจัดซื้อ/จัดจ้าง)</strong>
                        </div>
                        <textarea
                          rows={4}
                          className="big-textarea"
                          value={formData.factsText}
                          onChange={(e) => setFormData({ ...formData, factsText: e.target.value })}
                          placeholder="ระบุเหตุผลความจำเป็น เช่น งานก่อสร้างออกแบบให้ใช้เหล็กรางน้ำขนาด ๔.๕๐ เมตร... จำเป็นต้องเจาะรู... ดอกสว่านเดิมชำรุดไม่สามารถใช้งานได้"
                        />
                      </div>

                      {/* Live Compiled Preview */}
                      <div className="var-live-preview-box">
                        <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={14} /> ตัวอย่างข้อความที่จะปรากฏในบันทึกข้อความ (Live Preview):
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px' }}>
                          <strong>๑. เรื่องเดิม:</strong> {formData.backgroundText}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e293b', marginBottom: '6px' }}>
                          <strong>๒. ข้อเท็จจริง:</strong> {formData.factsText}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e293b' }}>
                          <strong>๓. ข้อเสนอเพื่อพิจารณา:</strong> {formData.proposalText}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="big-field-group">
                        <label className="big-label">๑. เรื่องเดิม</label>
                        <textarea
                          rows={3}
                          className="big-textarea"
                          value={formData.backgroundText}
                          onChange={(e) => setFormData({ ...formData, backgroundText: e.target.value })}
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">๒. ข้อเท็จจริง (เหตุผลความจำเป็น)</label>
                        <textarea
                          rows={4}
                          className="big-textarea"
                          value={formData.factsText}
                          onChange={(e) => setFormData({ ...formData, factsText: e.target.value })}
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">๓. ข้อเสนอเพื่อพิจารณา</label>
                        <textarea
                          rows={3}
                          className="big-textarea"
                          value={formData.proposalText}
                          onChange={(e) => setFormData({ ...formData, proposalText: e.target.value })}
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">คำสั่งมอบอำนาจ กฟภ.</label>
                        <textarea
                          rows={2}
                          className="big-textarea"
                          value={formData.delegationOrderText}
                          onChange={(e) => setFormData({ ...formData, delegationOrderText: e.target.value })}
                        />
                      </div>

                      <div className="big-field-group">
                        <label className="big-label">คำลงท้าย</label>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.closingText}
                          onChange={(e) => setFormData({ ...formData, closingText: e.target.value })}
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
                      placeholder="เช่น นายกำพล ตุ้ยเต็มวงศ์"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตำแหน่งผู้ลงนาม</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerTitle}
                      onChange={(e) => setFormData({ ...formData, signerTitle: e.target.value })}
                      placeholder="เช่น อก.รย.(ก๓)"
                    />
                    <div className="var-quick-options" style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerTitle: 'อก.รย.(ก๓)' })}
                      >
                        📌 อก.รย.(ก๓)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerTitle: 'รก.รย.(ก๓) ปฏิบัติงานแทน อก.รย.(ก๓)' })}
                      >
                        📌 รก.รย.(ก๓) ปฏิบัติงานแทน อก.รย.(ก๓)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerTitle: 'รก.รย.(ก๓)' })}
                      >
                        📌 รก.รย.(ก๓)
                      </button>
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">วันที่ลงนาม</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerDate}
                      onChange={(e) => setFormData({ ...formData, signerDate: e.target.value })}
                      placeholder="เช่น ๔ ตุลาคม ๒๕๖๙"
                    />
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
                          placeholder="เช่น นายเมธี สุภาก่ำ"
                        />
                      </div>
                      <div className="big-field-group">
                        <label className="big-label">ตำแหน่งผู้อนุมัติ</label>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.approverTitle}
                          onChange={(e) => setFormData({ ...formData, approverTitle: e.target.value })}
                          placeholder="เช่น อฝ.วบ.(ก๓)"
                        />
                        <div className="var-quick-options" style={{ marginTop: '6px' }}>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => setFormData({ ...formData, approverTitle: 'อฝ.วบ.(ก๓)' })}
                          >
                            📌 อฝ.วบ.(ก๓)
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => setFormData({ ...formData, approverTitle: 'รฝ.วบ.(ก๓)' })}
                          >
                            📌 รฝ.วบ.(ก๓)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="big-field-group" style={{ marginTop: '12px' }}>
                      <label className="big-label">ข้อความสั่งการถึง (หัวตรายางอนุมัติของ อฝ.วบ.)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverEndorsementTo || '- อก.รย.(ก๓)'}
                        onChange={(e) => setFormData({ ...formData, approverEndorsementTo: e.target.value })}
                        placeholder="เช่น - อก.รย.(ก๓)"
                      />
                      <div className="var-quick-options" style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, approverEndorsementTo: '- อก.รย.(ก๓)' })}
                        >
                          📌 - อก.รย.(ก๓)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, approverEndorsementTo: '- ผกร.กรย.(ก๓)' })}
                        >
                          📌 - ผกร.กรย.(ก๓)
                        </button>
                      </div>
                    </div>

                    <div className="big-field-group" style={{ marginTop: '12px' }}>
                      <label className="big-label">คำสั่งการอนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverDivisionText}
                        onChange={(e) => setFormData({ ...formData, approverDivisionText: e.target.value })}
                        placeholder="เช่น อนุมัติ ดำเนินการในส่วนที่เกี่ยวข้อง"
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
