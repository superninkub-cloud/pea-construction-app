const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./lib/estimationData.json', 'utf8'));

const newItems = [
  { code: '1010000304', name: 'STEEL CHANNEL150X75X6.5 MM.2,500MM.', unit: 'ชิ้น', qty: 2 },
  { code: '1010030002', name: 'PLATE,STEEL 6X100X450 MM.', unit: 'ชิ้น', qty: 4 },
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010050002', name: 'ST. PIPE,SIZE 20, 150 MM.LONG W/O T.E.', unit: 'ชิ้น', qty: 1 },
  { code: '1010050010', name: 'PIPE,STEEL,SIZE 20,TYPE 2, 250 mm LONG TIS.277 BUT WITHOUT THREADED END', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010110202', name: 'BOLT,MACHINE M.16x200 mm.', unit: 'ชุด', qty: 4 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010140001', name: 'BOLT, ROUNG EYE M 16X200 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010180001', name: 'NUT,EYE M.16 DIN 582', unit: 'ชิ้น', qty: 1 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 18 },
  { code: '1010180301', name: 'WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259', unit: 'ชิ้น', qty: 1 },
  { code: '1010210200', name: 'BOLT,STRAND EYE,SINGLE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 2 },
  { code: '1010230000', name: 'CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 6 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

let updated = 0;
data.forEach(d => {
  if (d.assemblyName === 'OVERHEAD GROUND WIRE ASSEMBLY D-5R') {
    d.items = [...newItems];
    updated++;
  }
});

fs.writeFileSync('./lib/estimationData.json', JSON.stringify(data, null, 2));
console.log(`Updated ${updated} assemblies.`);
