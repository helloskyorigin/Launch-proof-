const fs = require('fs');
let code = fs.readFileSync('app/api/checks/start/route.ts', 'utf8');

code = code.replace(
  /const \{ url, description, productType \} = body \|\| \{\};/,
  "const { url, description, productType, parentCheckId } = body || {};"
);

code = code.replace(
  /const checkRecord = await saveCheck\(\{/,
  `const checkRecord = await saveCheck({`
);

// We need to pass parentCheckId to saveCheck. Wait, saveCheck signature is:
// export async function saveCheck(check: CheckRecord, parentCheckId?: string): Promise<CheckRecord>

code = code.replace(
  /httpStatus: reachability\.statusCode,\n    \}\);/,
  `httpStatus: reachability.statusCode,\n    }, parentCheckId);`
);

fs.writeFileSync('app/api/checks/start/route.ts', code);
