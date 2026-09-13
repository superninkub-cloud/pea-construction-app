const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lib/estimationData.json', 'utf8'));

const d12bItems = [
  { code: '1020220109', name: 'ARMOR ROD,PREFORMED,FOR AL.OR AL-ALLOY CONDUCTOR 400 SQ.MM.', unit: 'ชุด', qty: 2 },
  { code: '1030020001', name: 'INSULATOR,SUSPENSION,TYPE C (CLASS 52-3) TIS.354', unit: 'ชิ้น', qty: 7 },
  { code: '1030120002', name: 'CLAMP,SUSPENSION,FOR AL 400 SQ.MM.', unit: 'ชุด', qty: 2 },
  { code: '1030140000', name: 'CLEVIS-EYE', unit: 'ชุด', qty: 2 },
  { code: '1030140004', name: 'Y-CLEVIS-BALL', unit: 'ชุด', qty: 1 },
  { code: '1030140006', name: 'SOCKET-CLEVIS,ANSI TYPE B', unit: 'ชุด', qty: 1 },
  { code: '1030140013', name: 'SPACER,PLATE,FOR AL.400 SQ.MM.', unit: 'ชิ้น', qty: 1 }
];

const assemblyName = 'SUSPENSION INSULATOR ASSEMBLY D-12B';
let found = false;

data.forEach(d => {
  if (d.assemblyName === assemblyName) {
    d.items = [...d12bItems];
    found = true;
  }
});

if (!found) {
  data.push({ assemblyName: assemblyName, items: d12bItems });
  console.log(`Added missing assembly: ${assemblyName}`);
} else {
  console.log(`Updated existing assembly: ${assemblyName}`);
}

fs.writeFileSync('./lib/estimationData.json', JSON.stringify(data, null, 2));
