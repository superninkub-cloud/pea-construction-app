"use client";

import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
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
  ShieldCheck
} from 'lucide-react';
import './job-open.css';
import {
  JobOpenFormData,
  SAMPLE_PRESET_SAMCHUK,
  SAMPLE_PRESET_KANCHANABURI,
  SAMPLE_PRESET_SAMUT,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  downloadJobOpenWordDocument,
  copyFormattedJobOpenWord,
  generateJobOpenPlainText
} from './jobOpenUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'para1' | 'para2' | 'supervisor' | 'signer' | 'stamps' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'para1', title: '2. วรรคที่ 1: หนังสืออ้างถึงเดิมของพื้นที่', shortName: 'วรรค 1 (อ้างถึง)', icon: Building },
  { key: 'para2', title: '3. วรรคที่ 2: การเข้าดำเนินการ & WBS', shortName: 'วรรค 2 (WBS)', icon: PlayCircle },
  { key: 'supervisor', title: '4. ผู้ควบคุมงานและคำลงท้าย', shortName: 'ผู้ควบคุมงาน', icon: ShieldCheck },
  { key: 'signer', title: '5. ผู้ลงนามหลัก (อก.รย.)', shortName: 'ผู้ลงนาม', icon: UserCheck },
  { key: 'stamps', title: '6. เกษียนหนังสือ (หผ.กร. / ชผ.กร.)', shortName: 'เกษียนหนังสือ', icon: Info },
];

