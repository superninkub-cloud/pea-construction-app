"use client";

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
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
  Calculator,
  TrendingUp
} from 'lucide-react';
import './site-expense-extra.css';
import {
  SiteExpenseJobItem,
  SiteExpenseExtraFormData,
  SAMPLE_PRESET_GOLF_COURSE,
  SAMPLE_PRESET_SINGLE_PROJECT,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  formatNumber,
  calculateTotals,
  downloadSiteExpenseWordDocument,
  copyFormattedSiteExpenseWord,
  generateSiteExpensePlainText
} from './siteExpenseExtraUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'para1' | 'para2' | 'table' | 'signer' | 'stamps' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'para1', title: '2. วรรคที่ 1: หนังสืออ้างถึงเดิม & โครงการ', shortName: 'วรรค 1 (อ้างถึง)', icon: Building },
  { key: 'para2', title: '3. วรรคที่ 2: ผู้ควบคุมงาน & เหตุผลความจำเป็น', shortName: 'วรรค 2 (เหตุผล)', icon: AlertTriangle },
  { key: 'table', title: '4. ตารางจัดสรรงบประมาณเพิ่มเติม (100%)', shortName: 'ตารางงบประมาณ', icon: Calculator },
  { key: 'signer', title: '5. ผู้ลงนามหลัก (อก.รย. / รก.รย.)', shortName: 'ผู้ลงนาม', icon: UserCheck },
  { key: 'stamps', title: '6. เกษียนหนังสือ (หผ.กร. / ชผ.กร.)', shortName: 'เกษียนหนังสือ', icon: Info },
];

