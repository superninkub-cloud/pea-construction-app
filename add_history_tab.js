const fs = require('fs');
let code = fs.readFileSync('app/gas-report/page.tsx', 'utf8');

code = code.replace(/<div\s+className=\{`gas-tab \$\{activeTab === "report" \? "active" : ""\}`\}\s+onClick=\{\(\) => setActiveTab\("report"\)\}\s+>\s+รายงาน \(ยพ\.6\)\s+<\/div>\s+<\/div>/, 
`<div 
              className={\`gas-tab \${activeTab === "report" ? "active" : ""}\`}
              onClick={() => setActiveTab("report")}
            >
              รายงาน (ยพ.6)
            </div>
            <div 
              className={\`gas-tab \${activeTab === "history" ? "active" : ""}\`}
              onClick={() => setActiveTab("history")}
            >
              ประวัติการรายงานน้ำมัน
            </div>
          </div>`);

fs.writeFileSync('app/gas-report/page.tsx', code, 'utf8');
console.log('done');
