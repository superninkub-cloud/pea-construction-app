"use client";

import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  FileText,
  Printer,
  RotateCcw,
  Copy,
  Sparkles,
  Download,
  Plus,
  Trash2,
  Search,
  Check,
  UserCheck,
  CheckCircle2,
  Building,
  Calendar,
  Info,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import './shortage-budget.css';
import {
  ShortageBudgetFormData,
  ShortageMaterialItem,
  SAMPLE_SHORTAGE_BUDGET_DATA,
  POPULAR_SHORTAGE_MATERIALS,
  calculateShortageTotal,
  numberToThaiBahtText,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  generateShortageBudgetMemoPlainText,
  generateShortageBudgetWordDocument
} from './shortageBudgetUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'para1' | 'para2' | 'table' | 'proposer' | 'order' | 'stamps' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'para1', title: '2. วรรคที่ ๑: ข้อมูลโครงการและพัสดุขาดแคลน', shortName: 'วรรค ๑ (พัสดุ)', icon: Building },
  { key: 'para2', title: '3. วรรคที่ ๒: แผนกเป้าหมายและจัดซื้อ', shortName: 'วรรค ๒ (จัดซื้อ)', icon: PackagePlus },
  { key: 'table', title: '4. ตารางรายการพัสดุขาดแคลนและงบประมาณ', shortName: 'ตารางพัสดุ', icon: Calculator },
  { key: 'proposer', title: '5. ผู้จัดทำ/ผู้เสนอลงนาม (หผ.กร.)', shortName: 'ผู้เสนอ', icon: UserCheck },
  { key: 'order', title: '6. คำสั่งการอนุมัติ (อก.รย.)', shortName: 'คำสั่งอนุมัติ', icon: CheckCircle2 },
  { key: 'stamps', title: '7. เกษียนหนังสือ (หผ.กร. / ชผ.กร.)', shortName: 'เกษียนหนังสือ', icon: Info },
];

