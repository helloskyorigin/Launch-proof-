const fs = require('fs');
let code = fs.readFileSync('app/api/checks/[id]/route.ts', 'utf8');

code = code.replace(
  /import \{ getCheck \} from '@\/lib\/checks\/store';/,
  "import { getCheck } from '@/lib/db/checks-repository';"
);

code = code.replace(
  /const check = getCheck\(id\);/,
  "const check = await getCheck(id);"
);

code = code.replace(
  /catch \{/,
  "catch (err) {\n    console.error('Error in GET /api/checks/[id]:', err);"
);

fs.writeFileSync('app/api/checks/[id]/route.ts', code);
