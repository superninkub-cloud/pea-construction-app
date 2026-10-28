"use client";

import React, { useState, useEffect } from 'react';
import {
  Moon,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
  Check,
  RotateCcw,
  Building,
  Calendar,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Truck,
  Plus,
  Trash2,
  Users
} from 'lucide-react';
import './overnight-stay.css';
import {
  OvernightStayFormData,
  StayPerson,
  SAMPLE_SUPAWIT_DATA,
  SAMPLE_WEERAPAT_DATA,
  SAMPLE_SARAWUT_DATA,
  SAMPLE_KWANNAKORN_DATA,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  generateOvernightStayMemoPlainText,
  generateOvernightStayWordDocument
} from './overnightStayUtils';
import TopBar from '../components/TopBar';

type EditSectionKey = 'header' | 'work' | 'persons' | 'vehicles' | 'proposer' | 'approval' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'work', title: '2. วรรค 1: รายละเอียดงานและเหตุผล', shortName: 'งาน & เหตุผล', icon: Building },
  { key: 'persons', title: '3. รายชื่อพนักงานและกำหนดวันพักแรม', shortName: 'รายชื่อพนักงาน', icon: Users },
  { key: 'vehicles', title: '4. รถยนต์และผู้ดูแลรับผิดชอบ', shortName: 'รถ & ผู้ดูแล', icon: Truck },
  { key: 'proposer', title: '5. ผู้เสนอและข้อมูลติดต่อ', shortName: 'ผู้เสนอ', icon: UserCheck },
  { key: 'approval', title: '6. ผู้อนุมัติและเกษียนหนังสือ', shortName: 'ผู้อนุมัติ & เกษียน', icon: ShieldCheck },
];

