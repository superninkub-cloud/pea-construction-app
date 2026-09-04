const fs = require('fs');
let content = fs.readFileSync('../c3-vehicle-web/index.html', 'utf8');
content = content.replace(
  'masterCars = cars.map(c => ({ plate: c.plate_number, driver: c.default_driver }));',
  'masterCars = cars.map(c => ({ plate: c.plate_number === "55-0774 กทม." ? "90-8896 นฐ." : c.plate_number, driver: c.default_driver }));'
);
fs.writeFileSync('../c3-vehicle-web/index.html', content, 'utf8');
console.log('patched index.html');
