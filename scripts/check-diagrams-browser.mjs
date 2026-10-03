import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium, firefox, webkit } from 'playwright';

const require = createRequire(import.meta.url);
const base = process.env.NVM_QA_BASE || 'http://127.0.0.1:4175/';
const files = ['fido2-hardware-trust-map.html', 'fido2-hardware-trust-map-zh.html', 'nvm-state-path.html', 'ocp-ai-nvm-opportunity-map.html', 'ocp-ai-nvm-opportunity-map-zh.html'];
const engines = { chromium, firefox, webkit, edge: chromium };
const output = path.resolve(import.meta.dirname, '..', 'qa-output', 'diagrams');
fs.mkdirSync(output, { recursive: true });
const report = { base, checkedAt: new Date().toISOString(), axeVersion: require('axe-core/package.json').version, scope: 'Automated desktop/mobile viewport, light/dark theme, keyboard, SVG export and axe checks. No physical device, Safari or screen-reader listening.', results: [], violations: [] };

try {
  for (const name of (process.env.NVM_QA_ENGINES || 'chromium,firefox,webkit').split(',')) {
    assert.ok(engines[name], `Unknown engine: ${name}`);
    const browser = await engines[name].launch({ headless: true, ...(name === 'edge' ? { channel: 'msedge' } : {}) });
    try {
      for (const width of [1280, 390, 320]) for (const file of files) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        try {
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          await page.goto(new URL(file, base).href, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(() => window.Archify?.focus && document.documentElement.dataset.motion === 'still');
          const result = { engine: name, version: browser.version(), width, file, themes: [], interactions: 'pending' };
          report.results.push(result);
          const svg = page.locator('svg[aria-labelledby="archify-diagram-title archify-diagram-description"]');
          assert.equal(await page.getByRole('main').count(), 1);
          assert.equal(await svg.getAttribute('role'), 'group');
          assert.equal(await svg.getAttribute('lang'), file.endsWith('-zh.html') ? 'zh-Hant' : 'en');
          assert.ok(await svg.getByRole('button').count() > 0, 'Interactive graph nodes must be exposed');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${file}/${width}: horizontal overflow`);
          const brokenReferences = await page.evaluate(() => [...document.querySelectorAll('[aria-controls], [aria-labelledby], [aria-describedby]')].flatMap(element => ['aria-controls', 'aria-labelledby', 'aria-describedby'].flatMap(attribute => (element.getAttribute(attribute) || '').split(/\s+/u).filter(id => id && !document.getElementById(id)))));
          assert.deepEqual(brokenReferences, [], 'ARIA references must resolve, including closed menus');
          for (const id of ['btn-theme', 'btn-preset', 'btn-motion', 'btn-present', 'btn-export']) {
            const button = page.locator(`#${id}`);
            assert.ok(await button.isVisible(), `${file}: ${id} is missing`);
            const box = await button.boundingBox();
            // Firefox reports a computed 44px box as 43.999996px via its protocol.
            const targetWidth = Math.round(box.width * 1000) / 1000;
            const targetHeight = Math.round(box.height * 1000) / 1000;
            assert.ok(box.x >= -1 && box.x + box.width <= width + 1 && targetWidth >= 44 && targetHeight >= 44, `${file}/${width}: ${id} must fit within the viewport with a 44 px target: ${JSON.stringify(box)}`);
          }

          await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
          for (const theme of ['light', 'dark']) {
            if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#btn-theme').click();
            assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
            // Measure the selected theme after its real color transitions finish.
            await page.evaluate(() => Promise.all(document.getAnimations()
              .filter(animation => Number.isFinite(animation.effect.getComputedTiming().endTime))
              .map(animation => animation.finished.catch(() => {}))));
            const scan = await page.evaluate(async () => {
              const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
              return { violations: result.violations, incomplete: result.incomplete.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) };
            });
            result.themes.push({ theme, violations: scan.violations.length, incomplete: scan.incomplete });
            if (scan.violations.length) report.violations.push({ engine: name, width, file, theme, violations: scan.violations });
          }

          const node = svg.locator('[data-node-id][role="button"]').first();
          const nodeId = await node.getAttribute('data-node-id');
          await node.focus();
          await page.keyboard.press('Enter');
          assert.equal(await node.getAttribute('aria-pressed'), 'true');
          await page.keyboard.press('Escape');
          assert.equal(await node.getAttribute('aria-pressed'), 'false');
          assert.equal(await page.evaluate(() => document.activeElement.getAttribute('data-node-id')), nodeId);

          await page.locator('#btn-node-finder').focus();
          await page.keyboard.press('Enter');
          await page.locator('#node-finder').waitFor({ state: 'visible' });
          await page.waitForFunction(() => document.activeElement.id === 'node-finder-input');
          assert.ok(await page.locator('#node-finder').evaluate(element => element.contains(document.activeElement)));
          await page.keyboard.press('Escape');
          assert.ok(await page.locator('#node-finder').isHidden());
          assert.equal(await page.evaluate(() => document.activeElement.id), 'btn-node-finder');

          await page.locator('#btn-export').focus();
          await page.keyboard.press('Enter');
          await page.locator('#export-menu').waitFor({ state: 'visible' });
          await page.locator('#export-menu [data-format="svg"]').focus();
          const downloadPromise = page.waitForEvent('download');
          await page.keyboard.press('Enter');
          const download = await downloadPromise;
          const exported = fs.readFileSync(await download.path(), 'utf8');
          assert.match(exported, /<svg\b/u);
          assert.ok(exported.includes(`data-node-id="${nodeId}"`), 'SVG export must retain the graph');
          await page.keyboard.press('Escape');
          if (width === 390 && file === 'fido2-hardware-trust-map-zh.html') await page.screenshot({ path: path.join(output, `${name}-zh-mobile.png`) });
          assert.deepEqual(errors, [], `${file}: runtime errors`);
          result.interactions = 'pass';
          console.log(`${name}/${width}/${file}: two themes and keyboard/export checks complete`);
        } finally { await context.close(); }
      }
    } finally { await browser.close(); }
  }
  assert.equal(report.violations.length, 0, `${report.violations.length} diagram configurations have axe violations; see qa-output/diagrams/results.json`);
  console.log(`PASS: ${report.results.length} diagram configurations, ${report.results.length * 2} theme scans; no axe violations.`);
} finally { fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2)); }
