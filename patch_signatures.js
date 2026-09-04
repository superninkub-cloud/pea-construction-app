const fs = require('fs');

let content = fs.readFileSync('app/gas-report/page.tsx', 'utf-8');

// Replace main-content with content-area
content = content.replace(
  '<div className="main-content" style={{ padding: "20px", overflowY: "auto" }}>',
  '<div className="content-area" style={{ padding: "20px" }}>'
);

// Replace signatures
content = content.replace(
  `<div>(.......................................................................................)</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>(.......................................................................................)</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>`,
  `<div>({reports[0]?.driver_name ? \` \${reports[0].driver_name} \` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.supervisor_name ? \` \${reports[0].supervisor_name} \` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>`
);

fs.writeFileSync('app/gas-report/page.tsx', content, 'utf-8');
console.log('Patched signatures and content-area');
