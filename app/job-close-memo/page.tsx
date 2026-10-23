"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileText,
  Printer,
  Copy,
  Sparkles,
  Download,
  Calendar,
  Plus,
  Trash2,
  Search,
  Check,
  UserCheck,
  RotateCcw,
  Building,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import './job-close.css';
import {
  JobCloseFormData,
  JobCloseItem,
  SAMPLE_JOB_CLOSE_DATA,
  POPULAR_WORK_CATEGORIES,
  POPULAR_DESTINATIONS,
  toThaiNumerals,
  toArabicNumerals,
  getTodayThaiDate,
  generateJobCloseMemoPlainText,
  generateJobCloseWordDocument
} from './jobCloseUtils';
import TopBar from '../components/TopBar';
import { supabase } from '../../lib/supabaseClient';

type EditSectionKey = 'header' | 'content' | 'jobs' | 'signer' | null;

interface SectionMeta {
  key: EditSectionKey;
  title: string;
  shortName: string;
  icon: any;
}

const SECTIONS_META: SectionMeta[] = [
  { key: 'header', title: '1. ข้อมูลส่วนหัวบันทึกข้อความ', shortName: 'ส่วนหัว', icon: FileText },
  { key: 'content', title: '2. ข้อความนำส่งและสถานะความพร้อม', shortName: 'ข้อความนำส่ง', icon: Building },
  { key: 'jobs', title: '3. รายการงานที่แจ้งปิด (WBS)', shortName: 'รายการ WBS', icon: Briefcase },
  { key: 'signer', title: '4. ผู้ลงนาม (อก.รย.)', shortName: 'ผู้ลงนาม', icon: UserCheck },
];

