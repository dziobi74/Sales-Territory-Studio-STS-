const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/vite/dist/client/client.mjs',
  'node_modules/vite/dist/client/bundledDevClient.mjs',
  'node_modules/vite/dist/node/module-runner.js',
];

filesToPatch.forEach((relPath) => {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // Replace unguarded ws.send
  if (content.includes('ws.send(JSON.stringify(data));')) {
    content = content.replaceAll(
      'ws.send(JSON.stringify(data));',
      'if (ws && typeof ws.send === "function" && ws.readyState === 1) { ws.send(JSON.stringify(data)); }'
    );
    changed = true;
  }

  // Also replace any unguarded this.environment.hot.send in @tailwindcss/vite if present
  if (content.includes('this.environment.hot.send({type:"full-reload"})')) {
    content = content.replaceAll(
      'this.environment.hot.send({type:"full-reload"})',
      '(this.environment?.hot?.send && this.environment.hot.send({type:"full-reload"}))'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[patch-vite] Successfully patched ${relPath}`);
  }
});

// Also patch @tailwindcss/vite index.mjs
const tailwindVitePath = path.resolve(__dirname, '..', 'node_modules/@tailwindcss/vite/dist/index.mjs');
if (fs.existsSync(tailwindVitePath)) {
  let content = fs.readFileSync(tailwindVitePath, 'utf8');
  if (content.includes('this.environment.hot.send')) {
    content = content.replaceAll(
      'this.environment.hot.send({type:"full-reload"})',
      '(this.environment?.hot?.send && this.environment.hot.send({type:"full-reload"}))'
    );
    fs.writeFileSync(tailwindVitePath, content, 'utf8');
    console.log('[patch-vite] Successfully patched @tailwindcss/vite');
  }
}
