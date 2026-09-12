const fs = require('fs');

const dataPath = './lib/estimationData.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Find the assembly SS-DD-3 DOUBLE DEAD END STRUCTURE
const targetAssemblyIndex = data.findIndex(a => a.assemblyName.includes('SS-DD-3 DOUBLE DEAD END STRUCTURE'));

const newItems = [
  { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 3 },
  { "code": "1010010005", "name": "STEEL ANGLE,OVERHEAD GROUND WIRE CORNER BAYONET 65X65X6 MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010100003", "name": "WIRE,STEEL STRANDED 35 SQ.MM.TIS.404", "unit": "ม.", "qty": 2.5 },
  { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 3 },
  { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
  { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010110400", "name": "BOLT,MACHINE, HEXAGON, M.16X75 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010150000", "name": "BOLT,OVAL EYE M.16X150 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010150100", "name": "BOLT,OVAL M.20X350 MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1010180002", "name": "NET,EYE M.20", "unit": "ชิ้น", "qty": 3 },
  { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 12 },
  { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 9 },
  { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 3 },
  { "code": "1010200002", "name": "BRACE,FLAT,FOR CROSSARM 40x6x1,000 mm.", "unit": "ชิ้น", "qty": 3 },
  { "code": "1010230003", "name": "CLAMP,TRIPLE BOLTS FOR STEEL STRANDED WIRE 35 SQ.MM.", "unit": "ชุด", "qty": 1 },
  { "code": "1010230203", "name": "GROUND WIRE SUPPORT AND CLAMP,FOR BAYONET", "unit": "ชุด", "qty": 1 },
  { "code": "1020230001", "name": "ARMOR-GRIP,PREFORMED,AL 400 SQ.MM.", "unit": "ชิ้น", "qty": 3 },
  { "code": "1020420302", "name": "TERMINAL,COMPRESSION,15 DEGREE PAD,NEMA,4-HOLE,FOR AL. 400 SQ.M", "unit": "ชิ้น", "qty": 3 },
  { "code": "1020430001", "name": "CLAMP DEAD END,COMPRESSION,SINGLE LUG,FOR AL.CONDUCTOR 400 SC", "unit": "ชุด", "qty": 3 },
  { "code": "1030020001", "name": "INSULATOR,SUSPENSION,TYPE C (CLASS 52-3) TIS.354", "unit": "ชิ้น", "qty": 81 },
  { "code": "1030110103", "name": "CLAMP,STRAIN,WITH CLAMPING KEEPER,FOR AL.CONDUCTOR 400 SQ.MM.", "unit": "ชุด", "qty": 3 },
  { "code": "1030140003", "name": "SOCKET-EYE", "unit": "ชุด", "qty": 6 },
  { "code": "1030140004", "name": "Y-CLEVIS-BALL", "unit": "ชุด", "qty": 3 },
  { "code": "1030140005", "name": "BALL-CLEVIS,ANSI TYPE B", "unit": "ชุด", "qty": 12 },
  { "code": "1030140006", "name": "SOCKET-CLEVIS,ANSI TYPE B", "unit": "ชุด", "qty": 3 }
];

if (targetAssemblyIndex !== -1) {
  data[targetAssemblyIndex].items = newItems;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully updated items for assembly: ${data[targetAssemblyIndex].assemblyName}`);
} else {
  console.log(`Could not find assembly matching SS-DD-3 DOUBLE DEAD END STRUCTURE`);
}
