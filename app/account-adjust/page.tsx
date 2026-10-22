"use client";

import React, { useState, useEffect } from 'react';
import {
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
  Briefcase,
  FileText,
  Table as TableIcon,
  RotateCcw,
  Sliders,
  Info,
  HelpCircle,
  HardHat,
  Truck,
  Wrench,
  Layers,
  Fuel
} from 'lucide-react';
import './account-adjust.css';
import {
  AccountAdjustFormData,
  AdjustmentItem,
  ReasonCategory,
  SAMPLE_ACCOUNT_ADJUST_DATA,
  PRESET_REASON_TEMPLATES,
  composeReasonText,
  formatMoney,
  thaiBahtText,
  getTodayThaiDate,
  POPULAR_SAP_ACCOUNTS,
  generateMemoPlainText,
  generateTableHtmlForWord,
  generateWordDocumentContent
} from './accountAdjustUtils';
import TopBar from '../components/TopBar';

type EditSectionKey = 'header' | 'reason' | 'signer' | 'table_meta' | 'items' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'reason', title: '2. เหตุผลความจำเป็นในการขอปรับปรุง', shortName: 'เหตุผล', icon: Building },
  { key: 'signer', title: '3. ผู้ลงนาม (อก.รย.)', shortName: 'ผู้ลงนาม', icon: UserCheck },
  { key: 'table_meta', title: '4. ข้อมูลหัวตารางแนบ (การไฟฟ้า & หน่วยงาน)', shortName: 'หัวตาราง', icon: TableIcon },
  { key: 'items', title: '5. ตารางรายการทางบัญชี (เดิม vs ใหม่)', shortName: 'ตาราง ๑๐ ช่อง', icon: Calculator },
];

