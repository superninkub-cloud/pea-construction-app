const fs = require('fs');

let content = fs.readFileSync('app/gas-report/page.tsx', 'utf-8');

// Replace 1
content = content.replace(
  '<div className="main-content" style={{ padding: "20px" }}>',
  '<div className="main-content" style={{ padding: "20px", overflowY: "auto" }}>'
);

// Replace 2
content = content.replace(
  "minHeight: '100vh'",
  "height: '190mm'"
);

fs.writeFileSync('app/gas-report/page.tsx', content, 'utf-8');
console.log('Patched height and overflow');
