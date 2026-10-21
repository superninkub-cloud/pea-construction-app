const fs = require('fs');

const d5i = [
  { code: '1010010004', name: 'STEEL ANGLE,OVERHEAD GROUND WIRE BAYONET 65X65X6 MM. 2,500 MM.LONG', unit: 'ชิ้น', qty: 1 },
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 6 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1010230203', name: 'GROUND WIRE SUPPORT AND CLAMP,FOR BAYONET', unit: 'ชุด', qty: 1 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5j = [
  { code: '1010010005', name: 'STEEL ANGLE,OVERHEAD GROUND WIRE CORNER BAYONET 65X65X6 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 6 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1010230203', name: 'GROUND WIRE SUPPORT AND CLAMP,FOR BAYONET', unit: 'ชุด', qty: 1 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5k = [
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 0.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 1 },
  { code: '1010230202', name: 'GROUND WIRE SUPPORT AND CLAMP, FOR CONCRETE POLE', unit: 'ชุด', qty: 1 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5l = [
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 0.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010180001', name: 'NUT,EYE M.16 DIN 582', unit: 'ชิ้น', qty: 1 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 2 },
  { code: '1010210202', name: 'BOLT,STRAND EYE,SINGLE 45 DEGREE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 2 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5m = [
  { code: '1010000304', name: 'STEEL CHANNEL150X75X6.5 MM.2,500MM.', unit: 'ชิ้น', qty: 1 },
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010140001', name: 'BOLT, ROUNG EYE M 16X200 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010180001', name: 'NUT,EYE M.16 DIN 582', unit: 'ชิ้น', qty: 1 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 8 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 2 },
  { code: '1010230000', name: 'CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 4 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5n = [
  { code: '1010000304', name: 'STEEL CHANNEL150X75X6.5 MM.2,500MM.', unit: 'ชิ้น', qty: 1 },
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010140001', name: 'BOLT, ROUNG EYE M 16X200 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010180001', name: 'NUT,EYE M.16 DIN 582', unit: 'ชิ้น', qty: 1 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 10 },
  { code: '1010210202', name: 'BOLT,STRAND EYE,SINGLE 45 DEGREE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 2 },
  { code: '1010230000', name: 'CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 4 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5o = [
  { code: '1010000304', name: 'STEEL CHANNEL150X75X6.5 MM.2,500MM.', unit: 'ชิ้น', qty: 1 },
  { code: '1010030006', name: 'PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004', unit: 'ชิ้น', qty: 1 },
  { code: '1010100003', name: 'WIRE,STEEL STRANDED 35 SQ.MM.TIS.404', unit: 'ม.', qty: 2.5 },
  { code: '1010110101', name: 'BOLE,MACHINE M. 12X50 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010110204', name: 'BOLT,MACHINE M.16x300 mm.', unit: 'ชุด', qty: 3 },
  { code: '1010140001', name: 'BOLT, ROUNG EYE M 16X200 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 10 },
  { code: '1010180301', name: 'WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259', unit: 'ชิ้น', qty: 1 },
  { code: '1010210202', name: 'BOLT,STRAND EYE,SINGLE 45 DEGREE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 1 },
  { code: '1010230000', name: 'CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 2 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5p = [
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
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 20 },
  { code: '1010180301', name: 'WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259', unit: 'ชิ้น', qty: 2 },
  { code: '1010210200', name: 'BOLT,STRAND EYE,SINGLE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210202', name: 'BOLT,STRAND EYE,SINGLE 45 DEGREE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 1 },
  { code: '1010230000', name: 'CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 4 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const d5q = [
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
  { code: '1010180100', name: 'WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258', unit: 'ชิ้น', qty: 18 },
  { code: '1010180301', name: 'WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259', unit: 'ชิ้น', qty: 2 },
  { code: '1010210200', name: 'BOLT,STRAND EYE,SINGLE M.16X350 MM.', unit: 'ชุด', qty: 1 },
  { code: '1010210304', name: 'THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.', unit: 'ชิ้น', qty: 1 },
  { code: '1010230000', name: 'CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)', unit: 'ชุด', qty: 1 },
  { code: '1010230003', name: 'CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.', unit: 'ชุด', qty: 4 },
  { code: '9090011007', name: 'WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD', unit: 'ชิ้น', qty: 1 }
];

const updates = {
  'OVERHEAD GROUND WIRE ASSEMBLY D-5I': d5i,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5J': d5j,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5K': d5k,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5L': d5l,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5M': d5m,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5N': d5n,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5O': d5o,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5P': d5p,
  'OVERHEAD GROUND WIRE ASSEMBLY D-5Q': d5q
};

const data = JSON.parse(fs.readFileSync('./lib/estimationData.json', 'utf8'));

let added = 0;
for (const [key, items] of Object.entries(updates)) {
  const existing = data.find(d => d.assemblyName === key);
  if (!existing) {
    data.push({ assemblyName: key, items: items });
    added++;
  }
}

fs.writeFileSync('./lib/estimationData.json', JSON.stringify(data, null, 2));
console.log(`Added ${added} missing assemblies.`);
