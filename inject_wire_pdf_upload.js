const fs = require('fs');

const pageFile = 'app/wire-return/page.tsx';
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add states
const stateInjection = `  const [isExtractingPDF, setIsExtractingPDF] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);`;
code = code.replace('  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);', '  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);\n' + stateInjection);

// 2. Add handlePDFUpload function
const handlePDFUploadFunc = `
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
      return;
    }

    setIsExtractingPDF(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract-wire-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงข้อมูลจาก AI");
      }

      if (data.wires && Array.isArray(data.wires)) {
        // Build new wires based on AI output
        const aiWires = data.wires.map((w: any) => {
          // Attempt to match the type with existing wireDataList to get exact ID if possible
          let matchedType = w.type;
          const found = wireDataList.find(wd => wd.id.toLowerCase() === w.type.toLowerCase() || wd.name.toLowerCase() === w.type.toLowerCase());
          if (found) {
            matchedType = found.id;
          } else {
            // Check for partial matches
            const partial = wireDataList.find(wd => w.type.toUpperCase().includes(wd.id.toUpperCase()) || wd.id.toUpperCase().includes(w.type.toUpperCase()));
            if (partial) matchedType = partial.id;
          }

          return {
            id: Date.now().toString() + Math.random(),
            type: matchedType,
            length: w.length,
            returned_weight: ""
          };
        });

        if (aiWires.length > 0) {
          setEditWires(aiWires);
          alert("AI ดึงข้อมูลเศษสายจาก ZPSR018 สำเร็จ!");
        } else {
          alert("AI ไม่พบข้อมูลเศษสายที่ต้องคืน (หรือยอดส่งคืนหักลบแล้วเท่ากับ 0)");
        }
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsExtractingPDF(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
`;

code = code.replace('  const handleSaveScrap = async () => {', handlePDFUploadFunc + '\n  const handleSaveScrap = async () => {');

// 3. Add AI Upload Button in the Edit Modal
// The edit modal has a <h3> header. Let's find: `<h3 className="text-xl font-bold text-gray-800 flex items-center">`
const uploadButtonUI = `
                <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    ref={fileInputRef} 
                    style={{ display: "none" }} 
                    onChange={handlePDFUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtractingPDF}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      background: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(126, 34, 206, 0.2)"
                    }}
                  >
                    {isExtractingPDF ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <Layers size={16} />
                    )}
                    {isExtractingPDF ? "กำลังอ่าน ZPSR018..." : "ใช้ AI อ่านไฟล์ ZPSR018"}
                  </button>
                </div>
`;

// Insert the button next to the title in the header
code = code.replace(/<h3 className="text-xl font-bold text-gray-800 flex items-center">\s*<Package size=\{24\} className="text-purple-600 mr-2" \/>\s*บันทึกการส่งคืนเศษสาย\s*<\/h3>/, 
  `<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Package size={24} className="text-purple-600 mr-2" />
                  บันทึกการส่งคืนเศษสาย
                </h3>
${uploadButtonUI}
              </div>`
);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('Successfully injected PDF upload logic');
