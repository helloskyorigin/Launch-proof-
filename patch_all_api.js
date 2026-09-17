const fs = require('fs');

const files = [
  'app/api/checks/[id]/run/route.ts',
  'app/api/checks/[id]/reason/route.ts',
  'app/api/checks/[id]/score/route.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace imports
  code = code.replace(
    /import \{([^}]+)\} from '@\/lib\/checks\/check-store';/,
    "import {$1} from '@/lib/db/checks-repository';"
  );
  
  // Make calls async
  code = code.replace(
    /const check = getCheck\(id\);/g,
    "const check = await getCheck(id);"
  );
  
  code = code.replace(
    /updateCheckStatus\(/g,
    "await updateCheckStatus("
  );
  
  code = code.replace(
    /saveCheck\(/g,
    "await saveCheck("
  );
  
  fs.writeFileSync(file, code);
}
