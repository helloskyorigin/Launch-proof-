const fs = require('fs');
let code = fs.readFileSync('app/api/checks/start/route.ts', 'utf8');

code = code.replace(
  /import \{ saveCheck \} from '@\/lib\/checks\/store';/,
  "import { saveCheck } from '@/lib/db/checks-repository';"
);

code = code.replace(
  /const checkRecord: CheckRecord = \{[\s\S]*?\};\n\n    saveCheck\(checkRecord\);/,
  `const checkRecord: CheckRecord = {
      id: checkId,
      url: normalizedUrl,
      finalUrl: normalizedUrl, // Can be updated if redirected
      status: 'created',
      productType: 'SaaS',
      createdAt: new Date().toISOString(),
    };

    await saveCheck(checkRecord);`
);

fs.writeFileSync('app/api/checks/start/route.ts', code);
