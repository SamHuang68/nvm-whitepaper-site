import assert from 'node:assert/strict';
import fs from 'node:fs';

// Apply after regenerating the pinned standalone Archify documents. Keep their
// graph data, rendering code and viewer controls intact; amend document semantics.
const files = ['fido2-hardware-trust-map.html', 'fido2-hardware-trust-map-zh.html', 'nvm-state-path.html', 'ocp-ai-nvm-opportunity-map.html', 'ocp-ai-nvm-opportunity-map-zh.html'];
for (const file of files) {
  const url = new URL(`../public/${file}`, import.meta.url);
  const original = fs.readFileSync(url, 'utf8');
  let html = original;
  if (!html.includes('<main id="diagram-workspace">')) {
    assert.equal(html.split('<body>').length, 2, `${file}: expected one body`);
    html = html.replace('<body>', '<body>\n  <main id="diagram-workspace">');
    const runtime = '\n  <script>\n    var Archify = {};';
    assert.equal(html.split(runtime).length, 2, `${file}: expected the pinned viewer runtime`);
    html = html.replace(runtime, '\n  </main>\n' + runtime);
  }
  const imageRole = 'role="img" lang="en" aria-labelledby="archify-diagram-title archify-diagram-description"';
  const diagramLanguage = file.endsWith('-zh.html') ? 'zh-Hant' : 'en';
  html = html.replace(imageRole, `role="group" lang="${diagramLanguage}" aria-labelledby="archify-diagram-title archify-diagram-description"`);
  if (diagramLanguage === 'zh-Hant') html = html.replace('<div class="header">', '<div class="header" lang="zh-Hant">');
  if (!html.includes('id="guided-views" role="group"')) html = html.replace('id="guided-views"', 'id="guided-views" role="group"');
  html = html.replace('justify-content: flex-end;\n        width: max-content;\n        max-width: 100%;', 'justify-content: flex-end;\n        flex-wrap: wrap;\n        width: 100%;\n        max-width: none;');
  if (!html.includes('id="nvm-viewer-accessibility"')) html = html.replace('</head>', '<style id="nvm-viewer-accessibility">.toolbar #btn-theme, .toolbar #btn-present { min-width: 44px; }</style>\n</head>');
  assert.match(html, /<svg[^>]*role="group"[^>]*aria-labelledby="archify-diagram-title archify-diagram-description"/u, `${file}: interactive SVG must expose its descendants`);
  assert.ok(html.includes(`lang="${diagramLanguage}" aria-labelledby="archify-diagram-title`), `${file}: diagram language`);
  assert.ok(html.includes('id="guided-views" role="group"'), `${file}: guided views group`);
  assert.ok(html.includes('justify-content: flex-end;\n        flex-wrap: wrap;\n        width: 100%;'), `${file}: mobile toolbar must wrap within the viewport`);
  if (process.argv.includes('--check')) assert.equal(original, html, `${file}: run npm run prepare:diagrams after regenerating viewers`);
  else if (html !== original) fs.writeFileSync(url, html);
}
console.log(`PASS: ${files.length} standalone viewers retain main landmarks, interactive diagram semantics and content languages.`);
