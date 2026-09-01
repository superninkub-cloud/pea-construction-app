import re

with open("app/gas-report/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

replacement = """              {reports.length > 0 ? (
                <div id="printable-report">
                  {Array.from({ length: Math.ceil(reports.length / 10) || 1 }).map((_, pageIndex) => {
                    const chunk = reports.slice(pageIndex * 10, (pageIndex + 1) * 10);
                    return (
                      <div key={pageIndex} className="official-form" style={{ pageBreakAfter: 'always', position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                          <img src="/PEA-Logo.png" alt="PEA" style={{ width: '80px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                        <div className="form-header text-center" style={{ marginBottom: '24px' }}>
                          <div style={{ fontSize: '28px', marginBottom: '8px' }}>การไฟฟ้าส่วนภูมิภาค</div>
                          <div style={{ fontSize: '24px' }}>แบบฟอร์มรายงานการใช้ยานพาหนะหรือเครื่องจักร</div>
                        </div>

                        <div className="form-body">
                          <div className="form-row flex-between">
                            <div className="flex-1 flex-start">
                              <span style={{ width: '40px' }}>จาก</span>
                              <span className="dotted-blank text-center" style={{ flex: 1, maxWidth: '250px' }}>ผกร.กรย.(ก3)</span>
                            </div>
                            <div className="flex-1 flex-start" style={{ marginLeft: '40px' }}>
                              <span>ถึง (หัวหน้าหน่วยงาน)</span>
                              <span className="dotted-blank text-center" style={{ flex: 1, maxWidth: '250px' }}>กรย.(ก3)</span>
                            </div>
                          </div>

                          <div className="form-row flex-start">
                            <span style={{ minWidth: '320px' }}>เรื่อง รายงานการใช้ยานพาหนะหรือเครื่องจักร</span>
                            <span className="ml-4">วันที่</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                            <span className="ml-2">เดือน</span>
                            <span className="dotted-blank text-center" style={{ width: '150px' }}></span>
                            <span className="ml-2">ปี</span>
                            <span className="dotted-blank text-center" style={{ width: '120px' }}></span>
                          </div>

                          <div className="form-row flex-start">
                            <span style={{ width: '40px' }}>เรียน</span>
                            <span className="dotted-blank text-center" style={{ width: '400px' }}>อก.รย.(ก3)</span>
                          </div>

                          <div className="form-row flex-start flex-wrap">
                            <span>รายงานการใช้ยานพาหนะหรือเครื่องจักร ประจำเดือน</span>
                            <span className="dotted-blank text-center" style={{ width: '120px' }}>{reportMonth}</span>
                            <span className="ml-2">พ.ศ.</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}>{reportYear}</span>
                            <span className="ml-2">หมายเลขทะเบียน</span>
                            <span className="dotted-blank text-center" style={{ width: '120px' }}>{reportPlate}</span>
                            <span className="ml-2">รหัส</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                            <span className="ml-2">ประเภท</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                            <span className="ml-2">ชนิด</span>
                            <span className="dotted-blank text-center" style={{ width: '80px' }}></span>
                          </div>
                          
                          <div className="form-row dotted-line-full"></div>

                          <div className="form-row flex-start flex-wrap fuel-checkboxes" style={{ marginTop: '16px' }}>
                            <span style={{ marginRight: '8px' }}>ชนิดของเชื้อเพลิง</span>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ 95</label>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ 91</label>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ E20</label>
                            <label><input type="checkbox" /> แก๊สโซฮอล์ E85</label>
                            <label><input type="checkbox" /> ดีเซล</label>
                            <label><input type="checkbox" /> น้ำมันหล่อลื่น จำนวน</label>
                            <span className="dotted-blank" style={{ width: '100px' }}></span>
                            <span>ลิตร</span>
                          </div>

                          <div className="form-row flex-start">
                            <span>อัตราการสิ้นเปลืองเชื้อเพลิงยานพาหนะ</span>
                            <span className="dotted-blank" style={{ width: '200px' }}></span>
                            <span>กิโลเมตร/ลิตร, เครื่องจักร</span>
                            <span className="dotted-blank" style={{ width: '200px' }}></span>
                            <span>ลิตร/ชั่วโมง</span>
                          </div>
                        </div>

                        <table className="official-table" style={{ flex: 1 }}>
                          <thead>
                            <tr>
                              <th rowSpan={2} style={{ width: '50px' }}>วันที่</th>
                              <th rowSpan={2} style={{ width: '120px' }}>ชื่อผู้ขับ<br/>(ผู้ควบคุม)</th>
                              <th rowSpan={2}>สถานที่ปฏิบัติงาน</th>
                              <th colSpan={2} style={{ width: '120px' }}>เลขระยะทาง</th>
                              <th rowSpan={2} style={{ width: '90px' }}>ชั่วโมงการทำงาน<br/>ของเครื่องจักร</th>
                              <th rowSpan={2} style={{ width: '90px' }}>จำนวนเชื้อเพลิง<br/>ที่เติม (ลิตร)</th>
                              <th rowSpan={2} style={{ width: '80px' }}>จำนวนเงิน<br/>(บาท)</th>
                              <th rowSpan={2} style={{ width: '120px' }}>รายการซ่อม</th>
                              <th rowSpan={2} style={{ width: '80px' }}>จำนวนเงิน<br/>(บาท)</th>
                            </tr>
                            <tr>
                              <th style={{ width: '60px' }}>ไป</th>
                              <th style={{ width: '60px' }}>กลับ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chunk.map((r, i) => (
                              <tr key={r.id}>
                                <td className="text-center">{getDayOnly(r.usage_date)}</td>
                                <td className="text-center">{r.driver_name}</td>
                                <td className="text-left">{r.work_location || ""}</td>
                                <td className="text-center">{r.odo_start || ""}</td>
                                <td className="text-center">{r.odo_end || ""}</td>
                                <td className="text-center">{r.machine_hours || ""}</td>
                                <td className="text-center">{r.fuel_liters || ""}</td>
                                <td className="text-right">{r.fuel_cost ? r.fuel_cost.toFixed(2) : ""}</td>
                                <td className="text-left">{r.repair_details || ""}</td>
                                <td className="text-right">{r.repair_cost ? r.repair_cost.toFixed(2) : ""}</td>
                              </tr>
                            ))}
                            {/* Fill up to exactly 10 rows per page */}
                            {Array.from({ length: 10 - chunk.length }).map((_, i) => (
                              <tr key={`empty-${i}`}>
                                <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr>
                              <td colSpan={6} className="text-right font-bold" style={{ paddingRight: '16px' }}>รวม</td>
                              <td className="text-center font-bold">
                                {chunk.reduce((sum, r) => sum + (r.fuel_liters || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.fuel_liters || 0), 0).toFixed(2) : ""}
                              </td>
                              <td className="text-right font-bold">
                                {chunk.reduce((sum, r) => sum + (r.fuel_cost || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.fuel_cost || 0), 0).toFixed(2) : ""}
                              </td>
                              <td></td>
                              <td className="text-right font-bold">
                                {chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0) > 0 ? chunk.reduce((sum, r) => sum + (r.repair_cost || 0), 0).toFixed(2) : ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <div style={{ marginTop: '8px', marginLeft: '40px', fontSize: '16px' }}>
                          จึงเรียนมาเพื่อโปรดทราบ
                        </div>

                        <div className="form-footer" style={{ marginTop: 'auto', paddingBottom: '20px' }}>
                          <div className="signature-section flex-between">
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>(.......................................................................................)</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>(.......................................................................................)</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>
                            </div>
                          </div>
                          <div className="form-code" style={{ position: 'absolute', bottom: '0', left: '0' }}>ยพ.6-ป.46</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : ("""

# Find the start and end of the block to replace
start_idx = content.find("              {reports.length > 0 ? (")
end_idx = content.find("              ) : (", start_idx) + 19

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open("app/gas-report/page.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Patch applied successfully.")
else:
    print("Could not find the block to replace.")
