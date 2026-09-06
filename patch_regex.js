const fs = require('fs');

let content = fs.readFileSync('app/gas-report/page.tsx', 'utf-8');

// Use exact line splits for replace

// 1. Remove app-container
const lines = content.split('\\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return (') && lines[i+1] && lines[i+1].includes('<div className="app-container">')) {
    lines[i+1] = lines[i+1].replace('<div className="app-container">', '<>');
  }
}
// Find the last closing div of app-container
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('    </div>')) {
    if (lines[i-1].includes('      </div>') && lines[i-2].includes('        </div>')) {
      lines[i] = lines[i].replace('    </div>', '    </>');
      break;
    }
  }
}

content = lines.join('\\n');

// 2. Replace signatures using regex
content = content.replace(
  /<div className="signature-box" style={{ flex: 1 }}>\\s*<div>\\(\\.*\\)<\\/div>\\s*<div className="font-bold mt-2">ผู้ขับยานพาหนะ<\\/div>\\s*<\\/div>\\s*<div className="signature-box" style={{ flex: 1 }}>\\s*<div>\\(\\.*\\)<\\/div>\\s*<div className="font-bold mt-2">ผู้ควบคุม<\\/div>\\s*<\\/div>/m,
  `<div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.driver_name ? \\\` \\\${reports[0].driver_name} \\\` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>
                            </div>
                            <div className="signature-box" style={{ flex: 1 }}>
                              <div>({reports[0]?.supervisor_name ? \\\` \\\${reports[0].supervisor_name} \\\` : "......................................................................................."})</div>
                              <div className="font-bold mt-2">ผู้ควบคุม</div>
                            </div>`
);

fs.writeFileSync('app/gas-report/page.tsx', content, 'utf-8');
console.log('Patched with JS using Regex');
