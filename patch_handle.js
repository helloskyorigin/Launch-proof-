const fs = require('fs');
let code = fs.readFileSync('app/check/[id]/page.tsx', 'utf8');

code = code.replace(
  /const handleRunRecheck = async \(\) => \{[\s\S]*?setStage\('checking'\);\n  \};/,
  `const handleRunRecheck = async () => {
    if (check) {
      try {
        const res = await fetch('/api/checks/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: check.url,
            description: check.description || '',
            productType: check.productType || '',
            parentCheckId: check.id,
          }),
        });
        const data = await res.json();
        if (data.success && data.check) {
          router.push(\`/check/\${data.check.id}\`);
          return;
        }
      } catch (err) {
        console.error('Failed to trigger re-check:', err);
      }
    }
    setStage('checking');
  };`
);

fs.writeFileSync('app/check/[id]/page.tsx', code);
