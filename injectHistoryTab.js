const fs = require('fs');

const pageFile = 'app/gas-report/page.tsx';
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add states
const statesToAdd = `
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const { data, error } = await supabase
        .from("gas_reports")
        .select("*")
        .order("usage_date", { ascending: false });
      if (!error && data) {
        setAllHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
    setFetchingHistory(false);
  };

  const handleDeleteHistory = async (id: number) => {
    if (!confirm("คุณต้องการลบข้อมูลนี้ใช่หรือไม่?")) return;
    try {
      const { error } = await supabase.from("gas_reports").delete().eq("id", id);
      if (error) {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล: " + error.message);
      } else {
        alert("ลบข้อมูลสำเร็จ");
        fetchHistory(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);
`;

code = code.replace('const [fetchingReports, setFetchingReports] = useState(false);', 'const [fetchingReports, setFetchingReports] = useState(false);\n' + statesToAdd);

// 2. Add Tab Button
const tabButton = `
            <div 
              className={\`gas-tab \${activeTab === "history" ? "active" : ""}\`}
              onClick={() => setActiveTab("history")}
            >
              ประวัติการรายงานน้ำมัน
            </div>
`;
code = code.replace('รายงาน (ยพ.6)\n            </div>', 'รายงาน (ยพ.6)\n            </div>' + tabButton);

// 3. Add History Tab Content
const historyContent = `
          {activeTab === "history" && (
            <div className="history-section no-print">
              <h3 style={{ marginBottom: "15px", color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>ประวัติการรายงานน้ำมันทั้งหมด</span>
                <button 
                  onClick={fetchHistory} 
                  disabled={fetchingHistory}
                  style={{ padding: "6px 12px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
                >
                  {fetchingHistory ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
                </button>
              </h3>
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <tr>
                      <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>วันที่ใช้งาน</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>ทะเบียนรถ</th>
                      <th style={{ padding: "12px", textAlign: "left", color: "#475569" }}>ผู้ขับขี่</th>
                      <th style={{ padding: "12px", textAlign: "center", color: "#475569" }}>ระยะทางไป-กลับ</th>
                      <th style={{ padding: "12px", textAlign: "center", color: "#475569" }}>ปริมาณน้ำมัน (ลิตร)</th>
                      <th style={{ padding: "12px", textAlign: "center", color: "#475569" }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allHistory.length > 0 ? (
                      allHistory.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px" }}>{new Date(item.usage_date).toLocaleDateString("th-TH")}</td>
                          <td style={{ padding: "12px", fontWeight: "bold", color: "#0f172a" }}>{item.license_plate}</td>
                          <td style={{ padding: "12px", color: "#334155" }}>{item.driver_name}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{item.odo_start && item.odo_end ? (item.odo_end - item.odo_start).toLocaleString() : "-"}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{item.fuel_liters ? item.fuel_liters : "-"}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <button 
                              onClick={() => handleDeleteHistory(item.id)}
                              style={{ padding: "6px 12px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}
                            >
                              ลบข้อมูล
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>ไม่มีประวัติข้อมูลการใช้น้ำมัน</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
`;

code = code.replace('{activeTab === "form" && (', historyContent + '\n          {activeTab === "form" && (');

fs.writeFileSync(pageFile, code, 'utf8');
console.log('Successfully injected history tab');