export default function OvernightStayPage() {
  const [formData, setFormData] = useState<OvernightStayFormData>(SAMPLE_SUPAWIT_DATA);
  const [activePreset, setActivePreset] = useState<'supawit' | 'weerapat' | 'sarawut' | 'kwannakorn' | 'custom'>('supawit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [newVehicleInput, setNewVehicleInput] = useState<string>('');
  const [isThaiNum, setIsThaiNum] = useState<boolean>(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_overnight_stay_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.subject) {
          const fixedDocNo = (!parsed.docNo || parsed.docNo.includes('2360') || parsed.docNo.includes('2358') || parsed.docNo.includes('2359') || parsed.docNo.includes('2361') || parsed.docNo.includes('5309') || parsed.docNo.includes('คชย'))
            ? 'ก.3 กรย.(กร)'
            : parsed.docNo;
          const fixedDocDate = (parsed.docDate && (parsed.docDate.includes('ตุลาคม') || parsed.docDate.includes('2569') || parsed.docDate.includes('๒๕๖๙')))
            ? ''
            : (parsed.docDate || '');
          const fixedProposerDate = (parsed.proposerDate && (parsed.proposerDate.includes('ต.ค.') || parsed.proposerDate.includes('69') || parsed.proposerDate.includes('2569'))) ? '' : (parsed.proposerDate || '');
          const fixedApproverDate = (parsed.approverDate && (parsed.approverDate.includes('ต.ค.') || parsed.approverDate.includes('69') || parsed.approverDate.includes('2569'))) ? '' : (parsed.approverDate || '');
          const fixedStampRwWb = (parsed.stampRwWbDate && (parsed.stampRwWbDate.includes('ต.ค.') || parsed.stampRwWbDate.includes('69') || parsed.stampRwWbDate.includes('2569'))) ? '' : (parsed.stampRwWbDate || '');
          const fixedStampHpKr = (parsed.stampHpKrDate && (parsed.stampHpKrDate.includes('ต.ค.') || parsed.stampHpKrDate.includes('69') || parsed.stampHpKrDate.includes('2569'))) ? '' : (parsed.stampHpKrDate || '');
          const fixedStampCpKr = (parsed.stampCpKrDate && (parsed.stampCpKrDate.includes('ต.ค.') || parsed.stampCpKrDate.includes('69') || parsed.stampCpKrDate.includes('2569') || parsed.stampCpKrDate.includes('/'))) ? '' : (parsed.stampCpKrDate || '');
          setFormData({
            ...SAMPLE_SUPAWIT_DATA,
            ...parsed,
            docNo: fixedDocNo,
            docDate: fixedDocDate,
            proposerDate: fixedProposerDate,
            approverDate: fixedApproverDate,
            stampRwWbDate: fixedStampRwWb,
            stampHpKrDate: fixedStampHpKr,
            stampCpKrDate: fixedStampCpKr,
            docTo: parsed.docTo || 'กฟก.3'
          });
          setActivePreset('custom');
        }
      }
    } catch (e) {
      console.error('Error loading stored overnight stay form:', e);
    }
  }, []);

  // Autosave
  useEffect(() => {
    try {
      localStorage.setItem('pea_overnight_stay_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPreset = (key: 'supawit' | 'weerapat' | 'sarawut' | 'kwannakorn') => {
    setActivePreset(key);
    if (key === 'supawit') {
      setFormData(SAMPLE_SUPAWIT_DATA);
      showToast('✓ โหลดแม่แบบ: ชุดงานนายศุภวิชญ์ เกาะลอย');
    } else if (key === 'weerapat') {
      setFormData(SAMPLE_WEERAPAT_DATA);
      showToast('✓ โหลดแม่แบบ: ชุดงานนายวีรพัฒน์ นาคลมัย');
    } else if (key === 'sarawut') {
      setFormData(SAMPLE_SARAWUT_DATA);
      showToast('✓ โหลดแม่แบบ: ชุดงานนายศราวุฒิ เกิดสีเล็ก');
    } else if (key === 'kwannakorn') {
      setFormData(SAMPLE_KWANNAKORN_DATA);
      showToast('✓ โหลดแม่แบบ: ชุดงานนายขวัญนคร ศรีจันทร์อินทร์');
    }
  };

  const handleToggleNumerals = () => {
    const nextState = !isThaiNum;
    setIsThaiNum(nextState);
    const convert = nextState ? toThaiNumerals : toArabicNumerals;
    setFormData(prev => ({
      ...prev,
      docNo: convert(prev.docNo),
      docDate: convert(prev.docDate),
      subject: convert(prev.subject),
      travelOrderNo: convert(prev.travelOrderNo),
      workArea: convert(prev.workArea),
      constructionDescription: convert(prev.constructionDescription),
      workStartDate: convert(prev.workStartDate),
      workEndDate: convert(prev.workEndDate),
      roundTripDistanceKm: convert(prev.roundTripDistanceKm),
      stayStartDate: convert(prev.stayStartDate),
      stayEndDate: convert(prev.stayEndDate),
      totalDays: convert(prev.totalDays),
      proposerDate: convert(prev.proposerDate),
      approverDate: convert(prev.approverDate),
      stampRwWbDate: convert(prev.stampRwWbDate),
      stampRkRyDate: convert(prev.stampRkRyDate),
      stampHpKrDate: convert(prev.stampHpKrDate),
      stampCpKrDate: convert(prev.stampCpKrDate),
      contactPhone: convert(prev.contactPhone),
      vehicles: prev.vehicles.map(v => convert(v)),
      persons: prev.persons.map(p => ({
        ...p,
        position: convert(p.position)
      }))
    }));
    showToast(nextState ? '✓ แปลงเป็นเลขไทย (1 2 3) แล้ว' : '✓ แปลงเป็นเลขอารบิก (1 2 3) แล้ว');
  };

  const handleSetTodayDocDate = () => {
    const todayStr = getTodayThaiDate('short');
    setFormData(prev => ({
      ...prev,
      docDate: todayStr,
      proposerDate: todayStr,
      approverDate: todayStr
    }));
    showToast(`ใส่วันที่เป็น: ${todayStr}`);
  };

  const handleAddVehicle = (plate: string) => {
    const trimmed = plate.trim();
    if (!trimmed) return;
    if (formData.vehicles.includes(trimmed)) {
      showToast('⚠️ หมายเลขทะเบียนนี้มีอยู่แล้ว');
      return;
    }
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, trimmed]
    }));
    setNewVehicleInput('');
    showToast(`✓ เพิ่มรถทะเบียน: ${trimmed}`);
  };

  const handleRemoveVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const handleAddPerson = () => {
    const newP: StayPerson = {
      id: `p-${Date.now()}`,
      name: '',
      position: 'พชง.6',
      department: 'ผกร.กรย.(ก3)'
    };
    setFormData(prev => ({
      ...prev,
      persons: [...prev.persons, newP]
    }));
  };

  const handleRemovePerson = (index: number) => {
    if (formData.persons.length <= 1) {
      showToast('⚠️ ต้องมีพนักงานอย่างน้อย 1 คน');
      return;
    }
    setFormData(prev => ({
      ...prev,
      persons: prev.persons.filter((_, i) => i !== index)
    }));
  };

  const handleUpdatePerson = (index: number, field: keyof StayPerson, val: string) => {
    setFormData(prev => {
      const copy = [...prev.persons];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, persons: copy };
    });
  };

  const handleCopyMemo = async () => {
    const plainText = generateOvernightStayMemoPlainText(formData);
    const html = generateOvernightStayWordDocument(formData);
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
    const content = generateOvernightStayWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = formData.persons[0]?.name?.replace(/[^a-zA-Z0-9ก-๙]/g, '_') || 'PEA';
    link.download = `บันทึกข้อความ_ขออนุมัติพักแรมหน้างาน_${cleanName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ ดาวน์โหลดไฟล์ Word (.doc) สำเร็จ');
  };

  // Section navigation in modal
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
      <TopBar title="โปรแกรมขออนุมัติพักแรมหน้างาน" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <Moon size={18} className="text-amber-300" />
              <span>ขออนุมัติพักแรมหน้างาน (ผกร.กรย.ก3)</span>
            </div>
            <div className="a4-preset-group">
              <span className="text-xs text-slate-300 font-medium">แม่แบบชุดงาน:</span>
              <button
                type="button"
                className={`a4-preset-chip ${activePreset === 'supawit' ? 'active' : ''}`}
                onClick={() => handleSelectPreset('supawit')}
              >
                ชุดงานนายศุภวิชญ์
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${activePreset === 'weerapat' ? 'active' : ''}`}
                onClick={() => handleSelectPreset('weerapat')}
              >
                ชุดงานนายวีรพัฒน์
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${activePreset === 'sarawut' ? 'active' : ''}`}
                onClick={() => handleSelectPreset('sarawut')}
              >
                ชุดงานนายศราวุฒิ
              </button>
              <button
                type="button"
                className={`a4-preset-chip ${activePreset === 'kwannakorn' ? 'active' : ''}`}
                onClick={() => handleSelectPreset('kwannakorn')}
              >
                ชุดงานนายขวัญนคร
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
              className="a4-action-btn a4-btn-muted"
              onClick={handleToggleNumerals}
              title="สลับเลขไทย 123 และเลขอารบิก 123"
            >
              {isThaiNum ? 'เลขไทย 1 2 3' : '123 อารบิก'}
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
                    <td style={{ width: '8%', fontWeight: 'bold' }}>จาก</td>
                    <td style={{ width: '42%' }}>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docFrom}
                        onChange={(e) => setFormData({ ...formData, docFrom: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="หน่วยงานเจ้าของเรื่อง เช่น แผนกก่อสร้างระบบไฟฟ้า..."
                      />
                    </td>
                    <td style={{ width: '8%', fontWeight: 'bold' }}>ถึง</td>
                    <td style={{ width: '42%' }}>
                      <input
                        type="text"
                        className="a4-live-input"
                        value={formData.docTo || 'กฟก.3'}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น กฟก.3"
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
                        placeholder="เช่น ก.3 กรย.(กร)"
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
                        placeholder=""
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
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. WORK & REASON SECTION (วรรค 1) */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('work')}
              title="คลิกเพื่อแก้ไขวรรค 1: รายละเอียดงานและเหตุผล"
              style={{ marginTop: '12pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขวรรค 1: รายละเอียดงานและเหตุผล
              </div>

              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                ตามอนุมัติเดินทางไปปฏิบัติงานต่างพื้นที่ เลขที่{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.travelOrderNo || '............'}</span>{' '}
                ให้พนักงานในสังกัดเดินทางไปปฏิบัติงานในพื้นที่{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.workArea || '............'}</span>{' '}
                โดยปฏิบัติงานก่อสร้างดังนี้{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.constructionDescription || '............'}</span>{' '}
                ตั้งแต่วันที่{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.workStartDate || '............'}</span>{' '}
                ถึงวันที่{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.workEndDate || '............'}</span>{' '}
                เนื่องจากระยะทางไปกลับประมาณ{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.roundTripDistanceKm || '............'}</span> กม.{' '}
                การเคลื่อนย้ายชุดปฏิบัติงานซึ่งประกอบด้วย คนงานรายวัน, เครื่องมือ, และเครื่องจักร เป็นไปด้วยความลำบาก และเสียค่าใช้จ่ายมาก เพื่อให้เกิดประสิทธิภาพต่อการปฏิบัติงาน ลดค่าใช้จ่ายในการเดินทางและให้เป็นไปอย่างต่อเนื่อง
              </p>

              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify', marginTop: '6pt' }}>
                {formData.docFrom} พิจารณาแล้วเห็นว่าเป็นการลดระยะเวลาและค่าใช้จ่ายในการเดินทาง, สามารถปฏิบัติงานในแต่ละวันเพิ่มขึ้น, ปฏิบัติงานนอกเวลาปกติได้ และเพื่อให้สถานที่พักแรมเป็นที่เก็บรักษาอุปกรณ์, เครื่องมือ และยานพาหนะ จึงเห็นควรให้พนักงานดังกล่าวพักแรมหน้างาน โดยมีสิทธิ์เบิกจ่าย ค่าเบี้ยเลี้ยงและค่าที่พักแรมได้ตามเสนอ ทั้งนี้ให้เบิกเฉพาะวันที่พักแรมหน้างานจริงเท่านั้น จึงขออนุมัติดำเนินการดังนี้
              </p>
            </div>

            {/* 3. PERSONS LIST & DURATION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('persons')}
              title="คลิกเพื่อแก้ไขรายชื่อพนักงานและวันพักแรม"
              style={{ marginTop: '10pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขรายชื่อพนักงานและวันพักแรม
              </div>

              {formData.persons.length === 1 ? (
                <div style={{ textIndent: '2.5cm', marginBottom: '6pt', lineHeight: 1.6 }}>
                  1. ขออนุมัติให้{' '}
                  <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.persons[0].name}</span>{' '}
                  ตำแหน่ง <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.persons[0].position}</span>{' '}
                  สังกัด <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.persons[0].department}</span>{' '}
                  พักแรมหน้างาน โดยขอเบิกจ่ายค่าเบี้ยเลี้ยง และค่าที่พักแรมจากงานที่ปฏิบัติ
                </div>
              ) : (
                <div style={{ marginBottom: '6pt' }}>
                  <div style={{ textIndent: '2.5cm', marginBottom: '4pt', lineHeight: 1.6 }}>
                    1. ขออนุมัติให้พนักงานพักแรมหน้างาน โดยขอเบิกจ่ายค่าเบี้ยเลี้ยง และค่าที่พักแรมจากงานที่ปฏิบัติ ดังนี้
                  </div>
                  {formData.persons.map((p, idx) => (
                    <div key={p.id} style={{ textIndent: '3.5cm', marginBottom: '3pt', lineHeight: 1.55 }}>
                      {isThaiNum ? ('1.' + toThaiNumerals(idx + 1)) : ('1.' + (idx + 1))} <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{p.name || '(ไม่ได้ระบุชื่อ)'}</span> ตำแหน่ง <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{p.position}</span> สังกัด <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{p.department}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ textIndent: '2.5cm', marginBottom: '6pt', lineHeight: 1.6 }}>
                ทั้งนี้ตั้งแต่วันที่ <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.stayStartDate}</span> ถึงวันที่{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.stayEndDate}</span> รวม{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.totalDays}</span> วัน
              </div>
            </div>

            {/* 4. VEHICLES SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('vehicles')}
              title="คลิกเพื่อแก้ไขทะเบียนรถและผู้ดูแล"
              style={{ marginTop: '8pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขรถยนต์ & ผู้ดูแลรับผิดชอบ
              </div>

              <div style={{ textIndent: '2.5cm', marginBottom: '8pt', lineHeight: 1.6 }}>
                2. ขออนุมัตินำรถยนต์ กฟภ. หมายเลขทะเบียน{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>
                  {formData.vehicles.length > 0 ? formData.vehicles.join(', ') : '..................'}
                </span>{' '}
                จอดเก็บรักษาหลังจากเลิกปฏิบัติงาน โดยให้อยู่ในความดูแลรับผิดชอบของ{' '}
                <span className="a4-var-red" style={{ fontWeight: 600, color: '#dc2626' }}>{formData.caretakerName || '..................'}</span>
              </div>

              <p className="a4-text-indent" style={{ marginTop: '10pt', marginBottom: '20pt' }}>
                จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติให้ต่อไป
              </p>
            </div>

            {/* 5. PROPOSER SIGNATURE BOX (ขวากลาง) */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('proposer')}
              title="คลิกเพื่อแก้ไขผู้เสนอเรื่อง"
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10pt', marginBottom: '20pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้เสนอเรื่อง
              </div>

              <div style={{ textAlign: 'center', minWidth: '260px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ fontWeight: 'normal' }}>({formData.proposerName})</div>
                <div style={{ fontSize: '13pt', color: '#334155', marginTop: '2pt' }}>{formData.proposerPosition}</div>
                {formData.proposerDate && (
                  <div style={{ fontSize: '12pt', color: '#64748b', marginTop: '2pt' }}>{formData.proposerDate}</div>
                )}
              </div>
            </div>

            {/* 6. APPROVER & ROUTING STAMPS SECTION (ล่างสุด) */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('approval')}
              title="คลิกเพื่อแก้ไขคำสั่งอนุมัติและเกษียนหนังสือ"
              style={{ marginTop: '16pt', borderTop: '1px solid #cbd5e1', paddingTop: '14pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขผู้อนุมัติ & ตารางเกษียน
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* ผู้อนุมัติ (ซ้าย) */}
                <div className="a4-approval-box">
                  <div style={{ fontWeight: 'bold', fontSize: '15pt', marginBottom: '14pt' }}>
                    {formData.approvalCommand || 'อนุมัติ'}
                  </div>
                  <div style={{ height: '34px' }}></div>
                  <div style={{ fontWeight: 'normal' }}>({formData.approverName})</div>
                  <div style={{ fontSize: '12pt', color: '#475569' }}>{formData.approverPosition}</div>
                  <div style={{ fontSize: '11pt', color: '#64748b', marginTop: '3pt' }}>{formData.approverDate}</div>
                </div>

                {/* ตารางเกษียนหนังสือ (ขวา) */}
                {formData.hasRoutingStamps && (
                  <div style={{ border: '1px solid #94a3b8', borderRadius: '4px', padding: '8pt 10pt', fontSize: '11pt' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4pt' }}>
                      <span style={{ fontWeight: 600 }}>รฝ.วบ.(ก3)</span>
                      <span>..................</span>
                      <span>วันที่ {formData.stampRwWbDate || '...........'}</span>
                    </div>
                    {formData.stampRkRyDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4pt' }}>
                        <span style={{ fontWeight: 600 }}>รก.รย.(ก3)</span>
                        <span>..................</span>
                        <span>วันที่ {formData.stampRkRyDate}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4pt' }}>
                      <span style={{ fontWeight: 600 }}>หผ.กร.(ก3)</span>
                      <span>..................</span>
                      <span>วันที่ {formData.stampHpKrDate || '...........'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>ชผ.กร.(ก3)</span>
                      <span>..................</span>
                      <span>วันที่ {formData.stampCpKrDate || '...........'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ท้ายกระดาษ */}
              <div style={{ marginTop: '16pt', fontSize: '10pt', color: '#64748b', textAlign: 'left', borderTop: '1px dashed #cbd5e1', paddingTop: '6pt' }}>
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
            {/* Modal Header */}
            <div className="big-editor-header">
              <div className="big-editor-title">
                {(() => {
                  const meta = SECTIONS_META.find(s => s.key === activeEditSection);
                  const Icon = meta?.icon || FileText;
                  return (
                    <>
                      <Icon size={22} className="text-amber-400" />
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

            {/* Modal Body */}
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
                      <label className="big-label">ถึง</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo || 'กฟก.3'}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="เช่น กฟก.3"
                      />
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่หนังสือบันทึกข้อความ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="เช่น ก.3 กรย.(กร)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ</label>
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
                      placeholder="เช่น ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: WORK & REASON */}
              {activeEditSection === 'work' && (
                <div>
                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่อนุมัติเดินทางไปปฏิบัติงาน</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.travelOrderNo}
                        onChange={(e) => setFormData({ ...formData, travelOrderNo: e.target.value })}
                        placeholder="เช่น TI26234411 กรย.(ก3)"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">ระยะทางไป-กลับโดยประมาณ (กม.)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.roundTripDistanceKm}
                        onChange={(e) => setFormData({ ...formData, roundTripDistanceKm: e.target.value })}
                        placeholder="เช่น 60 หรือ 120"
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">พื้นที่ปฏิบัติงาน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.workArea}
                      onChange={(e) => setFormData({ ...formData, workArea: e.target.value })}
                      placeholder="เช่น กฟจ.สมุทรสาคร และการไฟฟ้าในสังกัด กฟก.3"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">รายละเอียดงานก่อสร้างที่ต้องดำเนินการ</label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.constructionDescription}
                      onChange={(e) => setFormData({ ...formData, constructionDescription: e.target.value })}
                      placeholder="เช่น รื้อถอนสถานีไฟฟ้าสมุทรสาคร 10 ปักเสา พาดสายแรงสูง..."
                    />
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">วันที่เริ่มปฏิบัติงาน</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.workStartDate}
                        onChange={(e) => setFormData({ ...formData, workStartDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่สิ้นสุดปฏิบัติงาน</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.workEndDate}
                        onChange={(e) => setFormData({ ...formData, workEndDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: PERSONS & STAY DURATION */}
              {activeEditSection === 'persons' && (
                <div>
                  <div className="big-grid-3">
                    <div className="big-field-group">
                      <label className="big-label">วันที่เริ่มพักแรม</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.stayStartDate}
                        onChange={(e) => setFormData({ ...formData, stayStartDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่สิ้นสุดพักแรม</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.stayEndDate}
                        onChange={(e) => setFormData({ ...formData, stayEndDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">รวมระยะเวลาพักแรม (วัน)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.totalDays}
                        onChange={(e) => setFormData({ ...formData, totalDays: e.target.value })}
                        placeholder="เช่น 27"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '16px' }}>
                    <label className="big-label" style={{ marginBottom: 0 }}>
                      รายชื่อพนักงานที่ขออนุมัติพักแรม ({formData.persons.length} คน)
                    </label>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-emerald"
                      onClick={handleAddPerson}
                    >
                      <Plus size={15} /> เพิ่มพนักงาน
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.persons.map((p, idx) => (
                      <div key={p.id} className="big-table-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#1e3a8a' }}>
                            ลำดับที่ {idx + 1}
                          </span>
                          {formData.persons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePerson(idx)}
                              className="a4-action-btn"
                              style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px' }}
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          )}
                        </div>
                        <div className="big-grid-3">
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>ชื่อ-นามสกุล</span>
                            <input
                              type="text"
                              className="big-input"
                              value={p.name}
                              onChange={(e) => handleUpdatePerson(idx, 'name', e.target.value)}
                              placeholder="เช่น นายศุภวิชญ์ เกาะลอย"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>ตำแหน่ง</span>
                            <input
                              type="text"
                              className="big-input"
                              value={p.position}
                              onChange={(e) => handleUpdatePerson(idx, 'position', e.target.value)}
                              placeholder="เช่น พชง.6"
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>สังกัด</span>
                            <input
                              type="text"
                              className="big-input"
                              value={p.department}
                              onChange={(e) => handleUpdatePerson(idx, 'department', e.target.value)}
                              placeholder="เช่น ผกร.กรย.(ก3)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: VEHICLES & CARETAKER */}
              {activeEditSection === 'vehicles' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ผู้ดูแลรับผิดชอบรถยนต์หลังจากเลิกงาน</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.caretakerName}
                      onChange={(e) => setFormData({ ...formData, caretakerName: e.target.value })}
                      placeholder="เช่น นายศุภวิชญ์ เกาะลอย"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">หมายเลขทะเบียนรถยนต์ กฟภ. ที่นำไปใช้งาน</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        className="big-input"
                        value={newVehicleInput}
                        onChange={(e) => setNewVehicleInput(e.target.value)}
                        placeholder="พิมพ์หมายเลขทะเบียน เช่น 90-2228 นฐ. แล้วกดเพิ่ม"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddVehicle(newVehicleInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="a4-action-btn a4-btn-emerald"
                        onClick={() => handleAddVehicle(newVehicleInput)}
                      >
                        <Plus size={16} /> เพิ่มรถ
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {formData.vehicles.map((v, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            border: '1px solid #c7d2fe',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600
                          }}
                        >
                          <Truck size={14} />
                          <span>{v}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVehicle(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: PROPOSER */}
              {activeEditSection === 'proposer' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ชื่อผู้เสนอเรื่อง</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerName}
                      onChange={(e) => setFormData({ ...formData, proposerName: e.target.value })}
                      placeholder="เช่น นายอนันต์ กาญจนอุปถัมภ์"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตำแหน่งผู้เสนอ</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.proposerPosition}
                      onChange={(e) => setFormData({ ...formData, proposerPosition: e.target.value })}
                      placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                    />
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">วันที่เสนอ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.proposerDate}
                        onChange={(e) => setFormData({ ...formData, proposerDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">เบอร์โทรศัพท์ติดต่อ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="เช่น 10171"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: APPROVER & STAMPS */}
              {activeEditSection === 'approval' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">คำสั่งการอนุมัติ</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.approvalCommand}
                      onChange={(e) => setFormData({ ...formData, approvalCommand: e.target.value })}
                      placeholder="เช่น อนุมัติ"
                    />
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">ชื่อผู้อนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverName}
                        onChange={(e) => setFormData({ ...formData, approverName: e.target.value })}
                        placeholder="เช่น นายธานิน พ่วงบุญมาก"
                      />
                    </div>
                    <div className="big-field-group">
                      <label className="big-label">วันที่อนุมัติ</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.approverDate}
                        onChange={(e) => setFormData({ ...formData, approverDate: e.target.value })}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตำแหน่งผู้อนุมัติ</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.approverPosition}
                      onChange={(e) => setFormData({ ...formData, approverPosition: e.target.value })}
                      placeholder="เช่น อฝ.วบ.(ก3) ปฏิบัติงานแทน ผชก.(ก3)"
                    />
                  </div>

                  <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="big-label" style={{ marginBottom: 0 }}>
                        ตารางเกษียนหนังสือ (มุมขวาล่าง)
                      </span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.hasRoutingStamps}
                          onChange={(e) => setFormData({ ...formData, hasRoutingStamps: e.target.checked })}
                        />
                        <span>แสดงตารางเกษียน</span>
                      </label>
                    </div>

                    {formData.hasRoutingStamps && (
                      <div className="big-grid-3">
                        <div className="big-field-group">
                          <label className="big-label">รฝ.วบ.(ก3) วันที่</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.stampRwWbDate}
                            onChange={(e) => setFormData({ ...formData, stampRwWbDate: e.target.value })}
                            placeholder=""
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">หผ.กร.(ก3) วันที่</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.stampHpKrDate}
                            onChange={(e) => setFormData({ ...formData, stampHpKrDate: e.target.value })}
                            placeholder=""
                          />
                        </div>
                        <div className="big-field-group">
                          <label className="big-label">ชผ.กร.(ก3) วันที่</label>
                          <input
                            type="text"
                            className="big-input"
                            value={formData.stampCpKrDate}
                            onChange={(e) => setFormData({ ...formData, stampCpKrDate: e.target.value })}
                            placeholder=""
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Steppers & Close) */}
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