export default function JobOpenRequestPage() {
  const [formData, setFormData] = useState<JobOpenFormData>(SAMPLE_PRESET_SAMCHUK);
  const [activePreset, setActivePreset] = useState<string>('samchuk');
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
      const saved = localStorage.getItem('pea_job_open_request_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.wbsNumber) {
          if (!parsed.docNo || parsed.docNo.includes('2249') || parsed.docNo.includes('2246') || parsed.docNo.includes('2195') || parsed.docNo.includes('2569') || parsed.docNo.includes('คชย')) {
            parsed.docNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.docDate && (parsed.docDate.includes('28 ก.ย.') || parsed.docDate.includes('05 ต.ค.') || parsed.docDate.includes('ก.ย.') || parsed.docDate.includes('ต.ค.') || parsed.docDate.includes('2569') || parsed.docDate.includes('๒๕๖๙'))) {
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
      localStorage.setItem('pea_job_open_request_data', JSON.stringify(formData));
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
    if (presetKey === 'samchuk') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_SAMCHUK)));
      showToast('✓ โหลดแม่แบบ กฟส.สามชุก (สะพานลอย ม.ราชมงคลสุวรรณภูมิ) แล้ว');
    } else if (presetKey === 'kanchanaburi') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_KANCHANABURI)));
      showToast('✓ โหลดแม่แบบ กฟจ.กาญจนบุรี (สะพานลอยบ้านห้วยตลุง) แล้ว');
    } else if (presetKey === 'samut') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_SAMUT)));
      showToast('✓ โหลดแม่แบบ กฟจ.สมุทรสาคร (คลองท่าแร้ง) แล้ว');
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
      refDocNo: convertStr(prev.refDocNo),
      refDocDate: convertStr(prev.refDocDate),
      signerDate: convertStr(prev.signerDate),
      stampHpKrDate: convertStr(prev.stampHpKrDate),
      stampCpKrDate: convertStr(prev.stampCpKrDate),
    }));
    showToast(nextState ? '✓ สลับเป็นเลขไทย (๑ ๒ ๓)' : '✓ สลับเป็นเลขอารบิก (1 2 3)');
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
      subject: `ขอแจ้งเข้าดำเนินการงานก่อสร้าง ${proj.name}`,
      actionDescription: `กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้าง ${proj.name}`
    }));
    setShowWbsResults(false);
    showToast(`✓ เลือกโครงการ ${proj.wbs}`);
  };

  // Copy to Word
  const handleCopyWord = async () => {
    setCopiedItem('word');
    const success = await copyFormattedJobOpenWord(formData);
    if (success) {
      showToast('✓ คัดลอกแบบฟอร์มจัดหน้าลง Word แล้ว!');
    } else {
      showToast('⚠️ เบราว์เซอร์ไม่รองรับ HTML Clipboard');
    }
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Download .doc
  const handleDownloadDoc = () => {
    downloadJobOpenWordDocument(formData);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) แล้ว');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="jobopen-container">
      <TopBar title="โปรแกรมแจ้งขอเปิดงาน (เข้าดำเนินการก่อสร้าง)" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
      <div className="jobopen-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="jobopen-header-title">
            <div className="jobopen-icon-badge">
              <PlayCircle size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                โปรแกรมแจ้งขอเปิดงาน (เข้าดำเนินการก่อสร้าง)
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
              onClick={() => handleSelectPreset('samchuk')}
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
          onClick={() => handleSelectPreset('samchuk')}
          className={`preset-card ${activePreset === 'samchuk' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 1 (ตัวอย่างจริง)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กฟส.สามชุก</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            สะพานลอย ม.ราชมงคลสุวรรณภูมิ
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-SMG69.M4.1116</span>
          </div>
        </div>

        <div
          onClick={() => handleSelectPreset('kanchanaburi')}
          className={`preset-card ${activePreset === 'kanchanaburi' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 2 (ตัวอย่างจริง)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กฟจ.กาญจนบุรี</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            สะพานลอยบ้านห้วยตลุง
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-KBI69.M4.1114</span>
          </div>
        </div>

        <div
          onClick={() => handleSelectPreset('samut')}
          className={`preset-card ${activePreset === 'samut' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 3
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กฟจ.สมุทรสาคร</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            ย้ายแนวสายส่ง คลองท่าแร้ง
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-SSN69.M4.1022</span>
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)')}
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
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem' }}
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
                  background: activeEditSection === sec.key ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: activeEditSection === sec.key ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
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
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1.5px dashed #f59e0b',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '11pt',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
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
                      placeholder="เช่น กรย.(ก3)"
                    />
                  </td>
                  <td style={{ width: '8%', fontWeight: 'bold' }}>ถึง</td>
                  <td style={{ width: '42%' }}>
                    <input
                      type="text"
                      className="a4-live-input"
                      value={formData.docTo}
                      onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                      placeholder="เช่น กฟส.สามชุก"
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
                      placeholder="เช่น ผจก.กฟส.สามชุก"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: PARAGRAPH 1 (REF DOC & LOCATION) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para1')}
            style={{ marginTop: '10pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 1 หนังสืออ้างถึงเดิมของพื้นที่"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 1 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ตามหนังสือ </span>
              <strong>{formData.docTo || 'กฟส.สามชุก'}</strong>
              <span> ที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '180px' }}
                value={formData.refDocNo}
                onChange={(e) => setFormData({ ...formData, refDocNo: e.target.value })}
                placeholder="ก.3 สช.(ปร) 1040/2569"
              />
              <span> ลงวันที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '160px' }}
                value={formData.refDocDate}
                onChange={(e) => setFormData({ ...formData, refDocDate: e.target.value })}
                placeholder="17 กันยายน 2569"
              />
              <span> ได้</span>
              <textarea
                rows={2}
                className="a4-live-textarea"
                style={{ marginTop: '4pt' }}
                value={formData.refJobDescription}
                onChange={(e) => setFormData({ ...formData, refJobDescription: e.target.value })}
                placeholder="ระบุรายละเอียดงานที่พื้นที่ขอให้ กรย.(ก3) เข้าดำเนินการ..."
              />
              <span>ความละเอียดแจ้งแล้ว นั้น</span>
            </div>
          </div>

          {/* SECTION 3: PARAGRAPH 2 (ACTION DESCRIPTION & WBS) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para2')}
            style={{ marginTop: '10pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 2 การเข้าดำเนินการ & หมายเลข WBS"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 2 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ในการนี้ </span>
              <textarea
                rows={2}
                className="a4-live-textarea"
                style={{ marginTop: '2pt' }}
                value={formData.actionDescription}
                onChange={(e) => setFormData({ ...formData, actionDescription: e.target.value })}
                placeholder="กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้าง..."
              />
              <div style={{ marginTop: '4pt' }}>
                <span>ตามหมายเลขงาน (WBS) : </span>
                <input
                  type="text"
                  className="a4-inline-input"
                  style={{ width: '230px', fontWeight: 'bold', color: '#dc2626' }}
                  value={formData.wbsNumber}
                  onChange={(e) => setFormData({ ...formData, wbsNumber: e.target.value })}
                  placeholder="I-69-I-SMG69.M4.1116"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: SUPERVISOR & CLOSING TEXT */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('supervisor')}
            style={{ marginTop: '10pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ผู้ควบคุมงานและคำลงท้าย"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขผู้ควบคุมงาน (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>โดยมอบหมายให้ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '220px', fontWeight: 'bold' }}
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                placeholder="นายศราวุฒิ เกิดสีเล็ก"
              />
              <span> ตำแหน่ง </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '200px' }}
                value={formData.supervisorPosition}
                onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                placeholder="ผพง.6 ผกร.กรย.(ก3)"
              />
              <span> เป็นผู้ควบคุมงานก่อสร้าง </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '420px', marginTop: '2pt' }}
                value={formData.requestClosingText}
                onChange={(e) => setFormData({ ...formData, requestClosingText: e.target.value })}
                placeholder="และให้ กฟส.สามชุก อนุมัติเปิดงาน และดำเนินการในส่วนที่เกี่ยวข้องให้ต่อไป"
              />
            </div>

            <p className="a4-text-indent" style={{ marginTop: '12pt' }}>
              จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการ
            </p>
          </div>

          {/* SECTION 5: SIGNER BLOCK (อก.รย.) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('signer')}
            style={{ marginTop: '20pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ผู้ลงนามหลัก (อก.รย.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขผู้ลงนาม (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
              <div style={{ width: '260pt' }}>
                <div style={{ height: '36pt' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span>(</span>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', fontWeight: 'bold', width: '210pt' }}
                    value={formData.signerName}
                    onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                    placeholder="นายกำพล ตุ้ยเต็มวงค์"
                  />
                  <span>)</span>
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '210pt' }}
                    value={formData.signerPosition}
                    onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                    placeholder="อก.รย.(ก3)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: ROUTING STAMPS */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('stamps')}
            style={{ marginTop: '30pt', padding: '4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: เกษียนหนังสือ (หผ.กร. / ชผ.กร.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขเกษียน (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13pt' }}>
              <div>
                <div>แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3</div>
                <div>โทรศัพท์ 10171</div>
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(245, 158, 11, 0.35)'
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
                    background: activeEditSection === sec.key ? '#f59e0b' : 'rgba(255,255,255,0.06)',
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
                        <span className="big-label-hint">เช่น กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        placeholder="กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ถึง (หน่วยงานผู้รับ/พื้นที่)</span>
                        <span className="big-label-hint">เช่น กฟส.สามชุก หรือ กฟจ.กาญจนบุรี</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="กฟส.สามชุก"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เลขที่หนังสือ</span>
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร) 2249/2569</span>
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
                            color: '#38bdf8',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
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
                      <span>เรื่อง (ชื่อเรื่องการแจ้งขอเปิดงาน)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรียน (ผู้จัดการการไฟฟ้าพื้นที่)</span>
                      <span className="big-label-hint">เช่น ผจก.กฟส.สามชุก</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="ผจก.กฟส.สามชุก"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: PARAGRAPH 1 (REF DOC) */}
              {activeEditSection === 'para1' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>หนังสือเดิมของพื้นที่ ที่</span>
                        <span className="big-label-hint">เช่น ก.3 สช.(ปร) 1040/2569</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.refDocNo}
                        onChange={(e) => setFormData({ ...formData, refDocNo: e.target.value })}
                        placeholder="ก.3 สช.(ปร) 1040/2569"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ลงวันที่เดิม</span>
                        <span className="big-label-hint">เช่น 17 กันยายน 2569</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.refDocDate}
                        onChange={(e) => setFormData({ ...formData, refDocDate: e.target.value })}
                        placeholder="17 กันยายน 2569"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>รายละเอียดงานที่พื้นที่ขอให้เข้าดำเนินการ (ตามหนังสือเดิม)</span>
                    </label>
                    <textarea
                      rows={4}
                      className="big-textarea"
                      value={formData.refJobDescription}
                      onChange={(e) => setFormData({ ...formData, refJobDescription: e.target.value })}
                      placeholder="ขอให้ กรย.(ก3) เข้าดำเนินการงานย้ายแนวระบบสายส่ง ช่วงงานก่อสร้างสะพานลอยหน้า ม.ราชมงคลสุวรรณภูมิ..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: PARAGRAPH 2 (ACTION & WBS) */}
              {activeEditSection === 'para2' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ข้อความแจ้งเข้าดำเนินการของ กรย.(ก3)</span>
                      <span className="big-label-hint">เช่น กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้าง...</span>
                    </label>
                    <textarea
                      rows={4}
                      className="big-textarea"
                      value={formData.actionDescription}
                      onChange={(e) => setFormData({ ...formData, actionDescription: e.target.value })}
                      placeholder="กรย.(ก3) จึงขอแจ้งเข้าดำเนินการงานก่อสร้างย้ายแนวระบบสายส่ง..."
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

              {/* SECTION 4: SUPERVISOR & CLOSING */}
              {activeEditSection === 'supervisor' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อ-นามสกุล ผู้ควบคุมงานก่อสร้าง</span>
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
                      <span>คำลงท้ายคำขออนุมัติไปยังพื้นที่</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.requestClosingText}
                      onChange={(e) => setFormData({ ...formData, requestClosingText: e.target.value })}
                      placeholder="และให้ กฟส.สามชุก อนุมัติเปิดงาน และดำเนินการในส่วนที่เกี่ยวข้องให้ต่อไป"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 5: SIGNER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อ-นามสกุล ผู้ลงนามหลัก (อก.รย.)</span>
                      <span className="big-label-hint">ผู้อำนวยการกองก่อสร้างระบบไฟฟ้า</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerName}
                      onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                      placeholder="นายกำพล ตุ้ยเต็มวงค์"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่ง</span>
                        <span className="big-label-hint">เช่น อก.รย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.signerPosition}
                        onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                        placeholder="อก.รย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่ลงนาม</span>
                        <span className="big-label-hint">เช่น 28 ก.ย. 2569</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.signerDate}
                        onChange={(e) => setFormData({ ...formData, signerDate: e.target.value })}
                        placeholder="28 ก.ย. 2569"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: STAMPS */}
              {activeEditSection === 'stamps' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่เกษียน หผ.กร.(ก3)</span>
                        <span className="big-label-hint">เช่น 28 ก.ย. 69</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.stampHpKrDate}
                        onChange={(e) => setFormData({ ...formData, stampHpKrDate: e.target.value })}
                        placeholder="28 ก.ย. 69"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่เกษียน ชผ.กร.(ก3)</span>
                        <span className="big-label-hint">เช่น 25 ก.ย. 69</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.stampCpKrDate}
                        onChange={(e) => setFormData({ ...formData, stampCpKrDate: e.target.value })}
                        placeholder="25 ก.ย. 69"
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
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
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
              {generateJobOpenPlainText(formData)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  const text = generateJobOpenPlainText(formData);
                  await navigator.clipboard.writeText(text);
                  showToast('✓ คัดลอกข้อความสรุปแล้ว');
                }}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
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
