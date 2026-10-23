"use client";

import React, { useState, useEffect } from 'react';
import {
  Building,
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
  Info,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Share2
} from 'lucide-react';
import './concrete-transfer.css';
import {
  ConcreteTransferFormData,
  ConcreteProductItem,
  SAMPLE_CONCRETE_TRANSFER_1,
  SAMPLE_CONCRETE_TRANSFER_2,
  SAMPLE_CONCRETE_TRANSFER_3,
  POPULAR_CONCRETE_PRODUCTS,
  CONCRETE_PLANTS,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  generateConcreteTransferMemoPlainText,
  generateConcreteTransferWordDocument
} from './concreteTransferUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'para1' | 'table' | 'para2' | 'signer' | 'inform' | 'stamps' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'para1', title: '2. วรรคที่ 1: แหล่งผลิต & งานโครงการ WBS', shortName: 'วรรค 1 (โครงการ)', icon: Building },
  { key: 'table', title: '3. ตารางผลิตภัณฑ์คอนกรีตที่ขอโอน', shortName: 'ตารางคอนกรีต', icon: Package },
  { key: 'para2', title: '4. วรรคที่ 2: ผู้ประสานงานขนย้าย', shortName: 'ผู้ประสานงาน', icon: UserCheck },
  { key: 'signer', title: '5. ผู้ลงนามหลัก (อก.รย. / รก.รย.)', shortName: 'ผู้ลงนาม', icon: CheckCircle2 },
  { key: 'inform', title: '6. ส่วนส่งต่อเพื่อโปรดทราบ (แจ้งพื้นที่)', shortName: 'ส่งต่อเพื่อทราบ', icon: Share2 },
  { key: 'stamps', title: '7. เกษียนหนังสือ (หผ.กร. / ชผ.กร.)', shortName: 'เกษียนหนังสือ', icon: Info },
];

