const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lib/estimationData.json', 'utf8'));

const d19aAgs = [
  { code: '1020230001', name: 'ARMOR-GRIP,PREFORMED,AL 400 SQ.MM.', unit: 'ชิ้น', qty: 1 },
  { code: '1030020100', name: 'INSULATOR SUSPENSION COMPOSITE,FOR 115 KV.NOMINAL SECTION LEN', unit: 'ชิ้น', qty: 1 },
  { code: '1030140003', name: 'SOCKET-EYE', unit: 'ชุด', qty: 1 }
];

const d19a = [
  { code: '1020220109', name: 'ARMOR ROD,PREFORMED,FOR AL.OR AL-ALLOY CONDUCTOR 400 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1030020100', name: 'INSULATOR SUSPENSION COMPOSITE,FOR 115 KV.NOMINAL SECTION LEN', unit: 'ชิ้น', qty: 1 },
  { code: '1030120002', name: 'CLAMP,SUSPENSION,FOR AL 400 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1030140003', name: 'SOCKET-EYE', unit: 'ชุด', qty: 1 }
];

const d19b = [
  { code: '1020420302', name: 'TERMINAL,COMPRESSION,15 DEGREE PAD,NEMA,4-HOLE,FOR AL. 400 SQ.MM', unit: 'ชิ้น', qty: 1 },
  { code: '1020430001', name: 'CLAMP DEAD END,COMPRESSION,SINGLE LUG,FOR AL.CONDUCTOR 400 SQ', unit: 'ชุด', qty: 1 },
  { code: '1030020101', name: 'INSULATOR,SUSPENSION,COMPOSITE,FOR 115 KV.NOMINAL SELTION LENG', unit: 'ชิ้น', qty: 1 },
  { code: '1030140006', name: 'SOCKET-CLEVIS,ANSI TYPE B', unit: 'ชุด', qty: 1 }
];

const d19c = [
  { code: '1030020101', name: 'INSULATOR,SUSPENSION,COMPOSITE,FOR 115 KV.NOMINAL SELTION LENG', unit: 'ชิ้น', qty: 1 },
  { code: '1030110103', name: 'CLAMP,STRAIN,WITH CLAMPING KEEPER,FOR AL.CONDUCTOR 400 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1030140003', name: 'SOCKET-EYE', unit: 'ชุด', qty: 1 }
];

const d19d = [
  { code: '1020220109', name: 'ARMOR ROD,PREFORMED,FOR AL.OR AL-ALLOY CONDUCTOR 400 SQ.MM.', unit: 'ชุด', qty: 2 },
  { code: '1030020100', name: 'INSULATOR SUSPENSION COMPOSITE,FOR 115 KV.NOMINAL SECTION LEN', unit: 'ชิ้น', qty: 1 },
  { code: '1030120002', name: 'CLAMP,SUSPENSION,FOR AL 400 SQ.MM.', unit: 'ชุด', qty: 2 },
  { code: '1030140000', name: 'CLEVIS-EYE', unit: 'ชุด', qty: 2 },
  { code: '1030140006', name: 'SOCKET-CLEVIS,ANSI TYPE B', unit: 'ชุด', qty: 1 },
  { code: '1030140013', name: 'SPACER,PLATE,FOR AL.400 SQ.MM.', unit: 'ชิ้น', qty: 1 }
];

const updates = {
  'COMPOSITE SUSPENSION INSULATOR ASSEMBLY D-19A (AGS)': d19aAgs,
  'COMPOSITE SUSPENSION INSULATOR ASSEMBLY D-19A': d19a,
  'COMPOSITE SUSPENSION INSULATOR ASSEMBLY D-19B': d19b,
  'COMPOSITE SUSPENSION INSULATOR ASSEMBLY D-19C': d19c,
  'COMPOSITE SUSPENSION INSULATOR ASSEMBLY D-19D': d19d
};

let updated = 0;
let added = 0;

for (const [key, items] of Object.entries(updates)) {
  const existing = data.find(d => d.assemblyName === key);
  if (existing) {
    existing.items = [...items];
    updated++;
  } else {
    data.push({ assemblyName: key, items: items });
    added++;
  }
}

fs.writeFileSync('./lib/estimationData.json', JSON.stringify(data, null, 2));
console.log(`Updated ${updated} assemblies, Added ${added} assemblies.`);