export default function JobCloseMemoPage() {
  const [formData, setFormData] = useState<JobCloseFormData>(SAMPLE_JOB_CLOSE_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [activeEditSection, setActiveEditSection] = useState<EditSectionKey>(null);
  const [isThaiNum, setIsThaiNum] = useState<boolean>(false);

  // Supabase projects database
  const [dbProjects, setDbProjects] = useState<Array<{ wbs: string; name: string }>>([]);
  const [dbSearch, setDbSearch] = useState<string>('');
  const [isSearchingDb, setIsSearchingDb] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pea_job_close_form');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.subject) {
          if (!parsed.docTo || parsed.docTo === '-') {
            parsed.docTo = 'กบฟ.(ก3)';
          }
          if (!parsed.salutation) {
            parsed.salutation = 'อก.บฟ.(ก3)';
          }
          if (!parsed.docNo || parsed.docNo.includes('2383') || parsed.docNo.includes('2568') || parsed.docNo.includes('คชย')) {
            parsed.docNo = 'ก.3 กรย.(กร)';
          }
          if (parsed.docDate && (parsed.docDate.includes('12 ก.ค.') || parsed.docDate.includes('ก.ค.') || parsed.docDate.includes('2568') || parsed.docDate.includes('๒๕๖๘'))) {
            parsed.docDate = '';
          }
          setFormData(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading stored job close form:', e);
    }
    fetchProjects();
  }, []);

  const handleAutoCompileSubject = () => {
    const count = formData.jobs.length;
    const countStr = isThaiNum ? toThaiNumerals(count) : count.toString();
    setFormData(prev => ({
      ...prev,
      subject: `ขอนำส่งรายงานปิด กส.3 จำนวน ${countStr} งาน`
    }));
    showToast(`✓ ประกอบชื่อเรื่องตามจำนวนงาน (${countStr} งาน) แล้ว`);
  };

  useEffect(() => {
    try {
      localStorage.setItem('pea_job_close_form', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
    }
  }, [formData]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('wbs, name')
        .order('wbs', { ascending: true });

      if (!error && data) {
        setDbProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects from Supabase:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลกลับเป็นตัวอย่างบันทึกแจ้งปิดงานตามหนังสือจริงใช่หรือไม่?')) {
      setFormData(SAMPLE_JOB_CLOSE_DATA);
      try {
        localStorage.removeItem('pea_job_close_form');
      } catch (e) {}
      showToast('✓ รีเซ็ตข้อมูลเป็นตัวอย่างหนังสือจริงเรียบร้อย');
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

  const handleToggleNumerals = () => {
    const nextState = !isThaiNum;
    setIsThaiNum(nextState);
    const convert = nextState ? toThaiNumerals : toArabicNumerals;
    setFormData(prev => ({
      ...prev,
      docNo: convert(prev.docNo),
      docDate: convert(prev.docDate),
      subject: convert(prev.subject),
      workCategory: convert(prev.workCategory),
      completionText: convert(prev.completionText),
      signerDate: convert(prev.signerDate),
      jobs: prev.jobs.map(job => ({
        ...job,
        projectName: convert(job.projectName),
        wbsNo: convert(job.wbsNo)
      }))
    }));
    showToast(nextState ? '✓ แปลงเป็นเลขไทย (1 2 3) แล้ว' : '✓ แปลงเป็นเลขอารบิก (1 2 3) แล้ว');
  };

  const handleAddJob = (initial?: Partial<JobCloseItem>) => {
    const newJob: JobCloseItem = {
      id: `job-${Date.now()}`,
      projectName: initial?.projectName || '',
      wbsNo: initial?.wbsNo || ''
    };
    setFormData(prev => {
      const updatedJobs = [...prev.jobs, newJob];
      const thaiCount = toThaiNumerals(updatedJobs.length);
      return {
        ...prev,
        jobs: updatedJobs,
        subject: `ขอนำส่งรายงานปิด กส.3 จำนวน ${thaiCount} งาน`
      };
    });
    showToast('✓ เพิ่มรายการงานแล้ว');
  };

  const handleRemoveJob = (index: number) => {
    if (formData.jobs.length <= 1) {
      showToast('⚠️ ต้องมีงานอย่างน้อย 1 รายการ');
      return;
    }
    setFormData(prev => {
      const updatedJobs = prev.jobs.filter((_, i) => i !== index);
      const thaiCount = toThaiNumerals(updatedJobs.length);
      return {
        ...prev,
        jobs: updatedJobs,
        subject: `ขอนำส่งรายงานปิด กส.3 จำนวน ${thaiCount} งาน`
      };
    });
  };

  const handleUpdateJob = (index: number, field: keyof JobCloseItem, val: string) => {
    setFormData(prev => {
      const copy = [...prev.jobs];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, jobs: copy };
    });
  };

  const handleCopyMemo = async () => {
    const plainText = generateJobCloseMemoPlainText(formData);
    const html = generateJobCloseWordDocument(formData);
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
    const content = generateJobCloseWordDocument(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanWbs = formData.jobs[0]?.wbsNo?.replace(/[^a-zA-Z0-9]/g, '_') || 'PEA';
    link.download = `บันทึกแจ้งปิดงาน_กส3_${cleanWbs}.doc`;
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
      <TopBar title="โปรแกรมบันทึกแจ้งปิดงาน (กส.3)" />

      <div className="a4-wrapper">
        {/* Sticky Action Toolbar */}
        <div className="a4-action-bar">
          <div className="a4-action-left">
            <div className="a4-title-tag">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>บันทึกแจ้งปิดงาน (กส.3)</span>
            </div>
            <div className="a4-preset-group">
              <button
                type="button"
                className="a4-preset-chip"
                onClick={handleReset}
                title="รีเซ็ตเป็นตัวอย่างหนังสือจริง"
              >
                <RotateCcw size={13} /> คืนค่าตัวอย่างเดิม
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
                        placeholder="เช่น กรย.(ก3)"
                      />
                    </td>
                    <td style={{ width: '8%', fontWeight: 'bold' }}>ถึง</td>
                    <td style={{ width: '42%' }}>
                      <input
                        type="text"
                        className="a4-live-input a4-var-spot yellow"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="เช่น กบฟ.(ก3)"
                        title="ถึง (หน่วยงานปลายทาง)"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>ที่</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="a4-live-input a4-var-spot orange"
                          style={{ flex: 1, fontWeight: 500 }}
                          value={formData.docNo}
                          onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="เช่น ก.3 กรย.(กร)"
                          title="เลขที่หนังสือ (จุดที่ต้องแก้ไขแต่ละครั้ง)"
                        />
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>วันที่</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          className="a4-live-input a4-var-spot orange"
                          style={{ flex: 1, fontWeight: 500 }}
                          value={formData.docDate}
                          onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder=""
                          title="วันที่ในหนังสือ (จุดที่ต้องแก้ไขแต่ละครั้ง)"
                        />
                        <button
                          type="button"
                          className="no-print var-quick-opt-btn"
                          style={{ fontSize: '10px', padding: '2px 6px', whiteSpace: 'nowrap' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetTodayDocDate();
                          }}
                          title="ใส่วันที่ปัจจุบัน"
                        >
                          📅 วันนี้
                        </button>
                      </div>
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
                        placeholder="เช่น อก.บฟ.(ก3)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. BODY CONTENT SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('content')}
              title="คลิกเพื่อแก้ไขเนื้อหาการแจ้งปิดงาน"
              style={{ marginTop: '14pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขข้อความการนำส่งและสถานะความพร้อม
              </div>

              <p className="a4-text-indent" style={{ lineHeight: 1.6, textAlign: 'justify' }}>
                ด้วย {formData.docFrom || 'กรย.(ก3)'} ได้ดำเนินการ{' '}
                <span
                  className="a4-var-spot blue cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setActiveEditSection('content'); }}
                  title="คลิกเพื่อแก้ไขประเภทงาน"
                >
                  {formData.workCategory}
                </span>{' '}
                <span
                  className="a4-var-spot green cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setActiveEditSection('content'); }}
                  title="คลิกเพื่อแก้ไขสถานะความพร้อม"
                >
                  {formData.completionText}
                </span>
              </p>
            </div>

            {/* 3. JOBS LIST SECTION */}
            <div
              className="a4-section-hoverable"
              onClick={() => setActiveEditSection('jobs')}
              title="คลิกเพื่อแก้ไขรายการงานที่แจ้งปิด"
              style={{ marginTop: '10pt' }}
            >
              <div className="section-edit-badge">
                <Edit3 size={12} /> จิ้มแก้ไขรายการงาน WBS ({formData.jobs.length} งาน)
              </div>

              {formData.jobs.length === 1 ? (
                <p className="a4-text-indent" style={{ lineHeight: 1.6, fontWeight: 500 }}>
                  <span
                    className="a4-var-spot blue cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setActiveEditSection('jobs'); }}
                    title="คลิกเพื่อแก้ไขชื่องาน"
                  >
                    {formData.jobs[0].projectName || '(ไม่ได้ระบุชื่องาน)'}
                  </span>{' '}
                  หมายเลขงาน (WBS) :{' '}
                  <span
                    className="a4-var-spot orange cursor-pointer"
                    style={{ fontWeight: 'bold' }}
                    onClick={(e) => { e.stopPropagation(); setActiveEditSection('jobs'); }}
                    title="คลิกเพื่อแก้ไขหมายเลขงาน WBS"
                  >
                    {formData.jobs[0].wbsNo || '..................'}
                  </span>
                </p>
              ) : (
                <div style={{ marginBottom: '10pt' }}>
                  {formData.jobs.map((job, idx) => (
                    <div key={job.id} style={{ textIndent: '2.5cm', marginBottom: '5pt', lineHeight: 1.6 }}>
                      {isThaiNum ? toThaiNumerals(idx + 1) : (idx + 1)}.{' '}
                      <span
                        className="a4-var-spot blue cursor-pointer"
                        style={{ fontWeight: 500 }}
                        onClick={(e) => { e.stopPropagation(); setActiveEditSection('jobs'); }}
                      >
                        {job.projectName}
                      </span>{' '}
                      หมายเลขงาน (WBS) :{' '}
                      <span
                        className="a4-var-spot orange cursor-pointer"
                        style={{ fontWeight: 'bold' }}
                        onClick={(e) => { e.stopPropagation(); setActiveEditSection('jobs'); }}
                      >
                        {job.wbsNo}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="a4-text-indent" style={{ marginTop: '16pt', marginBottom: '24pt' }}>
                <span
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setActiveEditSection('content'); }}
                  title="คลิกเพื่อแก้ไขข้อความปิดท้าย"
                >
                  {formData.closingStatement || 'จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป'}
                </span>
              </p>
            </div>

            {/* 4. SIGNER SECTION */}
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
                <div style={{ height: '36px' }}></div>
                <div style={{ fontWeight: 'normal' }}>({formData.signerName || '...................................................'})</div>
                <div style={{ fontSize: '13pt', color: '#334155', marginTop: '2pt' }}>
                  {formData.signerPosition || '...................................................'}
                </div>
                {formData.signerDate && (
                  <div style={{ fontSize: '12pt', color: '#64748b', marginTop: '2pt' }}>{formData.signerDate}</div>
                )}
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
                  const Icon = meta?.icon || FileText;
                  return (
                    <>
                      <Icon size={22} className="text-emerald-400" />
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
                  <div style={{ fontSize: '12px', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px' }}>
                    📌 <strong>จุดที่ต้องระบุใหม่แต่ละครั้ง:</strong> เลขที่หนังสือ และ วันที่ออกหนังสือ
                  </div>

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
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docFrom: 'กรย.(ก3)' })}
                        >
                          📌 กรย.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docFrom: 'ผกร.' })}
                        >
                          📌 ผกร.
                        </button>
                      </div>
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">ถึง (หน่วยงานปลายทาง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docTo}
                        onChange={(e) => setFormData({ ...formData, docTo: e.target.value })}
                        placeholder="เช่น กบฟ.(ก3)"
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กบฟ.(ก3)', salutation: 'อก.บฟ.(ก3)' })}
                        >
                          📌 กบฟ.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กผง.(ก3)', salutation: 'อก.ผง.(ก3)' })}
                        >
                          📌 กผง.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กบภ.(ก3)', salutation: 'อก.บภ.(ก3)' })}
                        >
                          📌 กบภ.(ก3)
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docTo: 'กรย.(ก3)', salutation: 'อก.รย.(ก3)' })}
                        >
                          📌 กรย.(ก3)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="big-grid-2">
                    <div className="big-field-group">
                      <label className="big-label">เลขที่หนังสือ (เปลี่ยนแต่ละครั้ง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docNo}
                        onChange={(e) => setFormData({ ...formData, docNo: e.target.value })}
                        placeholder="เช่น ก.3 กรย.(กร)"
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docNo: 'ก.3 กรย.(กร)- ' })}
                        >
                          📌 ก.3 กรย.(กร)-
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docNo: '' })}
                        >
                          🗑️ ล้างเลขที่ว่าง
                        </button>
                      </div>
                    </div>

                    <div className="big-field-group">
                      <label className="big-label">วันที่ในหนังสือ (เปลี่ยนแต่ละครั้ง)</label>
                      <input
                        type="text"
                        className="big-input"
                        value={formData.docDate}
                        onChange={(e) => setFormData({ ...formData, docDate: e.target.value })}
                        placeholder=""
                      />
                      <div className="var-quick-options">
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={handleSetTodayDocDate}
                        >
                          📅 ใส่วันที่วันนี้
                        </button>
                        <button
                          type="button"
                          className="var-quick-opt-btn"
                          onClick={() => setFormData({ ...formData, docDate: '' })}
                        >
                          🗑️ ล้างวันที่ว่าง
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="big-field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="big-label" style={{ marginBottom: 0 }}>เรื่อง</label>
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
                      placeholder="เช่น อก.บฟ.(ก3)"
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อก.บฟ.(ก3)' })}
                      >
                        📌 อก.บฟ.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อก.ผง.(ก3)' })}
                      >
                        📌 อก.ผง.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อก.บภ.(ก3)' })}
                      >
                        📌 อก.บภ.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, salutation: 'อก.รย.(ก3)' })}
                      >
                        📌 อก.รย.(ก3)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CONTENT */}
              {activeEditSection === 'content' && (
                <div>
                  <div className="big-field-group">
                    <label className="big-label">ประเภทงานก่อสร้าง</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.workCategory}
                      onChange={(e) => setFormData({ ...formData, workCategory: e.target.value })}
                      placeholder="เช่น งานก่อสร้างปรับปรุงระบบสายส่ง 115 kV."
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {POPULAR_WORK_CATEGORIES.map((cat, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, workCategory: cat })}
                          className="a4-action-btn a4-btn-muted"
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ข้อความแสดงสถานะความพร้อม</label>
                    <textarea
                      rows={3}
                      className="big-textarea"
                      value={formData.completionText}
                      onChange={(e) => setFormData({ ...formData, completionText: e.target.value })}
                      placeholder="เช่น แล้วเสร็จพร้อมจ่ายไฟแล้วนั้น จึงขอนำส่งเอกสารปิด กส.3 งานดังนี้"
                    />
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">คำลงท้าย</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.closingStatement}
                      onChange={(e) => setFormData({ ...formData, closingStatement: e.target.value })}
                      placeholder="เช่น จึงเรียนมาเพื่อโปรดพิจารณาและดำเนินการต่อไป"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: JOBS LIST */}
              {activeEditSection === 'jobs' && (
                <div>
                  {/* Supabase WBS Fast Search */}
                  {dbProjects.length > 0 && (
                    <div style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#166534', marginBottom: '8px', fontSize: '13px' }}>
                        <Search size={15} /> ค้นหาโครงการจากฐานข้อมูล WBS (Supabase) เพื่อเพิ่มทันที
                      </div>
                      <input
                        type="text"
                        className="big-input"
                        placeholder="พิมพ์หมายเลข WBS หรือชื่อโครงการเพื่อค้นหา..."
                        value={dbSearch}
                        onChange={(e) => setDbSearch(e.target.value)}
                      />
                      {dbSearch.trim() && (
                        <div style={{ maxHeight: '160px', overflowY: 'auto', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {dbProjects
                            .filter(p => p.wbs.toLowerCase().includes(dbSearch.toLowerCase()) || p.name.toLowerCase().includes(dbSearch.toLowerCase()))
                            .slice(0, 5)
                            .map((p, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  handleAddJob({ projectName: p.name, wbsNo: p.wbs });
                                  setDbSearch('');
                                }}
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '6px',
                                  border: '1px solid #dcfce7',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, color: '#15803d' }}>{p.wbs}</div>
                                  <div style={{ color: '#475569', fontSize: '12px' }}>{p.name}</div>
                                </div>
                                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>+ เพิ่มงานนี้</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="big-label" style={{ marginBottom: 0 }}>
                      รายการงานที่แจ้งปิดทั้งหมด ({formData.jobs.length} รายการ)
                    </label>
                    <button
                      type="button"
                      className="a4-action-btn a4-btn-emerald"
                      onClick={() => handleAddJob()}
                    >
                      <Plus size={15} /> เพิ่มรายการงาน
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.jobs.map((job, idx) => (
                      <div key={job.id} className="big-table-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#15803d' }}>
                            งานลำดับที่ {idx + 1}
                          </span>
                          {formData.jobs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveJob(idx)}
                              className="a4-action-btn"
                              style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px' }}
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          )}
                        </div>
                        <div className="big-field-group">
                          <span style={{ fontSize: '11px', color: '#64748b' }}>ชื่องาน</span>
                          <input
                            type="text"
                            className="big-input"
                            value={job.projectName}
                            onChange={(e) => handleUpdateJob(idx, 'projectName', e.target.value)}
                            placeholder="เช่น งานก่อสร้างระบบสายส่ง 115 kV. CUT&TURN..."
                          />
                        </div>
                        <div className="big-field-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>หมายเลขงาน (WBS)</span>
                          <input
                            type="text"
                            className="big-input"
                            value={job.wbsNo}
                            onChange={(e) => handleUpdateJob(idx, 'wbsNo', e.target.value)}
                            placeholder="เช่น P-TDD02.1-I-PMNT0.0002"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: SIGNER */}
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
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerName: 'นายอนันต์ กาญจนอุปถัมภ์' })}
                      >
                        📌 นายอนันต์ กาญจนอุปถัมภ์
                      </button>
                    </div>
                  </div>

                  <div className="big-field-group">
                    <label className="big-label">ตำแหน่งผู้ลงนาม</label>
                    <input
                      type="text"
                      className="big-input"
                      value={formData.signerPosition}
                      onChange={(e) => setFormData({ ...formData, signerPosition: e.target.value })}
                      placeholder="เช่น รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)"
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerPosition: 'รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)' })}
                      >
                        📌 รก.รย.(ก3) ปฏิบัติงานแทน อก.รย.(ก3)
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerPosition: 'อก.รย.(ก3)' })}
                      >
                        📌 อก.รย.(ก3)
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
                      placeholder=""
                    />
                    <div className="var-quick-options">
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={handleSetTodayDocDate}
                      >
                        📅 ใส่วันที่วันนี้
                      </button>
                      <button
                        type="button"
                        className="var-quick-opt-btn"
                        onClick={() => setFormData({ ...formData, signerDate: '' })}
                      >
                        🗑️ ล้างวันที่ว่าง
                      </button>
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
