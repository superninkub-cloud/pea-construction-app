import sys

with open('app/gas-report/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix layout wrapper
old_layout = """  return (
    <div className="app-container">
      <TopBar title="รายงานน้ำมัน (ยพ.6)" />
      <div className="content-area" style={{ padding: "20px" }}>"""
new_layout = """  return (
    <>
      <TopBar title="รายงานน้ำมัน (ยพ.6)" />
      <div className="content-area" style={{ padding: "20px" }}>"""
content = content.replace(old_layout, new_layout)

old_end = """        </div>
      </div>
    </div>
  );
}"""
new_end = """        </div>
      </div>
    </>
  );
}"""
content = content.replace(old_end, new_end)

# Fix signatures
old_sig = """                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>(.......................................................................................)</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>(.......................................................................................)</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>
                            </div>"""

new_sig = """                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.driver_name ? ` ${reports[0].driver_name} ` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.supervisor_name ? ` ${reports[0].supervisor_name} ` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>
                            </div>"""

content = content.replace(old_sig, new_sig)

with open('app/gas-report/page.tsx', 'w', encoding='utf-8', newline='\\n') as f:
    f.write(content)