export default function SiteExpenseExtraPage() {
  const [formData, setFormData] = useState<SiteExpenseExtraFormData>(SAMPLE_PRESET_GOLF_COURSE);
  const [activePreset, setActivePreset] = useState<string>('golf');
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
      const saved = localStorage.getItem('pea_site_expense_extra_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.jobItems && parsed.jobItems.length > 0) {
          if (!parsed.docNo || parsed.docNo.includes('2327') || parsed.docNo.includes('2450') || parsed.docNo.includes('2569') || parsed.docNo.includes('คชย')) {
            parsed.docNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.docDate && (parsed.docDate.includes('8 ต.ค.') || parsed.docDate.includes('15 ต.ค.') || parsed.docDate.includes('ต.ค.') || parsed.docDate.includes('2569') || parsed.docDate.includes('๒๕๖๙'))) {
            parsed.docDate = '';
          }
          if (parsed.signerDate && (parsed.signerDate.includes('ต.ค.') || parsed.signerDate.includes('69') || parsed.signerDate.includes('2569'))) {
            parsed.signerDate = '';
          }
          if (parsed.stampHpKrDate && (parsed.stampHpKrDate.includes('ต.ค.') || parsed.stampHpKrDate.includes('69') || parsed.stampHpKrDate.includes('2569') || parsed.stampHpKrDate.includes('7') || parsed.stampHpKrDate.includes('15'))) {
            parsed.stampHpKrDate = '';
          }
          if (parsed.stampCpKrDate && (parsed.stampCpKrDate.includes('ต.ค.') || parsed.stampCpKrDate.includes('69') || parsed.stampCpKrDate.includes('2569') || parsed.stampCpKrDate.includes('7') || parsed.stampCpKrDate.includes('14'))) {
            parsed.stampCpKrDate = '';
          }
          if (parsed.supervisorPosition) {
            parsed.supervisorPosition = parsed.supervisorPosition.replace(/ผพง/g, 'พชง');
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
      localStorage.setItem('pea_site_expense_extra_data', JSON.stringify(formData));
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
    if (presetKey === 'golf') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_GOLF_COURSE)));
      showToast('✓ โหลดแม่แบบ หลังสนามกอล์ฟ - ซอยดาวทอง (2 จุด) แล้ว');
    } else if (presetKey === 'single') {
      setFormData(JSON.parse(JSON.stringify(SAMPLE_PRESET_SINGLE_PROJECT)));
      showToast('✓ โหลดแม่แบบโครงการเดี่ยว 1 จุด แล้ว');
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

  // Add Job Item to Table
  const handleAddJobItem = () => {
    const nextItemNo = formData.jobItems.length + 1;
    const newItem: SiteExpenseJobItem = {
      id: `item-${Date.now()}`,
      itemNo: nextItemNo,
      jobName: `งานปรับปรุงระบบจำหน่าย (จุดที่ ${nextItemNo})`,
      wbsNumber: 'P-TDD02.3-I-XXXXX.0000',
      initialPercent: 80,
      initialAmount: 500000,
      targetPercent: 100,
      additionalAmount: 125000,
      totalAmount: 625000,
      remarks: 'ขอจัดสรรเพิ่มเติม 20%'
    };
    setFormData(prev => ({
      ...prev,
      jobItems: [...prev.jobItems, newItem]
    }));
    showToast('✓ เพิ่มรายการโครงการใหม่แล้ว');
  };

  // Remove Job Item
  const handleRemoveJobItem = (id: string) => {
    if (formData.jobItems.length <= 1) {
      showToast('⚠️ ต้องมีโครงการอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => ({
      ...prev,
      jobItems: prev.jobItems.filter(it => it.id !== id)
    }));
    showToast('✓ ลบรายการโครงการแล้ว');
  };

  // Update Job Item field
  const handleUpdateJobItem = (id: string, field: keyof SiteExpenseJobItem, val: any) => {
    setFormData(prev => ({
      ...prev,
      jobItems: prev.jobItems.map(it => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          if (field === 'initialAmount' || field === 'additionalAmount') {
            const init = field === 'initialAmount' ? Number(val) || 0 : Number(it.initialAmount) || 0;
            const add = field === 'additionalAmount' ? Number(val) || 0 : Number(it.additionalAmount) || 0;
            updated.totalAmount = init + add;
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
    setFormData(prev => {
      const updatedItems = [...prev.jobItems];
      if (updatedItems.length > 0) {
        updatedItems[0].wbsNumber = proj.wbs;
        updatedItems[0].jobName = proj.name;
      }
      return {
        ...prev,
        projectName: proj.name,
        jobItems: updatedItems
      };
    });
    setShowWbsResults(false);
    showToast(`✓ เลือกโครงการ ${proj.wbs}`);
  };

  // Copy to Word
  const handleCopyWord = async () => {
    setCopiedItem('word');
    const success = await copyFormattedSiteExpenseWord(formData);
    if (success) {
      showToast('✓ คัดลอกตารางจัดรูปแบบลง Word แล้ว!');
    } else {
      showToast('⚠️ เบราว์เซอร์ไม่รองรับ HTML Clipboard');
    }
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Download .doc
  const handleDownloadDoc = () => {
    downloadSiteExpenseWordDocument(formData);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) แล้ว');
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Totals
  const totals = calculateTotals(formData.jobItems);

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
  const fmt = (num: number) => isThai ? toThaiNumerals(formatNumber(num)) : formatNumber(num);

  return (
    <div className="siteexpense-container">
      <TopBar title="โปรแกรมขอค่าใช้จ่ายหน้างานเพิ่มเติม (เป็น 100%)" />

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
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
      <div className="siteexpense-header no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="siteexpense-header-title">
            <div className="siteexpense-icon-badge">
              <CreditCard size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                โปรแกรมขอค่าใช้จ่ายหน้างานเพิ่มเติม (เป็น 100%)
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
              onClick={() => handleSelectPreset('golf')}
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
          onClick={() => handleSelectPreset('golf')}
          className={`preset-card ${activePreset === 'golf' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 1 (ตัวอย่างจริง 2 จุด)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>คพจ.2</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            หลังสนามกอล์ฟ - ซอยดาวทอง (จุดที่ 1, 2)
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            งบขอเพิ่ม: <span style={{ color: '#38bdf8' }}>318,394 บาท</span> • รวม 1,591,970 บาท
          </div>
        </div>

        <div
          onClick={() => handleSelectPreset('single')}
          className={`preset-card ${activePreset === 'single' ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '9999px' }}>
              แม่แบบที่ 2 (โครงการเดี่ยว 1 จุด)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>1 จุด</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#f8fafc' }}>
            ปรับปรุงระบบจำหน่าย (จุดที่ 1)
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            งบขอเพิ่ม: <span style={{ color: '#38bdf8' }}>159,197 บาท</span> • รวม 795,985 บาท
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
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
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
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
            <Sparkles size={16} className="text-rose-400" />
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
                  background: activeEditSection === sec.key ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: activeEditSection === sec.key ? '#ef4444' : 'rgba(255, 255, 255, 0.15)',
                  color: activeEditSection === sec.key ? '#f87171' : '#f1f5f9',
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
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1.5px dashed #ef4444',
            borderRadius: '8px',
            padding: '4px 12px',
            fontSize: '11pt',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)'
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
                      placeholder="เช่น กวว.(ก3)"
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
                      placeholder="เช่น อก.วว.(ก3)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: PARAGRAPH 1 (REF DOC & PROJECT INFO) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para1')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 1 หนังสืออ้างถึงเดิม & ข้อมูลโครงการ"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 1 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ตามหนังสือ </span>
              <strong>{formData.docTo || 'กวว.(ก3)'}</strong>
              <span> ที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '190px' }}
                value={formData.refDocNo}
                onChange={(e) => setFormData({ ...formData, refDocNo: e.target.value })}
                placeholder="ก.3 กวว.(วร) 826/2568"
              />
              <span> ลงวันที่ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '160px' }}
                value={formData.refDocDate}
                onChange={(e) => setFormData({ ...formData, refDocDate: e.target.value })}
                placeholder="2 พฤษภาคม 2568"
              />
              <span> ได้อนุมัติเปิดงานก่อสร้าง</span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '420px', marginTop: '2pt' }}
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง..."
              />
              <span> ตามแผนงาน </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '140px' }}
                value={formData.programName}
                onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                placeholder="โครงการ คพจ.2"
              />
              <span> นั้น</span>
            </div>
          </div>

          {/* SECTION 3: PARAGRAPH 2 (SUPERVISOR & REASONS) */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('para2')}
            style={{ marginTop: '8pt', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: วรรคที่ 2 ผู้ควบคุมงาน & เหตุผลความจำเป็น"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขวรรค 2 (ขยายใหญ่)
            </span>

            <div className="a4-text-indent" style={{ lineHeight: '1.45' }}>
              <span>ในการนี้ </span>
              <strong>{formData.docFrom || 'กรย.(ก3)'}</strong>
              <span> โดย </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '200px', fontWeight: 'bold' }}
                value={formData.supervisorName}
                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                placeholder="นายวีรพัฒน์ นาลดมัย"
              />
              <span> ตำแหน่ง </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '180px' }}
                value={formData.supervisorPosition}
                onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                placeholder="พชง.6 ผกร.กรย.(ก3)"
              />
              <span> ผู้ควบคุมงาน ได้รายงานผลการดำเนินงานก่อสร้างปัจจุบันมีความคืบหน้าประมาณ </span>
              <input
                type="text"
                className="a4-inline-input"
                style={{ width: '50px', textAlign: 'center', fontWeight: 'bold' }}
                value={formData.progressPercent}
                onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) || 0 })}
                placeholder="80"
              />
              <span> % </span>
              <textarea
                rows={3}
                className="a4-live-textarea"
                style={{ marginTop: '4pt' }}
                value={formData.justificationReason}
                onChange={(e) => setFormData({ ...formData, justificationReason: e.target.value })}
                placeholder="ระบุเหตุผลความจำเป็น เช่น ต้องระดมชุดปฏิบัติงานนอกเวลา..."
              />
            </div>

            <div className="a4-text-indent" style={{ marginTop: '6pt' }}>
              <span>{formData.requestObjective}</span>
            </div>
          </div>

          {/* SECTION 4: TABLE OF EXPENSES */}
          <div
            className="a4-section-hoverable"
            onClick={() => setActiveEditSection('table')}
            style={{ margin: '8pt 0', padding: '2pt 4pt' }}
            title="จิ้มเพื่อขยายแก้ไข: ตารางจัดสรรงบประมาณเพิ่มเติม (100%)"
          >
            <span className="section-edit-badge no-print">
              <Edit3 size={11} /> จิ้มแก้ไขตารางงบ (ขยายใหญ่)
            </span>

            <table className="a4-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '6%', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ width: '38%', textAlign: 'center' }}>ชื่องาน / หมายเลขงาน (WBS)</th>
                  <th style={{ width: '18%', textAlign: 'center' }}>งบเดิม ({tn(formData.jobItems[0]?.initialPercent || 80)}%) (บาท)</th>
                  <th style={{ width: '18%', textAlign: 'center' }}>งบขอเพิ่ม (บาท)</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>รวมงบทั้งสิ้น (100%) (บาท)</th>
                  <th className="no-print" style={{ width: '5%', textAlign: 'center' }}>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {formData.jobItems.map((it, idx) => (
                  <tr key={it.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{tn(idx + 1)}</td>
                    <td>
                      <input
                        type="text"
                        className="a4-table-input"
                        value={it.jobName}
                        onChange={(e) => handleUpdateJobItem(it.id, 'jobName', e.target.value)}
                        placeholder="ชื่องาน..."
                      />
                      <div style={{ fontSize: '13pt', color: '#dc2626', fontWeight: 600, fontFamily: 'monospace' }}>
                        WBS: {tn(it.wbsNumber)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        type="number"
                        className="a4-table-input"
                        style={{ textAlign: 'right' }}
                        value={it.initialAmount}
                        onChange={(e) => handleUpdateJobItem(it.id, 'initialAmount', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        type="number"
                        className="a4-table-input"
                        style={{ textAlign: 'right', color: '#c2410c', fontWeight: 'bold' }}
                        value={it.additionalAmount}
                        onChange={(e) => handleUpdateJobItem(it.id, 'additionalAmount', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {fmt(it.totalAmount)}
                    </td>
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="row-del-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveJobItem(it.id);
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
                  <td colSpan={2} style={{ textAlign: 'center' }}>รวมทั้งสิ้น</td>
                  <td style={{ textAlign: 'right' }}>{fmt(totals.totalInitial)}</td>
                  <td style={{ textAlign: 'right', color: '#c2410c' }}>{fmt(totals.totalAdditional)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(totals.grandTotal)}</td>
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
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px dashed #ef4444',
                  color: '#b91c1c',
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
                <span>+ จัดการและเพิ่มโครงการ (ขยายใหญ่)</span>
              </button>
            </div>
          </div>

          {/* Concluding Paragraph */}
          <p className="a4-text-indent" style={{ marginTop: '6pt' }}>
            จึงเรียนมาเพื่อโปรดพิจารณาจัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติมให้ กรย.(ก3) ต่อไป จะขอบคุณยิ่ง
          </p>

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
              </div>
            </div>
          </div>

          {/* SECTION 6: ROUTING STAMPS */}
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
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(239, 68, 68, 0.35)'
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
                    background: activeEditSection === sec.key ? '#ef4444' : 'rgba(255,255,255,0.06)',
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
                        <span className="big-label-hint">เช่น กวว.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="กวว.(ก3)"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>เลขที่หนังสือ</span>
                        <span className="big-label-hint">เช่น ก.3 กรย.(กร)- 2327/2569</span>
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
                      <span>เรื่อง (ชื่อเรื่องการขอจัดสรรงบประมาณ)</span>
                    </label>
                    <textarea
                      rows={2}
                      className="big-textarea"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="ขอให้จัดสรรงบประมาณค่าใช้จ่ายหน้างานเพิ่มเติม..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เรียน (ผู้บังคับบัญชา)</span>
                      <span className="big-label-hint">เช่น อก.วว.(ก3)</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                      placeholder="อก.วว.(ก3)"
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
                        <span>หนังสือเดิมของ กวว.(ก3) ที่</span>
                        <span className="big-label-hint">เช่น ก.3 กวว.(วร) 826/2568</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.refDocNo}
                        onChange={(e) => setFormData({ ...formData, refDocNo: e.target.value })}
                        placeholder="ก.3 กวว.(วร) 826/2568"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ลงวันที่เดิม</span>
                        <span className="big-label-hint">เช่น 2 พฤษภาคม 2568</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.refDocDate}
                        onChange={(e) => setFormData({ ...formData, refDocDate: e.target.value })}
                        placeholder="2 พฤษภาคม 2568"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>ชื่องาน/โครงการก่อสร้าง</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="งานปรับปรุงระบบจำหน่าย 22 เควี หลังสนามกอล์ฟ ถึง ซอยดาวทอง..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>แผนงาน/โครงการ</span>
                      <span className="big-label-hint">เช่น โครงการ คพจ.2</span>
                    </label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.programName}
                      onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                      placeholder="โครงการ คพจ.2"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: PARAGRAPH 2 (SUPERVISOR & REASONS) */}
              {activeEditSection === 'para2' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '1rem' }}>
                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ชื่อ-นามสกุล ผู้ควบคุมงาน</span>
                        <span className="big-label-hint">เช่น นายวีรพัฒน์ นาลดมัย</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.supervisorName}
                        onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                        placeholder="นายวีรพัฒน์ นาลดมัย"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ตำแหน่งผู้ควบคุมงาน</span>
                        <span className="big-label-hint">เช่น พชง.6 ผกร.กรย.(ก3)</span>
                      </label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.supervisorPosition}
                        onChange={(e) => setFormData({ ...formData, supervisorPosition: e.target.value })}
                        placeholder="พชง.6 ผกร.กรย.(ก3)"
                      />
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">
                        <span>ความคืบหน้า (%)</span>
                      </label>
                      <input
                        type="number"
                        className="big-input"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                        value={formData.progressPercent}
                        onChange={(e) => setFormData({ ...formData, progressPercent: Number(e.target.value) || 0 })}
                        placeholder="80"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>เหตุผลความจำเป็นที่งบประมาณไม่เพียงพอ</span>
                    </label>
                    <textarea
                      rows={4}
                      className="big-textarea"
                      value={formData.justificationReason}
                      onChange={(e) => setFormData({ ...formData, justificationReason: e.target.value })}
                      placeholder="แต่เนื่องจากงานก่อสร้างดังกล่าวเป็นงานก่อสร้างปรับปรุงระบบจำหน่าย มีความจำเป็นต้องระดมชุดปฏิบัติงานก่อสร้าง..."
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">
                      <span>คำขออนุมัติจัดสรรงบประมาณ (วรรคที่ 3)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.requestObjective}
                      onChange={(e) => setFormData({ ...formData, requestObjective: e.target.value })}
                      placeholder="ดังนั้นเพื่อให้ดำเนินการก่อสร้างได้แล้วเสร็จ และมีงบประมาณเพียงพอต่อการดำเนินงาน..."
                    />
                  </div>
                </div>
              )}

              {/* SECTION 4: TABLE OF EXPENSES */}
              {activeEditSection === 'table' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fed7aa' }}>
                      รายการโครงการของบเพิ่มเติม ({formData.jobItems.length} รายการ):
                    </div>
                    <button
                      type="button"
                      onClick={handleAddJobItem}
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
                    >
                      <Plus size={14} />
                      <span>+ เพิ่มโครงการ</span>
                    </button>
                  </div>

                  {/* Cards for each job item */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {formData.jobItems.map((it, idx) => (
                      <div key={it.id} className="big-table-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 800, color: '#f87171', fontSize: '1rem' }}>
                            จุดที่ {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveJobItem(it.id)}
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

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '0.75rem', marginBottom: '0.625rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ชื่องาน / จุดก่อสร้าง</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem' }}
                              value={it.jobName}
                              onChange={(e) => handleUpdateJobItem(it.id, 'jobName', e.target.value)}
                              placeholder="งานปรับปรุงระบบจำหน่าย..."
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>หมายเลขงาน (WBS)</label>
                            <input
                              type="text"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.9375rem', fontFamily: 'monospace', color: '#38bdf8' }}
                              value={it.wbsNumber}
                              onChange={(e) => handleUpdateJobItem(it.id, 'wbsNumber', e.target.value)}
                              placeholder="P-TDD02.3-I-XXXXX.0000"
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>งบเดิม ({it.initialPercent}%) (บาท)</label>
                            <input
                              type="number"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '1rem', textAlign: 'right' }}
                              value={it.initialAmount}
                              onChange={(e) => handleUpdateJobItem(it.id, 'initialAmount', e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#f87171', display: 'block', marginBottom: '2px' }}>งบขอเพิ่ม (บาท)</label>
                            <input
                              type="number"
                              className="big-input"
                              style={{ padding: '0.5rem 0.75rem', fontSize: '1rem', textAlign: 'right', color: '#f87171', fontWeight: 700 }}
                              value={it.additionalAmount}
                              onChange={(e) => handleUpdateJobItem(it.id, 'additionalAmount', e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>รวมทั้งสิ้น (100%) (บาท)</label>
                            <div style={{ padding: '0.5rem 0.75rem', fontSize: '1.0625rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.5rem', textAlign: 'right' }}>
                              {fmt(it.totalAmount)} บาท
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Footer in Modal */}
                  <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fed7aa' }}>รวมงบประมาณขอเพิ่มทั้งสิ้น:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>
                      {fmt(totals.totalAdditional)} บาท (รวมทั้งหมด {fmt(totals.grandTotal)} บาท)
                    </span>
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

              {/* SECTION 6: STAMPS */}
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
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
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
                <FileText size={20} className="text-rose-400" />
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
              {generateSiteExpensePlainText(formData)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  const text = generateSiteExpensePlainText(formData);
                  await navigator.clipboard.writeText(text);
                  showToast('✓ คัดลอกข้อความสรุปแล้ว');
                }}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
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
