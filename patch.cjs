const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/ficheData\.cout \|\| null\]/g, "ficheData.cout || null");
fs.writeFileSync('server.ts', code);
