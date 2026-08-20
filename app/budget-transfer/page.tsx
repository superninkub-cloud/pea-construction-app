"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, FileText, ArrowRightLeft } from 'lucide-react';

type TransferItem = {
  id: string;
  networkFrom: string;
  categoryFrom: string;
  categoryTo: string;
  amount: number;
};

export default function BudgetTransferPage() {
  const [docNo, setDocNo] = useState('');
  const [date, setDate] = useState('');
  const [wbs, setWbs] = useState('');
  const [projectName, setProjectName] = useState('');
  
  const [transfers, setTransfers] = useState<TransferItem[]>([]);

  const categories = [
    "ค่าแรง",
    "ค่าควบคุมงาน",
    "ค่าขนส่ง",
    "ค่าเบ็ดเตล็ด",
    "ค่าดำเนินการ"
  ];

  const addTransfer = () => {
    setTransfers([
      ...transfers,
      {
        id: Math.random().toString(36).substr(2, 9),
        networkFrom: '',
        categoryFrom: '',
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ArrowRightLeft className="text-blue-600" />
          โปรแกรมทำเอกสารโอนงบค่าใช้จ่ายหน้างาน
        </h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Save size={20} />
          <span>บันทึกเอกสาร</span>
        </button>
      </div>

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
            ยังไม่มีรายการโอนงบประมาณ กรุณากด "เพิ่มรายการ"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-2 border">โครงข่าย (Network)</th>
                  <th className="p-2 border">โอนจาก (ค่าใช้จ่าย)</th>
                  <th className="p-2 border">ไปเป็น (ค่าใช้จ่าย)</th>
                  <th className="p-2 border text-right">จำนวนเงิน (บาท)</th>
                  <th className="p-2 border text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, index) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-2">
                      <input 
                        type="text"
                        className="w-full border-gray-300 rounded border p-1"
                        placeholder="เช่น 6001381477"
                        value={t.networkFrom}
                        onChange={(e) => updateTransfer(t.id, 'networkFrom', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <select 
                        className="w-full border-gray-300 rounded border p-1"
                        value={t.categoryFrom}
                        onChange={(e) => updateTransfer(t.id, 'categoryFrom', e.target.value)}
                      >
                        <option value="">-- เลือก --</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                      <select 
                        className="w-full border-gray-300 rounded border p-1"
                        value={t.categoryTo}
                        onChange={(e) => updateTransfer(t.id, 'categoryTo', e.target.value)}
                      >
                        <option value="">-- เลือก --</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
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
                  <td colSpan={3} className="p-2 text-right border">รวมเป็นเงินทั้งสิ้น</td>
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
                3.{index + 1} โอน{t.categoryFrom} โครงข่าย {t.networkFrom} ไปเป็น {t.categoryTo} จำนวน {Number(t.amount).toLocaleString('th-TH')} บาท
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
