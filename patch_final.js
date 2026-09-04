const fs = require('fs');

let content = fs.readFileSync('app/gas-report/page.tsx', 'utf-8');

// Replace app-container
content = content.replace(
  '<div className="app-container">\\r\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />\\r\\n      <div className="content-area" style={{ padding: "20px" }}>',
  '<>\\r\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />\\r\\n      <div className="content-area" style={{ padding: "20px" }}>'
);
content = content.replace(
  '<div className="app-container">\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />\\n      <div className="content-area" style={{ padding: "20px" }}>',
  '<>\\n      <TopBar title="รายงานน้ำมัน (ยพ.6)" />\\n      <div className="content-area" style={{ padding: "20px" }}>'
);

// Replace end
content = content.replace(
  '        </div>\\r\\n      </div>\\r\\n    </div>\\r\\n  );\\r\\n}',
  '        </div>\\r\\n      </div>\\r\\n    </>\\r\\n  );\\r\\n}'
);
content = content.replace(
  '        </div>\\n      </div>\\n    </div>\\n  );\\n}',
  '        </div>\\n      </div>\\n    </>\\n  );\\n}'
);

// Signatures
content = content.replace(
  '                              <div>(.......................................................................................)</div>\\r\\n                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>\\r\\n                            </div>\\r\\n                            <div className="signature-box" style={{ flex: 1 }}>\\r\\n                              <div>(.......................................................................................)</div>\\r\\n                              <div className="font-bold mt-2">ผู้ควบคุม</div>',
  '                              <div>({reports[0]?.driver_name ? ` ${reports[0].driver_name} ` : "......................................................................................."})</div>\\r\\n                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>\\r\\n                            </div>\\r\\n                            <div className="signature-box" style={{ flex: 1 }}>\\r\\n                              <div>({reports[0]?.supervisor_name ? ` ${reports[0].supervisor_name} ` : "......................................................................................."})</div>\\r\\n                              <div className="font-bold mt-2">ผู้ควบคุม</div>'
);
content = content.replace(
  '                              <div>(.......................................................................................)</div>\\n                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>\\n                            </div>\\n                            <div className="signature-box" style={{ flex: 1 }}>\\n                              <div>(.......................................................................................)</div>\\n                              <div className="font-bold mt-2">ผู้ควบคุม</div>',
  '                              <div>({reports[0]?.driver_name ? ` ${reports[0].driver_name} ` : "......................................................................................."})</div>\\n                              <div className="font-bold mt-2">ผู้ขับยานพาหนะ</div>\\n                            </div>\\n                            <div className="signature-box" style={{ flex: 1 }}>\\n                              <div>({reports[0]?.supervisor_name ? ` ${reports[0].supervisor_name} ` : "......................................................................................."})</div>\\n                              <div className="font-bold mt-2">ผู้ควบคุม</div>'
);

fs.writeFileSync('app/gas-report/page.tsx', content, 'utf-8');
console.log('Done replacement');
