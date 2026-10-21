"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Printer, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Copy, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  Calendar, 
  ArrowRight, 
  Layers, 
  Check, 
  FileCheck2,
  FileSpreadsheet,
  Download,
  ClipboardCopy,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';
import './account-adjust.css';
import SignatureBox from './SignatureBox';
import {
  AccountAdjustFormData,
  AdjustmentItem,
  SAMPLE_ACCOUNT_ADJUST_DATA,
  formatMoney,
  thaiBahtText,
  getTodayThaiDate,
  POPULAR_SAP_ACCOUNTS,
  PRESET_REASON_TEMPLATES,
  generateMemoPlainText,
  generateTableHtmlForWord,
  generateWordDocumentContent,
  generateTableTsvForExcel
} from './accountAdjustUtils';

export default function AccountAdjustPage() {
  // Main form data state (defaults to sample matching user's image)
  const [formData, setFormData] = useState<AccountAdjustFormData>(SAMPLE_ACCOUNT_ADJUST_DATA);
  const [customSignatureUrl, setCustomSignatureUrl] = useState<string>('');
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'form' | 'word' | 'preview'>('form');
  const [previewPage, setPreviewPage] = useState<'all' | 'memo' | 'table'>('all');
  
  // Toast & copy feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Print mode target
  const [printTarget, setPrintTarget] = useState<'all' | 'memo' | 'table'>('all');

  // Load from LocalStorage if available
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem('pea_account_adjust_form_word');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.items && parsed.items.length > 0) {
          // If the cached form still has the previous sample docNo or docDate, clear them as requested
          if (parsed.docNo && parsed.docNo.includes('๒๘๑๓')) {
            parsed.docNo = '';
          }
          if (parsed.docDate && parsed.docDate.includes('๑๙ ต.ค.')) {
            parsed.docDate = '';
          }
          if (parsed.signerDate && parsed.signerDate.includes('๑๙ ต.ค.')) {
            parsed.signerDate = '';
          }
          // If items contain the previous sample data, clear the values
          parsed.items = parsed.items.map((item: any) => {
            if (
              item.debtDocNo === '1093485692' || 
              item.oldValue === 'P-TDD02.3-I-TARNA.0011' || 
              item.oldAmount === 12400 ||
              item.oldAccountCode === '21920010'
            ) {
              return {
                ...item,
                debtDocNo: '',
                postingDate: '',
                oldAccountCode: '',
                oldValue: '',
                oldAmount: 0,
                newAccountCode: '',
                newValue: '',
                newAmount: 0,
                deptDocNo: '',
                deptPostingDate: '',
              };
            }
            return item;
          });
          setFormData(parsed);
        }
      }
      const savedSig = localStorage.getItem('pea_account_adjust_sig');
      if (savedSig) {
        setCustomSignatureUrl(savedSig);
      }
    } catch (e) {
      console.error('Error loading stored form:', e);
    }
  }, []);

  // Save to LocalStorage
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem('pea_account_adjust_form_word', JSON.stringify(formData));
      if (customSignatureUrl) {
        localStorage.setItem('pea_account_adjust_sig', customSignatureUrl);
      }
      showToast('✓ บันทึกข้อมูลสำเร็จเรียบร้อยแล้ว');
    } catch (e) {
      showToast('⚠️ ไม่สามารถบันทึกลงเบราว์เซอร์ได้');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset to original sample
  const handleResetToSample = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นแบบฟอร์มตัวอย่างเริ่มต้นใช่หรือไม่?')) {
      setFormData(SAMPLE_ACCOUNT_ADJUST_DATA);
      setCustomSignatureUrl('');
      try {
        localStorage.removeItem('pea_account_adjust_form_word');
        localStorage.removeItem('pea_account_adjust_sig');
      } catch (e) {}
      showToast('✓ รีเซ็ตเป็นแบบฟอร์มตัวอย่างสำเร็จรูปแล้ว');
    }
  };

  // Clear all items to start fresh
  const handleClearAll = () => {
    if (confirm('คุณต้องการล้างข้อมูลเพื่อเริ่มกรอกรายการใหม่ทั้งหมดใช่หรือไม่?')) {
      setFormData(prev => ({
        ...prev,
        items: [
          {
            id: `item-${Date.now()}`,
            debtDocNo: '',
            postingDate: getTodayThaiDate('short'),
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
          }
        ]
      }));
      showToast('ล้างข้อมูลเรียบร้อยแล้ว');
    }
  };

  // Quick preset loader
  const handleApplyPreset = (index: number) => {
    const preset = PRESET_REASON_TEMPLATES[index];
    if (!preset) return;

    setFormData(prev => ({
      ...prev,
      memoReason: preset.reason,
      col4HeaderChoice: preset.col4Header,
      col7HeaderChoice: preset.col7Header,
      routingType: preset.routingType,
      items: prev.items.map(item => ({
        ...item,
        oldType: preset.col4Header,
        newType: preset.col7Header,
      }))
    }));
    showToast(`✓ เลือกแม่แบบ: ${preset.title}`);
  };

  // Calculations
  const totalOldAmount = formData.items.reduce((sum, item) => sum + (Number(item.oldAmount) || 0), 0);
  const totalNewAmount = formData.items.reduce((sum, item) => sum + (Number(item.newAmount) || 0), 0);
  const isBalanced = Math.abs(totalOldAmount - totalNewAmount) < 0.01 && totalOldAmount > 0;
  const balanceDiff = Math.abs(totalOldAmount - totalNewAmount);

  // Table row modifiers
  const handleAddItem = () => {
    const newItem: AdjustmentItem = {
      id: `item-${Date.now()}`,
      debtDocNo: '',
      postingDate: getTodayThaiDate('short'),
      oldAccountCode: formData.items[formData.items.length - 1]?.oldAccountCode || '',
      oldType: formData.col4HeaderChoice,
      oldValue: '',
      oldAmount: 0,
      newAccountCode: formData.items[formData.items.length - 1]?.newAccountCode || '',
      newType: formData.col7HeaderChoice,
      newValue: '',
      newAmount: 0,
      deptDocNo: '',
      deptPostingDate: '',
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleDuplicateItem = (index: number) => {
    const target = formData.items[index];
    if (!target) return;
    const duplicated: AdjustmentItem = {
      ...target,
      id: `item-${Date.now()}`,
    };
    const updated = [...formData.items];
    updated.splice(index + 1, 0, duplicated);
    setFormData(prev => ({ ...prev, items: updated }));
    showToast('คัดลอกแถวเรียบร้อย');
  };

  const handleDeleteItem = (index: number) => {
    if (formData.items.length <= 1) {
      showToast('ต้องมีรายการอย่างน้อย 1 รายการ');
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

  const handleSyncAmounts = (index: number) => {
    const item = formData.items[index];
    if (!item) return;
    handleUpdateItem(index, 'newAmount', item.oldAmount);
  };

  const handleSetTodayMemoDate = (type: 'short' | 'thai_num') => {
    const todayStr = getTodayThaiDate(type);
    setFormData(prev => ({
      ...prev,
      docDate: todayStr,
      signerDate: todayStr
    }));
    showToast(`เปลี่ยนวันที่เป็น: ${todayStr}`);
  };

  // ============================================================================
  // DIRECT CLIPBOARD COPY FOR WORD / EXCEL
  // ============================================================================

  // Copy Memo text to clipboard (Rich HTML + Plain Text)
  const handleCopyMemo = async () => {
    const plainText = generateMemoPlainText(formData);
    const html = `
      <div style="font-family: 'TH Sarabun New', 'Cordia New', sans-serif; font-size: 16pt; line-height: 1.4;">
        <p><b>จาก:</b> ${formData.docFrom || ''}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>ถึง:</b> ${formData.docTo || ''}</p>
        <p><b>เลขที่:</b> ${formData.docNo || ''}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>วันที่:</b> ${formData.docDate || ''}</p>
        <p><b>เรื่อง:</b> <b>${formData.subject || 'ขอให้ปรับปรุงรายการทางบัญชี'}</b></p>
        <p style="margin-bottom: 12pt;"><b>เรียน:</b> ${formData.salutation || 'อก.กบฟ.(ก๓)'}</p>
        <p style="text-indent: 40px; text-align: justify;">${formData.memoReason || ''}</p>
        <p style="text-indent: 40px; text-align: justify;">${formData.memoClosing || 'จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป'}</p>
        <div style="margin-top: 40px; text-align: center; width: 300px; margin-left: auto;">
          <p style="margin-bottom: 25px;"><br/></p>
          <p>(${formData.signerName || ''})</p>
          <p>${formData.signerTitle || ''}</p>
          ${formData.signerDate ? `<p style="font-size: 14pt;">${formData.signerDate}</p>` : ''}
        </div>
      </div>
    `;

    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('memo');
      showToast('✓ คัดลอกข้อความบันทึกแล้ว! กด Ctrl+V ใน Microsoft Word ได้ทันที');
    } catch (e) {
      // Fallback
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('memo');
      showToast('✓ คัดลอกข้อความแล้ว (Plain Text)');
    }
  };

  // Copy 10-Column Table for Word
  const handleCopyTable = async () => {
    const tableHtml = generateTableHtmlForWord(formData);
    const plainText = generateTableTsvForExcel(formData);

    try {
      const htmlBlob = new Blob([tableHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('table');
      showToast('✓ คัดลอกตาราง ๑๐ ช่องแล้ว! กด Ctrl+V ใน Microsoft Word จะได้ตาราง Word สมบูรณ์');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('table');
      showToast('✓ คัดลอกตารางแล้ว');
    }
  };

  // Copy Complete Document (Memo + Table)
  const handleCopyAll = async () => {
    const plainText = `${generateMemoPlainText(formData)}\n\n--- ตารางขอปรับปรุงรายการทางบัญชี ---\n\n${generateTableTsvForExcel(formData)}`;
    const fullHtml = generateWordDocumentContent(formData);

    try {
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
      await navigator.clipboard.write([item]);
      setCopiedItem('all');
      showToast('✓ คัดลอกเอกสารทั้งชุดแล้ว! นำไปกด Ctrl+V ใน Word ได้เลย');
    } catch (e) {
      await navigator.clipboard.writeText(plainText);
      setCopiedItem('all');
      showToast('✓ คัดลอกข้อความทั้งหมดแล้ว');
    }
  };

  // Copy for Excel
  const handleCopyExcel = async () => {
    const tsv = generateTableTsvForExcel(formData);
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedItem('excel');
      showToast('✓ คัดลอกข้อมูลตารางสำหรับ Excel แล้ว! นำไปกด Ctrl+V ใน Excel ได้ทันที');
    } catch (e) {
      showToast('⚠️ ไม่สามารถคัดลอกได้');
    }
  };

  // Download .doc file for Microsoft Word
  const handleDownloadWordFile = () => {
    const content = generateWordDocumentContent(formData);
    const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `บันทึกขอปรับปรุงบัญชี_${formData.docNo.replace(/[\\/:*?"<>|]/g, '_') || 'PEA'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ ดาวน์โหลดไฟล์ Microsoft Word (.doc) สำเร็จแล้ว!');
  };

  const handleTriggerPrint = (target: 'all' | 'memo' | 'table') => {
    setPrintTarget(target);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!isClient) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>กำลังโหลดโปรแกรมปรับปรุงบัญชี...</div>;
  }

  // Calculate empty rows needed to fill up the form
  const minRows = 8;
  const emptyRowsCount = Math.max(0, minRows - formData.items.length);

  return (
    <div className="account-adjust-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Sparkles size={16} className="text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="aa-header aa-no-print">
        <div className="aa-header-left">
          <div className="aa-header-icon">
            <Calculator size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <h1 className="aa-header-title">โปรแกรมปรับปรุงบัญชี</h1>
              <span className="aa-badge-active">
                <CheckCircle2 size={13} />
                แบบฟอร์มสำเร็จรูป
              </span>
              <span className="aa-badge-word">
                <Copy size={12} />
                คัดลอกลง Word ได้ทันที
              </span>
            </div>
            <p className="aa-header-sub">
              เปลี่ยนรายละเอียดแค่นิดหน่อย แล้วกดคัดลอก (Copy) ไปวางใน Microsoft Word หรือดาวน์โหลดไฟล์ Word (.doc) ได้ใน 1 คลิก
            </p>
          </div>
        </div>

        <div className="aa-header-actions">
          <button 
            type="button" 
            className="aa-btn aa-btn-secondary"
            onClick={handleResetToSample}
            title="รีเซ็ตกลับเป็นแบบฟอร์มตัวอย่างเริ่มต้นตามภาพ"
          >
            <RotateCcw size={16} />
            รีเซ็ตตัวอย่าง
          </button>

          <button 
            type="button" 
            className="aa-btn aa-btn-word"
            onClick={handleCopyAll}
            title="คัดลอกทั้งบันทึกข้อความและตารางเพื่อนำไปวางใน Word"
          >
            <Copy size={16} />
            คัดลอกทั้งหมดลง Word
          </button>

          <button 
            type="button" 
            className="aa-btn aa-btn-primary"
            onClick={handleDownloadWordFile}
            title="ดาวน์โหลดเป็นไฟล์ Microsoft Word (.doc) เปิดใช้งานได้ทันที"
          >
            <Download size={16} />
            ดาวน์โหลดไฟล์ Word
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="aa-tabs-bar aa-no-print">
        <div className="aa-tabs-group">
          <button
            type="button"
            className={`aa-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <FileCheck2 size={18} />
            ๑. ปรับแต่งข้อมูลและตาราง
          </button>
          <button
            type="button"
            className={`aa-tab-btn ${activeTab === 'word' ? 'active-blue' : ''}`}
            onClick={() => setActiveTab('word')}
          >
            <Copy size={18} />
            ๒. ศูนย์คัดลอกและส่งออกลง Word / Excel
          </button>
          <button
            type="button"
            className={`aa-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={18} />
            ๓. ตัวอย่างเอกสาร & สั่งพิมพ์
          </button>
        </div>

        {/* Right Tab Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            รายการ: <strong>{formData.items.length} รายการ</strong>
          </span>
          <span className={`aa-balance-badge ${isBalanced ? 'ok' : 'warn'}`}>
            {isBalanced ? (
              <>
                <Check size={14} />
                ยอดเงินสมดุล {formatMoney(totalOldAmount)} บาท
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                ยอดเงินไม่เท่ากัน (ผลต่าง {formatMoney(balanceDiff)} บาท)
              </>
            )}
          </span>
        </div>
      </div>

      {/* Preset Banner (Shown in Form Mode) */}
      {activeTab === 'form' && (
        <div className="aa-preset-banner aa-no-print">
          <div className="aa-preset-label">
            <Sparkles size={18} className="text-purple-600" />
            <span>เลือกแม่แบบด่วน (เปลี่ยนรายละเอียดนิดเดียวแล้วใช้ได้ทันที):</span>
          </div>
          <div className="aa-preset-btns">
            {PRESET_REASON_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                className="aa-preset-pill"
                onClick={() => handleApplyPreset(idx)}
              >
                ⚡ {tmpl.title}
              </button>
            ))}
            <button
              type="button"
              className="aa-preset-pill"
              style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
              onClick={handleClearAll}
            >
              🧹 ล้างข้อมูลเริ่มใหม่
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 1: QUICK FORM EDITOR
          ==================================================================== */}
      {activeTab === 'form' && (
        <div className="aa-no-print">
          {/* Card 1: บันทึกข้อความ (Memo Information) */}
          <div className="aa-card">
            <div className="aa-card-header">
              <div className="aa-card-title">
                <FileText className="text-purple-600" size={20} />
                <span>1. ข้อมูลหนังสือบันทึกข้อความ (หน้าแรก)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="aa-btn aa-btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                  onClick={() => handleSetTodayMemoDate('short')}
                >
                  <Calendar size={13} />
                  ใช้วันที่วันนี้
                </button>
                <button
                  type="button"
                  className="aa-btn aa-btn-word"
                  style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                  onClick={handleCopyMemo}
                >
                  <Copy size={13} />
                  คัดลอกข้อความนี้
                </button>
              </div>
            </div>

            <div className="aa-card-body">
              <div className="aa-form-grid-4" style={{ marginBottom: '16px' }}>
                <div className="aa-field">
                  <label className="aa-label">จาก</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.docFrom}
                    onChange={e => setFormData({ ...formData, docFrom: e.target.value })}
                    placeholder="เช่น กรย.(ก๓)"
                  />
                </div>
                <div className="aa-field">
                  <label className="aa-label">ถึง</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.docTo}
                    onChange={e => setFormData({ ...formData, docTo: e.target.value })}
                    placeholder="เช่น กบฟ.(ก๓)"
                  />
                </div>
                <div className="aa-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="aa-label" style={{ margin: 0 }}>เลขที่หนังสือ</label>
                    {formData.docNo && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, docNo: '' }));
                          showToast('ล้างเลขที่หนังสือแล้ว');
                        }}
                        style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                        title="ล้างเลขที่หนังสือ"
                      >
                        ล้าง
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.docNo}
                    onChange={e => setFormData({ ...formData, docNo: e.target.value })}
                    placeholder="เว้นว่างไว้ลงรับ หรือกรอก เช่น ก.๓ กรย.(กร.) ..."
                  />
                </div>
                <div className="aa-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="aa-label" style={{ margin: 0 }}>วันที่</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleSetTodayMemoDate('short')}
                        style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', borderRadius: '4px', cursor: 'pointer' }}
                        title="ใส่วันที่ปัจจุบัน"
                      >
                        ใส่วันนี้
                      </button>
                      {formData.docDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, docDate: '', signerDate: '' }));
                            showToast('ล้างวันที่แล้ว');
                          }}
                          style={{ fontSize: '0.72rem', padding: '1px 6px', background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                          title="ล้างวันที่"
                        >
                          ล้าง
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.docDate}
                    onChange={e => setFormData({ ...formData, docDate: e.target.value })}
                    placeholder="เว้นว่างไว้ลงวันที่ หรือกรอก เช่น ๑๙ ต.ค. ๖๗"
                  />
                </div>
              </div>

              <div className="aa-form-grid-2" style={{ marginBottom: '16px' }}>
                <div className="aa-field">
                  <label className="aa-label">เรื่อง</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="ขอให้ปรับปรุงรายการทางบัญชี"
                  />
                </div>
                <div className="aa-field">
                  <label className="aa-label">เรียน</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.salutation}
                    onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                    placeholder="อก.กบฟ.(ก๓)"
                  />
                </div>
              </div>

              {/* Memo Body / Reason */}
              <div className="aa-field" style={{ marginBottom: '16px' }}>
                <label className="aa-label">
                  <span>ข้อความเหตุผลการขอปรับปรุงบัญชี</span>
                  <span style={{ fontSize: '0.78rem', color: '#6b21a8' }}>
                    *สามารถแก้ไขรายละเอียดข้อความได้อิสระ
                  </span>
                </label>
                <textarea
                  className="aa-textarea"
                  rows={3}
                  value={formData.memoReason}
                  onChange={e => setFormData({ ...formData, memoReason: e.target.value })}
                />
              </div>

              <div className="aa-field" style={{ marginBottom: '16px' }}>
                <label className="aa-label">
                  <span>ข้อความปิดท้าย</span>
                </label>
                <input
                  type="text"
                  className="aa-input"
                  value={formData.memoClosing}
                  onChange={e => setFormData({ ...formData, memoClosing: e.target.value })}
                  placeholder="จึงเรียนมาเพื่อโปรดพิจารณาดำเนินการต่อไป"
                />
              </div>

              {/* Signer Info */}
              <div style={{ backgroundColor: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#6b21a8', marginBottom: '12px' }}>
                  ผู้ลงนามท้ายบันทึกข้อความ
                </div>
                <div className="aa-form-grid-3">
                  <div className="aa-field">
                    <label className="aa-label">ชื่อผู้ลงนาม</label>
                    <input
                      type="text"
                      className="aa-input"
                      value={formData.signerName}
                      onChange={e => setFormData({ ...formData, signerName: e.target.value })}
                      placeholder="นายอนันต์ กาญจนอุปถัมภ์"
                    />
                  </div>
                  <div className="aa-field">
                    <label className="aa-label">ตำแหน่ง</label>
                    <input
                      type="text"
                      className="aa-input"
                      value={formData.signerTitle}
                      onChange={e => setFormData({ ...formData, signerTitle: e.target.value })}
                      placeholder="รก.กรย.(ก๓) ปฏิบัติงานแทน อก.กรย.(ก๓)"
                    />
                  </div>
                  <div className="aa-field">
                    <label className="aa-label">วันที่กำกับลายเซ็น</label>
                    <input
                      type="text"
                      className="aa-input"
                      value={formData.signerDate}
                      onChange={e => setFormData({ ...formData, signerDate: e.target.value })}
                      placeholder="๑๙ ต.ค. ๖๗"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: แบบฟอร์มขอปรับปรุงรายการทางบัญชี (Attachment Table Header) */}
          <div className="aa-card">
            <div className="aa-card-header">
              <div className="aa-card-title">
                <FileSpreadsheet className="text-purple-600" size={20} />
                <span>2. ข้อมูลหัวตารางแบบฟอร์มขอปรับปรุงบัญชี (หน้าสอง)</span>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-word"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                onClick={handleCopyTable}
              >
                <Copy size={13} />
                คัดลอกตารางนี้ลง Word
              </button>
            </div>

            <div className="aa-card-body">
              <div className="aa-form-grid-3" style={{ marginBottom: '18px' }}>
                <div className="aa-field">
                  <label className="aa-label">การไฟฟ้า / หน่วยงาน</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.peaBranch}
                    onChange={e => setFormData({ ...formData, peaBranch: e.target.value })}
                    placeholder="ผกร.กรย.(ก๓)"
                  />
                </div>
                <div className="aa-field">
                  <label className="aa-label">ประเภทธุรกิจ</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                    placeholder="ระบุ หรือเว้นว่างตามต้นฉบับ"
                  />
                </div>
                <div className="aa-field">
                  <label className="aa-label">รายละเอียดค่าใช้จ่ายเดือน</label>
                  <select
                    className="aa-select"
                    value={formData.expenseMonth}
                    onChange={e => setFormData({ ...formData, expenseMonth: e.target.value })}
                  >
                    {[
                      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                    ].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Routing & Department Selection */}
              <div className="aa-form-grid-2">
                <div className="aa-routing-box">
                  <label className="aa-label">
                    <span>ประเภทการปรับปรุง (กล่องมุมขวาบนของแบบฟอร์ม)</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label 
                      className={`aa-radio-card ${formData.routingType === 'wbs' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="routingType"
                        checked={formData.routingType === 'wbs'}
                        onChange={() => setFormData({ ...formData, routingType: 'wbs' })}
                      />
                      <div>
                        <div>[✓] WBS / โครงข่าย - กิจกรรม ส่ง ผบส.</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ใช้สำหรับรายการที่มี WBS หรือ โครงข่ายโครงการก่อสร้าง
                        </div>
                      </div>
                    </label>

                    <label 
                      className={`aa-radio-card ${formData.routingType === 'cost_center' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="routingType"
                        checked={formData.routingType === 'cost_center'}
                        onChange={() => setFormData({ ...formData, routingType: 'cost_center' })}
                      />
                      <div>
                        <div>[✓] ศูนย์ต้นทุน (ส่ง ผบต.)</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ใช้สำหรับกรณีปรับปรุงศูนย์ต้นทุนกับศูนย์ต้นทุน
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="aa-field">
                  <label className="aa-label">หน่วยงานที่ปรับปรุงบัญชี (ปลายทาง)</label>
                  <input
                    type="text"
                    className="aa-input"
                    value={formData.adjustingDept}
                    onChange={e => setFormData({ ...formData, adjustingDept: e.target.value })}
                    placeholder="กบฟ.(ก๓)"
                  />
                  
                  <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.5 }}>
                    <strong>💡 เคล็ดลับการคัดลอกลง Word:</strong>
                    <div style={{ marginTop: '4px' }}>
                      หลังจากกรอกข้อมูลเสร็จ สามารถกดปุ่ม <b>&ldquo;คัดลอกตารางนี้ลง Word&rdquo;</b> ด้านบน แล้วไปเปิด Word กด <b>Ctrl+V</b> ตารางจะถูกสร้างเป็นตาราง Word พร้อมใช้งานทันที!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: รายการในตาราง (Interactive Table Editor) */}
          <div className="aa-card">
            <div className="aa-card-header">
              <div className="aa-card-title">
                <Layers className="text-purple-600" size={20} />
                <span>3. รายการปรับปรุงบัญชี (ตาราง 10 คอลัมน์)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="aa-btn aa-btn-secondary"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      items: [
                        {
                          id: `item-${Date.now()}`,
                          debtDocNo: '',
                          postingDate: '',
                          oldAccountCode: '',
                          oldType: prev.col4HeaderChoice,
                          oldValue: '',
                          oldAmount: 0,
                          newAccountCode: '',
                          newType: prev.col7HeaderChoice,
                          newValue: '',
                          newAmount: 0,
                          deptDocNo: '',
                          deptPostingDate: '',
                        }
                      ]
                    }));
                    showToast('เคลียร์ค่าในตารางเรียบร้อยแล้ว');
                  }}
                  title="เคลียร์ค่าทุกช่องในตารางให้เป็นช่องว่าง"
                >
                  <RotateCcw size={15} />
                  เคลียร์ค่าตาราง
                </button>
                <button
                  type="button"
                  className="aa-btn aa-btn-secondary"
                  onClick={handleCopyExcel}
                >
                  <FileSpreadsheet size={15} />
                  คัดลอกลง Excel
                </button>
                <button
                  type="button"
                  className="aa-btn aa-btn-primary"
                  onClick={handleAddItem}
                >
                  <Plus size={16} />
                  เพิ่มรายการ (+ 1 แถว)
                </button>
              </div>
            </div>

            <div className="aa-card-body">
              {/* Header default choice control */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', padding: '10px 14px', backgroundColor: '#faf5ff', borderRadius: '8px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#6b21a8' }}>ค่าเริ่มต้นหัวช่อง 4 (เดิม):</span>
                  <select
                    className="aa-select"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
                    value={formData.col4HeaderChoice}
                    onChange={e => setFormData({ ...formData, col4HeaderChoice: e.target.value as any })}
                  >
                    <option value="wbs">[✓] WBS</option>
                    <option value="cost_center">[✓] ศูนย์ต้นทุน</option>
                    <option value="network">[✓] โครงข่าย - กิจกรรม</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#6b21a8' }}>ค่าเริ่มต้นหัวช่อง 7 (ใหม่):</span>
                  <select
                    className="aa-select"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
                    value={formData.col7HeaderChoice}
                    onChange={e => setFormData({ ...formData, col7HeaderChoice: e.target.value as any })}
                  >
                    <option value="cost_center">[✓] ศูนย์ต้นทุน</option>
                    <option value="wbs">[✓] WBS</option>
                    <option value="network">[✓] โครงข่าย - กิจกรรม</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="aa-table-responsive">
                <table className="aa-table-edit">
                  <thead>
                    <tr>
                      <th colSpan={6} className="th-old">
                        รายการที่บันทึกบัญชี (เดิม)
                      </th>
                      <th colSpan={4} className="th-new">
                        รายการที่ต้องการแก้ไขปรับปรุงบัญชี
                      </th>
                      <th rowSpan={2} style={{ width: '80px' }}>จัดการ</th>
                    </tr>
                    <tr>
                      <th style={{ width: '45px' }}>ที่</th>
                      <th style={{ width: '130px' }}>1. เลขที่เอกสารตั้งหนี้</th>
                      <th style={{ width: '105px' }}>2. วันที่ผ่าน</th>
                      <th style={{ width: '100px' }}>3. รหัสบัญชี</th>
                      <th style={{ width: '190px' }}>4. ประเภท & รหัสเดิม</th>
                      <th style={{ width: '115px' }}>5. จำนวนเงิน (บาท)</th>
                      <th style={{ width: '100px' }}>6. รหัสบัญชีใหม่</th>
                      <th style={{ width: '190px' }}>7. ประเภท & รหัสใหม่</th>
                      <th style={{ width: '115px' }}>8. จำนวนเงินใหม่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                        {/* 1. เลขที่เอกสารตั้งหนี้ */}
                        <td>
                          <input
                            type="text"
                            className="aa-input-cell"
                            value={item.debtDocNo}
                            onChange={e => handleUpdateItem(index, 'debtDocNo', e.target.value)}
                            placeholder="เลขที่เอกสาร"
                          />
                        </td>
                        {/* 2. วันที่ผ่านรายการ */}
                        <td>
                          <input
                            type="text"
                            className="aa-input-cell"
                            value={item.postingDate}
                            onChange={e => handleUpdateItem(index, 'postingDate', e.target.value)}
                            placeholder="วว/ดด/ปป"
                          />
                        </td>
                        {/* 3. รหัสบัญชีเดิม */}
                        <td>
                          <input
                            type="text"
                            className="aa-input-cell"
                            value={item.oldAccountCode}
                            onChange={e => handleUpdateItem(index, 'oldAccountCode', e.target.value)}
                            placeholder="รหัสบัญชี"
                            list="popularAccountsList"
                          />
                        </td>
                        {/* 4. ประเภท & รหัสเดิม */}
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <select
                              className="aa-select-cell"
                              style={{ width: '80px', flexShrink: 0 }}
                              value={item.oldType}
                              onChange={e => handleUpdateItem(index, 'oldType', e.target.value)}
                            >
                              <option value="wbs">WBS</option>
                              <option value="cost_center">ศ.ต้นทุน</option>
                              <option value="network">โครงข่าย</option>
                            </select>
                            <input
                              type="text"
                              className="aa-input-cell"
                              value={item.oldValue}
                              onChange={e => handleUpdateItem(index, 'oldValue', e.target.value)}
                              placeholder="รหัสเดิม"
                            />
                          </div>
                        </td>
                        {/* 5. จำนวนเงินเดิม */}
                        <td>
                          <input
                            type="number"
                            step="any"
                            className="aa-input-cell"
                            style={{ textAlign: 'right', fontWeight: 600 }}
                            value={item.oldAmount || ''}
                            onChange={e => handleUpdateItem(index, 'oldAmount', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </td>
                        {/* 6. รหัสบัญชีใหม่ */}
                        <td>
                          <input
                            type="text"
                            className="aa-input-cell"
                            value={item.newAccountCode}
                            onChange={e => handleUpdateItem(index, 'newAccountCode', e.target.value)}
                            placeholder="รหัสบัญชีใหม่"
                            list="popularAccountsList"
                          />
                        </td>
                        {/* 7. ประเภท & รหัสใหม่ */}
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <select
                              className="aa-select-cell"
                              style={{ width: '80px', flexShrink: 0 }}
                              value={item.newType}
                              onChange={e => handleUpdateItem(index, 'newType', e.target.value)}
                            >
                              <option value="cost_center">ศ.ต้นทุน</option>
                              <option value="wbs">WBS</option>
                              <option value="network">โครงข่าย</option>
                            </select>
                            <input
                              type="text"
                              className="aa-input-cell"
                              value={item.newValue}
                              onChange={e => handleUpdateItem(index, 'newValue', e.target.value)}
                              placeholder="รหัสใหม่"
                            />
                          </div>
                        </td>
                        {/* 8. จำนวนเงินใหม่ */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <input
                              type="number"
                              step="any"
                              className="aa-input-cell"
                              style={{ textAlign: 'right', fontWeight: 600, color: '#3730a3' }}
                              value={item.newAmount || ''}
                              onChange={e => handleUpdateItem(index, 'newAmount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                            <button
                              type="button"
                              onClick={() => handleSyncAmounts(index)}
                              style={{
                                padding: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                              }}
                              title="คัดลอกจำนวนเงินเดิมมาที่นี่"
                            >
                              =
                            </button>
                          </div>
                        </td>
                        {/* จัดการแถว */}
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(index)}
                              style={{
                                padding: '4px 6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#475569',
                              }}
                              title="ทำสำเนาแถวนี้"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(index)}
                              style={{
                                padding: '4px 6px',
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#ef4444',
                              }}
                              title="ลบแถวนี้"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Data list for account autocomplete */}
              <datalist id="popularAccountsList">
                {POPULAR_SAP_ACCOUNTS.map(acc => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </datalist>

              {/* Summary Bar */}
              <div className="aa-summary-bar">
                <div className="aa-summary-items">
                  <div className="aa-sum-item">
                    <span className="aa-sum-label">รวมยอดเงินเดิม (ช่อง 5):</span>
                    <span className="aa-sum-value purple">{formatMoney(totalOldAmount)} บาท</span>
                  </div>
                  <div className="aa-sum-item">
                    <span className="aa-sum-label">รวมยอดเงินใหม่ (ช่อง 8):</span>
                    <span className="aa-sum-value green">{formatMoney(totalNewAmount)} บาท</span>
                  </div>
                  <div className="aa-sum-item">
                    <span className="aa-sum-label">ตัวหนังสือภาษาไทย:</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                      ({thaiBahtText(totalNewAmount || totalOldAmount)})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="aa-btn aa-btn-word"
                    onClick={() => setActiveTab('word')}
                  >
                    ไปที่ศูนย์คัดลอกลง Word
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: WORD & EXCEL COPY HUB (คัดลอกลง Microsoft Word ได้อย่างง่ายดาย)
          ==================================================================== */}
      {activeTab === 'word' && (
        <div className="aa-no-print">
          {/* Action Cards Grid */}
          <div className="aa-word-grid">
            {/* Card 1: Copy Memo */}
            <div className="aa-word-action-card">
              <div>
                <div className="aa-word-card-top">
                  <div className="aa-word-card-icon blue">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="aa-word-card-title">คัดลอกข้อความบันทึก</h3>
                    <p className="aa-word-card-desc">
                      คัดลอกข้อความหัวกระดาษ เลขที่ วันที่ เหตุผล และผู้ลงนาม นำไปวาง (Ctrl+V) ใน Word ได้ทันที
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-word"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyMemo}
              >
                {copiedItem === 'memo' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'memo' ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความบันทึก'}
              </button>
            </div>

            {/* Card 2: Copy Table */}
            <div className="aa-word-action-card">
              <div>
                <div className="aa-word-card-top">
                  <div className="aa-word-card-icon purple">
                    <TableIcon size={22} />
                  </div>
                  <div>
                    <h3 className="aa-word-card-title">คัดลอกตาราง ๑๐ ช่อง</h3>
                    <p className="aa-word-card-desc">
                      คัดลอกเป็นตาราง Word แท้ๆ พร้อมเส้นกรอบ หัวตาราง ยอดรวม และหมายเหตุ วางใน Word แก้ไขตารางต่อได้เลย
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyTable}
              >
                {copiedItem === 'table' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'table' ? 'คัดลอกแล้ว!' : 'คัดลอกตาราง ๑๐ ช่อง'}
              </button>
            </div>

            {/* Card 3: Download Word File */}
            <div className="aa-word-action-card">
              <div>
                <div className="aa-word-card-top">
                  <div className="aa-word-card-icon blue">
                    <Download size={22} />
                  </div>
                  <div>
                    <h3 className="aa-word-card-title">ดาวน์โหลดเป็นไฟล์ Word (.doc)</h3>
                    <p className="aa-word-card-desc">
                      บันทึกเป็นไฟล์ Word อัตโนมัติ เปิดในโปรแกรม Microsoft Word ได้ทันที ทั้งข้อความและตาราง
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-secondary"
                style={{ width: '100%', justifyContent: 'center', borderColor: '#2563eb', color: '#1d4ed8' }}
                onClick={handleDownloadWordFile}
              >
                <Download size={16} />
                ดาวน์โหลดไฟล์ Word (.doc)
              </button>
            </div>

            {/* Card 4: Copy for Excel */}
            <div className="aa-word-action-card">
              <div>
                <div className="aa-word-card-top">
                  <div className="aa-word-card-icon green">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <h3 className="aa-word-card-title">คัดลอกตารางลง Excel</h3>
                    <p className="aa-word-card-desc">
                      คัดลอกข้อมูลเฉพาะตารางตัวเลข นำไปวางในโปรแกรม Microsoft Excel แยกคอลัมน์อัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-excel"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleCopyExcel}
              >
                {copiedItem === 'excel' ? <Check size={16} /> : <Copy size={16} />}
                {copiedItem === 'excel' ? 'คัดลอกแล้ว!' : 'คัดลอกสำหรับ Excel'}
              </button>
            </div>
          </div>

          {/* Live Preview Box for Memo */}
          <div className="aa-copy-preview-box">
            <div className="aa-copy-preview-header">
              <div className="aa-copy-preview-title">
                <FileText size={18} className="text-blue-600" />
                <span>ตัวอย่างข้อความบันทึก (พร้อมคัดลอก)</span>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                onClick={handleCopyMemo}
              >
                <Copy size={14} />
                คัดลอกส่วนนี้
              </button>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b', fontSize: '15pt', lineHeight: 1.6 }}>
              {generateMemoPlainText(formData)}
            </div>
          </div>

          {/* Live Preview Box for Table */}
          <div className="aa-copy-preview-box">
            <div className="aa-copy-preview-header">
              <div className="aa-copy-preview-title">
                <TableIcon size={18} className="text-purple-600" />
                <span>ตัวอย่างตาราง ๑๐ คอลัมน์ (พร้อมคัดลอกเป็นตาราง Word)</span>
              </div>
              <button
                type="button"
                className="aa-btn aa-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                onClick={handleCopyTable}
              >
                <Copy size={14} />
                คัดลอกตารางนี้
              </button>
            </div>

            <div 
              style={{ overflowX: 'auto', margin: '10px 0' }}
              dangerouslySetInnerHTML={{ __html: generateTableHtmlForWord(formData) }}
            />

            <div style={{ fontSize: '12pt', marginTop: '12px', color: '#334155', lineHeight: 1.5 }}>
              <strong>หมายเหตุ</strong><br/>
              ๑. กรณีปรับปรุงศูนย์ต้นทุนกับศูนย์ต้นทุนให้ทำเครื่องหมาย / ในช่องศูนย์ต้นทุนมุมบนขวา และจัดส่ง ผบต. นอกเหนือจากนี้ให้ส่ง ผบส.<br/>
              ๒. ช่องที่ ๔ ให้ทำเครื่องหมาย / หน้าข้อความที่บันทึกบัญชีไว้ผิด เช่น ผิดศูนย์ต้นทุนให้ทำเครื่องหมาย [/] ศูนย์ต้นทุน และกรอกรหัสศูนย์ต้นทุนในช่องที่ ๔<br/>
              ๓. ช่องที่ ๗ ให้ทำเครื่องหมาย / หน้าข้อความที่ต้องการให้ปรับปรุงบัญชี เช่น ขอปรับปรุงเข้า โครงข่าย-กิจกรรม ให้ทำเครื่องหมาย [/] โครงข่าย-กิจกรรม และกรอกหมายเลขโครงข่าย-กิจกรรม<br/>
              ๔. ให้แนบสำเนาใบสำคัญจ่ายที่บันทึกไว้ผิดบัญชีมาด้วยทุกครั้ง
            </div>
          </div>

          {/* Instruction Card */}
          <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.88rem', lineHeight: 1.6 }}>
            <strong>💡 คำแนะนำการนำไปใส่ใน Microsoft Word:</strong>
            <ol style={{ paddingLeft: '20px', marginTop: '6px', margin: 0 }}>
              <li>กดปุ่ม <b>&ldquo;คัดลอกตาราง ๑๐ ช่อง&rdquo;</b> หรือ <b>&ldquo;คัดลอกข้อความบันทึก&rdquo;</b> ด้านบน</li>
              <li>เปิดโปรแกรม Microsoft Word หรือไฟล์เทมเพลตเอกสารของคุณ</li>
              <li>คลิกตำแหน่งที่ต้องการ แล้วกดปุ่ม <b>Ctrl + V</b> (หรือคลิกขวาเลือก Paste)</li>
              <li>ตารางและข้อความจะปรากฏใน Word ทันที โดยเป็นตารางของ Word ที่คุณสามารถจัดหน้า ปรับความกว้าง หรือแก้ไขตัวอักษรได้อิสระครับ</li>
            </ol>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: DOCUMENT PREVIEW & DIRECT PRINT
          ==================================================================== */}
      {activeTab === 'preview' && (
        <div className="aa-no-print">
          {/* Controls Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#334155' }}>มุมมอง:</span>
              <button
                type="button"
                className={`aa-btn ${previewPage === 'all' ? 'aa-btn-primary' : 'aa-btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => setPreviewPage('all')}
              >
                แสดงทั้ง 2 หน้า
              </button>
              <button
                type="button"
                className={`aa-btn ${previewPage === 'memo' ? 'aa-btn-primary' : 'aa-btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => setPreviewPage('memo')}
              >
                หน้า 1: บันทึกข้อความ
              </button>
              <button
                type="button"
                className={`aa-btn ${previewPage === 'table' ? 'aa-btn-primary' : 'aa-btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={() => setPreviewPage('table')}
              >
                หน้า 2: แบบฟอร์มขอปรับปรุงฯ
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="aa-btn aa-btn-word"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                onClick={handleCopyAll}
              >
                <Copy size={15} />
                คัดลอกลง Word
              </button>
              <button
                type="button"
                className="aa-btn aa-btn-primary"
                onClick={() => handleTriggerPrint(previewPage)}
              >
                <Printer size={16} />
                สั่งพิมพ์หน้านี้ (Print)
              </button>
            </div>
          </div>

          {/* Screen Document Preview */}
          {(previewPage === 'all' || previewPage === 'memo') && (
            <div className="aa-doc-preview-wrapper">
              <div className="aa-memo-preview-header">
                <img src="/pea-logo.png" alt="PEA Logo" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
                  <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
                </div>
              </div>

              <table className="aa-memo-meta-table">
                <tbody>
                  <tr>
                    <td style={{ width: '10%', fontWeight: 'bold' }}>จาก</td>
                    <td style={{ width: '40%' }}>{formData.docFrom || '................................'}</td>
                    <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                    <td style={{ width: '40%' }}>{formData.docTo || '................................'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>เลขที่</td>
                    <td>{formData.docNo || '................................'}</td>
                    <td style={{ fontWeight: 'bold' }}>วันที่</td>
                    <td>{formData.docDate || '................................'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                    <td colSpan={3} style={{ fontWeight: 'bold' }}>{formData.subject || 'ขอให้ปรับปรุงรายการทางบัญชี'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>เรียน</td>
                    <td colSpan={3}>{formData.salutation || 'อก.กบฟ.(ก๓)'}</td>
                  </tr>
                </tbody>
              </table>

              <p className="aa-memo-preview-p">{formData.memoReason}</p>
              <p className="aa-memo-preview-p">{formData.memoClosing}</p>

              <div className="aa-memo-preview-signer">
                <SignatureBox
                  signerName={formData.signerName}
                  signerTitle={formData.signerTitle}
                  signerDate={formData.signerDate}
                  showDigitalSign={formData.showDigitalSign}
                  onToggleDigitalSign={show => setFormData({ ...formData, showDigitalSign: show })}
                  customSignatureUrl={customSignatureUrl}
                  onSaveCustomSignature={url => setCustomSignatureUrl(url)}
                />
              </div>
            </div>
          )}

          {(previewPage === 'all' || previewPage === 'table') && (
            <div className="aa-doc-preview-wrapper" style={{ marginTop: '20px' }}>
              <div style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', marginBottom: '16px' }}>
                แบบฟอร์มขอปรับปรุงรายการทางบัญชี
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', fontSize: '14pt' }}>
                <div>
                  การไฟฟ้า: <b>{formData.peaBranch || 'ผกร.กรย.(ก๓)'}</b>&nbsp;&nbsp;&nbsp;&nbsp;ประเภทธุรกิจ: {formData.businessType || '........................'}<br/>
                  รายละเอียดค่าใช้จ่ายที่ต้องการปรับปรุงบัญชี เดือน: <b>{formData.expenseMonth} {formData.expenseYear}</b>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ border: '1px solid black', padding: '6px 10px', textAlign: 'left', display: 'inline-block', fontSize: '12pt', minWidth: '220px' }}>
                    <div>{formData.routingType === 'cost_center' ? '[✓]' : '[ ]'} ศูนย์ต้นทุน</div>
                    <div>{formData.routingType === 'wbs' ? '[✓]' : '[ ]'} WBS / โครงข่าย - กิจกรรม ส่ง ผบส.</div>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '12pt' }}>
                    หน่วยงานที่ปรับปรุงบัญชี: <b>{formData.adjustingDept || 'กบฟ.(ก๓)'}</b>
                  </div>
                </div>
              </div>

              <div 
                style={{ overflowX: 'auto' }}
                dangerouslySetInnerHTML={{ __html: generateTableHtmlForWord(formData) }}
              />

              <div style={{ fontSize: '12pt', marginTop: '14px', lineHeight: 1.5 }}>
                <b>หมายเหตุ</b><br/>
                ๑. กรณีปรับปรุงศูนย์ต้นทุนกับศูนย์ต้นทุนให้ทำเครื่องหมาย / ในช่องศูนย์ต้นทุนมุมบนขวา และจัดส่ง ผบต. นอกเหนือจากนี้ให้ส่ง ผบส.<br/>
                ๒. ช่องที่ ๔ ให้ทำเครื่องหมาย / หน้าข้อความที่บันทึกบัญชีไว้ผิด เช่น ผิดศูนย์ต้นทุนให้ทำเครื่องหมาย [/] ศูนย์ต้นทุน และกรอกรหัสศูนย์ต้นทุนในช่องที่ ๔<br/>
                ๓. ช่องที่ ๗ ให้ทำเครื่องหมาย / หน้าข้อความที่ต้องการให้ปรับปรุงบัญชี เช่น ขอปรับปรุงเข้า โครงข่าย-กิจกรรม ให้ทำเครื่องหมาย [/] โครงข่าย-กิจกรรม และกรอกหมายเลขโครงข่าย-กิจกรรม<br/>
                ๔. ให้แนบสำเนาใบสำคัญจ่ายที่บันทึกไว้ผิดบัญชีมาด้วยทุกครั้ง
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          PRINT ONLY VIEWPORT
          ==================================================================== */}
      <div className="aa-print-only">
        {(printTarget === 'all' || printTarget === 'memo') && (
          <div className="aa-doc-preview-wrapper">
            <div className="aa-memo-preview-header">
              <img src="/pea-logo.png" alt="PEA Logo" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '18pt', fontWeight: 'bold', lineHeight: 1.15 }}>การไฟฟ้าส่วนภูมิภาค</div>
                <div style={{ fontSize: '9pt', fontWeight: 'bold' }}>PROVINCIAL ELECTRICITY AUTHORITY</div>
              </div>
            </div>

            <table className="aa-memo-meta-table">
              <tbody>
                <tr>
                  <td style={{ width: '10%', fontWeight: 'bold' }}>จาก</td>
                  <td style={{ width: '40%' }}>{formData.docFrom || '................................'}</td>
                  <td style={{ width: '10%', fontWeight: 'bold' }}>ถึง</td>
                  <td style={{ width: '40%' }}>{formData.docTo || '................................'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เลขที่</td>
                  <td>{formData.docNo || '................................'}</td>
                  <td style={{ fontWeight: 'bold' }}>วันที่</td>
                  <td>{formData.docDate || '................................'}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เรื่อง</td>
                  <td colSpan={3} style={{ fontWeight: 'bold' }}>{formData.subject}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>เรียน</td>
                  <td colSpan={3}>{formData.salutation}</td>
                </tr>
              </tbody>
            </table>

            <p className="aa-memo-preview-p">{formData.memoReason}</p>
            <p className="aa-memo-preview-p">{formData.memoClosing}</p>

            <div className="aa-memo-preview-signer">
              <SignatureBox
                signerName={formData.signerName}
                signerTitle={formData.signerTitle}
                signerDate={formData.signerDate}
                showDigitalSign={formData.showDigitalSign}
                onToggleDigitalSign={() => {}}
                customSignatureUrl={customSignatureUrl}
              />
            </div>
          </div>
        )}

        {(printTarget === 'all' || printTarget === 'table') && (
          <div className="aa-doc-preview-wrapper">
            <div style={{ textAlign: 'center', fontSize: '18pt', fontWeight: 'bold', marginBottom: '16px' }}>
              แบบฟอร์มขอปรับปรุงรายการทางบัญชี
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', fontSize: '14pt' }}>
              <div>
                การไฟฟ้า: <b>{formData.peaBranch || 'ผกร.กรย.(ก๓)'}</b>&nbsp;&nbsp;&nbsp;&nbsp;ประเภทธุรกิจ: {formData.businessType || '........................'}<br/>
                รายละเอียดค่าใช้จ่ายที่ต้องการปรับปรุงบัญชี เดือน: <b>{formData.expenseMonth} {formData.expenseYear}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ border: '1px solid black', padding: '6px 10px', textAlign: 'left', display: 'inline-block', fontSize: '12pt', minWidth: '220px' }}>
                  <div>{formData.routingType === 'cost_center' ? '[✓]' : '[ ]'} ศูนย์ต้นทุน</div>
                  <div>{formData.routingType === 'wbs' ? '[✓]' : '[ ]'} WBS / โครงข่าย - กิจกรรม ส่ง ผบส.</div>
                </div>
                <div style={{ marginTop: '4px', fontSize: '12pt' }}>
                  หน่วยงานที่ปรับปรุงบัญชี: <b>{formData.adjustingDept || 'กบฟ.(ก๓)'}</b>
                </div>
              </div>
            </div>

            <div 
              style={{ overflowX: 'auto' }}
              dangerouslySetInnerHTML={{ __html: generateTableHtmlForWord(formData) }}
            />

            <div style={{ fontSize: '12pt', marginTop: '14px', lineHeight: 1.5 }}>
              <b>หมายเหตุ</b><br/>
              ๑. กรณีปรับปรุงศูนย์ต้นทุนกับศูนย์ต้นทุนให้ทำเครื่องหมาย / ในช่องศูนย์ต้นทุนมุมบนขวา และจัดส่ง ผบต. นอกเหนือจากนี้ให้ส่ง ผบส.<br/>
              ๒. ช่องที่ ๔ ให้ทำเครื่องหมาย / หน้าข้อความที่บันทึกบัญชีไว้ผิด เช่น ผิดศูนย์ต้นทุนให้ทำเครื่องหมาย [/] ศูนย์ต้นทุน และกรอกรหัสศูนย์ต้นทุนในช่องที่ ๔<br/>
              ๓. ช่องที่ ๗ ให้ทำเครื่องหมาย / หน้าข้อความที่ต้องการให้ปรับปรุงบัญชี เช่น ขอปรับปรุงเข้า โครงข่าย-กิจกรรม ให้ทำเครื่องหมาย [/] โครงข่าย-กิจกรรม และกรอกหมายเลขโครงข่าย-กิจกรรม<br/>
              ๔. ให้แนบสำเนาใบสำคัญจ่ายที่บันทึกไว้ผิดบัญชีมาด้วยทุกครั้ง
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
