import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium, firefox, webkit } from 'playwright';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const base = process.env.NVM_QA_BASE || 'http://127.0.0.1:4175/';
const engines = { chromium, firefox, webkit, edge: chromium };
const requestedEngines = (process.env.NVM_QA_ENGINES || 'chromium,firefox,webkit').split(',');
const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates', 'applications', 'security', 'roadmap'];
const output = path.resolve(import.meta.dirname, '..', 'qa-output', 'accessibility');
fs.mkdirSync(output, { recursive: true });
const report = {
  base, checkedAt: new Date().toISOString(), axeVersion: require('axe-core/package.json').version,
  scope: 'Automated engine, viewport, keyboard, DOM/ARIA and axe checks; Chromium/Edge also inspect the platform AX tree.',
  notVerified: ['Physical mobile devices', 'Safari on macOS or iOS', 'Audible screen-reader output'],
  results: [], violations: []
};
const activeId = page => page.evaluate(() => document.activeElement.id);

try {
  for (const name of requestedEngines) {
    assert.ok(engines[name], `Unknown browser engine: ${name}`);
    const browser = await engines[name].launch({ headless: true, ...(name === 'edge' ? { channel: 'msedge' } : {}) });
    try {
      for (const language of ['en', 'zh-Hant']) for (const width of [1280, 390, 320]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        try {
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          const result = { engine: name, version: browser.version(), language, width, views: [], keyboard: 'pending' };
          report.results.push(result);
          const open = async view => {
            await page.goto(`${base}?view=${view}&lang=${language}`, { waitUntil: 'networkidle' });
            await page.locator(`#panel-${view} h2`).first().waitFor();
            await page.evaluate(() => document.fonts.ready);
          };
          for (const view of views) {
            await open(view);
            assert.equal(await page.locator('html').getAttribute('lang'), language);
            assert.equal(await page.getByRole('main').count(), 1);
            assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
            assert.equal(await page.getByRole('tabpanel').count(), 1);
            assert.equal(await page.getByRole('tab', { selected: true }).getAttribute('id'), `tab-${view}`);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}/${language}/${width}/${view}: page overflow`);
            assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
            await page.locator(`#tab-${view}`).focus();
            await page.keyboard.press('Tab');
            assert.equal(await activeId(page), `panel-${view}`, `${name}/${view}: Tab must enter the panel before its controls`);
            assert.notEqual(await page.locator(`#panel-${view}`).evaluate(element => getComputedStyle(element).outlineStyle), 'none');
            await page.keyboard.press('Shift+Tab');
            assert.equal(await activeId(page), `tab-${view}`);

            if (view === 'selector') {
              assert.equal(await page.getByRole('columnheader').count(), 6, 'Responsive cards must preserve table headers');
              assert.equal(await page.getByRole('rowheader').count(), 8);
              assert.equal(await page.getByRole('cell').count(), 40);
              if (width <= 860) assert.ok(await page.locator('.matrix-secondary').first().evaluate(element => Math.abs(element.getBoundingClientRect().left - element.previousElementSibling.getBoundingClientRect().left) < 1), 'Node-lens details must stay in the mobile value column');
              if (name === 'chromium' || name === 'edge') {
                const cdp = await context.newCDPSession(page);
                const { nodes } = await cdp.send('Accessibility.getFullAXTree');
                result.platformAX = { columnHeaders: nodes.filter(node => !node.ignored && node.role?.value === 'columnheader').length };
                assert.equal(result.platformAX.columnHeaders, 6);
                await cdp.detach();
              }
              await page.locator('#filter-family').selectOption('Reprogrammable embedded NVM');
              assert.equal(await page.getByRole('rowheader').count(), 1);
              assert.equal(await page.getByRole('columnheader').count(), 6);
              await page.locator('#filter-family').selectOption('ALL');
              if (width === 390) await page.locator('.decision-table').screenshot({ path: path.join(output, `${name}-${language}-matrix-mobile.png`) });
            }
            if (view === 'security') {
              const titles = await page.locator('.fido-source-list h4').allTextContents();
              assert.equal(titles.length, 30);
              for (const title of titles) assert.equal(await page.locator('.fido-source-list').getByRole('link', { name: new RegExp(`${escapeRegex(title)}$`) }).count(), 1);
            }
            if (view === 'templates') {
              for (const card of await page.locator('.template-card').all()) {
                const title = await card.locator('h3').innerText();
                assert.equal(await card.getByRole('button', { name: new RegExp(`${escapeRegex(title)}$`) }).count(), 1);
              }
            }

            await page.addScriptTag({ path: axePath });
            const scan = await page.evaluate(async () => {
              const scan = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
              return { violations: scan.violations, incomplete: scan.incomplete.map(item => ({ id: item.id, help: item.help, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) };
            });
            result.views.push({ view, violations: scan.violations.length, incomplete: scan.incomplete });
            if (scan.violations.length) report.violations.push({ engine: name, language, width, view, violations: scan.violations });
          }

          await open('overview');
          await page.locator('#tab-overview').focus();
          await page.keyboard.press('End');
          assert.equal(await activeId(page), 'tab-roadmap');
          await page.keyboard.press('ArrowRight');
          assert.equal(await activeId(page), 'tab-overview');
          await page.keyboard.press('ArrowLeft');
          assert.equal(await activeId(page), 'tab-roadmap');
          await page.keyboard.press('Home');
          assert.equal(await activeId(page), 'tab-overview');
          await page.locator('.skip-link').focus();
          await page.keyboard.press('Enter');
          assert.equal(await activeId(page), 'studio-content');
          if (width < 1081) {
            await page.locator('#menuToggle').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'true');
            assert.ok(await page.locator('#globalNav a').first().evaluate(element => element === document.activeElement));
            await page.keyboard.press('Escape');
            assert.equal(await activeId(page), 'menuToggle');
            assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'false');
          }

          await open('selector');
          await page.locator('#tab-templates').click();
          await page.locator('[data-copy-outline]').first().focus();
          await page.goBack({ waitUntil: 'networkidle' });
          assert.equal(await activeId(page), 'tab-selector', 'History must not retain focus in a hidden panel');
          await page.keyboard.press('Tab');
          assert.equal(await activeId(page), 'panel-selector');
          await page.goForward({ waitUntil: 'networkidle' });
          assert.equal(await activeId(page), 'tab-templates');
          if (name === 'chromium' && width === 390) {
            await page.emulateMedia({ forcedColors: 'active' });
            await page.keyboard.press('Tab');
            assert.equal(await activeId(page), 'panel-templates');
            assert.notEqual(await page.locator('#panel-templates').evaluate(element => getComputedStyle(element).outlineStyle), 'none');
            await page.screenshot({ path: path.join(output, `forced-colors-${language}.png`) });
          }
          assert.deepEqual(errors, [], `${name}/${language}/${width}: browser errors`);
          result.keyboard = 'pass';
          console.log(`${name}/${language}/${width}: 8 views, keyboard and semantic checks complete`);
        } finally { await context.close(); }
      }
    } finally { await browser.close(); }
  }
  assert.equal(report.violations.length, 0, `${report.violations.length} page configurations have axe violations; inspect qa-output/accessibility/results.json`);
  console.log(`PASS: ${report.results.length * views.length} page configurations; no axe violations. Manual-review items and hardware/reader gaps remain explicit in the report.`);
} finally {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'); }
