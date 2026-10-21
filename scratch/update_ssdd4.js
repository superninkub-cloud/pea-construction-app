const fs = require('fs');

const dataPath = './lib/estimationData.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Find the assembly SS-DD-4
const targetAssemblyIndex = data.findIndex(a => a.assemblyName.includes('SS-DD-4'));

const newItems = [
  { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 3 },
  { "code": "1010000304", "name": "STEEL CHANNEL150X75X6.5 MM.2,500MM.", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010000400", "name": "STEEL CHANNEL,200X80X7.5 MM.1,000 MM.LONG", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010010000", "name": "STEEL ANGLE,65X65X6 MM.1,000 MM.LONG", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010030005", "name": "PLATE,STEEL 6X100X900 MM.", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010030006", "name": "PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DWG.NO.SA3-015/44004", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010100003", "name": "WIRE,STEEL STRANDED 35 SQ.MM.TIS.404", "unit": "ม.", "qty": 2.5 },
  { "code": "1010110101", "name": "BOLE,MACHINE M. 12x50 MM.", "unit": "ชุด", "qty": 2 },
  { "code": "1010110200", "name": "BOLT,MACHINE M.16x130 mm.", "unit": "ชุด", "qty": 7 },
  { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 7 },
  { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 3 },
  { "code": "1010110301", "name": "BOLT,MACHINE M.20x400 mm.", "unit": "ชุด", "qty": 3 },
  { "code": "1010110302", "name": "BOLT,MACHINE M.20x450 mm.", "unit": "ชุด", "qty": 6 },
  { "code": "1010110400", "name": "BOLT,MACHINE, HEXAGON, M.16X75 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010140001", "name": "BOLT, ROUNG EYE M 16X200 MM.", "unit": "ชุด", "qty": 2 },
  { "code": "1010150000", "name": "BOLT,OVAL EYE M.16X150 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010150100", "name": "BOLT,OVAL M.20X350 MM.", "unit": "ชุด", "qty": 6 },
  { "code": "1010150101", "name": "BOLT,OVAL M.20X450 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 36 },
  { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 30 },
  { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 9 },
  { "code": "1010180302", "name": "WASHER,LOCK,SPRING,SIZE 20 MM.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 9 },
  { "code": "1010200009", "name": "BRACE,ALLEY ARM 50x50x6 MM. 1,000 MM.LONG", "unit": "ชิ้น", "qty": 3 },
  { "code": "1010210200", "name": "BOLT,STRAND EYE,SINGLE M.16X350 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010210304", "name": "THIMBLE,GUY,FOR STEEL WIRE 50-95 sq.mm.", "unit": "ชิ้น", "qty": 2 },
  { "code": "1010230000", "name": "CLAMP,SINGLE U-BOLT,M.8 (WIRE ROPE CLIP)", "unit": "ชุด", "qty": 2 },
  { "code": "1010230003", "name": "CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.", "unit": "ชุด", "qty": 7 },
  { "code": "1020230001", "name": "ARMOR-GRIP,PREFORMED,AL 400 SQ.MM.", "unit": "ชิ้น", "qty": 3 },
  { "code": "1020420302", "name": "TERMINAL,COMPRESSION,15 DEGREE PAD,NEMA,4-HOLE,FOR AL. 400 SQ.MM.", "unit": "ชิ้น", "qty": 3 },
  { "code": "1020430001", "name": "CLAMP DEAD END,COMPRESSION,SINGLE LUG,FOR AL.CONDUCTOR 400 SQ.MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1030020001", "name": "INSULATOR,SUSPENSION,TYPE C (CLASS 52-3) TIS.354", "unit": "ชิ้น", "qty": 81 },
  { "code": "1030110103", "name": "CLAMP,STRAIN,WITH CLAMPING KEEPER,FOR AL.CONDUCTOR 400 SQ.MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1030140003", "name": "SOCKET-EYE", "unit": "ชุด", "qty": 6 },
  { "code": "1030140004", "name": "Y-CLEVIS-BALL", "unit": "ชุด", "qty": 3 },
  { "code": "1030140005", "name": "BALL-CLEVIS,ANSI TYPE B", "unit": "ชุด", "qty": 6 },
  { "code": "1030140006", "name": "SOCKET-CLEVIS,ANSI TYPE B", "unit": "ชุด", "qty": 3 },
  { "code": "9090011007", "name": "WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD", "unit": "ชิ้น", "qty": 2 }
];

if (targetAssemblyIndex !== -1) {
  data[targetAssemblyIndex].items = newItems;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully updated items for assembly: ${data[targetAssemblyIndex].assemblyName}`);
} else {
  console.log(`Could not find assembly matching SS-DD-4`);
}
