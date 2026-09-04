const fs = require('fs');

let content = fs.readFileSync('app/gas-report/page.tsx', 'utf-8');

// 1. Remove app-container
const searchStr = '<div className="app-container">\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />';
const replaceStr = '<>\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />';
const searchStrR = '<div className="app-container">\\r\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />';
const replaceStrR = '<>\\r\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />';

content = content.replace(searchStr, replaceStr);
content = content.replace(searchStrR, replaceStrR);

const lines = content.split('\\n');
for (let i = lines.length - 1; i >= 2; i--) {
  if (lines[i].includes('    </div>')) {
    if (lines[i-1].includes('      </div>') && lines[i-2].includes('        </div>')) {
      lines[i] = lines[i].replace('    </div>', '    </>');
      break;
    }
  }
}
content = lines.join('\\n');

// 2. Replace signatures
const searchSig = '<div>(.......................................................................................)</div>';
const replaceDriver = '<div>({reports[0]?.driver_name ? ` ${reports[0].driver_name} ` : "......................................................................................."})</div>';
const replaceSupervisor = '<div>({reports[0]?.supervisor_name ? ` ${reports[0].supervisor_name} ` : "......................................................................................."})</div>';

// Replace first occurrence for driver
content = content.replace(searchSig, replaceDriver);
// Replace second occurrence for supervisor
content = content.replace(searchSig, replaceSupervisor);

fs.writeFileSync('app/gas-report/page.tsx', content, 'utf-8');
console.log('Patched with JS simple replace');
