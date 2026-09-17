const fs = require('fs');
let code = fs.readFileSync('app/api/checks/start/route.ts', 'utf8');

code = code.replace(
  /const checkRecord = await saveCheck\(\{/,
  `const checkRecord = await saveCheck({` // In case it was already replaced
);

code = code.replace(
  /const checkRecord = saveCheck\(\{/,
  `const checkRecord = await saveCheck({`
);

fs.writeFileSync('app/api/checks/start/route.ts', code);