export default function ShortageBudgetPage() {
  const [formData, setFormData] = useState<ShortageBudgetFormData>(SAMPLE_SHORTAGE_BUDGET_DATA);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);

  // WBS Search state
  const [searchWbsQuery, setSearchWbsQuery] = useState<string>('');
  const [isSearchingWbs, setIsSearchingWbs] = useState<boolean>(false);
  const [wbsSearchResults, setWbsSearchResults] = useState<Array<{ wbs: string; name: string }>>([]);
  const [showWbsResults, setShowWbsResults] = useState<boolean>(false);

  // Autosave load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_shortage_budget_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          setFormData(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load cached form data', e);
    }
  }, []);

  // Autosave persist
  useEffect(() => {
    try {
      localStorage.setItem('pea_shortage_budget_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Thai numerals
  const handleToggleThaiNumerals = () => {
    const nextState = !formData.isThaiNumerals;
    const convertStr = (val?: string) => val ? (nextState ? toThaiNumerals(val) : toArabicNumerals(val)) : '';

    setFormData(prev => ({
      ...prev,
      isThaiNumerals: nextState,
      docNo: convertStr(prev.docNo),
      docDate: convertStr(prev.docDate),
      proposerDate: convertStr(prev.proposerDate),
      commanderDate: convertStr(prev.commanderDate),
      stampHpKrDate: convertStr(prev.stampHpKrDate),
      stampCpKrDate: convertStr(prev.stampCpKrDate),
      contactPhone: convertStr(prev.contactPhone),
    }));
    showToast(nextState ? '✓ สลับเป็นเลขไทย (๑ ๒ ๓)' : '✓ สลับเป็นเลขอารบิก (1 2 3)');
  };

  // Add Item to Table
  const handleAddItem = (preset?: typeof POPULAR_SHORTAGE_MATERIALS[0]) => {
    const newItem: ShortageMaterialItem = {
      id: `item-${Date.now()}`,
      wbsNo: formData.wbsNo || 'P-TDD02.3-I-XXXXX.0000',
      networkNo: '6001397496',
      materialCode: preset ? preset.code : '1020050004',
      materialName: preset ? preset.name : 'เคเบิลอากาศ อลูมิเนียม 22 เควี 1x185 ต.มม.',
      quantity: 100,
      unit: preset ? preset.unit : 'เมตร',
      unitPrice: preset ? preset.price : 252.00,
      lineTotal: (100) * (preset ? preset.price : 252.00)
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    showToast(`✓ เพิ่มพัสดุ: ${newItem.materialName}`);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      showToast('⚠️ ต้องมีพัสดุอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
    showToast('✓ ลบรายการพัสดุแล้ว');
  };

  // Update Item field
  const handleUpdateItem = (id: string, field: keyof ShortageMaterialItem, val: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? Number(val) || 0 : Number(it.quantity) || 0;
            const price = field === 'unitPrice' ? Number(val) || 0 : Number(it.unitPrice) || 0;
            updated.lineTotal = qty * price;
          }
          return updated;
        }
        return it;
      })
    }));
  };

  // WBS Search with Supabase
  const handleSearchWbs = async () => {
    if (!searchWbsQuery.trim()) return;
    setIsSearchingWbs(true);
    setShowWbsResults(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('wbs, name')
        .or(`wbs.ilike.%${searchWbsQuery}%,name.ilike.%${searchWbsQuery}%`)
        .limit(8);

      if (!error && data) {
        setWbsSearchResults(data);
      } else {
        setWbsSearchResults([]);
      }
    } catch (e) {
      console.error(e);
      setWbsSearchResults([]);
    } finally {
      setIsSearchingWbs(false);
    }
  };

  // Select project from search
  const handleSelectProject = (proj: { wbs: string; name: string }) => {
    setFormData(prev => ({
      ...prev,
      wbsNo: proj.wbs,
      projectDescription: proj.name,
      items: prev.items.map(it => ({ ...it, wbsNo: proj.wbs }))
    }));
    setShowWbsResults(false);
    showToast(`✓ เลือกโครงการ ${proj.wbs}`);
  };

  // Copy to Word
  const handleCopyWord = async () => {
    setCopiedItem('word');
    try {
      const html = generateShortageBudgetWordDocument(formData);
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      showToast('✓ คัดลอกตารางจัดหน้าแล้ว! วางลง Microsoft Word ได้ทันที');
    } catch (e) {
      showToast('⚠️ เบราว์เซอร์ไม่รองรับ HTML Clipboard');
    }
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Download .doc
  const handleDownloadDoc = () => {
    const html = generateShortageBudgetWordDocument(formData);
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `บันทึกของบพัสดุขาดแคลน_${formData.wbsNo || 'PEA'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) แล้ว');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Totals
  const totalAmount = calculateShortageTotal(formData.items);
  const totalBahtText = numberToThaiBahtText(totalAmount);

  // Navigation in Big Modal
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

  const isThai = formData.isThaiNumerals;
  const tn = (val: string | number | undefined | null) => isThai ? toThaiNumerals(val) : (val?.toString() || '');
  const fmt = (num: number) => {
    const formatted = num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isThai ? toThaiNumerals(formatted) : formatted;
  };

  return (
    <div className="shortage-container">
      <TopBar title="โปรแกรมของบซื้อพัสดุขาดแคลน (คพจ./งบเร่งด่วน)" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          fontWeight: 600,
          fontSize: '0.9375rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header (Screen only) */}
      <div className="shortage-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="shortage-header-title">
            <div className="shortage-icon-badge">
              <PackagePlus size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                โปรแกรมของบซื้อพัสดุขาดแคลน (คพจ./งบเร่งด่วน)
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                ✏️ <strong>หน้าร่างเอกสาร A4 เสมือนจริง:</strong> จิ้มแตะส่วนที่ต้องการบนแผ่นกระดาษเพื่อ <strong>&ldquo;ขยายใหญ่แก้ไขชัดเจน&rdquo;</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
            {/* Toggle Thai Numerals */}
            <button
              onClick={handleToggleThaiNumerals}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              title="สลับการแสดงผลตัวเลขอารบิก / เลขไทย"
            >
              <Sparkles size={16} className={formData.isThaiNumerals ? 'text-amber-400' : 'text-gray-400'} />
              <span>{formData.isThaiNumerals ? 'ใช้เลขอารบิก (1 2 3)' : 'แปลงเป็นเลขไทย (๑ ๒ ๓)'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                setFormData(JSON.parse(JSON.stringify(SAMPLE_SHORTAGE_BUDGET_DATA)));
                showToast('✓ รีเซ็ตเป็นค่าเริ่มต้นแล้ว');
              }}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              title="รีเซ็ตกลับไปเป็นค่าเริ่มต้น"
            >
              <RotateCcw size={16} />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Toolbar above A4 paper (Sticky, Screen only) */}
      <div className="editor-toolbar no-print">
        {/* Left: Quick WBS Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="ค้นหา WBS หรือชื่อโครงการ..."
              value={searchWbsQuery}
              onChange={(e) => setSearchWbsQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchWbs()}
              style={{
                width: '100%',
                padding: '0.45rem 2rem 0.45rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                fontSize: '0.8125rem'
              }}
            />
            <button
              onClick={handleSearchWbs}
              style={{
                position: 'absolute',
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <Search size={15} />
            </button>
          </div>

          {/* Search Dropdown */}
          {showWbsResults && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '380px',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 50,
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>ผลการค้นหา Supabase</span>
                <button onClick={() => setShowWbsResults(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.75rem' }}>ปิด</button>
              </div>
              {isSearchingWbs ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>กำลังค้นหา...</div>
              ) : wbsSearchResults.length > 0 ? (
                wbsSearchResults.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectProject(p)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.8125rem'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(217, 119, 6, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontWeight: 600, color: '#38bdf8' }}>{p.wbs}</div>
                    <div style={{ color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: '#94a3b8' }}>ไม่พบข้อมูลโครงการ</div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyWord}
            className="btn-primary"
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
            title="คัดลอกตารางจัดรูปแบบ วางลง Word ได้ทันที"
          >
            {copiedItem === 'word' ? <Check size={15} /> : <Copy size={15} />}
            <span>{copiedItem === 'word' ? 'คัดลอกแล้ว!' : 'คัดลอกลง Word'}</span>
          </button>

          <button
            onClick={handleDownloadDoc}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem' }}
            title="ดาวน์โหลดไฟล์เอกสาร Word (.doc)"
          >
            <Download size={15} />
            <span>โหลดไฟล์ Word</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem' }}
            title="ดูข้อความสรุปสำหรับแชร์ทาง LINE / Email"
          >
            <FileText size={15} />
            <span>ข้อความ LINE</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
            title="สั่งพิมพ์เอกสาร A4 หรือบันทึกเป็น PDF"
          >
            <Printer size={15} />
            <span>พิมพ์ A4 (Print)</span>
          </button>
        </div>
      </div>

      {/* Guide Banner & Section Shortcut Pills (Screen only) */}
      <div className="chips-bar no-print" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#fed7aa' }}>
            <Sparkles size={16} className="text-amber-400" />
            <span>จิ้มส่วนที่ต้องการแก้ไข (จะเปิดหน้าต่างขยายใหญ่ให้แก้ไขชัดเจนสบายตา):</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            (หรือคลิกปุ่มลัดด้านล่างเพื่อเปิดหน้าต่างขยายใหญ่ตามหัวข้อ)
          </span>
        </div>

        <div className="chip-group">
          {SECTIONS_META.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <button
                key={idx}
                className="chip-btn"
                onClick={() => setActiveEditSection(sec.key)}
                style={{
                  background: activeEditSection === sec.key ? 'rgba(217, 119, 6, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: activeEditSection === sec.key ? '#d97706' : 'rgba(255, 255, 255, 0.15)',
                  color: activeEditSection === sec.key ? '#fbbf24' : '#f1f5f9',
                  fontWeight: 600,
                  padding: '0.4rem 0.85rem'
                }}
              >
                <Icon size={14} />
                <span>{sec.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* IN-PLACE LIVE EDITABLE A4 DRAFT DOCUMENT (WYSIWYG)       */}
      {/* ======================================================== */}
      <div className="a4-wrapper">
        <div className="a4-page">
          {/* Badge Guide (Screen only) */}
          <div className="no-print" style={{
            position: 'absolute',
            top: '8mm',
            right: '12mm',
            background: 'rgba(217, 119, 6, 0.12)',
            border: '1.5px dashed #d97706',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '11pt',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.15)'
          }}
          onClick={() => setActiveEditSection('header')}
          title="คลิกเพื่อเริ่มขยายแก้ไขส่วนหัว"
          >
            <Edit3 size={15} />
            <span><strong>แตะจิ้มส่วนไหนก็ได้บนกระดาษ</strong> เพื่อขยายใหญ่แก้ไข</span>
          </div>

          {/* PEA Official Logo & Header */}
          <div className="a4-pea-header">
            <img
              src="/pea-logo.png"
              alt="PEA Logo"
              style={{ width: '56px', height: '56px', objectFit: 'contain' }}
            />
            <div style={{ marginLeft: '10px' }}>
              <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
              <div style={{ fontSize: '8.5pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
            </div>
          </div>

          {/* Big Bold Memo Title */}
          <div style={{ textAlign: 'center', fontSize: '28pt', fontWeight: 'bold', margin: '4pt 0 10pt 0', letterSpacing: '2px' }}>
            บันทึกข้อความ
          </div>

          {/* SECTION 1: HEADER INFO TABLE */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('header')}
            title="จิ้มเพื่อขยายแก้ไข: ส่วนหัวบันทึกข้อความ (จาก, ถึง, เลขที่, วันที่, เรื่อง, เรียน)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขส่วนหัว (ขยายใหญ่)
            </span>

            <table className="a4-info-table">
              <tbody>
                <tr>
                  <td style={{ width: '8%', fontWeight: 'bold' }}>จาก</td>
                  <td style={{ width: '42%' }}>
                    <input
                      type="text"
                      className="a4-live-input"
                      value={formData.docFrom}
                      onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                      placeholder="เช่น ผกร.กรย.(ก3)"
                    />
                  </td>
                  <td style={{ width: '8%', fontWeight: 'bold' }}>ถึง</td>
                  <td style={{ width: '42%' }}>
                    <input
                      type="text"
                      className="a4-live-input"
                      value={formData.docTo}
                      onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                      placeholder="เช่น กรย.(ก3)"
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เลขที่</td>
                  <td>
                    <input
                      type="text"
                      className="a4-live-input"
                      value={formData.docNo}
                      onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                      placeholder="เช่น ก.3 กรย.(กร) ๒๓๓๗/๒๕๖๙"
                    />
                  </td>
                  <td style={{ fontWeight: 'bold' }}>วันที่</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        placeholder="เช่น 8 ต.ค. 2569"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, docDate: getTodayThaiDate() });
                        }}
                        className="no-print"
                        style={{
                          padding: '1px 6px',
                          fontSize: '11px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          color: '#475569'
                        }}
                        title="ใส่วันที่ปัจจุบัน"
                      >
                        วันนี้
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top' }}>เรื่อง</td>
                  <td colSpan={3}>
                    <textarea
                      rows={2}
                      className="a4-live-textarea"
                      style={{ fontWeight: 'bold' }}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="เรื่อง..."
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
                      placeholder="เช่น อก.รย.(ก3)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: PARAGRAPH 1 (PROJECT & DEMAND) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para1')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ ๑ ข้อมูลโครงการและพัสดุขาดแคลน"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค ๑ (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ตามที่ </span>
              <strong>{formData.docFrom || 'ผกร.กรย.(ก3)'}</strong>
              <span> ได้ดำเนินการงาน</span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '450px' }}
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="งานก่อสร้างปรับปรุงระบบจำหน่าย 22 เควี..."
              />
              <span> ในพื้นที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '130px' }}
                value={formData.peaArea}
                onChange={(e) => setFormData({ ...formData, peaArea: e.target.value })}
                placeholder="กฟส.บางเลน"
              />
              <span> ตามแผนงาน </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '120px', fontWeight: 'bold' }}
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                placeholder="คพจ.2.3"
              />
              <span> มีความประสงค์ขอใช้พัสดุ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '180px' }}
                value={formData.materialCategory}
                onChange={(e) => setFormData({ ...formData, materialCategory: e.target.value })}
                placeholder="สายไฟแรงสูง"
              />
              <span> จำนวน </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }}
                value={formData.demandQuantity}
                onChange={(e) => setFormData({ ...formData, demandQuantity: e.target.value })}
                placeholder="1,313"
              />
              <span> </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '60px', textAlign: 'center' }}
                value={formData.demandUnit}
                onChange={(e) => setFormData({ ...formData, demandUnit: e.target.value })}
                placeholder="เมตร"
              />
              <span> ตามหมายเลขงาน (WBS) : </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '230px', fontWeight: 'bold', color: '#0369a1' }}
                value={formData.wbsNo}
                onChange={(e) => setFormData({ ...formData, wbsNo: e.target.value })}
                placeholder="P-TDD02.3-I-BLNIA.0026"
              />
              <span> โดยมี </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '180px', fontWeight: 'bold' }}
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                placeholder="นายศราวุฒิ เกิดสีเล็ก"
              />
              <span> ตำแหน่ง </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '150px' }}
                value={formData.supervisorPosition}
                onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                placeholder="พชง.6"
              />
              <span> สังกัด </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '140px' }}
                value={formData.supervisorDept}
                onChange={(e) => setFormData({ ...formData, supervisorDept: e.target.value })}
                placeholder="ผกร.กรย.(ก3)"
              />
              <span> เป็นผู้ควบคุมงาน นั้น</span>
            </div>
          </div>

          {/* SECTION 3: PARAGRAPH 2 (PURCHASING DEPT) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para2')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ ๒ แผนกเป้าหมายและจัดซื้อ"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค ๒ (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>เนื่องจากพัสดุดังกล่าวขาดแคลน เพื่อให้งานก่อสร้างสามารถดำเนินการได้อย่างต่อเนื่อง </span>
              <strong>{formData.docFrom || 'ผกร.กรย.(ก3)'}</strong>
              <span> จึงขออนุมัติจัดสรรงบประมาณเพื่อจัดซื้อพัสดุจำนวน </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }}
                value={formData.requestQuantity}
                onChange={(e) => setFormData({ ...formData, requestQuantity: e.target.value })}
                placeholder="1,300"
              />
              <span> </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '60px', textAlign: 'center' }}
                value={formData.requestUnit}
                onChange={(e) => setFormData({ ...formData, requestUnit: e.target.value })}
                placeholder="เมตร"
              />
              <span> และขอส่งเรื่องให้ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '140px', fontWeight: 'bold' }}
                value={formData.targetDept}
                onChange={(e) => setFormData({ ...formData, targetDept: e.target.value })}
                placeholder="ผจร.กรย.(ก3)"
              />
              <span> ดำเนินการขอจัดสรรงบประมาณผ่าน </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '130px', fontWeight: 'bold' }}
                value={formData.purchasingDept}
                onChange={(e) => setFormData({ ...formData, purchasingDept: e.target.value })}
                placeholder="กบพ.(ก3)"
              />
              <span> ตามรายละเอียดพัสดุแนบท้าย</span>
            </div>
          </div>

          {/* SECTION 4: SHORTAGE MATERIALS TABLE */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('table')}
            style={{ margin: '8pt 0', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ตารางรายการพัสดุขาดแคลนและงบประมาณ"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขตารางพัสดุ (ขยายใหญ่)
            </span>

            <table className="a4-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '6%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '22%', textAlign: 'center' }}>รหัสพัสดุ</th>
                  <th style={{ width: '38%', textAlign: 'center' }}>รายการพัสดุ</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>จำนวน</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>หน่วย</th>
                  <th style={{ width: '16%', textAlign: 'center' }}>รวมเป็นเงิน (บาท)</th>
                  <th className="no-print" style={{ width: '5%', textAlign: 'center' }}>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((it, idx) => (
                  <tr key={it.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{tn(idx + 1)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="text"
                        className="a4-table-input"
                        style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}
                        value={it.materialCode}
                        onChange={(e) => handleUpdateItem(it.id, 'materialCode', e.target.value)}
                        placeholder="1020050004"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        value={it.materialName}
                        onChange={(e) => handleUpdateItem(it.id, 'materialName', e.target.value)}
                        placeholder="ชื่อพัสดุ..."
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        className="a4-table-input"
                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                        value={it.quantity}
                        onChange={(e) => handleUpdateItem(it.id, 'quantity', Number(e.target.value) || 0)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="text"
                        className="a4-table-input"
                        style={{ textAlign: 'center' }}
                        value={it.unit}
                        onChange={(e) => handleUpdateItem(it.id, 'unit', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {fmt(it.lineTotal)}
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="row-del-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(it.id);
                        }}
                        title="ลบแถวนี้"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ textAlign: 'center' }}>รวมเป็นเงินทั้งสิ้น ({totalBahtText})</td>
                  <td colSpan={2}></td>
                  <td style={{ textAlign: 'right', color: '#b45309' }}>{fmt(totalAmount)}</td>
                  <td className="no-print"></td>
                </tr>
              </tbody>
            </table>

            {/* Quick Add Row inside table footer (Screen only) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-start', margin: '4pt 0 0 0' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveEditSection('table');
                }}
                style={{
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px dashed #d97706',
                  color: '#b45309',
                  padding: '3px 12px',
                  borderRadius: '4px',
                  fontSize: '13pt',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} />
                <span>+ จัดการและเพิ่มพัสดุขาดแคลน (ขยายใหญ่)</span>
              </button>
            </div>
          </div>

          {/* Concluding Paragraph */}
          <p className="a4-text-indent" style={{ marginTop: '6pt' }}>
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติจัดสรรงบประมาณและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
          </p>

          {/* SECTION 5: PROPOSER BLOCK */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('proposer')}
            style={{ marginTop: '16pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ผู้จัดทำ/ผู้เสนอลงนาม (หผ.กร.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขผู้เสนอ (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
              <div style={{ width: '270pt' }}>
                <div style={{ height: '28pt' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span>(</span>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', fontWeight: 'bold', width: '210pt' }}
                    value={formData.proposerName}
                    onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                    placeholder="นายพิสันต์ จิตต์ปลื้ม"
                  />
                  <span>)</span>
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '240pt' }}
                    value={formData.proposerPosition}
                    onChange={(e) => setFormData({ ...formData, proposerPosition: e.target.value })}
                    placeholder="หผ.กร.กรย.(ก3)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: COMMANDER ORDER BOX */}
          <div
            className="a4-section-hoverable a4-approval-box"
            onClick={() => setActiveEditSection('order')}
            title="จิ้มเพื่อขยายแก้ไข: คำสั่งการอนุมัติ (อก.รย.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขคำสั่งอนุมัติ (ขยายใหญ่)
            </span>

            <div style={{ fontSize: '15pt', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>เรียน:</span>
                <input
                  type="text"
                  className="a4-inline-input"
                  style={{ width: '220px', fontWeight: 'bold' }}
                  value={formData.orderTo}
                  onChange={(e) => setFormData({ ...formData, orderTo: e.target.value })}
                  placeholder="ผจร.กรย.(ก3)"
                />
              </div>
              <div style={{ marginTop: '2pt' }}>
                <input
                  type="text"
                  className="a4-live-input"
                  value={formData.orderText}
                  onChange={(e) => setFormData({ ...formData, orderText: e.target.value })}
                  placeholder="แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center', marginTop: '10pt' }}>
                <div style={{ width: '270pt' }}>
                  <div style={{ height: '20pt' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    <span>(</span>
                    <input
                      type="text"
                      className="a4-live-input"
                      style={{ textAlign: 'center', fontWeight: 'bold', width: '210pt' }}
                      value={formData.commanderName}
                      onChange={(e) => setFormData({ ...formData, commanderName: e.target.value })}
                      placeholder="นายอนันต์ กาญจนอุปถัมภ์"
                    />
                    <span>)</span>
                  </div>
                  <div style={{ marginTop: '2pt' }}>
                    <input
                      type="text"
                      className="a4-live-input"
                      style={{ textAlign: 'center', width: '250pt' }}
                      value={formData.commanderPosition}
                      onChange={(e) => setFormData({ ...formData, commanderPosition: e.target.value })}
                      placeholder="รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: ROUTING STAMPS */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('stamps')}
            style={{ marginTop: '16pt', padding: '4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: เกษียนหนังสือ (หผ.กร. / ชผ.กร.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขเกษียน (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13pt' }}>
              <div>
                <div>{formData.contactDepartment}</div>
                <div>โทรศัพท์ {tn(formData.contactPhone)}</div>
              </div>

              {formData.hasRoutingStamps && (
                <div style={{ textAlign: 'right', lineHeight: 1.5 }}>
                  <div>หผ.กร.(ก3) ลงชื่อ ................... วันที่ {tn(formData.stampHpKrDate)}</div>
                  <div>ชผ.กร.(ก3) ลงชื่อ ................... วันที่ {tn(formData.stampCpKrDate)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BIG SECTION POP-OUT EDITOR MODAL                         */}
      {/* ======================================================== */}
      {activeEditSection && (
        <div
          className="big-editor-overlay no-print"
          onClick={() => setActiveEditSection(null)}
        >
          <div
            className="big-editor-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="big-editor-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(217, 119, 6, 0.35)'
                }}>
                  {(() => {
                    const found = SECTIONS_META.find(s => s.key === activeEditSection);
                    const Icon = found ? found.icon : Edit3;
                    return <Icon size={22} />;
                  })()}
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                    {SECTIONS_META.find(s => s.key === activeEditSection)?.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                    ขยายใหญ่ชัดเจน ปรับค่าเสร็จจะอัปเดตลงกระดาษ A4 ด้านหลังทันที (เรียลไทม์)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveEditSection(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0.5rem',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="ปิดหน้าต่างขยาย"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Section Switcher Bar */}
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              padding: '0.625rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              overflowX: 'auto'
            }}>
              {SECTIONS_META.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveEditSection(sec.key)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: activeEditSection === sec.key ? 700 : 500,
                    background: activeEditSection === sec.key ? '#d97706' : 'rgba(255,255,255,0.06)',
                    color: activeEditSection === sec.key ? '#ffffff' : '#cbd5e1',
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sec.shortName}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="big-editor-body">
              {/* SECTION 1: HEADER */}
              {activeEditSection === 'header' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>จาก (หน่วยงานผู้จัดทำ)</span>
                        <span className="big-label-hint">เช่น ผกร.กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        placeholder="ผกร.กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ถึง (หน่วยงานผู้รับ)</span>
                        <span className="big-label-hint">เช่น กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="กรย.(ก3)"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เลขที่หนังสือ</span>
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร) ๒๓๓๗/๒๕๖๙</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="ก.3 กรย.(กร) ๒๓๓๗/๒๕๖๙"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่หนังสือ</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, docDate: getTodayThaiDate() })}
                          style={{
                            fontSize: '0.75rem',
                            color: '#fbbf24',
                            background: 'rgba(217, 119, 6, 0.1)',
                            border: '1px solid rgba(217, 119, 6, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          + ใส่วันที่วันนี้
                        </button>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        placeholder="8 ต.ค. 2569"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรื่อง (ชื่อเรื่องการขอจัดสรรงบซื้อพัสดุ)</span>
                    </label>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขออนุมัติจัดสรรงบประมาณจัดซื้อพัสดุขาดแคลน..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรียน (ผู้บังคับบัญชา)</span>
                      <span className="big-label-hint">เช่น อก.รย.(ก3)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="อก.รย.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: PARAGRAPH 1 (PROJECT & DEMAND) */}
              {activeEditSection === 'para1' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อโครงการก่อสร้าง</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder="ก่อสร้างปรับปรุงระบบจำหน่าย 22 เควี บริเวณสถานีไฟฟ้าบางเลน 3..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>การไฟฟ้าพื้นที่</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.peaArea}
                        onChange={(e) => setFormData({ ...formData, peaArea: e.target.value })}
                        placeholder="กฟส.บางเลน"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>แผนงาน</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.planName}
                        onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                        placeholder="คพจ.2.3"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>หมายเลขงาน (WBS)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}
                        value={formData.wbsNo}
                        onChange={(e) => setFormData({ ...formData, wbsNo: e.target.value })}
                        placeholder="P-TDD02.3-I-BLNIA.0026"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ประเภทพัสดุที่ขาดแคลน</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.materialCategory}
                        onChange={(e) => setFormData({ ...formData, materialCategory: e.target.value })}
                        placeholder="สายไฟแรงสูง"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ปริมาณความต้องการ</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                        value={formData.demandQuantity}
                        onChange={(e) => setFormData({ ...formData, demandQuantity: e.target.value })}
                        placeholder="1,313"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>หน่วย</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        style={{ textAlign: 'center' }}
                        value={formData.demandUnit}
                        onChange={(e) => setFormData({ ...formData, demandUnit: e.target.value })}
                        placeholder="เมตร"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อผู้ควบคุมงาน</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.supervisorName}
                        onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                        placeholder="นายศราวุฒิ เกิดสีเล็ก"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่ง</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.supervisorPosition}
                        onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                        placeholder="พชง.6"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>สังกัด</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.supervisorDept}
                        onChange={(e) => setFormData({ ...formData, supervisorDept: e.target.value })}
                        placeholder="ผกร.กรย.(ก3)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: PARAGRAPH 2 (PURCHASING) */}
              {activeEditSection === 'para2' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>จำนวนที่ขอจัดซื้อ</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                        value={formData.requestQuantity}
                        onChange={(e) => setFormData({ ...formData, requestQuantity: e.target.value })}
                        placeholder="1,300"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>หน่วย</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        style={{ textAlign: 'center' }}
                        value={formData.requestUnit}
                        onChange={(e) => setFormData({ ...formData, requestUnit: e.target.value })}
                        placeholder="เมตร"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>แผนกเป้าหมาย</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.targetDept}
                        onChange={(e) => setFormData({ ...formData, targetDept: e.target.value })}
                        placeholder="ผจร.กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>กองจัดซื้อ</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.purchasingDept}
                        onChange={(e) => setFormData({ ...formData, purchasingDept: e.target.value })}
                        placeholder="กบพ.(ก3)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: TABLE OF SHORTAGE MATERIALS */}
              {activeEditSection === 'table' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fed7aa' }}>
                      รายการพัสดุในตาราง ({formData.items.length} รายการ):
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddItem()}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                    >
                      <Plus size={14} />
                      <span>+ เพิ่มพัสดุ</span>
                    </button>
                  </div>

                  {/* Cards for each shortage item */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {formData.items.map((it, idx) => (
                      <div key={it.id} className="big-table-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>
                            รายการที่ {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>ลบแถวนี้</span>
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '0.75rem', marginBottom: '0.625rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รหัสพัสดุ</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', fontFamily: 'monospace' }}
                              value={it.materialCode}
                              onChange={(e) => handleUpdateItem(it.id, 'materialCode', e.target.value)}
                              placeholder="1020050004"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ชื่อรายการพัสดุ</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem' }}
                              value={it.materialName}
                              onChange={(e) => handleUpdateItem(it.id, 'materialName', e.target.value)}
                              placeholder="เคเบิลอากาศ..."
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1fr 1.2fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>จำนวน</label>
                            <input
                              type="number"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '1rem', textAlign: 'center', fontWeight: 700 }}
                              value={it.quantity}
                              onChange={(e) => handleUpdateItem(it.id, 'quantity', Number(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>หน่วย</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', textAlign: 'center' }}
                              value={it.unit}
                              onChange={(e) => handleUpdateItem(it.id, 'unit', e.target.value)}
                              placeholder="เมตร"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ราคา/หน่วย (บาท)</label>
                            <input
                              type="number"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', textAlign: 'right' }}
                              value={it.unitPrice}
                              onChange={(e) => handleUpdateItem(it.id, 'unitPrice', Number(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รวมเงิน (บาท)</label>
                            <div style={{ padding: '0.5rem 0.75rem', fontSize: '1.0625rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.5rem', textAlign: 'right' }}>
                              {fmt(it.lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Popular shortage materials chips */}
                  <div style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fbbf24', marginBottom: '0.5rem' }}>
                      + คลิกเพิ่มพัสดุขาดแคลนยอดนิยมเข้าตารางทันที:
                    </div>
                    <div className="chip-group">
                      {POPULAR_SHORTAGE_MATERIALS.map((pi, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="chip-btn"
                          onClick={() => handleAddItem(pi)}
                          title={`เพิ่ม: ${pi.name}`}
                        >
                          <Plus size={12} />
                          <span>{pi.name} ({pi.unit})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Amount in Modal */}
                  <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fed7aa' }}>รวมงบประมาณที่ขอจัดสรรทั้งสิ้น:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
                      {fmt(totalAmount)} บาท ({totalBahtText})
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 5: PROPOSER */}
              {activeEditSection === 'proposer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อ-นามสกุล ผู้เสนอลงนาม (หผ.กร.)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerName}
                      onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                      placeholder="นายพิสันต์ จิตต์ปลื้ม"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ตำแหน่งผู้เสนอ</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerPosition}
                      onChange={(e) => setFormData({ ...formData, proposerPosition: e.target.value })}
                      placeholder="หผ.กร.กรย.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 6: ORDER */}
              {activeEditSection === 'order' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>สั่งการถึง</span>
                        <span className="big-label-hint">เช่น ผจร.กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.orderTo}
                        onChange={(e) => setFormData({ ...formData, orderTo: e.target.value })}
                        placeholder="ผจร.กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ข้อความสั่งการ</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.orderText}
                        onChange={(e) => setFormData({ ...formData, orderText: e.target.value })}
                        placeholder="แจ้งส่วนเกี่ยวข้องดำเนินการต่อไป"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อผู้อนุมัติสั่งการ</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.commanderName}
                        onChange={(e) => setFormData({ ...formData, commanderName: e.target.value })}
                        placeholder="นายอนันต์ กาญจนอุปถัมภ์"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่ง</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.commanderPosition}
                        onChange={(e) => setFormData({ ...formData, commanderPosition: e.target.value })}
                        placeholder="รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: STAMPS */}
              {activeEditSection === 'stamps' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>แผนกเจ้าของเรื่อง</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.contactDepartment}
                      onChange={(e) => setFormData({ ...formData, contactDepartment: e.target.value })}
                      placeholder="แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เบอร์โทรศัพท์</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="10171"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่เกษียน หผ.กร.</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.stampHpKrDate}
                        onChange={(e) => setFormData({ ...formData, stampHpKrDate: e.target.value })}
                        placeholder="8 ต.ค. 69"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่เกษียน ชผ.กร.</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.stampCpKrDate}
                        onChange={(e) => setFormData({ ...formData, stampCpKrDate: e.target.value })}
                        placeholder="8 ต.ค. 69"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Previous / Next / Done */}
            <div className="big-editor-footer">
              <button
                type="button"
                onClick={handlePrevSection}
                disabled={currentSectionIndex <= 0}
                className="btn-secondary"
                style={{
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  opacity: currentSectionIndex <= 0 ? 0.4 : 1,
                  cursor: currentSectionIndex <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={18} />
                <span>ส่วนก่อนหน้า</span>
              </button>

              <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                ส่วนที่ {currentSectionIndex + 1} จาก {SECTIONS_META.length}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {currentSectionIndex < SECTIONS_META.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="btn-secondary"
                    style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
                  >
                    <span>ส่วนถัดไป</span>
                    <ChevronRight size={18} />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setActiveEditSection(null)}
                  className="btn-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
                >
                  <Check size={18} />
                  <span>เสร็จสิ้น (ดูบน A4)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share / Plain Text Modal (Screen only) */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            padding: '1.5rem',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.125rem' }}>
                <FileText size={20} className="text-amber-400" />
                <span>ข้อความสรุปสำหรับแชร์ทาง LINE / อีเมล</span>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <pre style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#cbd5e1',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '380px',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              {generateShortageBudgetMemoPlainText(formData)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  const text = generateShortageBudgetMemoPlainText(formData);
                  await navigator.clipboard.writeText(text);
                  showToast('✓ คัดลอกข้อความสรุปแล้ว');
                }}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
              >
                <Copy size={16} />
                <span>คัดลอกข้อความ</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