export default function ConcreteTransferPage() {
  const [formData, setFormData] = useState<ConcreteTransferFormData>(SAMPLE_CONCRETE_TRANSFER_1);
  const [activePreset, setActivePreset] = useState<'preset1' | 'preset2' | 'preset3' | 'custom'>('preset1');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [isThaiNumerals, setIsThaiNumerals] = useState<boolean>(false);

  // WBS Search state
  const [searchWbsQuery, setSearchWbsQuery] = useState<string>('');
  const [isSearchingWbs, setIsSearchingWbs] = useState<boolean>(false);
  const [wbsSearchResults, setWbsSearchResults] = useState<Array<{ wbs: string; name: string }>>([]);
  const [showWbsResults, setShowWbsResults] = useState<boolean>(false);

  // Autosave load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_concrete_transfer_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          if (!parsed.docNo || parsed.docNo.includes('2238') || parsed.docNo.includes('2421') || parsed.docNo.includes('2569') || parsed.docNo.includes('คชย') || parsed.docNo.includes('(กร.)') || parsed.docNo.includes('-')) {
            parsed.docNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.docDate && (parsed.docDate.includes('5 ต.ค.') || parsed.docDate.includes('14 ต.ค.') || parsed.docDate.includes('ต.ค.') || parsed.docDate.includes('2569') || parsed.docDate.includes('๒๕๖๙'))) {
            parsed.docDate = '';
          }
          if (parsed.informDocNo && (parsed.informDocNo.includes('2238') || parsed.informDocNo.includes('2421') || parsed.informDocNo.includes('2569') || parsed.informDocNo.includes('(กร.)'))) {
            parsed.informDocNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.signerDate && (parsed.signerDate.includes('ต.ค.') || parsed.signerDate.includes('69') || parsed.signerDate.includes('2569'))) {
            parsed.signerDate = '';
          }
          if (parsed.informDate && (parsed.informDate.includes('ต.ค.') || parsed.informDate.includes('69') || parsed.informDate.includes('2569'))) {
            parsed.informDate = '';
          }
          if (parsed.stampHpKrDate && (parsed.stampHpKrDate.includes('ต.ค.') || parsed.stampHpKrDate.includes('69') || parsed.stampHpKrDate.includes('2569'))) {
            parsed.stampHpKrDate = '';
          }
          if (parsed.stampCpKrDate && (parsed.stampCpKrDate.includes('ต.ค.') || parsed.stampCpKrDate.includes('69') || parsed.stampCpKrDate.includes('2569'))) {
            parsed.stampCpKrDate = '';
          }
          setFormData(parsed);
          setActivePreset('custom');
        }
      }
    } catch (e) {
      console.warn('Could not load cached form data', e);
    }
  }, []);

  // Autosave persist
  useEffect(() => {
    try {
      localStorage.setItem('pea_concrete_transfer_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick select ผรค. for subject and source units
  const handleSelectSourceUnit = (unit: string) => {
    setFormData((prev) => ({
      ...prev,
      sourceUnits: unit,
      subject: `ขอโอนผลิตภัณฑ์คอนกรีต จาก ${unit} มาใช้งานพื้นที่ กฟก.3`,
      objectivePurpose: prev.objectivePurpose ? prev.objectivePurpose.replace(/จาก\s+ผรค\.[^\s]+/g, `จาก ${unit}`) : `ซึ่งมีความต้องการผลิตภัณฑ์คอนกรีต เพื่อใช้ในภารกิจ จึงมีความจำเป็นต้องขอโอนจาก ${unit} ดังรายการต่อไปนี้`
    }));
    showToast(`✓ เลือก ${unit} สำหรับเรื่องและแหล่งผลิตแล้ว`);
  };

  // Preset switch
  const handleSelectPreset = (presetKey: 'preset1' | 'preset2' | 'preset3') => {
    setActivePreset(presetKey);
    if (presetKey === 'preset1') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_CONCRETE_TRANSFER_1)));
      showToast('✓ โหลดแม่แบบที่ 1 (เสา 22 ม. สมุทรสาคร) แล้ว');
    } else if (presetKey === 'preset2') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_CONCRETE_TRANSFER_2)));
      showToast('✓ โหลดแม่แบบที่ 2 (เสา 14.30 ม. ท่าม่วง) แล้ว');
    } else if (presetKey === 'preset3') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_CONCRETE_TRANSFER_3)));
      showToast('✓ โหลดแม่แบบที่ 3 (เสา 12 ม. อู่ทอง) แล้ว');
    }
  };

  // Toggle Thai numerals
  const handleToggleThaiNumerals = () => {
    const nextState = !isThaiNumerals;
    setIsThaiNumerals(nextState);
    const convertStr = (val: string) => nextState ? toThaiNumerals(val) : toArabicNumerals(val);

    setFormData(prev => ({
      ...prev,
      docNo: convertStr(prev.docNo),
      docDate: convertStr(prev.docDate),
      signerDate: convertStr(prev.signerDate),
      informDocNo: convertStr(prev.informDocNo),
      informDate: convertStr(prev.informDate),
      stampHpKrDate: convertStr(prev.stampHpKrDate),
      stampCpKrDate: convertStr(prev.stampCpKrDate),
      contactPhone: convertStr(prev.contactPhone),
    }));
    showToast(nextState ? '✓ สลับเป็นเลขไทย (๑ ๒ ๓)' : '✓ สลับเป็นเลขอารบิก (1 2 3)');
  };

  // Add Item to Table
  const handleAddItem = (preset?: typeof POPULAR_CONCRETE_PRODUCTS[0]) => {
    const newItem: ConcreteProductItem = {
      id: `item-${Date.now()}`,
      materialCode: preset ? preset.code : '1-00-001-0016',
      description: preset ? preset.name : 'POLE 22 M WITH GROUND PLATE 2 SIDES',
      quantity: 1,
      remarks: 'พร้อมติดตั้ง'
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    showToast(`✓ เพิ่มพัสดุ: ${newItem.description}`);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (formData.items.length <= 1) {
      showToast('⚠️ ต้องมีรายการผลิตภัณฑ์อย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
    showToast('✓ ลบรายการแล้ว');
  };

  // Update Item field
  const handleUpdateItem = (id: string, field: keyof ConcreteProductItem, val: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === id ? { ...it, [field]: val } : it)
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
      planDescription: `กฟก.3 มีแผนงานก่อสร้าง ${proj.name}`,
      subject: `ขอโอนผลิตภัณฑ์คอนกรีต เพื่อใช้ในงาน ${proj.name}`
    }));
    setShowWbsResults(false);
    showToast(`✓ เลือกโครงการ ${proj.wbs}`);
  };

  // Copy to Word
  const handleCopyWord = async () => {
    setCopiedItem('word');
    try {
      const html = generateConcreteTransferWordDocument(formData);
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
    const html = generateConcreteTransferWordDocument(formData);
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `บันทึกขอโอนคอนกรีต_${formData.wbsNo || 'PEA'}.doc`;
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

  const isThai = isThaiNumerals;
  const tn = (val: string | number | undefined | null) => isThai ? toThaiNumerals(val) : (val?.toString() || '');

  return (
    <div className="concrete-container">
      <TopBar title="โปรแกรมขอโอนคอนกรีตจาก กผภ. (ผรค.รบ./กจ.)" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
      {/* Main Header (Screen only) */}
      <div className="concrete-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="concrete-header-title">
            <div className="concrete-icon-badge">
              <Building size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  โปรแกรมขอโอนคอนกรีตจาก กผภ.
                </h1>
                <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '2px 9px', borderRadius: '6px', fontWeight: 600 }}>
                  ผรค.กจ. / ผรค.รบ. / ผรค.อย.
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                ✏️ <strong>หน้าร่างเอกสาร A4 เสมือนจริง:</strong> จิ้มแตะส่วนที่ต้องการบนแผ่นกระดาษเพื่อ <strong>&ldquo;ขยายใหญ่แก้ไขชัดเจน&rdquo;</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Toggle Thai Numerals */}
            <button
              onClick={handleToggleThaiNumerals}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              title="สลับการแสดงผลตัวเลขอารบิก / เลขไทย"
            >
              <Sparkles size={16} className={isThaiNumerals ? 'text-amber-400' : 'text-gray-400'} />
              <span>{isThaiNumerals ? 'ใช้เลขอารบิก (1 2 3)' : 'แปลงเป็นเลขไทย (๑ ๒ ๓)'}</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => handleSelectPreset('preset1')}
              className="btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              title="รีเซ็ตกลับไปเป็นค่าเริ่มต้น"
            >
              <RotateCcw size={16} />
              <span>รีเซ็ตแม่แบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Cards (Screen only) */}
      <div className="preset-grid no-print">
        {/* Preset 1 */}
        <div
          onClick={() => handleSelectPreset('preset1')}
          className={`preset-card ${activePreset === 'preset1' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              แม่แบบที่ 1 (งานจริง)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 500 }}>📍 สมุทรสาคร</span>
              {activePreset === 'preset1' && (
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, background: 'rgba(14, 165, 233, 0.25)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
                  ✓ กำลังใช้งาน
                </span>
              )}
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.35 }}>
            เสา 22 ม. คลองท่าแร้ง (ผรค.กจ., รบ.)
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>I-69-I-SM269.M4.1105</span>
            <span>•</span>
            <span style={{ color: '#cbd5e1' }}>เสา 22 ม. 10 ต้น + เสาเข็ม T1-T4</span>
          </div>
        </div>

        {/* Preset 2 */}
        <div
          onClick={() => handleSelectPreset('preset2')}
          className={`preset-card ${activePreset === 'preset2' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              แม่แบบที่ 2 (สายส่ง 115 kV)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 500 }}>📍 กาญจนบุรี</span>
              {activePreset === 'preset2' && (
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, background: 'rgba(14, 165, 233, 0.25)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
                  ✓ กำลังใช้งาน
                </span>
              )}
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.35 }}>
            เสา 14.30 ม. ท่าม่วง (ผรค.กจ.)
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>I-69-I-TMG69.M4.1018</span>
            <span>•</span>
            <span style={{ color: '#cbd5e1' }}>เสา 14.30 ม. 25 ต้น (สายส่ง 115 เควี)</span>
          </div>
        </div>

        {/* Preset 3 */}
        <div
          onClick={() => handleSelectPreset('preset3')}
          className={`preset-card ${activePreset === 'preset3' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              แม่แบบที่ 3 (ตอม่อ/ฐานราก)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 500 }}>📍 สุพรรณบุรี</span>
              {activePreset === 'preset3' && (
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, background: 'rgba(14, 165, 233, 0.25)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
                  ✓ กำลังใช้งาน
                </span>
              )}
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', lineHeight: 1.35 }}>
            เสา 12 ม. และตอม่อ อู่ทอง (ผรค.รบ.)
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>I-69-I-UTH69.M4.1045</span>
            <span>•</span>
            <span style={{ color: '#cbd5e1' }}>ตอม่อ CONC. FOOTING 8 ชุด</span>
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)')}
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
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
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
      <div className="chips-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#fef08a' }}>
            <Sparkles size={17} className="text-amber-400" />
            <span>แถบแก้ไขด่วน (จิ้มเปิดหน้าต่างขยายใหญ่ตามหัวข้อ หรือแตะที่กระดาษ A4 ได้โดยตรง):</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            7 หมวดหมู่ข้อมูล
          </span>
        </div>

        <div className="chip-group">
          {SECTIONS_META.map((sec, idx) => {
            const Icon = sec.icon;
            const isActive = activeEditSection === sec.key;
            return (
              <button
                key={idx}
                type="button"
                className={`chip-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveEditSection(sec.key)}
              >
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: isActive ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  color: isActive ? '#ffffff' : '#93c5fd'
                }}>
                  {idx + 1}
                </span>
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
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1.5px dashed #3b82f6',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '11pt',
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
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
                      placeholder="เช่น กผภ."
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
                  <td style={{ fontWeight: 'bold', verticalAlign: 'top', paddingTop: '6pt' }}>เรื่อง</td>
                  <td colSpan={3}>
                    {/* Quick ผรค. Chips Selector */}
                    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>เลือก ผรค.:</span>
                      {CONCRETE_PLANTS.map((plant) => {
                        const isSelected = formData.subject.includes(plant.name) || formData.sourceUnits === plant.name;
                        return (
                          <button
                            key={plant.id}
                            type="button"
                            onClick={() => handleSelectSourceUnit(plant.name)}
                            style={{
                              fontSize: '11px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: isSelected ? '1px solid #dc2626' : '1px solid #cbd5e1',
                              background: isSelected ? '#fee2e2' : '#f8fafc',
                              color: isSelected ? '#b91c1c' : '#475569',
                              fontWeight: isSelected ? 'bold' : 'normal',
                              cursor: 'pointer'
                            }}
                            title={`คลิกเพื่อตั้งชื่อเรื่องเป็น: ขอโอนผลิตภัณฑ์คอนกรีต จาก ${plant.name} มาใช้งานพื้นที่ กฟก.3`}
                          >
                            {plant.name}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      rows={2}
                      className="a4-live-textarea"
                      style={{ fontWeight: 'bold' }}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขอโอนผลิตภัณฑ์คอนกรีต จาก ผรค. มาใช้งานพื้นที่ กฟก.3"
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
                      placeholder="เช่น อก.ผภ."
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: PARAGRAPH 1 (SOURCE UNITS & WBS) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para1')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 1 แหล่งผลิต & งานโครงการ WBS"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 1 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ตามที่ </span>
              <strong>{formData.docFrom || 'กรย.(ก3)'}</strong>
              <span> มีความประสงค์ขอโอนผลิตภัณฑ์คอนกรีต จาก </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '130px', fontWeight: 'bold' }}
                value={formData.sourceUnits}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    sourceUnits: val,
                    subject: `ขอโอนผลิตภัณฑ์คอนกรีต จาก ${val || 'ผรค.'} มาใช้งานพื้นที่ กฟก.3`
                  });
                }}
                placeholder="ผรค.กจ."
              />
              <span> เนื่องจาก </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '420px', marginTop: '2pt' }}
                value={formData.planDescription}
                onChange={(e) => setFormData({ ...formData, planDescription: e.target.value })}
                placeholder="กฟก.3 มีแผนงานก่อสร้างย้ายแนว 115 เควี คลองท่าแร้ง..."
              />
              <span> ตามหมายเลขงาน (WBS) : </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '230px', fontWeight: 'bold', color: '#dc2626' }}
                value={formData.wbsNo}
                onChange={(e) => setFormData({ ...formData, wbsNo: e.target.value })}
                placeholder="I-69-I-SM269.M4.1105"
              />
              <span> เพื่อใช้ในภารกิจงาน</span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '240px', marginTop: '2pt' }}
                value={formData.objectivePurpose}
                onChange={(e) => setFormData({ ...formData, objectivePurpose: e.target.value })}
                placeholder="งานย้ายแนวระบบจำหน่าย..."
              />
              <span> ตามรายละเอียดดังนี้</span>
            </div>
          </div>

          {/* SECTION 3: CONCRETE PRODUCTS TABLE */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('table')}
            style={{ margin: '8pt 0', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ตารางผลิตภัณฑ์คอนกรีตที่ขอโอน"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขตารางคอนกรีต (ขยายใหญ่)
            </span>

            <table className="a4-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '28%', textAlign: 'center' }}>รหัสพัสดุ</th>
                  <th style={{ width: '42%', textAlign: 'center' }}>รายการพัสดุ</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>จำนวน</th>
                  <th className="no-print" style={{ width: '10%', textAlign: 'center' }}>ลบ</th>
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
                        placeholder="1-00-001-0016"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        value={it.description}
                        onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                        placeholder="POLE 22 M..."
                      />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      <input
                        type="text"
                        className="a4-table-input"
                        style={{ textAlign: 'center', fontWeight: 'bold' }}
                        value={it.quantity}
                        onChange={(e) => handleUpdateItem(it.id, 'quantity', e.target.value)}
                        placeholder="10"
                      />
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
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px dashed #3b82f6',
                  color: '#1d4ed8',
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
                <span>+ จัดการและเพิ่มผลิตภัณฑ์คอนกรีต (ขยายใหญ่)</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: PARAGRAPH 2 (COORDINATION) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para2')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 2 ผู้ประสานงานขนย้าย"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขผู้ประสานงาน (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ทั้งนี้ ในการขนย้ายเสาคอนกรีตดังกล่าว ได้มอบหมายให้ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '200px', fontWeight: 'bold' }}
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="นายชานินทร์ ศรีสวัสดิ์"
              />
              <span> ตำแหน่ง </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '180px' }}
                value={formData.contactPosition}
                onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
                placeholder="ชผ.กร.กรย.(ก3)"
              />
              <span> หมายเลขโทรศัพท์ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '130px' }}
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="099-1326977"
              />
              <span> เป็นผู้ประสานงานต่อไป</span>
            </div>

            <p className="a4-text-indent" style={{ marginTop: '8pt' }}>
              จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติโอนผลิตภัณฑ์คอนกรีตดังกล่าว และแจ้งส่วนเกี่ยวข้องดำเนินการต่อไป
            </p>
          </div>

          {/* SECTION 5: SIGNER BLOCK */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('signer')}
            style={{ marginTop: '16pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ผู้ลงนามหลัก (อก.รย. / รก.รย.)"
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
                    placeholder="นายอนันต์ กาญจนอุปถัมภ์"
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
                    placeholder="รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
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

          {/* SECTION 6: INFORM SECTION (ส่งต่อเพื่อทราบ) */}
          {formData.hasInformSection && (
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('inform')}
              style={{ marginTop: '14pt', padding: '4pt', borderTop: '1px solid #cbd5e1' }}
              title="จิ้มเพื่อขยายแก้ไข: ส่วนส่งต่อเพื่อโปรดทราบ (แจ้งพื้นที่)"
            >
              <span className="section-edit-badge no-print">
                <Edit3 size={11} /> จิ้มแก้ไขส่งต่อเพื่อทราบ (ขยายใหญ่)
              </span>

              <div style={{ fontSize: '14pt', lineHeight: 1.4 }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>ที่:</span>
                  <input
                    type="text"
                    className="a4-inline-input"
                    style={{ width: '250px' }}
                    value={formData.informDocNo}
                    onChange={(e) => setFormData({ ...formData, informDocNo: e.target.value })}
                    placeholder="ก.3 กรย.(กร.) 2238/2569"
                  />
                  <span style={{ fontWeight: 'bold' }}>วันที่:</span>
                  <input
                    type="text"
                    className="a4-inline-input"
                    style={{ width: '120px' }}
                    value={formData.informDate}
                    onChange={(e) => setFormData({ ...formData, informDate: e.target.value })}
                    placeholder=""
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2pt' }}>
                  <span style={{ fontWeight: 'bold' }}>เรียน:</span>
                  <input
                    type="text"
                    className="a4-inline-input"
                    style={{ width: '500px' }}
                    value={formData.informReceivers}
                    onChange={(e) => setFormData({ ...formData, informReceivers: e.target.value })}
                    placeholder="ผจก.กฟจ.สมุทรสาคร, ผจก.กฟส.สมุทรสาคร 2"
                  />
                </div>
                <div style={{ marginTop: '2pt' }}>
                  <input
                    type="text"
                    className="a4-live-input"
                    value={formData.informActionText}
                    onChange={(e) => setFormData({ ...formData, informActionText: e.target.value })}
                    placeholder="เพื่อโปรดทราบ และแจ้ง ผคพ. พร้อมส่วนเกี่ยวข้องต่อไป"
                  />
                </div>
              </div>
            </div>
          )}

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
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(59, 130, 246, 0.35)'
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
                    background: activeEditSection === sec.key ? '#3b82f6' : 'rgba(255,255,255,0.06)',
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
                        <span>ถึง (หน่วยงานผู้รับ)</span>
                        <span className="big-label-hint">เช่น กผภ.</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="กผภ."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เลขที่หนังสือ</span>
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร)</span>
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
                      <span>เรื่อง (ชื่อเรื่องการขอโอนผลิตภัณฑ์คอนกรีต)</span>
                      <span className="big-label-hint">คลิกเลือก ผรค. ด้านล่าง หรือพิมพ์แก้ไขเอง</span>
                    </label>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {CONCRETE_PLANTS.map((plant) => {
                        const isSelected = formData.subject.includes(plant.name) || formData.sourceUnits === plant.name;
                        return (
                          <button
                            key={plant.id}
                            type="button"
                            onClick={() => handleSelectSourceUnit(plant.name)}
                            style={{
                              fontSize: '12px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #ef4444' : '1px solid #334155',
                              background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                              color: isSelected ? '#fca5a5' : '#cbd5e1',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {plant.fullName}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขอโอนผลิตภัณฑ์คอนกรีต จาก ผรค. มาใช้งานพื้นที่ กฟก.3"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรียน (ผู้อำนวยการฝ่ายผู้รับ)</span>
                      <span className="big-label-hint">เช่น อก.ผภ.</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="อก.ผภ."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: PARAGRAPH 1 (SOURCE UNITS & WBS) */}
              {activeEditSection === 'para1' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>แหล่งผลิตคอนกรีตที่ขอโอน (ผรค.)</span>
                        <span className="big-label-hint">เช่น ผรค.กจ., ผรค.รบ., ผรค.อย.</span>
                      </label>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        {CONCRETE_PLANTS.map((plant) => (
                          <button
                            key={plant.id}
                            type="button"
                            onClick={() => handleSelectSourceUnit(plant.name)}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: formData.sourceUnits === plant.name ? '1px solid #38bdf8' : '1px solid #334155',
                              background: formData.sourceUnits === plant.name ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                              color: formData.sourceUnits === plant.name ? '#7dd3fc' : '#94a3b8',
                              fontWeight: formData.sourceUnits === plant.name ? 700 : 400,
                              cursor: 'pointer'
                            }}
                          >
                            {plant.name}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.sourceUnits}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            sourceUnits: val,
                            subject: `ขอโอนผลิตภัณฑ์คอนกรีต จาก ${val || 'ผรค.'} มาใช้งานพื้นที่ กฟก.3`
                          });
                        }}
                        placeholder="ผรค.กจ."
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>หมายเลขงาน (WBS Number)</span>
                        <span className="big-label-hint">เช่น I-69-I-SM269.M4.1105</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}
                        value={formData.wbsNo}
                        onChange={(e) => setFormData({ ...formData, wbsNo: e.target.value })}
                        placeholder="I-69-I-SM269.M4.1105"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>แผนงานและโครงการก่อสร้าง</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.planDescription}
                      onChange={(e) => setFormData({ ...formData, planDescription: e.target.value })}
                      placeholder="กฟก.3 มีแผนงานก่อสร้างย้ายแนว 115 เควี คลองท่าแร้ง..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>วัตถุประสงค์การนำไปใช้งาน</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.objectivePurpose}
                      onChange={(e) => setFormData({ ...formData, objectivePurpose: e.target.value })}
                      placeholder="เพื่อใช้ในภารกิจงานย้ายแนวระบบจำหน่าย..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: CONCRETE PRODUCTS TABLE */}
              {activeEditSection === 'table' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fed7aa' }}>
                      รายการผลิตภัณฑ์คอนกรีตในตาราง ({formData.items.length} รายการ):
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddItem()}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                    >
                      <Plus size={14} />
                      <span>+ เพิ่มผลิตภัณฑ์</span>
                    </button>
                  </div>

                  {/* Cards for each concrete item */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {formData.items.map((it, idx) => (
                      <div key={it.id} className="big-table-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: '#60a5fa', fontSize: '1rem' }}>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 0.8fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รหัสพัสดุ</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', fontFamily: 'monospace' }}
                              value={it.materialCode}
                              onChange={(e) => handleUpdateItem(it.id, 'materialCode', e.target.value)}
                              placeholder="1-00-001-0016"
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รายละเอียดผลิตภัณฑ์คอนกรีต</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem' }}
                              value={it.description}
                              onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                              placeholder="POLE 22 M..."
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>จำนวน (ต้น/ชุด)</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '1rem', textAlign: 'center', fontWeight: 700, color: '#60a5fa' }}
                              value={it.quantity}
                              onChange={(e) => handleUpdateItem(it.id, 'quantity', e.target.value)}
                              placeholder="10"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Popular concrete chips */}
                  <div style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.5rem' }}>
                      + คลิกเพิ่มเสาคอนกรีตยอดนิยมเข้าตารางทันที:
                    </div>
                    <div className="chip-group">
                      {POPULAR_CONCRETE_PRODUCTS.map((pi, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="chip-btn"
                          onClick={() => handleAddItem(pi)}
                          title={`เพิ่ม: ${pi.name}`}
                        >
                          <Plus size={12} />
                          <span>{pi.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: PARAGRAPH 2 (COORDINATION) */}
              {activeEditSection === 'para2' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อ-นามสกุล ผู้ประสานงานขนย้าย</span>
                        <span className="big-label-hint">เช่น นายชานินทร์ ศรีสวัสดิ์</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="นายชานินทร์ ศรีสวัสดิ์"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่ง</span>
                        <span className="big-label-hint">เช่น ชผ.กร.กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.contactPosition}
                        onChange={(e) => setFormData({ ...formData, contactPosition: e.target.value })}
                        placeholder="ชผ.กร.กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เบอร์โทรศัพท์ติดต่อ</span>
                        <span className="big-label-hint">เช่น 099-1326977</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="099-1326977"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: SIGNER */}
              {activeEditSection === 'signer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่อ-นามสกุล ผู้ลงนามหลัก (อก.รย. / รก.รย.)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerName}
                      onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                      placeholder="นายอนันต์ กาญจนอุปถัมภ์"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่งผู้ลงนาม</span>
                        <span className="big-label-hint">เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.signerPosition}
                        onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                        placeholder="รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
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

              {/* SECTION 6: INFORM SECTION */}
              {activeEditSection === 'inform' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เลขที่หนังสือส่งต่อ</span>
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร.) 2238/2569</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.informDocNo}
                        onChange={(e) => setFormData({ ...formData, informDocNo: e.target.value })}
                        placeholder="ก.3 กรย.(กร.) 2238/2569"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่ส่งต่อ</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.informDate}
                        onChange={(e) => setFormData({ ...formData, informDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>หน่วยงานผู้รับแจ้งเพื่อทราบ (พื้นที่)</span>
                      <span className="big-label-hint">เช่น ผจก.กฟจ.สมุทรสาคร, ผจก.กฟส.สมุทรสาคร 2</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.informReceivers}
                      onChange={(e) => setFormData({ ...formData, informReceivers: e.target.value })}
                      placeholder="ผจก.กฟจ.สมุทรสาคร, ผจก.กฟส.สมุทรสาคร 2"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ข้อความสั่งการส่งต่อ</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.informActionText}
                      onChange={(e) => setFormData({ ...formData, informActionText: e.target.value })}
                      placeholder="เพื่อโปรดทราบ และแจ้ง ผคพ. พร้อมส่วนเกี่ยวข้องต่อไป"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 7: STAMPS */}
              {activeEditSection === 'stamps' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>วันที่เกษียน หผ.กร.(ก3)</span>
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
                        <span>วันที่เกษียน ชผ.กร.(ก3)</span>
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
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
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
                <FileText size={20} className="text-blue-400" />
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
              {generateConcreteTransferMemoPlainText(formData)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  const text = generateConcreteTransferMemoPlainText(formData);
                  await navigator.clipboard.writeText(text);
                  showToast('✓ คัดลอกข้อความสรุปแล้ว');
                }}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
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
