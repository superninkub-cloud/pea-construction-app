"use client";

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
  Plus,
  Minus,
  Search,
  Check,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  Building,
  Layers,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Edit3,
  AlertTriangle,
  X,
  ArrowRight
} from 'lucide-react';
import './demolish-scrap.css';
import {
  DemolishScrapItem,
  DemolishScrapFormData,
  POPULAR_SCRAP_ITEMS,
  SAMPLE_PRESET_KAMPHAENGSAEN,
  SAMPLE_PRESET_SAMCHUK_SCRAP,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  downloadDemolishScrapWordDocument,
  copyFormattedDemolishScrapWord,
  generateDemolishScrapPlainText
} from './demolishScrapUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'para1' | 'para2' | 'table' | 'proposer' | 'approval' | 'footer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'para1', title: '2. วรรคที่ ๑: ข้อมูลโครงการและหนังสืออ้างถึง', shortName: 'วรรค ๑ (WBS)', icon: Building },
  { key: 'para2', title: '3. วรรคที่ ๒: สภาพหน้างานและเหตุผลทำลาย', shortName: 'วรรค ๒ (เหตุผล)', icon: AlertTriangle },
  { key: 'table', title: '4. ตารางรายการพัสดุรื้อถอน (เสา/ตอม่อ)', shortName: 'ตารางพัสดุ', icon: Trash2 },
  { key: 'proposer', title: '5. ผู้จัดทำบันทึก / ผู้เสนอลงนาม (หผ.กร.)', shortName: 'ผู้เสนอ', icon: UserCheck },
  { key: 'approval', title: '6. ส่วนคำสั่งการอนุมัติ (อก.รย.)', shortName: 'คำสั่งอนุมัติ', icon: CheckCircle2 },
  { key: 'footer', title: '7. ท้ายกระดาษและหมายเลขติดต่อ', shortName: 'ท้ายกระดาษ', icon: Info },
];

