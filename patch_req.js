const fs = require('fs');

let content = fs.readFileSync('app/gas-report/page.tsx', 'utf-8');

// 1. Add personnelList state
content = content.replace(
  '  const [notes, setNotes] = useState("");',
  `  const [notes, setNotes] = useState("");
  const [personnelList, setPersonnelList] = useState<any[]>([]);`
);

// 2. Fetch personnel in useEffect
content = content.replace(
  `  useEffect(() => {
    // When plate changes, auto-fill driver
    if (selectedPlate) {
      const v = driversList.find(d => d.plate === selectedPlate);
      if (v) {
        setDriverName(v.driver);
      }
    }
  }, [selectedPlate]);`,
  `  useEffect(() => {
    // When plate changes, auto-fill driver
    if (selectedPlate) {
      const v = driversList.find(d => d.plate === selectedPlate);
      if (v) {
        setDriverName(v.driver);
      }
    }
  }, [selectedPlate]);

  useEffect(() => {
    const fetchPersonnel = async () => {
      const { data, error } = await supabase.from("personnel").select("*").order("full_name", { ascending: true });
      if (!error && data) {
        setPersonnelList(data);
      }
    };
    fetchPersonnel();
  }, []);`
);

// 3. Change supervisor input to select
content = content.replace(
  `              <div className="gas-form-group">
                <label>ผู้ขับขี่ *</label>
                <input type="text" value={driverName} onChange={e => setDriverName(e.target.value)} required />
              </div>

              <div className="gas-form-group">
                <label>รหัสรถ / หมายเลข กฟภ.</label>`,
  `              <div className="gas-form-group">
                <label>ผู้ขับขี่ *</label>
                <select value={driverName} onChange={e => setDriverName(e.target.value)} required>
                  <option value="">-- เลือกผู้ขับขี่ --</option>
                  {personnelList.map(p => (
                    <option key={p.id} value={p.full_name}>{p.full_name}</option>
                  ))}
                  {/* Fallback to driversList if not in personnel */}
                  {driversList.map(v => v.driver).filter((v, i, a) => v && a.indexOf(v) === i && !personnelList.find(p => p.full_name === v)).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="gas-form-group">
                <label>ผู้ควบคุมรถ *</label>
                <select value={supervisorName} onChange={e => setSupervisorName(e.target.value)} required>
                  <option value="">-- เลือกผู้ควบคุมรถ --</option>
                  {personnelList.map(p => (
                    <option key={p.id} value={p.full_name}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="gas-form-group">
                <label>รหัสรถ / หมายเลข กฟภ.</label>`
);

// 4. Change notes label
content = content.replace(
  `<label>หมายเหตุ</label>`,
  `<label>หมายเหตุ (ใส่หมายเลขงาน WBS)</label>`
);

// 5. Add notes column to the printed table TH
content = content.replace(
  `<th rowSpan={2} style={{ width: '80px' }}>จำนวนเงิน<br/>(บาท)</th>
                            </tr>
                            <tr>`,
  `<th rowSpan={2} style={{ width: '80px' }}>จำนวนเงิน<br/>(บาท)</th>
                              <th rowSpan={2} style={{ width: '120px' }}>หมายเหตุ</th>
                            </tr>
                            <tr>`
);

// 6. Add notes column to the printed table TD (data row)
content = content.replace(
  `<td className="text-right">{r.repair_cost ? r.repair_cost.toFixed(2) : ""}</td>
                              </tr>`,
  `<td className="text-right">{r.repair_cost ? r.repair_cost.toFixed(2) : ""}</td>
                                <td className="text-left" style={{ fontSize: '12px' }}>{r.notes || ""}</td>
                              </tr>`
);

// 7. Add notes column to the empty rows
content = content.replace(
  `<td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`,
  `<td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`
);

// 8. Add notes column to the total row
content = content.replace(
  `<td className="text-right font-bold">
                                {chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0).toFixed(2) : ""}
                              </td>
                            </tr>`,
  `<td className="text-right font-bold">
                                {chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0).toFixed(2) : ""}
                              </td>
                              <td></td>
                            </tr>`
);

// Write back
fs.writeFileSync('app/gas-report/page.tsx', content, 'utf-8');
console.log('Patched page.tsx with new requirements');
