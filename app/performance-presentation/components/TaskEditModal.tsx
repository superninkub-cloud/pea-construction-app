"use client";

import React, { useState, useEffect } from "react";
import { PlanTargetItem } from "../types";
import { X, Check, Plus, Edit2, AlertCircle } from "lucide-react";

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PlanTargetItem) => void;
  initialItem?: PlanTargetItem | null;
  memberName: string;
}

export default function TaskEditModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  memberName
}: TaskEditModalProps) {
  const [taskName, setTaskName] = useState("");
  const [accumulatedPercent, setAccumulatedPercent] = useState<string>("80");
  const [targetPercent, setTargetPercent] = useState<string>("100");
  const [remarks, setRemarks] = useState("");
  const [category, setCategory] = useState<
    "115kv" | "22kv" | "close_job" | "office" | "urgent" | "general"
  >("general");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialItem);

  useEffect(() => {
    if (initialItem) {
      setTaskName(initialItem.taskName || "");
      setAccumulatedPercent(
        initialItem.accumulatedPercent !== null && initialItem.accumulatedPercent !== undefined
          ? String(initialItem.accumulatedPercent)
          : ""
      );
      setTargetPercent(
        initialItem.targetPercent !== null && initialItem.targetPercent !== undefined
          ? String(initialItem.targetPercent)
          : "100"
      );
      setRemarks(initialItem.remarks || "");
      setCategory(initialItem.category || "general");
    } else {
      setTaskName("");
      setAccumulatedPercent("80");
      setTargetPercent("100");
      setRemarks("");
      setCategory("general");
    }
    setError("");
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError("กรุณากรอกชื่อรายการแผนงาน");
      return;
    }

    const acc = accumulatedPercent === "" ? null : Number(accumulatedPercent);
    const tgt = targetPercent === "" ? null : Number(targetPercent);

    if (acc !== null && (isNaN(acc) || acc < 0 || acc > 100)) {
      setError("เปอร์เซ็นต์สะสมต้องเป็นตัวเลข 0 - 100");
      return;
    }
    if (tgt !== null && (isNaN(tgt) || tgt < 0 || tgt > 100)) {
      setError("เปอร์เซ็นต์เป้าหมายต้องเป็นตัวเลข 0 - 100");
      return;
    }

    const newItem: PlanTargetItem = {
      id: initialItem?.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      taskName: taskName.trim(),
      accumulatedPercent: acc,
      targetPercent: tgt,
      remarks: remarks.trim() || undefined,
      category
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEdit ? <Edit2 size={18} className="text-amber-400" /> : <Plus size={18} className="text-amber-400" />}
            <div>
              <h3 className="font-bold text-sm">
                {isEdit ? "แก้ไขรายการแผนงานเป้าหมาย" : "เพิ่มรายการแผนงานเป้าหมายใหม่"}
              </h3>
              <p className="text-[11px] text-purple-200">ผู้รับผิดชอบ: {memberName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รายการแผนงาน / โครงการ <span className="text-red-500">*</span>
            </label>
            <textarea
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="ระบุชื่องานก่อสร้าง, ย้ายแนว, ปรับปรุง หรือปิดงาน..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">สะสม (ร้อยละ)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={accumulatedPercent}
                  onChange={(e) => setAccumulatedPercent(e.target.value)}
                  placeholder="เช่น 80"
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold text-slate-800"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">เป้าหมาย/ตัวชี้วัด (ร้อยละ)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={targetPercent}
                  onChange={(e) => setTargetPercent(e.target.value)}
                  placeholder="เช่น 100"
                  className="w-full pl-3 pr-7 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs font-semibold text-purple-700"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 font-bold">
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">หมวดหมู่งาน</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-slate-800 bg-white"
            >
              <option value="115kv">งานสายส่งระบบ 115 kV</option>
              <option value="22kv">งานระบบจำหน่าย 22 kV</option>
              <option value="close_job">งานปิดงานก่อสร้าง (TECO/ส่งมอบ)</option>
              <option value="office">งานบริหารจัดการ / งบลงทุน / พัสดุ</option>
              <option value="urgent">งานเร่งรัดพิเศษ</option>
              <option value="general">งานก่อสร้างทั่วไป</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">หมายเหตุ / ข้อจำกัดหน้างาน</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="เช่น ติดสะพาน, ย้ายแนวให้กรมทาง, รองรับ สฟฟ. ชั่วคราว..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md shadow-purple-700/20 flex items-center gap-1.5"
            >
              <Check size={15} />
              <span>{isEdit ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