export default function AccountAdjustPage() {
  const [formData, setFormData] = useState<AccountAdjustFormData>(SAMPLE_ACCOUNT_ADJUST_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [activeSheet, setActiveSheet] = useState<'memo' | 'table'>('memo');
  const [reasonMode, setReasonMode] = useState<'guided' | 'freeform'>('guided');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_account_adjust_form_word');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          let salutation = parsed.salutation || 'อก.บฟ.(ก๓)';
          if (salutation === 'อก.กบฟ.(ก๓)' || salutation === 'อก.กบฟ.(ก3)') {
            salutation = 'อก.บฟ.(ก๓)';
          }
          const docTo = parsed.docTo || 'กบฟ.(ก๓)';
          setFormData({
            ...SAMPLE_ACCOUNT_ADJUST_DATA,
            ...parsed,
            salutation,
            docTo,
            reasonCategory: parsed.reasonCategory || 'vehicle',
            causeItem: parsed.causeItem || 'ค่าซ่อมยานพาหนะ',
            errorType: parsed.errorType || 'มีการบันทึกรายการทางบัญชีผิดพลาด',
            detailNote: parsed.detailNote || '',
            purpose: parsed.purpose || 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้',
            memoReason: parsed.memoReason || composeReasonText({
              docFrom: parsed.docFrom,
              docTo: docTo,
              causeItem: parsed.causeItem || 'ค่าซ่อมยานพาหนะ',
              errorType: parsed.errorType || 'มีการบันทึกรายการทางบัญชีผิดพลาด',
              detailNote: parsed.detailNote || '',
              purpose: parsed.purpose || 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้'
            })
          });
        }
      }
    } catch (e) {
      console.error('Error loading stored account adjust form:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pea_account_adjust_form_word', JSON.stringify(formData));
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
      setFormData(SAMPLE_ACCOUNT_ADJUST_DATA);
      try {
        localStorage.removeItem('pea_account_adjust_form_word');
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

  // Variable Builder Handlers for Reason
  const handleUpdateVariable = (field: 'causeItem' | 'errorType' | 'detailNote' | 'purpose', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const newReason = composeReasonText({
        docFrom: updated.docFrom,
        docTo: updated.docTo,
        causeItem: updated.causeItem,
        errorType: updated.errorType,
        detailNote: updated.detailNote,
        purpose: updated.purpose
      });
      return { ...updated, memoReason: newReason };
    });
  };

  const handleSelectPresetReason = (template: typeof PRESET_REASON_TEMPLATES[0]) => {
    setFormData(prev => {
      const newReason = composeReasonText({
        docFrom: prev.docFrom,
        docTo: prev.docTo,
        causeItem: template.causeItem,
        errorType: template.errorType,
        detailNote: template.detailNote,
        purpose: template.purpose
      });
      return {
        ...prev,
        reasonCategory: template.category,
        causeItem: template.causeItem,
        errorType: template.errorType,
        detailNote: template.detailNote,
        purpose: template.purpose,
        memoReason: newReason,
        col4HeaderChoice: template.col4Header,
        col7HeaderChoice: template.col7Header,
        routingType: template.routingType
      };
    });
    showToast(`✓ เลือกรูปแบบ: ${template.badge}`);
  };

  // Render on-screen reason with interactive color highlights
  const renderScreenReasonText = () => {
    const from = formData.docFrom || 'กรย.(ก๓)';
    const to = formData.docTo || 'กบฟ.(ก๓)';
    const cause = formData.causeItem || 'ค่าใช้จ่ายดำเนินงาน';
    const err = formData.errorType || 'มีการบันทึกรายการทางบัญชีผิดพลาด';
    const note = formData.detailNote && formData.detailNote.trim() ? ` (${formData.detailNote.trim()})` : '';
    const purp = formData.purpose || 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้';

    return (
      <>
        <span>{from} ได้ตรวจสอบพบว่ามีการเบิกจ่าย</span>{' '}
        <span
          className="a4-var-spot"
          title="🟡 จุดที่ ๑: รายการ/สิ่งที่เบิกผิด (คลิกแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {cause}
        </span>{' '}
        <span
          className="a4-var-spot blue"
          title="🔵 จุดที่ ๒: ลักษณะความผิดพลาด (คลิกแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {err}
        </span>
        {note ? (
          <>
            {' '}
            <span
              className="a4-var-spot orange"
              title="🟠 จุดที่ ๓: ระบุเจาะจง/หมายเลขงาน WBS (คลิกแก้ไข)"
              onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
            >
              {note}
            </span>
          </>
        ) : null}
        <span> จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้น</span>{' '}
        <span
          className="a4-var-spot green"
          title="🟢 จุดที่ ๔: วัตถุประสงค์ในการขอปรับปรุง (คลิกแก้ไข)"
          onClick={(e) => { e.stopPropagation(); setActiveEditSection('reason'); }}
        >
          {purp}
        </span>{' '}
        <span>จึงขอให้ {to} ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้</span>
      </>
    );
  };


  // Calculations
  const totalOldAmount = formData.items.reduce((sum, item) => sum + (Number(item.oldAmount) || 0), 0);
  const totalNewAmount = formData.items.reduce((sum, item) => sum + (Number(item.newAmount) || 0), 0);

  const handleAddItem = () => {
    const newItem: AdjustmentItem = {
      id: `item-${Date.now()}`,
      debtDocNo: '',
      postingDate: '',
      oldAccountCode: '',
      oldType: 'wbs',
      oldValue: '',
      oldAmount: 0,
      newAccountCode: '',
      newType: 'cost_center',
      newValue: '',
      newAmount: 0,
      deptDocNo: '',
      deptPostingDate: '',
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    showToast('✓ เพิ่มแถวรายการใหม่แล้ว');
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) {
      showToast('⚠️ ต้องมีรายการอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: keyof AdjustmentItem, value: any) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleCopyMemo = async () => {
    const plainText = generateMemoPlainText(formData);
    const html = generateWordDocumentContent(formData);
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
    const content = generateWordDocumentContent(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `บันทึกขอปรับปรุงรายการทางบัญชี_PEA.doc`;
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
      <TopBar title="โปรแกรมปรับปรุงบัญชี" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <Calculator size={18} className="text-purple-300" />
              <span>โปรแกรมปรับปรุงบัญชี (กบฟ. - กรย.ก3)</span>
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
                className={`a4-preset-chip ${activeSheet === 'table' ? 'active' : ''}`}
                onClick={() => setActiveSheet('table')}
              >
                หน้า ๒: แบบฟอร์ม ๑๐ ช่อง
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

        {/* Quick Reason Presets Bar (สาเหตุการปรับปรุงบัญชี) */}
        <div className="no-print" style={{ marginBottom: '16px', background: 'rgba(30, 41, 59, 0.7)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
            <Sparkles size={16} className="text-amber-400" />
            <span>สาเหตุการปรับปรุงบัญชี:</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESET_REASON_TEMPLATES.map(tpl => (
              <button
                key={tpl.category}
                type="button"
                className={`preset-chip ${formData.reasonCategory === tpl.category ? 'active' : ''}`}
                onClick={() => handleSelectPresetReason(tpl)}
                title={tpl.title}
              >
                {tpl.badge}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* A4 PAPER CANVAS (LIVE EDITABLE)                                           */}
        {/* ========================================================================= */}
        <div className="a4-page-shadow">
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
                          placeholder="เช่น กบฟ.(ก๓)"
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
                          placeholder="เช่น อก.บฟ.(ก๓)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. REASON SECTION */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('reason')}
                title="คลิกเพื่อแก้ไขเหตุผลการปรับปรุงบัญชี"
                style={{ marginTop: '14pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขเหตุผลการปรับปรุงบัญชี
                </div>

                {/* Staff guide info badge on screen */}
                <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    📌 จุดตัวแปรที่เปลี่ยนแต่ละงาน: {formData.causeItem || 'ค่าใช้จ่าย'} ({formData.errorType || 'บันทึกผิดพลาด'})
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    (ส่วนที่มีสีไฮไลท์คือจุดที่เปลี่ยนแต่ละครั้ง • เมื่อสั่งพิมพ์หรือก๊อปปี้จะเป็นสีดำทางการปกติ)
                  </span>
                </div>

                <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginBottom: '12pt' }}>
                  {/* Clean text for print */}
                  <span className="aa-print-only">{formData.memoReason}</span>
                  {/* Interactive highlighted text on screen */}
                  <span className="no-print">{renderScreenReasonText()}</span>
                </p>

                <p className="a4-text-indent" style={{ marginBottom: '30pt' }}>
                  {formData.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป'}
                </p>
              </div>

              {/* 3. SIGNER SECTION */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('signer')}
                title="คลิกเพื่อแก้ไขผู้ลงนาม"
                style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10pt', marginBottom: '30pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขผู้ลงนาม
                </div>

                <div style={{ textAlign: 'center', minWidth: '280px' }}>
                  <div style={{ height: '40px' }}></div>
                  <div>({formData.signerName || '...................................................'})</div>
                  <div style={{ fontSize: '13pt', color: '#334155', marginTop: '3pt' }}>{formData.signerTitle}</div>
                  {formData.signerDate && (
                    <div style={{ fontSize: '12pt', color: '#64748b', marginTop: '3pt' }}>{formData.signerDate}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SHEET 2: 10-COLUMN TABLE FORM */}
          {activeSheet === 'table' && (
            <div className="a4-page" style={{ maxWidth: '960px' }}>
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('table_meta')}
                title="คลิกเพื่อแก้ไขข้อมูลหัวตาราง"
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขข้อมูลหัวตาราง
                </div>

                <div style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', marginBottom: '14px' }}>
                  แบบฟอร์มขอปรับปรุงรายการทางบัญชี
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', fontSize: '13pt' }}>
                  <div>
                    การไฟฟ้า: <b>{formData.peaBranch || 'ผกร.กรย.(ก๓)'}</b>&nbsp;&nbsp;&nbsp;&nbsp;ประเภทธุรกิจ: {formData.businessType || '........................'}<br/>
                    รายละเอียดค่าใช้จ่ายที่ต้องการปรับปรุงบัญชี เดือน: <b>{formData.expenseMonth} {formData.expenseYear}</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ border: '1px solid #94a3b8', padding: '4pt 8pt', textAlign: 'left', display: 'inline-block', fontSize: '11pt' }}>
                      <div>{formData.routingType === 'cost_center' ? '[✓]' : '[ ]'} ศูนย์ต้นทุน ส่ง ผบต.</div>
                      <div>{formData.routingType === 'wbs' ? '[✓]' : '[ ]'} WBS / โครงข่าย ส่ง ผบส.</div>
                    </div>
                    <div style={{ marginTop: '3pt', fontSize: '11pt' }}>
                      หน่วยงานที่ปรับปรุงบัญชี: <b>{formData.adjustingDept || 'กบฟ.(ก๓)'}</b>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLE ITEMS */}
              <div
                className="a4-section-hoverable"
                onClick={() => setActiveEditSection('items')}
                title="คลิกเพื่อแก้ไขตาราง ๑๐ ช่อง"
                style={{ marginTop: '8pt' }}
              >
                <div className="section-edit-badge">
                  <Edit3 size={12} /> จิ้มแก้ไขรายการตาราง ๑๐ ช่อง ({formData.items.length} แถว)
                </div>

                <div 
                  style={{ overflowX: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: generateTableHtmlForWord(formData) }}
                />

                <div style={{ fontSize: '11pt', marginTop: '12pt', color: '#475569', lineHeight: 1.5 }}>
                  <b>หมายเหตุ</b><br/>
                  ๑. กรณีปรับปรุงศูนย์ต้นทุนกับศูนย์ต้นทุนให้ทำเครื่องหมาย / ในช่องศูนย์ต้นทุนมุมบนขวา และจัดส่ง ผบต. นอกเหนือจากนี้ให้ส่ง ผบส.<br/>
                  ๒. ช่องที่ ๔ ให้ทำเครื่องหมาย / หน้าข้อความที่บันทึกบัญชีไว้ผิด เช่น ผิดศูนย์ต้นทุนให้ทำเครื่องหมาย [/] ศูนย์ต้นทุน<br/>
                  ๓. ช่องที่ ๗ ให้ทำเครื่องหมาย / หน้าข้อความที่ต้องการให้ปรับปรุงบัญชี เช่น ขอปรับปรุงเข้า โครงข่าย-กิจกรรม ให้ทำเครื่องหมาย [/]<br/>
                  ๔. ให้แนบสำเนาใบสำคัญจ่ายที่บันทึกไว้ผิดบัญชีมาด้วยทุกครั้ง
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
                        placeholder="เช่น กบฟ.(ก๓)"
                      />
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
                        placeholder="เช่น ก.๓ กรย.(กร.) ๒๘๑๓/๒๕๖๘"
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
                      placeholder="เช่น อก.บฟ.(ก๓)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: REASON SUITE */}
              {activeEditSection === 'reason' && (
                <div>
                  {/* Preset Pills Header */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fed7aa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} className="text-amber-400" />
                      <span>เลือกสาเหตุสำเร็จรูป (คลิกเดียวปรับข้อมูลทันที):</span>
                    </div>
                    <div className="preset-chip-list">
                      {PRESET_REASON_TEMPLATES.map(tpl => (
                        <button
                          key={tpl.category}
                          type="button"
                          className={`preset-chip ${formData.reasonCategory === tpl.category ? 'active' : ''}`}
                          onClick={() => handleSelectPresetReason(tpl)}
                        >
                          {tpl.badge}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="reason-mode-toggle">
                    <button
                      type="button"
                      className={`reason-mode-btn ${reasonMode === 'guided' ? 'active' : ''}`}
                      onClick={() => setReasonMode('guided')}
                    >
                      <Sliders size={15} /> โหมดช่วยกรอกแยกจุดที่เปลี่ยนบ่อย (แนะนำ)
                    </button>
                    <button
                      type="button"
                      className={`reason-mode-btn ${reasonMode === 'freeform' ? 'active' : ''}`}
                      onClick={() => setReasonMode('freeform')}
                    >
                      <Edit3 size={15} /> โหมดพิมพ์ข้อความอิสระ (Full Text)
                    </button>
                  </div>

                  {/* GUIDED MODE */}
                  {reasonMode === 'guided' && (
                    <div>
                      {/* Live Preview Box with color tokens */}
                      <div className="var-live-preview-box">
                        <div className="var-live-preview-title">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Info size={15} /> ตัวอย่างข้อความที่ระบบสร้างสดๆ (ส่วนที่มีสีคือจุดที่เปลี่ยนแต่ละครั้ง):
                          </span>
                        </div>
                        <div className="var-live-preview-text">
                          <span>{formData.docFrom || 'กรย.(ก๓)'} ได้ตรวจสอบพบว่ามีการเบิกจ่าย</span>{' '}
                          <span className="variable-badge-num badge-yellow" title="จุดที่ ๑">
                            🟡 จุดที่ ๑: {formData.causeItem || 'ค่าใช้จ่าย'}
                          </span>{' '}
                          <span className="variable-badge-num badge-blue" title="จุดที่ ๒">
                            🔵 จุดที่ ๒: {formData.errorType || 'บันทึกผิดพลาด'}
                          </span>{' '}
                          {formData.detailNote ? (
                            <span className="variable-badge-num badge-orange" title="จุดที่ ๓">
                              🟠 จุดที่ ๓: {formData.detailNote}
                            </span>
                          ) : null}{' '}
                          <span>จึงจำเป็นต้องปรับปรุงรายการดังกล่าวให้ถูกต้อง ดังนั้น</span>{' '}
                          <span className="variable-badge-num badge-green" title="จุดที่ ๔">
                            🟢 จุดที่ ๔: {formData.purpose || 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้'}
                          </span>{' '}
                          <span>จึงขอให้ {formData.docTo || 'กบฟ.(ก๓)'} ปรับปรุงรายการทางบัญชีโดยมีรายละเอียดตามเอกสารแนบที่ส่งมาด้วยนี้</span>
                        </div>
                      </div>

                      {/* Variable Card 1 */}
                      <div className="variable-card">
                        <div className="variable-card-header">
                          <span className="variable-badge-num badge-yellow">
                            🟡 จุดที่ ๑: สิ่งที่เบิกผิด / สาเหตุ
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ระบุค่าใช้จ่ายที่พบข้อผิดพลาด</span>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.causeItem || ''}
                          onChange={(e) => handleUpdateVariable('causeItem', e.target.value)}
                          placeholder="เช่น ค่าจ้างเหมาบริการและแรงงานภายนอก, ค่าซ่อมยานพาหนะ"
                        />
                        <div className="var-quick-options">
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>ตัวเลือกด่วน:</span>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('causeItem', 'ค่าจ้างเหมาบริการและแรงงานภายนอก')}
                          >
                            + 👷 ค่าแรงงาน/จ้างเหมา
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('causeItem', 'ค่าใช้จ่ายโครงการก่อสร้าง')}
                          >
                            + 🏗️ ค่าใช้จ่ายโครงการ
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('causeItem', 'ค่าซ่อมยานพาหนะ')}
                          >
                            + 🚗 ค่าซ่อมยานพาหนะ
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('causeItem', 'ค่าพัสดุและอุปกรณ์ระบบจำหน่ายไฟฟ้า')}
                          >
                            + 📦 ค่าพัสดุ/อุปกรณ์
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('causeItem', 'ค่าน้ำมันเชื้อเพลิงและหล่อลื่น')}
                          >
                            + ⛽ ค่าน้ำมันเชื้อเพลิง
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('causeItem', 'ค่าใช้จ่ายดำเนินงาน')}
                          >
                            + 🏢 ค่าใช้จ่ายดำเนินงาน
                          </button>
                        </div>
                      </div>

                      {/* Variable Card 2 */}
                      <div className="variable-card">
                        <div className="variable-card-header">
                          <span className="variable-badge-num badge-blue">
                            🔵 จุดที่ ๒: ลักษณะความผิดพลาด
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ระบุว่าผิดพลาดอย่างไร</span>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.errorType || ''}
                          onChange={(e) => handleUpdateVariable('errorType', e.target.value)}
                          placeholder="เช่น มีการบันทึกรายการทางบัญชีผิดพลาด, บันทึกผิดหมายเลขงาน WBS"
                        />
                        <div className="var-quick-options">
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>ตัวเลือกด่วน:</span>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('errorType', 'มีการบันทึกรายการทางบัญชีผิดพลาด')}
                          >
                            + บันทึกรายการทางบัญชีผิดพลาด
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('errorType', 'บันทึกผิดหมายเลขงาน WBS ข้ามโครงการ')}
                          >
                            + บันทึกผิดหมายเลขงาน WBS
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('errorType', 'มีการบันทึกบัญชีผิดศูนย์ต้นทุน')}
                          >
                            + บันทึกผิดศูนย์ต้นทุน
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('errorType', 'เบิกจ่ายผิดงวดงานโครงการ')}
                          >
                            + เบิกผิดงวดงาน
                          </button>
                        </div>
                      </div>

                      {/* Variable Card 3 */}
                      <div className="variable-card">
                        <div className="variable-card-header">
                          <span className="variable-badge-num badge-orange">
                            🟠 จุดที่ ๓: ระบุหมายเลขงาน / เจาะจงเพิ่มเติม (ถ้ามี)
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ระบุ WBS/ศูนย์ต้นทุน หรือเว้นว่างได้</span>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.detailNote || ''}
                          onChange={(e) => handleUpdateVariable('detailNote', e.target.value)}
                          placeholder="เช่น งานเดิม: WBS... โอนเข้า WBS... หรือศูนย์ต้นทุน..."
                        />
                      </div>

                      {/* Variable Card 4 */}
                      <div className="variable-card">
                        <div className="variable-card-header">
                          <span className="variable-badge-num badge-green">
                            🟢 จุดที่ ๔: วัตถุประสงค์ในการขอปรับปรุง
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ระบุเป้าหมายการปรับปรุง</span>
                        </div>
                        <input
                          type="text"
                          className="big-input"
                          value={formData.purpose || ''}
                          onChange={(e) => handleUpdateVariable('purpose', e.target.value)}
                          placeholder="เช่น เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้"
                        />
                        <div className="var-quick-options">
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>ตัวเลือกด่วน:</span>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('purpose', 'เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้')}
                          >
                            + เพื่อให้ดำเนินการปิด กส.๓ ต่อไปได้
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('purpose', 'เพื่อให้การสรุปค่าใช้จ่ายโครงการมีความถูกต้องและปิด กส.๓ ได้ตามกำหนด')}
                          >
                            + เพื่อสรุปค่าใช้จ่ายโครงการและปิด กส.๓
                          </button>
                          <button
                            type="button"
                            className="var-quick-opt-btn"
                            onClick={() => handleUpdateVariable('purpose', 'เพื่อให้การจัดทำบัญชีต้นทุนถูกต้องครบถ้วน')}
                          >
                            + เพื่อจัดทำบัญชีต้นทุนถูกต้องครบถ้วน
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FREEFORM MODE */}
                  {reasonMode === 'freeform' && (
                    <div>
                      <div className="big-field-group">
                        <label className="big-label">ข้อความเหตุผลความจำเป็นในการปรับปรุงบัญชี (พิมพ์อิสระ)</label>
                        <textarea
                          rows={6}
                          className="big-textarea"
                          value={formData.memoReason}
                          onChange={(e) => setFormData({ ...formData, memoReason: e.target.value })}
                          placeholder="พิมพ์ข้อความเหตุผลทั้งหมด..."
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="a4-action-btn a4-btn-muted text-xs"
                          onClick={() => {
                            const newText = composeReasonText({
                              docFrom: formData.docFrom,
                              docTo: formData.docTo,
                              causeItem: formData.causeItem,
                              errorType: formData.errorType,
                              detailNote: formData.detailNote,
                              purpose: formData.purpose
                            });
                            setFormData({ ...formData, memoReason: newText });
                            showToast('✓ ดึงข้อความจากโหมดแยกจุดเรียบร้อย');
                          }}
                        >
                          <RotateCcw size={12} /> ดึงข้อความจากโหมดแยกจุด
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="big-field-group" style={{ marginTop: '16px' }}>
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

              {/* SECTION 3: SIGNER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ชื่อผู้ลงนาม</label>
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
                      placeholder="เช่น รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)"
                    />
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
                </div>
              )}

              {/* SECTION 4: TABLE META */}
              {activeEditSection === 'table_meta' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">การไฟฟ้า / หน่วยงานผู้ขอ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.peaBranch}
                        onChange={(e) => setFormData({ ...formData, peaBranch: e.target.value })}
                        placeholder="เช่น ผกร.กรย.(ก๓)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ประเภทธุรกิจ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        placeholder="เช่น ก่อสร้างและบูรณะระบบจำหน่าย"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ประจำเดือน</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.expenseMonth}
                        onChange={(e) => setFormData({ ...formData, expenseMonth: e.target.value })}
                        placeholder="เช่น ตุลาคม"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ปี พ.ศ.</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.expenseYear}
                        onChange={(e) => setFormData({ ...formData, expenseYear: e.target.value })}
                        placeholder="เช่น ๒๕๖๗"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ประเภทการส่งปรับปรุง</label>
                      <select
                        className="big-input"
                        value={formData.routingType}
                        onChange={(e) => setFormData({ ...formData, routingType: e.target.value as any })}
                      >
                        <option value="cost_center">ศูนย์ต้นทุน (จัดส่ง ผบต.)</option>
                        <option value="wbs">WBS / โครงข่าย - กิจกรรม (จัดส่ง ผบส.)</option>
                      </select>
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">หน่วยงานที่ปรับปรุงบัญชี</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.adjustingDept}
                        onChange={(e) => setFormData({ ...formData, adjustingDept: e.target.value })}
                        placeholder="เช่น กบฟ.(ก๓)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: ITEMS */}
              {activeEditSection === 'items' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="big-label" style={{ marginBottom: 0 }}>
                      รายการปรับปรุงบัญชี ({formData.items.length} รายการ)
                    </label>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-emerald"
                      onClick={handleAddItem}
                    >
                      <Plus size={15} /> เพิ่มแถวรายการ
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.items.map((item, idx) => (
                      <div key={item.id} className="big-table-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#6d28d9' }}>
                            แถวที่ {idx + 1}
                          </span>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(idx)}
                              className="a4-action-btn"
                              style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px' }}
                            >
                              <Trash2 size={13} /> ลบแถว
                            </button>
                          )}
                        </div>

                        <div className="big-grid-2">
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>1. เลขที่เอกสารตั้งหนี้</span>
                            <input
                              type="text"
                              className="big-input"
                              value={item.debtDocNo}
                              onChange={(e) => handleUpdateItem(idx, 'debtDocNo', e.target.value)}
                              placeholder="เช่น 1093485692"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>2. วันที่ผ่านรายการ</span>
                            <input
                              type="text"
                              className="big-input"
                              value={item.postingDate}
                              onChange={(e) => handleUpdateItem(idx, 'postingDate', e.target.value)}
                              placeholder="เช่น 26/08/2024"
                            />
                          </div>
                        </div>

                        {/* ข้อมูลเดิม */}
                        <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                          <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '12px', marginBottom: '6px' }}>ข้อมูลเดิมที่ผิด</div>
                          <div className="big-grid-3">
                            <div>
                              <span style={{ fontSize: '10px', color: '#7f1d1d' }}>3. รหัสบัญชีเดิม</span>
                              <input
                                type="text"
                                className="big-input"
                                value={item.oldAccountCode}
                                onChange={(e) => handleUpdateItem(idx, 'oldAccountCode', e.target.value)}
                                placeholder="เช่น 21920010"
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#7f1d1d' }}>4. รหัสเดิม (WBS/ศูนย์)</span>
                              <input
                                type="text"
                                className="big-input"
                                value={item.oldValue}
                                onChange={(e) => handleUpdateItem(idx, 'oldValue', e.target.value)}
                                placeholder="เช่น P-TDD02..."
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#7f1d1d' }}>5. จำนวนเงินเดิม (บาท)</span>
                              <input
                                type="number"
                                className="big-input"
                                value={item.oldAmount}
                                onChange={(e) => handleUpdateItem(idx, 'oldAmount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ข้อมูลใหม่ */}
                        <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                          <div style={{ fontWeight: 600, color: '#166534', fontSize: '12px', marginBottom: '6px' }}>ข้อมูลใหม่ที่ถูกต้อง</div>
                          <div className="big-grid-3">
                            <div>
                              <span style={{ fontSize: '10px', color: '#14532d' }}>6. รหัสบัญชีใหม่</span>
                              <input
                                type="text"
                                className="big-input"
                                value={item.newAccountCode}
                                onChange={(e) => handleUpdateItem(idx, 'newAccountCode', e.target.value)}
                                placeholder="เช่น 53040110 หรือ 53051050"
                              />
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                {POPULAR_SAP_ACCOUNTS.map(acc => (
                                  <button
                                    key={acc.code}
                                    type="button"
                                    onClick={() => handleUpdateItem(idx, 'newAccountCode', acc.code)}
                                    style={{
                                      fontSize: '9px',
                                      padding: '2px 5px',
                                      borderRadius: '4px',
                                      background: item.newAccountCode === acc.code ? '#15803d' : '#ffffff',
                                      color: item.newAccountCode === acc.code ? '#ffffff' : '#166534',
                                      border: '1px solid #bbf7d0',
                                      cursor: 'pointer'
                                    }}
                                    title={acc.name}
                                  >
                                    {acc.code} ({acc.group})
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#14532d' }}>7. รหัสใหม่ (WBS/ศูนย์)</span>
                              <input
                                type="text"
                                className="big-input"
                                value={item.newValue}
                                onChange={(e) => handleUpdateItem(idx, 'newValue', e.target.value)}
                                placeholder="เช่น I301013050"
                              />
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: '#14532d' }}>8. จำนวนเงินใหม่ (บาท)</span>
                              <input
                                type="number"
                                className="big-input"
                                value={item.newAmount}
                                onChange={(e) => handleUpdateItem(idx, 'newAmount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#5b21b6' }}>
                      <span>รวมเดิม: {formatMoney(totalOldAmount)} บาท</span>
                      <span>รวมใหม่: {formatMoney(totalNewAmount)} บาท</span>
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
