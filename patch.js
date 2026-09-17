const fs = require('fs');
let code = fs.readFileSync('lib/checks/check-store.ts', 'utf8');

code = code.replace(
  /export function updateCheckStatus[\s\S]*?return updated;\n\}/,
  `export function updateCheckStatus(
  id: string,
  status: CheckStatus,
  partial?: Partial<CheckRecord>
): CheckRecord | undefined {
  const existing = checksStore.get(id);
  if (!existing) {
     import('@/lib/db/checks-repository').then(({ updateCheckStatus: dbUpdate }) => {
       dbUpdate(id, status, partial).catch(e => console.error('Background update failed:', e));
     }).catch(() => {});
     return undefined;
  }
  const updated: CheckRecord = {
    ...existing,
    ...partial,
    status,
    updatedAt: new Date().toISOString(),
  };
  checksStore.set(id, updated);
  
  import('@/lib/db/checks-repository').then(({ updateCheckStatus: dbUpdate }) => {
    dbUpdate(id, status, partial).catch(e => console.error('Background update failed:', e));
  }).catch(() => {});
  
  return updated;
}`
);

code = code.replace(
  /export function getCheck[\s\S]*?return checksStore\.get\(id\);\n\}/,
  `export function getCheck(id: string): CheckRecord | undefined {
  import('@/lib/db/checks-repository').then(({ getCheck: dbGet }) => {
    dbGet(id).then(dbCheck => {
      if (dbCheck) checksStore.set(id, dbCheck);
    }).catch(e => console.error('Background fetch failed:', e));
  }).catch(() => {});
  
  return checksStore.get(id);
}`
);

fs.writeFileSync('lib/checks/check-store.ts', code);
