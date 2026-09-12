const fs = require('fs');

const dataPath = './lib/estimationData.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Find the assembly SS-SA-2 (WITH GROUND PLATE IN POLE) ANGLE STRUCTURE
const targetAssemblyIndex = data.findIndex(a => a.assemblyName.includes('SS-SA-2 (WITH GROUND PLATE IN POLE)'));

const newItems = [
  { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010010005", "name": "STEEL ANGLE,OVERHEAD GROUND WIRE CORNER BAYONET 65X65X6 MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010030002", "name": "PLATE,STEEL 6X100X450 MM.", "unit": "ชิ้น", "qty": 12 },
  { "code": "1010030006", "name": "PLATE,STEEL,FOR OVERHEAD GROUND WIRE BAYONET,ACCORDING TO DV", "unit": "ชิ้น", "qty": 1 },
  { "code": "1010050000", "name": "ST. PIPE,SIZE 20, 100 MM.LONG W/O T.E.", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010100003", "name": "WIRE,STEEL STRANDED 35 SQ.MM.TIS.404", "unit": "ม.", "qty": 2.5 },
  { "code": "1010110101", "name": "BOLE,MACHINE M. 12x50 MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010110200", "name": "BOLT,MACHINE M.16x130 mm.", "unit": "ชุด", "qty": 6 },
  { "code": "1010110201", "name": "BOLT,MACHINE M.16x170 mm.", "unit": "ชุด", "qty": 18 },
  { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 4 },
  { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
  { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 48 },
  { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010200009", "name": "BRACE,ALLEY ARM 50x50x6 MM. 1,000 MM.LONG", "unit": "ชิ้น", "qty": 6 },
  { "code": "1010230003", "name": "CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010230203", "name": "GROUND WIRE SUPPORT AND CLAMP,FOR BAYONET", "unit": "ชุด", "qty": 1 },
  { "code": "1020230001", "name": "ARMOR-GRIP,PREFORMED,AL 400 SQ.MM.", "unit": "ชิ้น", "qty": 3 },
  { "code": "1030020001", "name": "INSULATOR,SUSPENSION,TYPE C (CLASS 52-3) TIS.354", "unit": "ชิ้น", "qty": 21 },
  { "code": "1030140003", "name": "SOCKET-EYE", "unit": "ชุด", "qty": 3 },
  { "code": "1030140004", "name": "Y-CLEVIS-BALL", "unit": "ชุด", "qty": 3 },
  { "code": "1030140012", "name": "BRACKET,CORNER SUSPENSION", "unit": "ชุด", "qty": 3 },
  { "code": "9090011007", "name": "WELDING POWDER, ST. WIRE 50 SQ.MM. TO GD", "unit": "ชิ้น", "qty": 1 }
];

if (targetAssemblyIndex !== -1) {
  data[targetAssemblyIndex].items = newItems;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully updated items for assembly: ${data[targetAssemblyIndex].assemblyName}`);
} else {
  console.log(`Could not find assembly matching SS-SA-2 (WITH GROUND PLATE IN POLE) ANGLE STRUCTURE`);
}
