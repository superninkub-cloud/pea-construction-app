"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, ArrowRightLeft, UploadCloud, Loader2 } from 'lucide-react';

type TransferItem = {
  id: string;
  networkFrom: string;
  categoryFrom: string;
  networkTo: string;
  categoryTo: string;
  amount: number;
};

type NetworkDiff = {
  network: string;
  networkName: string;
  differences: Record<string, number>;
};

export default function BudgetTransferPage() {
  const [docNo, setDocNo] = useState('');
  const [date, setDate] = useState('');
  const [wbs, setWbs] = useState('');
  const [projectName, setProjectName] = useState('');
  
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const categories = [
    "ค่าแรง",
    "ค่าควบคุมงาน",
    "ค่าขนส่ง",
    "ค่าเบ็ดเตล็ด",
    "ค่าดำเนินการ"
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('wbs', wbs);

    try {
      const res = await fetch('/api/extract-budget-transfer', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to extract data');
      }

      const data: NetworkDiff[] = await res.json();
      autoCalculateTransfers(data);
    } catch (err: any) {
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF');
    } finally {
      setIsUploading(false);
      // clear the input
      e.target.value = '';
    }
  };

  const autoCalculateTransfers = (data: NetworkDiff[]) => {
    let deficits: { network: string; category: string; amount: number }[] = [];
    let surpluses: { network: string; category: string; amount: number }[] = [];

    data.forEach(net => {
      Object.entries(net.differences).forEach(([cat, amount]) => {
        let normalizedCat = cat.replace('งาน', ''); 
        if (cat.includes('แรง')) normalizedCat = 'ค่าแรง';
        if (cat.includes('ควบคุม')) normalizedCat = 'ค่าควบคุมงาน';
        if (cat.includes('ขนส่ง')) normalizedCat = 'ค่าขนส่ง';
        if (cat.includes('เบ็ดเตล็ด')) normalizedCat = 'ค่าเบ็ดเตล็ด';
        if (cat.includes('ดำเนินการ')) normalizedCat = 'ค่าดำเนินการ';

        // Only process known categories (exclude ค่าพัสดุ etc.)
        if (categories.includes(normalizedCat)) {
          if (amount < 0) {
            deficits.push({ network: net.network, category: normalizedCat, amount: Math.abs(amount) });
          } else if (amount > 0) {
            surpluses.push({ network: net.network, category: normalizedCat, amount: amount });
          }
        }
      });
    });

    const newTransfers: TransferItem[] = [];
    
    // Greedy match
    for (let d of deficits) {
      let needed = d.amount;
      
      for (let s of surpluses) {
        if (needed <= 0.001) break;
        if (s.amount <= 0.001) continue;

        const transferAmount = Math.min(needed, s.amount);
        
        newTransfers.push({
          id: Math.random().toString(36).substr(2, 9),
          networkFrom: s.network,
          categoryFrom: s.category,
          networkTo: d.network,
          categoryTo: d.category,
          amount: Number(transferAmount.toFixed(2))
        });

        needed -= transferAmount;
        s.amount -= transferAmount;
      }
    }
    
    setTransfers(newTransfers);
  };

  const addTransfer = () => {
    setTransfers([
      ...transfers,
      {
        id: Math.random().toString(36).substr(2, 9),
        networkFrom: '',
        categoryFrom: '',
        networkTo: '',
        categoryTo: '',
        amount: 0
      }
    ]);
  };

  const updateTransfer = (id: string, field: keyof TransferItem, value: string | number) => {
    setTransfers(transfers.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const removeTransfer = (id: string) => {
    setTransfers(transfers.filter(t => t.id !== id));
  };

  const totalAmount = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ArrowRightLeft className="text-blue-600" />
          โปรแกรมทำเอกสารโอนงบค่าใช้จ่ายหน้างาน
        </h1>
        <div className="flex gap-2">
          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50">
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
            <span>{isUploading ? 'กำลังประมวลผล AI...' : 'อัพโหลด PDF ZPSR018'}</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Save size={20} />
            <span>บันทึกเอกสาร</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
          <FileText size={18} />
          ข้อมูลเอกสาร
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่เอกสาร</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="เช่น ก.3 กยร.(กร)-"
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขงาน (WBS)</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="เช่น P-TDD02.3-I-LYAIA.0015"
              value={wbs}
              onChange={(e) => setWbs(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่องาน</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="เช่น งานปรับปรุงระบบจำหน่าย 22 เควี..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ArrowRightLeft size={18} />
            รายการขอโอนงบประมาณ
          </h2>
          <button 
            onClick={addTransfer}
            className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-md flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            เพิ่มรายการ
          </button>
        </div>

        {transfers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ยังไม่มีรายการโอนงบประมาณ กรุณากด &quot;เพิ่มรายการ&quot; หรืออัพโหลด PDF เพื่อคำนวณอัตโนมัติ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-2 border" colSpan={2}>โอนจาก (Surplus)</th>
                  <th className="p-2 border" colSpan={2}>ไปเป็น (Deficit)</th>
                  <th className="p-2 border text-right" rowSpan={2}>จำนวนเงิน (บาท)</th>
                  <th className="p-2 border text-center" rowSpan={2}>จัดการ</th>
                </tr>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-2 border">โครงข่าย</th>
                  <th className="p-2 border">ค่าใช้จ่าย</th>
                  <th className="p-2 border">โครงข่าย</th>
                  <th className="p-2 border">ค่าใช้จ่าย</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, index) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-2 border-r">
                      <input 
                        type="text"
                        className="w-full border-gray-300 rounded border p-1"
                        placeholder="เช่น 6001381477"
                        value={t.networkFrom}
                        onChange={(e) => updateTransfer(t.id, 'networkFrom', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r">
                      <select 
                        className="w-full border-gray-300 rounded border p-1"
                        value={t.categoryFrom}
                        onChange={(e) => updateTransfer(t.id, 'categoryFrom', e.target.value)}
                      >
                        <option value="">-- เลือก --</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-r">
                      <input 
                        type="text"
                        className="w-full border-gray-300 rounded border p-1"
                        placeholder="เช่น 6001381477"
                        value={t.networkTo}
                        onChange={(e) => updateTransfer(t.id, 'networkTo', e.target.value)}
                      />
                    </td>
                    <td className="p-2 border-r">
                      <select 
                        className="w-full border-gray-300 rounded border p-1"
                        value={t.categoryTo}
                        onChange={(e) => updateTransfer(t.id, 'categoryTo', e.target.value)}
                      >
                        <option value="">-- เลือก --</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-r">
                      <input 
                        type="number"
                        className="w-full border-gray-300 rounded border p-1 text-right"
                        placeholder="0.00"
                        value={t.amount || ''}
                        onChange={(e) => updateTransfer(t.id, 'amount', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => removeTransfer(t.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={4} className="p-2 text-right border">รวมเป็นเงินทั้งสิ้น</td>
                  <td className="p-2 text-right border text-blue-600">{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="border"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {transfers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">สรุปข้อพิจารณา (ข้อความสำหรับพิมพ์ลงในเอกสาร)</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm space-y-2 leading-relaxed">
            {transfers.map((t, index) => (
              <div key={t.id}>
                3.{index + 1} โอน{t.categoryFrom} โครงข่าย {t.networkFrom} ไปเป็น {t.categoryTo} โครงข่าย {t.networkTo} จำนวน {Number(t.amount).toLocaleString('th-TH')} บาท
              </div>
            ))}
            <div className="font-semibold mt-4 pt-2 border-t">
              รวมเป็นเงินโอนทั้งสิ้น {totalAmount.toLocaleString('th-TH')} บาท
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
