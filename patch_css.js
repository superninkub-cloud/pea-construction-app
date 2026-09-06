const fs = require('fs');

let css = fs.readFileSync('app/gas-report/GasReport.css', 'utf-8');

if (!css.includes('transform: scale')) {
  css = css.replace(
    '.official-form {',
    `.official-form {
  transform: scale(0.95);
  transform-origin: top center;`
  );
  
  fs.writeFileSync('app/gas-report/GasReport.css', css, 'utf-8');
  console.log('Patched CSS');
}