export default function DemolishScrapPage() {
  const [formData, setFormData] = useState<DemolishScrapFormData>(SAMPLE_PRESET_KAMPHAENGSAEN);
  const [activePreset, setActivePreset] = useState<string>('kamphaengsaen');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Active Big Section Editor Modal
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);

  // WBS Search state
  const [searchWbsQuery, setSearchWbsQuery] = useState<string>('');
  const [isSearchingWbs, setIsSearchingWbs] = useState<boolean>(false);
  const [wbsSearchResults, setWbsSearchResults] = useState<Array<{ wbs: string; name: string }>>([]);
  const [showWbsResults, setShowWbsResults] = useState<boolean>(false);

  // Autosave load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_demolish_scrap_data');
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

  // Autosave persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pea_demolish_scrap_data', JSON.stringify(formData));
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
    if (presetKey === 'kamphaengsaen') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_KAMPHAENGSAEN)));
      showToast('✓ โหลดแม่แบบ กฟส.กำแพงแสน (ทุ่งบัว - ม.เกษตรศาสตร์) แล้ว');
    } else if (presetKey === 'samchuk') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_SAMCHUK_SCRAP)));
      showToast('✓ โหลดแม่แบบ กฟส.สามชุก (สะพานลอย ม.ราชมงคลสุวรรณภูมิ) แล้ว');
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
      approverDate: convertStr(prev.approverDate),
      stampCpKrDate: convertStr(prev.stampCpKrDate),
      contactPhone: convertStr(prev.contactPhone),
    }));
    showToast(nextState ? '✓ สลับเป็นเลขไทย (๑ ๒ ๓)' : '✓ สลับเป็นเลขอารบิก (1 2 3)');
  };

  // Add Item to Table
  const handleAddItem = (preset?: typeof POPULAR_SCRAP_ITEMS[0]) => {
    const newItem: DemolishScrapItem = {
      id: `scrap-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      materialCode: preset ? preset.materialCode : '1-00-001-0004',
      description: preset ? preset.description : 'เสาคอนกรีต คอร. ขนาด 12 เมตร',
      quantity: 1,
      unit: preset ? preset.unit : 'ต้น',
      actionMethod: preset ? preset.defaultAction : 'ตัดเป็นท่อน',
      remarks: preset ? preset.defaultAction : 'ตัดเป็นท่อน'
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    showToast(`✓ เพิ่มพัสดุ: ${newItem.description}`);
  };

  // Remove Item from Table
  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      showToast('⚠️ ต้องมีรายการพัสดุอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
    showToast('✓ ลบรายการพัสดุแล้ว');
  };

  // Update Item field
  const handleUpdateItem = (id: string, field: keyof DemolishScrapItem, val: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          if (field === 'actionMethod') {
            updated.remarks = val;
          }
          return updated;
        }
        return it;
      })
    }));
  };

  // Adjust item quantity with stepper
  const handleStepQuantity = (id: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === id) {
          const current = typeof it.quantity === 'number' ? it.quantity : parseInt(it.quantity as string, 10) || 1;
          const next = Math.max(1, current + delta);
          return { ...it, quantity: next };
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
      wbsNumber: proj.wbs,
      projectName: proj.name,
      subject: `ขอส่งคืนพัสดุรื้อถอน ประเภทเสา คอร., และเสาตอม่อ คอร. หักชำรุดและทุบทำลาย ${proj.name}`
    }));
    setShowWbsResults(false);
    showToast(`✓ เลือกโครงการ ${proj.wbs}`);
  };

  // Copy to Word
  const handleCopyWord = async () => {
    setCopiedItem('word');
    const success = await copyFormattedDemolishScrapWord(formData);
    if (success) {
      showToast('✓ คัดลอกตารางจัดรูปแบบแล้ว! วางลง Microsoft Word ได้ทันที');
    } else {
      showToast('⚠️ เบราว์เซอร์ไม่รองรับ HTML Clipboard');
    }
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Download .doc
  const handleDownloadDoc = () => {
    downloadDemolishScrapWordDocument(formData);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) แล้ว');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Navigation between sections in Big Modal
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
    <div className="demolish-container">
      <TopBar title="โปรแกรมขอส่งคืนพัสดุรื้อถอนแบบทำลาย" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
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
      <div className="demolish-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="demolish-header-title">
            <div className="demolish-icon-badge">
              <Trash2 size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                โปรแกรมขอส่งคืนพัสดุรื้อถอนแบบทำลาย
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
              onClick={() => handleSelectPreset('kamphaengsaen')}
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
          onClick={() => handleSelectPreset('kamphaengsaen')}
          className={`preset-card ${activePreset === 'kamphaengsaen' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', background: 'rgba(234, 88, 12, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              ตัวอย่างตามเอกสารจริง (PDF 4 หน้า)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>กำแพงแสน</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            ทางรถไฟทุ่งบัว ถึง ม.เกษตรศาสตร์
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>P-TDD02.3-I-KPNIA.0027</span> • 6 รายการเสาและตอม่อ
          </div>
        </div>

        <div
          onClick={() => handleSelectPreset('samchuk')}
          className={`preset-card ${activePreset === 'samchuk' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบโครงการที่ 2
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>สามชุก</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            สะพานลอย ม.ราชมงคลสุวรรณภูมิ
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            WBS: <span style={{ color: '#38bdf8' }}>I-69-I-SMG69.M4.1116</span> • เสา 22 ม., 14 ม. และตอม่อ Footing
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(234, 88, 12, 0.15)')}
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
            <Sparkles size={16} className="text-orange-400" />
            <span>จิ้มส่วนที่ต้องการแก้ไข (จะเปิดหน้าต่างขยายใหญ่ให้แก้ไขชัดเจนสบายตา):</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            (หรือคลิกปุ่มลัดด้านล่างเพื่อเปิดหน้าต่างขยายใหญ่ตามหัวข้อ)
          </span>
        </div>

        {/* Shortcut Section Pills */}
        <div className="chip-group">
          {SECTIONS_META.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <button
                key={idx}
                className="chip-btn"
                onClick={() => setActiveEditSection(sec.key)}
                style={{
                  background: activeEditSection === sec.key ? 'rgba(234, 88, 12, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: activeEditSection === sec.key ? '#ea580c' : 'rgba(255, 255, 255, 0.15)',
                  color: activeEditSection === sec.key ? '#fb923c' : '#f1f5f9',
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
          {/* Watermark / Badge Guide on top of A4 (Screen only) */}
          <div className="no-print" style={{
            position: 'absolute',
            top: '8mm',
            right: '12mm',
            background: 'rgba(234, 88, 12, 0.12)',
            border: '1.5px dashed #ea580c',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '11pt',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.15)'
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
                      placeholder="เช่น ก.3 กรย.(กร) 1638/2569"
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
                      placeholder="เช่น อก.รย.(ก3) ผ่าน รก.รย.(ก3)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: PARAGRAPH 1 (PROJECT & WBS INFO) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para1')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ ๑ ข้อมูลโครงการและหนังสืออ้างถึง"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค ๑ (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ด้วย </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '130px' }}
                value={formData.docFrom}
                onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                placeholder="ผกร.กรย.(ก3)"
              />
              <span> ได้ดำเนินการ</span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '420px' }}
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="ชื่อโครงการก่อสร้าง"
              />
              <span> ตามหนังสือเลขที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '190px' }}
                value={formData.refDocNo}
                onChange={(e) => setFormData({ ...formData, refDocNo: e.target.value })}
                placeholder="ก.3 กวว.(วร) 3058/2566"
              />
              <span> ลงวันที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '150px' }}
                value={formData.refDocDate}
                onChange={(e) => setFormData({ ...formData, refDocDate: e.target.value })}
                placeholder="13 ธันวาคม 2566"
              />
              <span> ตามหมายเลข (WBS) : </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '230px', fontWeight: 'bold', color: '#0369a1' }}
                value={formData.wbsNumber}
                onChange={(e) => setFormData({ ...formData, wbsNumber: e.target.value })}
                placeholder="P-TDD02.3-I-KPNIA.0027"
              />
              <span> ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และ อยู่ระหว่างการจัดทำเอกสารเพื่อปิด กส. นั้น</span>
            </div>
          </div>

          {/* SECTION 3: PARAGRAPH 2 (JUSTIFICATION REASON) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para2')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ ๒ สภาพหน้างานและเหตุผลขอส่งคืนแบบทำลาย"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค ๒ (ขยายใหญ่)
            </span>

            <div style={{ lineHeight: '1.4' }}>
              <div className="a4-text-indent" style={{ marginBottom: '4pt' }}>
                <span>ปัจจุบัน </span>
                <strong>{formData.docFrom || 'ผกร.กรย.(ก3)'}</strong>
                <span> ได้ตรวจสอบพบว่า มีความจำเป็นต้องขอส่งคืนพัสดุรื้อถอนแบบทำลายเนื่องจากสภาพปัญหาหน้างาน ดังนี้</span>
              </div>

              <textarea
                rows={4}
                className="a4-live-textarea"
                value={formData.justificationReason}
                onChange={(e) => setFormData({ ...formData, justificationReason: e.target.value })}
                placeholder="ระบุสภาพหน้างานและเหตุผลที่ต้องตัดเสาเป็นท่อนหรือทุบทำลาย..."
              />

              <div style={{ textAlign: 'right', marginTop: '2pt', fontSize: '15pt' }}>
                <span>ตามรายละเอียดดังนี้</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: TABLE OF SCRAP MATERIALS */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('table')}
            style={{ margin: '8pt 0', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ตารางรายการพัสดุรื้อถอน (จัดการเสาและตอม่อ)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขตารางพัสดุ (ขยายใหญ่)
            </span>

            <table className="a4-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '7%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '26%', textAlign: 'center' }}>รหัสพัสดุ</th>
                  <th style={{ width: '38%', textAlign: 'center' }}>รายการพัสดุ</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>จำนวน</th>
                  <th style={{ width: '7%', textAlign: 'center' }}>หน่วย</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>วิธีการจัดการ</th>
                  <th className="no-print" style={{ width: '5%', textAlign: 'center' }}>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {tn(idx + 1)}
                    </td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}
                        value={item.materialCode}
                        onChange={(e) => handleUpdateItem(item.id, 'materialCode', e.target.value)}
                        placeholder="1-00-xxx-xxxx"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="ระบุชื่อพัสดุรื้อถอน"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                        placeholder="1"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        style={{ textAlign: 'center' }}
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                        placeholder="ต้น"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select
                        className="a4-table-select"
                        value={item.actionMethod}
                        onChange={(e) => handleUpdateItem(item.id, 'actionMethod', e.target.value)}
                      >
                        <option value="ตัดเป็นท่อน">ตัดเป็นท่อน</option>
                        <option value="ทุบทำลาย">ทุบทำลาย</option>
                        <option value="ส่งคืนคลังสภาพปกติ">ส่งคืนคลังสภาพปกติ</option>
                      </select>
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="row-del-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        title="ลบแถวนี้"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px dashed #ea580c',
                  color: '#c2410c',
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
                <span>+ จัดการและเพิ่มรายการพัสดุ (ขยายใหญ่)</span>
              </button>
            </div>
          </div>

          {/* Concluding Paragraph */}
          <p className="a4-text-indent" style={{ marginTop: '6pt' }}>
            จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติและแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
          </p>

          {/* SECTION 5: PROPOSER BLOCK (ผู้จัดทำ/ผู้เสนอ หผ.กร.) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('proposer')}
            style={{ marginTop: '14pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ผู้เสนอลงนาม (หผ.กร.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขผู้เสนอ (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center' }}>
              <div style={{ width: '250pt' }}>
                <div style={{ height: '24pt' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span>(</span>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', fontWeight: 'bold', width: '200pt' }}
                    value={formData.proposerName}
                    onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                    placeholder="ชื่อผู้เสนอ"
                  />
                  <span>)</span>
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '220pt' }}
                    value={formData.proposerPosition}
                    onChange={(e) => setFormData({ ...formData, proposerPosition: e.target.value })}
                    placeholder="ตำแหน่ง เช่น หผ.กร.กรย.(ก3)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: APPROVER ORDER SECTION (คำสั่งการอนุมัติของ อก.รย.) */}
          <div
            className="a4-section-hoverable a4-approval-box"
            onClick={() => setActiveEditSection('approval')}
            title="จิ้มเพื่อขยายแก้ไข: คำสั่งการอนุมัติ (อก.รย. / รก.รย.)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขคำสั่งอนุมัติ (ขยายใหญ่)
            </span>

            <div style={{ fontSize: '15pt', marginBottom: '4pt', fontWeight: 'bold', color: '#475569' }} className="no-print">
              ข้อความคำสั่งการอนุมัติ (อก.รย.):
            </div>
            <textarea
              rows={2}
              className="a4-live-textarea"
              style={{ fontSize: '15pt' }}
              value={formData.approverOrderNote}
              onChange={(e) => setFormData({ ...formData, approverOrderNote: e.target.value })}
              placeholder="เรียน ผจก.กฟจ.นฐ. ผจก.กฟส.กพส. อนุมัติ และแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'center', marginTop: '10pt' }}>
              <div style={{ width: '270pt' }}>
                <div style={{ height: '20pt' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span>(</span>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', fontWeight: 'bold', width: '220pt' }}
                    value={formData.approverName}
                    onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                    placeholder="ชื่อผู้อนุมัติ"
                  />
                  <span>)</span>
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '250pt' }}
                    value={formData.approverPosition}
                    onChange={(e) => setFormData({ ...formData, approverPosition: e.target.value })}
                    placeholder="ตำแหน่ง เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                  />
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    style={{ textAlign: 'center', width: '140pt' }}
                    value={formData.approverDate}
                    onChange={(e) => setFormData({ ...formData, approverDate: e.target.value })}
                    placeholder="เช่น 8 ต.ค. 69"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: FOOTER CONTACT & DEPARTMENT & STAMP */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('footer')}
            style={{ marginTop: '18pt', padding: '4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ท้ายกระดาษและหมายเลขติดต่อ"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขท้ายกระดาษ (ขยายใหญ่)
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13pt' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  className="a4-live-input"
                  style={{ fontSize: '13pt', width: '90%' }}
                  value={formData.contactDepartment}
                  onChange={(e) => setFormData({ ...formData, contactDepartment: e.target.value })}
                  placeholder="แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2pt' }}>
                  <span>โทรศัพท์</span>
                  <input
                    type="text"
                    className="a4-inline-input"
                    style={{ fontSize: '13pt', width: '80px' }}
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="10171"
                  />
                </div>
              </div>

              {formData.hasRoutingStamps && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <span>ชผ.กร.(ก3) ลงชื่อ ................... วันที่</span>
                  <input
                    type="text"
                    className="a4-inline-input"
                    style={{ fontSize: '13pt', width: '90px' }}
                    value={formData.stampCpKrDate}
                    onChange={(e) => setFormData({ ...formData, stampCpKrDate: e.target.value })}
                    placeholder="8 ต.ค. 69"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BIG SECTION POP-OUT EDITOR MODAL (จิ้มแล้วขยายใหญ่แก้ไขง่าย) */}
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
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(234, 88, 12, 0.35)'
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
                    background: activeEditSection === sec.key ? '#ea580c' : 'rgba(255,255,255,0.06)',
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
                        <span>เลขที่หนังสือบันทึกข้อความ</span>
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร) 1638/2569</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="ก.3 กรย.(กร) 1638/2569"
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
                        placeholder="เช่น 8 ต.ค. 2569"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรื่อง (ชื่อเรื่องการขอส่งคืนพัสดุรื้อถอน)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขอส่งคืนพัสดุรื้อถอน ประเภทเสา คอร., และเสาตอม่อ คอร. หักชำรุดและทุบทำลาย..."
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

              {/* SECTION 2: PARAGRAPH 1 (WBS & PROJECT) */}
              {activeEditSection === 'para1' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อโครงการก่อสร้าง</span>
                      <span className="big-label-hint">ระบุชื่อสายทางหรือช่วงงาน</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="เช่น ปรับปรุงระบบจำหน่าย 22 เควี ช่วงทางรถไฟทุ่งบัว ถึง ม.เกษตรศาสตร์..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>หนังสือเลขที่เดิม (ที่อ้างถึง)</span>
                        <span className="big-label-hint">เช่น ก.3 กวว.(วร) 3058/2566</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.refDocNo}
                        onChange={(e) => setFormData({ ...formData, refDocNo: e.target.value })}
                        placeholder="ก.3 กวว.(วร) 3058/2566"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ลงวันที่เดิม</span>
                        <span className="big-label-hint">เช่น 13 ธันวาคม 2566</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.refDocDate}
                        onChange={(e) => setFormData({ ...formData, refDocDate: e.target.value })}
                        placeholder="13 ธันวาคม 2566"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>หมายเลขงาน (WBS Number)</span>
                      <span className="big-label-hint">เช่น P-TDD02.3-I-KPNIA.0027</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}
                      value={formData.wbsNumber}
                      onChange={(e) => setFormData({ ...formData, wbsNumber: e.target.value })}
                      placeholder="P-TDD02.3-I-KPNIA.0027"
                    />
                  </div>

                  {/* Sentence Preview Card */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '0.9375rem',
                    color: '#cbd5e1',
                    lineHeight: 1.6
                  }}>
                    <strong style={{ color: '#fed7aa' }}>ตัวอย่างประโยควรรคที่ ๑ บนกระดาษ A4:</strong>
                    <div style={{ marginTop: '0.375rem' }}>
                      ด้วย {formData.docFrom || '...'} ได้ดำเนินการ{formData.projectName || '...'} ตามหนังสือเลขที่ {formData.refDocNo || '...'} ลงวันที่ {formData.refDocDate || '...'} ตามหมายเลข (WBS) : {formData.wbsNumber || '...'} ซึ่งปัจจุบันได้ดำเนินการก่อสร้างแล้วเสร็จ และ อยู่ระหว่างการจัดทำเอกสารเพื่อปิด กส. นั้น
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: PARAGRAPH 2 (JUSTIFICATION REASON) */}
              {activeEditSection === 'para2' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>สภาพหน้างานและเหตุผลขอส่งคืนแบบทำลาย</span>
                      <span className="big-label-hint">อธิบายสภาพปัญหาและเหตุผล</span>
                    </label>
                    <textarea
                      rows={6}
                      className="big-textarea"
                      style={{ fontSize: '1.1875rem' }}
                      value={formData.justificationReason}
                      onChange={(e) => setFormData({ ...formData, justificationReason: e.target.value })}
                      placeholder="จากสภาพหน้างานมีระยะห่างจากถนนประมาณ 18 เมตร และระบบสื่อสารเป็นจำนวนมาก..."
                    />
                  </div>

                  {/* Preset Quick Clauses */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fed7aa', marginBottom: '0.5rem' }}>
                      💡 คลิกข้อความมาตรฐานเพื่อเติมเข้าข้อความด้านบน:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const clause = 'จากสภาพหน้างานมีระยะห่างจากถนนประมาณ 18 เมตร และระบบสื่อสารเป็นจำนวนมาก จึงไม่สามารถดำเนินการรื้อถอน เสา คอร. ขนาด 14.30 เมตร, เสา คอร. ขนาด 14 เมตร, เสา คอร. ขนาด 12 เมตร ได้เต็มต้น จำเป็นต้องตัดเป็นท่อน ท่อนละ 5-8 เมตร ส่งคืนคลังพัสดุ กฟจ.นครปฐม เสาตอม่อ คอร. เป็นการรื้อถอนแบบวิธีทุบทำลาย ไม่สามารถนำพัสดุส่งคืนคลังพัสดุได้ เพื่อให้สามารถปิดงานก่อสร้างได้ตามกำหนด กรย.(ก3) จึงขอนำส่งคืนพัสดุรื้อถอน (ส่งคืนชำรุด)';
                          setFormData({ ...formData, justificationReason: clause });
                          showToast('✓ ใส่ข้อความตัวอย่างกำแพงแสนแล้ว');
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '0.5rem',
                          textAlign: 'left',
                          color: '#cbd5e1',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          lineHeight: 1.5
                        }}
                      >
                        📌 <strong>กรณีระยะห่างถนน & สายสื่อสาร:</strong> ตัดเป็นท่อนส่งคืนคลัง และทุบทำลายตอม่อเสา
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const clause = 'เนื่องจากพื้นที่ก่อสร้างติดแนวสะพานลอยคนข้ามและแนวอาคารพาณิชย์ ไม่สามารถนำเครื่องจักรกลหนักเข้าทำการถอนเสาได้ จำเป็นต้องใช้วิธีตัดเป็นท่อนเพื่อความปลอดภัยของประชาชนและผู้ใช้ทาง สำหรับตอม่อ คอร. ต้องใช้วิธีสกัดทุบทำลายใต้ระดับผิวดิน ไม่สามารถนำส่งคืนคลังได้';
                          setFormData({ ...formData, justificationReason: clause });
                          showToast('✓ ใส่ข้อความตัวอย่างสามชุกแล้ว');
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '0.5rem',
                          textAlign: 'left',
                          color: '#cbd5e1',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                          lineHeight: 1.5
                        }}
                      >
                        📌 <strong>กรณีติดแนวสะพานลอย/อาคาร:</strong> ตัดท่อนเพื่อความปลอดภัย และสกัดทุบทำลายตอม่อ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: TABLE OF SCRAP MATERIALS */}
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
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      <Plus size={14} />
                      <span>+ เพิ่มรายการใหม่</span>
                    </button>
                  </div>

                  {/* Scrap Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {formData.items.map((it, idx) => (
                      <div key={it.id} className="big-table-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '1rem' }}>
                            ลำดับที่ {idx + 1}
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
                              placeholder="1-00-xxx-xxxx"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ชื่อรายการพัสดุ</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem' }}
                              value={it.description}
                              onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                              placeholder="เช่น เสาคอนกรีต คอร. ขนาด 14 เมตร"
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.5fr', gap: '0.75rem' }}>
                          {/* Stepper Quantity */}
                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>จำนวน</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                className="stepper-btn"
                                onClick={() => handleStepQuantity(it.id, -1)}
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                className="big-input"
                                style={{ padding: '0.5rem', textAlign: 'center', fontSize: '1.125rem', fontWeight: 700 }}
                                value={it.quantity}
                                onChange={(e) => handleUpdateItem(it.id, 'quantity', e.target.value)}
                              />
                              <button
                                type="button"
                                className="stepper-btn"
                                onClick={() => handleStepQuantity(it.id, 1)}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>หน่วย</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', textAlign: 'center' }}
                              value={it.unit}
                              onChange={(e) => handleUpdateItem(it.id, 'unit', e.target.value)}
                              placeholder="ต้น"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>วิธีการจัดการ</label>
                            <select
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', cursor: 'pointer' }}
                              value={it.actionMethod}
                              onChange={(e) => handleUpdateItem(it.id, 'actionMethod', e.target.value)}
                            >
                              <option value="ตัดเป็นท่อน">ตัดเป็นท่อน</option>
                              <option value="ทุบทำลาย">ทุบทำลาย</option>
                              <option value="ส่งคืนคลังสภาพปกติ">ส่งคืนคลังสภาพปกติ</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Popular items chips to add */}
                  <div style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fb923c', marginBottom: '0.5rem' }}>
                      + คลิกเพิ่มพัสดุยอดนิยมเข้าตารางทันที:
                    </div>
                    <div className="chip-group">
                      {POPULAR_SCRAP_ITEMS.map((pi, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="chip-btn"
                          onClick={() => handleAddItem(pi)}
                          title={`เพิ่ม: ${pi.description}`}
                        >
                          <Plus size={12} />
                          <span>{pi.description} ({pi.defaultAction})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: PROPOSER */}
              {activeEditSection === 'proposer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อ-นามสกุล ผู้เสนอลงนาม (หผ.กร.)</span>
                      <span className="big-label-hint">หัวหน้าแผนกก่อสร้างระบบไฟฟ้า</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerName}
                      onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                      placeholder="เช่น นายพิสันติ์ จิตต์ปลื้ม"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ตำแหน่งผู้เสนอ</span>
                      <span className="big-label-hint">เช่น หผ.กร.กรย.(ก3)</span>
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

              {/* SECTION 6: APPROVAL ORDER */}
              {activeEditSection === 'approval' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ข้อความคำสั่งการอนุมัติ (อก.รย.)</span>
                      <span className="big-label-hint">คำสั่งการอนุมัติและแจ้งส่วนเกี่ยวข้อง</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.approverOrderNote}
                      onChange={(e) => setFormData({ ...formData, approverOrderNote: e.target.value })}
                      placeholder="เรียน ผจก.กฟจ.นฐ. ผจก.กฟส.กพส. อนุมัติ และแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อ-นามสกุล ผู้อนุมัติ</span>
                        <span className="big-label-hint">เช่น นายอนันต์ กาญจนอุปถัมภ์</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverName}
                        onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                        placeholder="นายอนันต์ กาญจนอุปถัมภ์"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่อนุมัติ</span>
                        <span className="big-label-hint">เช่น 8 ต.ค. 69</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverDate}
                        onChange={(e) => setFormData({ ...formData, approverDate: e.target.value })}
                        placeholder="8 ต.ค. 69"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ตำแหน่งผู้อนุมัติ</span>
                      <span className="big-label-hint">เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.approverPosition}
                      onChange={(e) => setFormData({ ...formData, approverPosition: e.target.value })}
                      placeholder="รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 7: FOOTER & CONTACT */}
              {activeEditSection === 'footer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>แผนกเจ้าของเรื่อง (มุมซ้ายล่าง)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.contactDepartment}
                      onChange={(e) => setFormData({ ...formData, contactDepartment: e.target.value })}
                      placeholder="แผนกก่อสร้างระบบไฟฟ้า กองก่อสร้างระบบไฟฟ้าและงานโยธา กฟก.3"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เบอร์โทรศัพท์ติดต่อ</span>
                        <span className="big-label-hint">เช่น 10171</span>
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
                        <span>วันที่เกษียน ชผ.กร.(ก3) (มุมขวาล่าง)</span>
                        <span className="big-label-hint">เช่น 8 ต.ค. 69</span>
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
                <FileText size={20} className="text-orange-400" />
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
              {generateDemolishScrapPlainText(formData)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  const text = generateDemolishScrapPlainText(formData);
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
