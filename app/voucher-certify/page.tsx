"use client";

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
  Plus,
  Trash2,
  Search,
  Check,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  Building,
  Calendar,
  Info,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  Fuel
} from 'lucide-react';
import './voucher-certify.css';
import {
  VoucherCertifyFormData,
  VoucherLineItem,
  ExpenseCategory,
  SAMPLE_PRESET_SUPHAN,
  SAMPLE_PRESET_KAN,
  SAMPLE_PRESET_SAMUT,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  formatCurrency,
  thaiBahtText,
  calculateGrandTotal,
  generateExpenseSummarySentence,
  generatePlainTextSummary,
  downloadWordDocument,
  copyFormattedWordTable
} from './voucherCertifyUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'para1' | 'para2' | 'wbs' | 'expenses' | 'signer' | 'stamps' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'para1', title: '2. วรรคที่ 1: ผู้ควบคุมงานและโครงการ', shortName: 'วรรค 1 (โครงการ)', icon: Building },
  { key: 'para2', title: '3. วรรคที่ 2: วัตถุประสงค์การขอรับรอง', shortName: 'วรรค 2 (วัตถุประสงค์)', icon: AlertTriangle },
  { key: 'wbs', title: '4. ตารางงานและหมายเลข WBS', shortName: 'ตาราง WBS', icon: Receipt },
  { key: 'expenses', title: '5. สรุปหมวดค่าใช้จ่ายและยอดเงิน', shortName: 'หมวดค่าใช้จ่าย', icon: DollarSign },
  { key: 'signer', title: '6. ผู้ลงนามหลัก (หผ.กร.)', shortName: 'ผู้ลงนาม', icon: UserCheck },
  { key: 'stamps', title: '7. เกษียนหนังสือ (หผ.กร. / ชผ.กร.)', shortName: 'เกษียนหนังสือ', icon: Info },
];

