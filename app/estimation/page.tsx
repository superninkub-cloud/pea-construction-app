"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import estimationDataRaw from "@/lib/estimationData.json";
import { Assembly, EstimationItem, SavedEstimation } from "@/lib/estimationTypes";
import { Save, Plus, Trash2, X } from "lucide-react";

const estimationData = estimationDataRaw as Assembly[];

export default function EstimationPage() {
  const [selectedAssembly, setSelectedAssembly] = useState<string>("");
  const [poleName, setPoleName] = useState("");
  const [items, setItems] = useState<EstimationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<EstimationItem>({ code: "", name: "", unit: "????", qty: 1 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem("pea_role");
    if (role === "admin") {
      setIsAdmin(true);
    }
  }, []);

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
      alert("???????????????????????????????????");
      return;
    }
    setItems([...items, newItem]);
    setNewItem({ code: "", name: "", unit: "????", qty: 1 });
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!poleName) {
      alert("???????????????????????????");
      return;
    }
    if (items.length === 0) {
      alert("?????????????????????????");
      return;
    }

    try {
      const { error } = await supabase
        .from("pole_estimations")
        .insert({
          pole_name: poleName,
          assembly_type: selectedAssembly || "Custom",
          items: items
        });

      if (error) throw error;

      alert("?????????????????????????????????????");
    } catch (error: any) {
      console.error("Error saving estimation:", error);
      alert("????????????????????????: " + error.message);
    }
  };

  const filteredAssemblies = estimationData.filter(a => 
    a.assemblyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">??????????????????????? (?????)</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ?????????????????? <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            placeholder="???? ????????? 1, Pole-A01"
            value={poleName}
            onChange={(e) => setPoleName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ????????????? (Assembly)
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            value={selectedAssembly}
            onChange={handleAssemblyChange}
          >
            <option value="">-- ?????????????????? --</option>
            {estimationData.map((asm, idx) => (
              <option key={idx} value={asm.assemblyName}>
                {asm.assemblyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">?????????????????????</h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-sm flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
            >
              {isAdding ? <><X size={16} /> ??????</> : <><Plus size={16} /> ????????????????</>}
            </button>
          </div>

          {isAdding && (
            <div className="p-4 border-b bg-purple-50 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-600 mb-1">?????????</label>
                <input type="text" className="w-full p-2 text-sm border rounded" value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} />
              </div>
              <div className="flex-[2] min-w-[200px]">
                <label className="block text-xs text-gray-600 mb-1">?????????</label>
                <input type="text" className="w-full p-2 text-sm border rounded" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div className="w-20">
                <label className="block text-xs text-gray-600 mb-1">?????</label>
                <input type="number" min="1" step="0.01" className="w-full p-2 text-sm border rounded" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="w-20">
                <label className="block text-xs text-gray-600 mb-1">?????</label>
                <input type="text" className="w-full p-2 text-sm border rounded" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
              </div>
              <button onClick={handleAddItem} className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
                ?????
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">?????????</th>
                  <th className="px-4 py-3">?????????</th>
                  <th className="px-4 py-3 text-right">?????</th>
                  <th className="px-4 py-3">?????</th>
                  <th className="px-4 py-3 text-center">??????</th>
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
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95"
          >
            <Save size={18} />
            ????????????
          </button>
        </div>
      )}
      {!isAdmin && items.length > 0 && (
        <div className="text-center text-gray-500 text-sm mt-4">
          ????? Admin ????????????????????????????????
        </div>
      )}
    </div>
  );
}
