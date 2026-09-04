const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'c3-vehicle-web');
const filesToPatch = ['index.html', 'schema.sql'];

filesToPatch.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('55-0774')) {
      content = content.replace(/55-0774 กทม\./g, '90-8896 นฐ.');
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${file} successfully without corrupting encoding`);
    } else {
      console.log(`No match found in ${file}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