export default function VoucherCertifyPage() {
  const [formData, setFormData] = useState<VoucherCertifyFormData>(SAMPLE_PRESET_SUPHAN);
  const [activePreset, setActivePreset] = useState<string>('suphan');
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
      const saved = localStorage.getItem('pea_voucher_certify_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.categories) {
          if (!parsed.docNo || parsed.docNo.includes('2233') || parsed.docNo.includes('2415') || parsed.docNo.includes('2190') || parsed.docNo.includes('2445') || parsed.docNo.includes('2569') || parsed.docNo.includes('คชย')) {
            parsed.docNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.docDate && (parsed.docDate.includes('22 ก.ค.') || parsed.docDate.includes('15 ส.ค.') || parsed.docDate.includes('01 ก.ย.') || parsed.docDate.includes('8 ต.ค.') || parsed.docDate.includes('2569') || parsed.docDate.includes('๒๕๖๙'))) {
            parsed.docDate = '';
          }
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
      localStorage.setItem('pea_voucher_certify_data', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preset switch
  const handleSelectPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === 'suphan') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_SUPHAN)));
      showToast('✓ โหลดแม่แบบ กฟส.สามชุก (สุพรรณบุรี) แล้ว');
    } else if (presetKey === 'kan') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_KAN)));
      showToast('✓ โหลดแม่แบบ กฟจ.กาญจนบุรี แล้ว');
    } else if (presetKey === 'samut') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_SAMUT)));
      showToast('✓ โหลดแม่แบบ กฟจ.สมุทรสาคร แล้ว');
    }
  };

  // Toggle Thai numerals
  const handleToggleThaiNumerals = () => {
    const nextState = !formData.isThaiNumerals;
    const convertStr = (val: string) => nextState ? toThaiNumerals(val) : toArabicNumerals(val);

    setFormData(prev => ({
      ...prev,
      isThaiNumerals: nextState,
      docNo: convertStr(prev.docNo),
      docDate: convertStr(prev.docDate),
      signerDate: convertStr(prev.signerDate),
      stampHpKrDate: convertStr(prev.stampHpKrDate),
      stampCpKrDate: convertStr(prev.stampCpKrDate),
      contactPhone: convertStr(prev.contactPhone),
    }));
    showToast(nextState ? '✓ สลับเป็นเลขไทย (๑ ๒ ๓)' : '✓ สลับเป็นเลขอารบิก (1 2 3)');
  };

  // Update Category Total Amount
  const handleUpdateCategoryAmount = (categoryId: string, newAmount: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === categoryId) {
          const updatedLines = cat.items && cat.items.length > 0
            ? [{ ...cat.items[0], amount: newAmount }]
            : [{
                id: `line-${Date.now()}`,
                docDate: '01.08.2022',
                docNumber: '2001273190',
                accountCode: '6001070196',
                amount: newAmount,
                description: cat.name
              }];
          return {
            ...cat,
            amount: newAmount,
            items: updatedLines
          };
        }
        return cat;
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
      wbsNumber: proj.wbs,
      projectName: proj.name,
      shortProjectName: proj.name
    }));
    setShowWbsResults(false);
    showToast(`✓ เลือกโครงการ ${proj.wbs}`);
  };

  // Copy to Word
  const handleCopyWord = async () => {
    setCopiedItem('word');
    const success = await copyFormattedWordTable(formData);
    if (success) {
      showToast('✓ คัดลอกตารางจัดรูปแบบลง Word แล้ว!');
    } else {
      showToast('⚠️ เบราว์เซอร์ไม่รองรับ HTML Clipboard');
    }
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Download .doc
  const handleDownloadDoc = () => {
    downloadWordDocument(formData);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) แล้ว');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const grandTotal = calculateGrandTotal(formData.categories);
  const totalInThaiText = thaiBahtText(grandTotal);

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
  const fmt = (num: number) => isThai ? toThaiNumerals(formatCurrency(num)) : formatCurrency(num);

  return (
    <div className="voucher-container">
      <TopBar title="โปรแกรมรับรองใบสำคัญจ่าย (ปิดบัญชีก่อสร้าง)" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
      <div className="voucher-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="voucher-header-title">
            <div className="voucher-icon-badge">
              <Receipt size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                โปรแกรมรับรองใบสำคัญจ่าย (ปิดบัญชีก่อสร้าง)
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
              onClick={() => handleSelectPreset('suphan')}
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

      {/* Preset Cards (Screen only) */}
      <div className="preset-grid no-print">
        <div
          onClick={() => handleSelectPreset('suphan')}
          className={`preset-card ${activePreset === 'suphan' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              ตัวอย่างจริง (สุพรรณบุรี)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กฟส.สามชุก</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            สะพานลอย ม.ราชมงคลสุวรรณภูมิ
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-SMG69.M4.1116</span> • ยอด 65,301.24 บาท
          </div>
        </div>

        <div
          onClick={() => handleSelectPreset('kan')}
          className={`preset-card ${activePreset === 'kan' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 2 (กาญจนบุรี)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กฟจ.กาญจนบุรี</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            สะพานลอยบ้านห้วยตลุง
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-KBI69.M4.1114</span> • ยอด 48,250.00 บาท
          </div>
        </div>

        <div
          onClick={() => handleSelectPreset('samut')}
          className={`preset-card ${activePreset === 'samut' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 3 (สมุทรสาคร)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กฟจ.สมุทรสาคร</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            ย้ายแนวสายส่ง คลองท่าแร้ง
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-SSN69.M4.1022</span> • ยอด 82,410.50 บาท
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)')}
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
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
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
            <Sparkles size={16} className="text-emerald-400" />
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
                  background: activeEditSection === sec.key ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: activeEditSection === sec.key ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                  color: activeEditSection === sec.key ? '#34d399' : '#f1f5f9',
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
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1.5px dashed #10b981',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '11pt',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
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
                      placeholder="เช่น ก.3 กรย.(กร)"
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
                        placeholder=""
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
                      placeholder="เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: PARAGRAPH 1 (SUPERVISOR & PROJECT) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para1')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 1 ผู้ควบคุมงาน & ข้อมูลโครงการ"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 1 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ตามที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '200px', fontWeight: 'bold' }}
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                placeholder="นายศราวุฒิ เกิดสีเล็ก"
              />
              <span> ตำแหน่ง </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '180px' }}
                value={formData.supervisorPosition}
                onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                placeholder="ผพง.6 ผกร.กรย.(ก3)"
              />
              <span> ได้ดำเนินการก่อสร้าง</span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '420px', marginTop: '2pt' }}
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="งานก่อสร้างย้ายแนวระบบสายส่ง..."
              />
              <span> </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '300px', marginTop: '2pt' }}
                value={formData.statusExplanation}
                onChange={(e) => setFormData({ ...formData, statusExplanation: e.target.value })}
                placeholder="ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ..."
              />
            </div>
          </div>

          {/* SECTION 3: PARAGRAPH 2 (PURPOSE) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para2')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 2 วัตถุประสงค์การขอรับรอง"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 2 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <textarea
                rows={2}
                className="a4-live-textarea"
                value={formData.purposeText}
                onChange={(e) => setFormData({ ...formData, purposeText: e.target.value })}
                placeholder="ข้อความวัตถุประสงค์..."
              />
            </div>
          </div>

          {/* SECTION 4: WBS TABLE */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('wbs')}
            style={{ margin: '8pt 0', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ตารางงานและหมายเลข WBS"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขตาราง WBS (ขยายใหญ่)
            </span>

            <table className="a4-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>ที่</th>
                  <th style={{ width: '55%' }}>ชื่องาน</th>
                  <th style={{ width: '35%' }}>หมายเลขงาน (WBS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{tn(1)}</td>
                  <td>
                    <input
                      type="text"
                      className="a4-table-input"
                      value={formData.shortProjectName || formData.projectName}
                      onChange={(e) => setFormData({ ...formData, shortProjectName: e.target.value })}
                      placeholder="ชื่องาน..."
                    />
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    <input
                      type="text"
                      className="a4-table-input"
                      style={{ textAlign: 'center', fontWeight: 'bold', color: '#dc2626', fontFamily: 'monospace' }}
                      value={formData.wbsNumber}
                      onChange={(e) => setFormData({ ...formData, wbsNumber: e.target.value })}
                      placeholder="I-69-I-SMG69.M4.1116"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 5: EXPENSES SUMMARY */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('expenses')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: หมวดค่าใช้จ่ายและจำนวนเงิน"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขยอดเงิน (ขยายใหญ่)
            </span>

            <p className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>{generateExpenseSummarySentence(formData.categories, isThai)}</span>
              <span> รวมเป็นเงินทั้งสิ้น </span>
              <strong style={{ fontSize: '17pt' }}>{fmt(grandTotal)}</strong>
              <span> บาท ({totalInThaiText})</span>
            </p>

            <p className="a4-text-indent" style={{ marginTop: '6pt' }}>
              จึงเรียนมาเพื่อโปรดทราบและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
            </p>
          </div>

          {/* SECTION 6: SIGNER BLOCK */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('signer')}
            style={{ marginTop: '16pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ผู้ลงนามหลัก (หผ.กร.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขผู้ลงนาม (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
              <div style={{ width: '270pt' }}>
                <div style={{ height: '32pt' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span>(</span>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', fontWeight: 'bold', width: '210pt' }}
                    value={formData.signerName}
                    onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                    placeholder="นายพิสันติ์ จิตต์ปลื้ม"
                  />
                  <span>)</span>
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '240pt' }}
                    value={formData.signerPosition}
                    onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                    placeholder="หผ.กร.กรย.(ก3)"
                  />
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '160pt' }}
                    value={formData.signerDate}
                    onChange={(e) => setFormData({ ...formData, signerDate: e.target.value })}
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: ROUTING STAMPS */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('stamps')}
            style={{ marginTop: '24pt', padding: '4pt' }}
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
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(16, 185, 129, 0.35)'
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
                    background: activeEditSection === sec.key ? '#10b981' : 'rgba(255,255,255,0.06)',
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
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร) 2445/2569</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="เช่น ก.3 กรย.(กร)"
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
                            color: '#34d399',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
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
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรื่อง (ชื่อเรื่องการรับรองใบสำคัญจ่าย)</span>
                    </label>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขอรับรองใบสำคัญจ่ายและขอส่งหลักฐาน..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรียน (ผู้บังคับบัญชา)</span>
                      <span className="big-label-hint">เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="อก.รย.(ก3) ผ่าน รก.รย.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: PARAGRAPH 1 (SUPERVISOR & PROJECT) */}
              {activeEditSection === 'para1' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อผู้ควบคุมงาน</span>
                        <span className="big-label-hint">เช่น นายศราวุฒิ เกิดสีเล็ก</span>
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
                        <span>ตำแหน่งผู้ควบคุมงาน</span>
                        <span className="big-label-hint">เช่น ผพง.6 ผกร.กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.supervisorPosition}
                        onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                        placeholder="ผพง.6 ผกร.กรย.(ก3)"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อโครงการก่อสร้าง</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="งานก่อสร้างย้ายแนวระบบสายส่ง..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ข้อความอธิบายสถานะงาน</span>
                      <span className="big-label-hint">เช่น ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และ อยู่ระหว่างการจัดทำเอกสารเพื่อปิด กส.</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.statusExplanation}
                      onChange={(e) => setFormData({ ...formData, statusExplanation: e.target.value })}
                      placeholder="ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: PARAGRAPH 2 (PURPOSE) */}
              {activeEditSection === 'para2' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ข้อความวัตถุประสงค์การขอรับรองใบสำคัญจ่าย</span>
                    </label>
                    <textarea
                      rows={4}
                      className="big-textarea"
                      value={formData.purposeText}
                      onChange={(e) => setFormData({ ...formData, purposeText: e.target.value })}
                      placeholder="เพื่อให้สามารถปิดงานก่อสร้าง (ปิด กส.) และส่งมอบงานได้ตามกำหนดเวลา..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: WBS TABLE */}
              {activeEditSection === 'wbs' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่องาน (สำหรับแสดงในตาราง WBS)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.shortProjectName || formData.projectName}
                      onChange={(e) => setFormData({ ...formData, shortProjectName: e.target.value })}
                      placeholder="ชื่องาน..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>หมายเลขงาน (WBS Number)</span>
                      <span className="big-label-hint">เช่น I-69-I-SMG69.M4.1116</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}
                      value={formData.wbsNumber}
                      onChange={(e) => setFormData({ ...formData, wbsNumber: e.target.value })}
                      placeholder="I-69-I-SMG69.M4.1116"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 5: EXPENSES */}
              {activeEditSection === 'expenses' && (
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fed7aa', marginBottom: '0.75rem' }}>
                    ยอดเงินตามหมวดค่าใช้จ่าย (SAP Account):
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {formData.categories.map((cat) => (
                      <div key={cat.id} className="big-table-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#f8fafc' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                            รหัสบัญชี SAP: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{cat.sapAccount}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>จำนวนเงิน:</span>
                          <input
                            type="number"
                            className="big-input"
                            style={{ width: '180px', padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#34d399' }}
                            value={cat.amount}
                            onChange={(e) => handleUpdateCategoryAmount(cat.id, Number(e.target.value) || 0)}
                          />
                          <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>บาท</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Card in Modal */}
                  <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fed7aa' }}>รวมยอดเงินทุกหมวดทั้งสิ้น:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                      {fmt(grandTotal)} บาท ({totalInThaiText})
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 6: SIGNER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อ-นามสกุล ผู้เสนอลงนาม (หผ.กร.)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerName}
                      onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                      placeholder="นายพิสันติ์ จิตต์ปลื้ม"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่ง</span>
                        <span className="big-label-hint">เช่น หผ.กร.กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.signerPosition}
                        onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                        placeholder="หผ.กร.กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่ลงนาม</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.signerDate}
                        onChange={(e) => setFormData({ ...formData, signerDate: e.target.value })}
                        placeholder=""
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
                        placeholder=""
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
                        placeholder=""
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
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
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
                <FileText size={20} className="text-emerald-400" />
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
              {generatePlainTextSummary(formData)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  const text = generatePlainTextSummary(formData);
                  await navigator.clipboard.writeText(text);
                  showToast('✓ คัดลอกข้อความสรุปแล้ว');
                }}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
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
