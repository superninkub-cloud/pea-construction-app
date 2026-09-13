const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lib/estimationData.json', 'utf8'));

const newItems = [
  { code: '1010000100', name: 'STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG', unit: 'ชิ้น', qty: 6 },
  { code: '1010010004', name: 'STEEL ANGLE,OVERHEAD GROUND WIRE BAYONET 65X65X6 MM. 2,500 MM.LONG', unit: 'ชิ้น', qty: 1 },
  { code: '1010030002', name: 'PLATE,STEEL 6X100X450 MM.', unit: 'ชิ้น', qty: 6 },
  { code: '1010050000', name: 'ST. PIPE,SIZE 20, 100 MM.LONG W/O T.E.', unit: 'ชิ้น', qty: 3 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110201', name: 'BOLT,MACHINE M.16x170 mm.', unit: 'ชุด', qty: 6 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010110205', name: 'BOLT,MACHINE M.16x350 mm.', unit: 'ชุด', qty: 2 },
  { code: '1010110301', name: 'BOLT,MACHINE M.20x400 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010110400', name: 'BOLT,MACHINE, HEXAGON, M.16X75 MM.', unit: 'ชุด', qty: 6 },
  { code: '1010150000', name: 'BOLT,OVAL EYE M.16X150 MM.', unit: 'ชุด', qty: 3 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 20 },
  { code: '1010180101', name: 'WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258', unit: 'ชิ้น', qty: 6 },
  { code: '1010180301', name: 'WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259', unit: 'ชิ้น', qty: 3 },
  { code: '1010200002', name: 'BRACE,FLAT,FOR CROSSARM 40x6x1,000 mm.', unit: 'ชิ้น', qty: 6 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1010230203', name: 'GROUND WIRE SUPPORT AND CLAMP,FOR BAYONET', unit: 'ชุด', qty: 1 },
  { code: '1020230001', name: 'ARMOR-GRIP,PREFORMED,AL 400 SQ.MM.', unit: 'ชิ้น', qty: 6 },
  { code: '1030020001', name: 'INSULATOR,SUSPENSION,TYPE C (CLASS 52-3) TIS.354', unit: 'ชิ้น', qty: 21 },
  { code: '1030140000', name: 'CLEVIS-EYE', unit: 'ชุด', qty: 6 },
  { code: '1030140004', name: 'Y-CLEVIS-BALL', unit: 'ชุด', qty: 3 },
  { code: '1030140006', name: 'SOCKET-CLEVIS,ANSI TYPE B', unit: 'ชุด', qty: 3 },
  { code: '1030140013', name: 'SPACER,PLATE,FOR AL.400 SQ.MM.', unit: 'ชิ้น', qty: 3 }
];

let updated = 0;
data.forEach(d => {
  if (d.assemblyName === 'SD-TG-4 TANGENT STRUCTURE , ADJACENT TO DEADEND POLE' || 
      d.assemblyName === 'SD-TG-4(WITH GROUND PLATE IN POLE)TANGENT STRUCTURE,ADJACENT TO DEADEND POLE') {
    d.items = [...newItems];
    updated++;
  }
});

fs.writeFileSync('./lib/estimationData.json', JSON.stringify(data, null, 2));
console.log(`Updated ${updated} assemblies.`);
