const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib', 'estimationData.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const newAssemblies = [
  {
    "assemblyName": "SD-TG-3 ASSEMBLY NO. 5264A",
    "items": [
      { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 3 },
      { "code": "1010110200", "name": "BOLT,MACHINE M.16x130 mm.", "unit": "ชุด", "qty": 3 },
      { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 1 },
      { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
      { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010150000", "name": "BOLT,OVAL EYE M.16X150 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 12 },
      { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 3 },
      { "code": "1010200009", "name": "BRACE,ALLEY ARM 50x50x6 MM. 1,000 MM.LONG", "unit": "ชิ้น", "qty": 3 }
    ]
  },
  {
    "assemblyName": "SD-SA-2 ASSEMBLY NO. 5265A",
    "items": [
      { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010030002", "name": "PLATE,STEEL 6X100X450 MM.", "unit": "ชิ้น", "qty": 12 },
      { "code": "1010050000", "name": "ST. PIPE,SIZE 20, 100 MM.LONG W/O T.E.", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010110200", "name": "BOLT,MACHINE M.16x130 mm.", "unit": "ชุด", "qty": 6 },
      { "code": "1010110201", "name": "BOLT,MACHINE M.16x170 mm.", "unit": "ชุด", "qty": 18 },
      { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 1 },
      { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
      { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 42 },
      { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010200009", "name": "BRACE,ALLEY ARM 50x50x6 MM. 1,000 MM.LONG", "unit": "ชิ้น", "qty": 6 },
      { "code": "1030140012", "name": "BRACKET,CORNER SUSPENSION", "unit": "ชุด", "qty": 3 }
    ]
  },
  {
    "assemblyName": "SD-SA-3 ASSEMBLY NO. 5268A",
    "items": [
      { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 3 },
      { "code": "1010110200", "name": "BOLT,MACHINE M.16x130 mm.", "unit": "ชุด", "qty": 3 },
      { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 1 },
      { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
      { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010150000", "name": "BOLT,OVAL EYE M.16X150 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 12 },
      { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 3 },
      { "code": "1010200009", "name": "BRACE,ALLEY ARM 50x50x6 MM. 1,000 MM.LONG", "unit": "ชิ้น", "qty": 3 }
    ]
  },
  {
    "assemblyName": "SD-AS-3 ASSEMBLY NO. 5266A",
    "items": [
      { "code": "1000120004", "name": "CROSSARM,CHANNEL STEEL,ALLEY ARM,150X75X9 MM.3,000 MM.LONG", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010030002", "name": "PLATE,STEEL 6X100X450 MM.", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010030102", "name": "PLATE,STEEL DOUBLE ARMING 12X100X760 MM.", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010050002", "name": "ST. PIPE,SIZE 20, 150 MM.LONG W/O T.E.", "unit": "ชิ้น", "qty": 2 },
      { "code": "1010110203", "name": "BOLT,MACHINE M.16x250 mm.", "unit": "ชุด", "qty": 12 },
      { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 1 },
      { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
      { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 9 },
      { "code": "1010110301", "name": "BOLT,MACHINE M.20x400 mm.", "unit": "ชุด", "qty": 1 },
      { "code": "1010120000", "name": "BOLT,DOUBLE ARMING,M.16x400 mm.", "unit": "ชุด", "qty": 3 },
      { "code": "1010150001", "name": "BOLT,OVAL EYE M.16X200 MM.", "unit": "ชุด", "qty": 2 },
      { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 36 },
      { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 2 },
      { "code": "1010200002", "name": "BRACE,FLAT,FOR CROSSARM 50X10X1,950 MM.", "unit": "ชิ้น", "qty": 6 },
      { "code": "1020210109", "name": "LINE GUARD,PREFORMED,AL 400MM.", "unit": "ชุด", "qty": 2 },
      { "code": "1020240000", "name": "SPACER,HELICAL ROD,PREFORMED,FOR AL.400 SQ.MM.", "unit": "ชุด", "qty": 6 },
      { "code": "1020570106", "name": "CLAMP,TOP TYPE DOUBLE CONDUCTOR, AL 400 SQ.MM.FOR HORIZONTAL...", "unit": "ชุด", "qty": 1 },
      { "code": "1030010204", "name": "INSULATOR, POST TYPE 115 KV. HORIZONTAL MOUNTING", "unit": "ชิ้น", "qty": 1 },
      { "code": "1030140011", "name": "CLEVIS,THIMBLE,FOR PREFORMED DEAD-END", "unit": "ชิ้น", "qty": 3 }
    ]
  },
  {
    "assemblyName": "SD-DD-3 ASSEMBLY NO. 5274",
    "items": [
      { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 3 },
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
      { "code": "1010200002", "name": "BRACE,FLAT,FOR CROSSARM 40x6x1,000 mm.", "unit": "ชิ้น", "qty": 3 }
    ]
  },
  {
    "assemblyName": "SD-DD-4 ASSEMBLY NO. 5290",
    "items": [
      { "code": "1010000100", "name": "STEEL CHANNEL, 100x50x5 mm. 2,250 MM.LONG", "unit": "ชิ้น", "qty": 3 },
      { "code": "1010000400", "name": "STEEL CHANNEL,200X80X7.5 MM.1,000 MM.LONG", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010110200", "name": "BOLT,MACHINE M.16x130 mm.", "unit": "ชุด", "qty": 3 },
      { "code": "1010110204", "name": "BOLT,MACHINE M.16x300 mm.", "unit": "ชุด", "qty": 1 },
      { "code": "1010110205", "name": "BOLT,MACHINE M.16x350 mm.", "unit": "ชุด", "qty": 2 },
      { "code": "1010110300", "name": "BOLT,MACHINE M.20X350 MM.", "unit": "ชุด", "qty": 7 },
      { "code": "1010110301", "name": "BOLT,MACHINE M.20x400 mm.", "unit": "ชุด", "qty": 2 },
      { "code": "1010150000", "name": "BOLT,OVAL EYE M.16X150 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010150100", "name": "BOLT,OVAL M.20X350 MM.", "unit": "ชุด", "qty": 6 },
      { "code": "1010180100", "name": "WASHER,PLAIN,SQUARE,LARGE 52x52x4.5 mm.HOLE DIA. 18 MM. TIS.258", "unit": "ชิ้น", "qty": 12 },
      { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 30 },
      { "code": "1010180301", "name": "WASHER,LOCK,SPRING,SIZE 16 mm.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 3 },
      { "code": "1010180302", "name": "WASHER,LOCK,SPRING,SIZE 20 MM.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010200009", "name": "BRACE,ALLEY ARM 50x50x6 MM. 1,000 MM.LONG", "unit": "ชิ้น", "qty": 3 },
      { "code": "1020240000", "name": "SPACER,HELICAL ROD,PREFORMED,FOR AL.400 SQ.MM.", "unit": "ชุด", "qty": 3 }
    ]
  },
  {
    "assemblyName": "SD-LA-2 ASSEMBLY NO. 5255A",
    "items": [
      { "code": "1010000400", "name": "STEEL CHANNEL,200X80X7.5 MM.1,000 MM.LONG", "unit": "ชิ้น", "qty": 6 },
      { "code": "1010110302", "name": "BOLT,MACHINE M.20X450 MM.", "unit": "ชุด", "qty": 6 },
      { "code": "1010150100", "name": "BOLT,OVAL M.20X350 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010150101", "name": "BOLT,OVAL M.20X450 MM.", "unit": "ชุด", "qty": 3 },
      { "code": "1010180101", "name": "WASHER,PLAIN,SQUARE,LARGE 62X62X6 MM.HOLE DIA.22 MM. TIS.258", "unit": "ชิ้น", "qty": 24 },
      { "code": "1010180302", "name": "WASHER,LOCK,SPRING,SIZE 20 MM.,GENERAL PURPOSE,TIS.259", "unit": "ชิ้น", "qty": 6 },
      { "code": "1020240000", "name": "SPACER,HELICAL ROD,PREFORMED,FOR AL.400 SQ.MM.", "unit": "ชุด", "qty": 3 }
    ]
  }
];

newAssemblies.forEach(newAssembly => {
  const existingIndex = data.findIndex(a => a.assemblyName === newAssembly.assemblyName);
  if (existingIndex !== -1) {
      data[existingIndex] = newAssembly;
      console.log("Updated existing assembly:", newAssembly.assemblyName);
  } else {
      data.push(newAssembly);
      console.log("Added new assembly:", newAssembly.assemblyName);
  }
});

data.sort((a, b) => a.assemblyName.localeCompare(b.assemblyName));

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("Done");
