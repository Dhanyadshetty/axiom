const fs = require('fs');
const enPath = 'src/lib/i18n/en.ts';
const dePath = 'src/lib/i18n/de.ts';

let en = fs.readFileSync(enPath, 'utf8');
let de = fs.readFileSync(dePath, 'utf8');

en = en.replace('state: "STATE"', 'state: "STATE",\\n      noExecutions: "No agent executions have been recorded yet. Run an agent from the catalog and this trace will populate from the live database."');
de = de.replace('state: "STATUS"', 'state: "STATUS",\\n      noExecutions: "Es wurden noch keine Agentenausführungen aufgezeichnet. Führen Sie einen Agenten aus dem Katalog aus, und dieser Trace wird aus der Live-Datenbank gefüllt."');

fs.writeFileSync(enPath, en);
fs.writeFileSync(dePath, de);
console.log('en.ts and de.ts updated');
