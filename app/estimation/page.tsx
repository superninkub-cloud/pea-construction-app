"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import estimationDataRaw from "@/lib/estimationData.json";
import { Assembly, EstimationItem, SavedEstimation } from "@/lib/estimationTypes";
import { Save, Plus, Trash2, X } from "lucide-react";

const estimationData = estimationDataRaw as Assembly[];

export default function EstimationPage() {
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [poleName, setPoleName] = useState("");
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState("");
  const [image2Preview, setImage2Preview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<EstimationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<EstimationItem>({ code: "", name: "", unit: "ชิ้น", qty: 1 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("pea_role");
    if (role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressedFile = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressedFile);
      if (imageNumber === 1) {
        setImage1(compressedFile);
        setImage1Preview(previewUrl);
      } else {
        setImage2(compressedFile);
        setImage2Preview(previewUrl);
      }
    }
  };

  const handleAssemblyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const asmName = e.target.value;
    setSelectedAssembly(asmName);
    
    if (asmName) {
      const found = estimationData.find(a => a.assemblyName === asmName);
      if (found) {
        setItems(JSON.parse(JSON.stringify(found.items)));
      }
    } else {
      setItems([]);
    }
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const newItems = [...items];
    newItems[index].qty = newQty;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleAddItem = () => {
    if (!newItem.code || !newItem.name) {
      alert("กรุณากรอกรหัสและชื่อพัสดุให้ครบถ้วน");
      return;
    }
    setItems([...items, newItem]);
    setNewItem({ code: "", name: "", unit: "ชิ้น", qty: 1 });
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!projectName) {
      alert("กรุณาระบุชื่อโครงการ");
      return;
    }
    if (!poleName) {
      alert("กรุณาระบุชื่อหรือเบอร์เสาไฟ");
      return;
    }
    if (items.length === 0) {
      alert("ไม่มีรายการพัสดุให้บันทึก");
      return;
    }

    setIsSaving(true);
    try {
      let img1Url = null;
      let img2Url = null;

      if (image1) {
        const fileExt = image1.name.split(".").pop();
        const fileName = `estimation_${Date.now()}_1.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("project_images")
          .upload(fileName, image1);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("project_images").getPublicUrl(fileName);
        img1Url = data.publicUrl;
      }

      if (image2) {
        const fileExt = image2.name.split(".").pop();
        const fileName = `estimation_${Date.now()}_2.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("project_images")
          .upload(fileName, image2);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("project_images").getPublicUrl(fileName);
        img2Url = data.publicUrl;
      }

      const { error } = await supabase
        .from("pole_estimations")
        .insert({
          project_name: projectName,
          pole_name: poleName,
          assembly_type: selectedAssembly || "Custom",
          items: items,
          image1_url: img1Url,
          image2_url: img2Url
        });

      if (error) {
        throw error;
      }

      alert("บันทึกข้อมูลการประมาณการเรียบร้อยแล้ว");
      setPoleName("");
      setImage1(null);
      setImage2(null);
      setImage1Preview("");
      setImage2Preview("");
    } catch (error: any) {
      console.error("Error saving estimation:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้ (ตรวจสอบว่ามีคอลัมน์ project_name ในฐานข้อมูลแล้วหรือยัง): " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAssemblies = estimationData.filter(a => 
    a.assemblyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">โปรแกรมประมาณการอุปกรณ์ (เสาไฟ)</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อโครงการ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            placeholder="เช่น โครงการก่อสร้างระบบสายส่งรองรับ สฟ.กาญจนบุรี 5"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อหรือเบอร์เสาไฟ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            placeholder="เช่น เสาต้นที่ 1, Pole-A01"
            value={poleName}
            onChange={(e) => setPoleName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชนิดชุดประกอบ (Assembly)
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={selectedAssembly}
            onChange={handleAssemblyChange}
          >
            <option value="">-- เลือกชนิดชุดประกอบ --</option>
            {estimationData.map((asm, idx) => (
              <option key={idx} value={asm.assemblyName}>
                {asm.assemblyName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปเสาต้นที่ 1</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 1)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {image1Preview && <img src={image1Preview} alt="Preview 1" className="mt-3 h-40 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปเสาต้นที่ 2</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 2)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {image2Preview && <img src={image2Preview} alt="Preview 2" className="mt-3 h-40 w-full object-cover rounded-lg border border-gray-200 shadow-sm" />}
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">รายการวัสดุที่ต้องใช้</h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-sm flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
            >
              {isAdding ? <><X size={16} /> ยกเลิก</> : <><Plus size={16} /> เพิ่มรายการอื่นๆ</>}
            </button>
          </div>

          {isAdding && (
            <div className="p-4 border-b bg-purple-50 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-600 mb-1">รหัสพัสดุ</label>
                <input type="text" className="w-full p-2 text-sm border rounded" value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} />
              </div>
              <div className="flex-[2] min-w-[200px]">
                <label className="block text-xs text-gray-600 mb-1">ชื่อพัสดุ</label>
                <input type="text" className="w-full p-2 text-sm border rounded" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="w-20">
                <label className="block text-xs text-gray-600 mb-1">จำนวน</label>
                <input type="number" min="1" step="0.01" className="w-full p-2 text-sm border rounded" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="w-20">
                <label className="block text-xs text-gray-600 mb-1">หน่วย</label>
                <input type="text" className="w-full p-2 text-sm border rounded" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
              </div>
              <button onClick={handleAddItem} className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
                เพิ่ม
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">รหัสพัสดุ</th>
                  <th className="px-4 py-3">ชื่อพัสดุ</th>
                  <th className="px-4 py-3 text-right">จำนวน</th>
                  <th className="px-4 py-3">หน่วย</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{item.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-right">
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-20 text-right border rounded p-1"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(idx, parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdmin && items.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all active:scale-95 ${
              isSaving ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 shadow-purple-200 hover:bg-purple-700"
            }`}
          >
            <Save size={18} />
            {isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      )}
      {!isAdmin && items.length > 0 && (
        <div className="text-center text-gray-500 text-sm mt-4">
          เฉพาะ Admin เท่านั้นที่สามารถบันทึกข้อมูลได้
        </div>
      )}
    </div>
  );
}
