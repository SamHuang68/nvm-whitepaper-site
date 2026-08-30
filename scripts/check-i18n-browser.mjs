import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const output = path.resolve(import.meta.dirname, '..', '.loop-engineering', 'rendered-i18n-r1');
fs.mkdirSync(output, { recursive: true });
const locales = [
  { query: 'en', app: 'en', html: 'en', marker: 'NVM Overview' },
  { query: 'zh-Hant', app: 'zh', html: 'zh-Hant', marker: 'NVM 概覽' }
];
const widths = [1440, 1360, 1100, 900, 620, 390, 312];
const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates'];
const failures = [];
const browser = await chromium.launch({ headless: true });

for (const locale of locales) {
  for (const width of widths) {
    for (const view of views) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      page.on('requestfailed', (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText || 'failed'}`));
      await page.goto(`http://127.0.0.1:4175/?view=${view}&lang=${locale.query}`, { waitUntil: 'networkidle' });

      const audit = await page.evaluate(({ expectedView, expectedLanguage }) => {
        const visible = (element) => element?.getClientRects().length > 0;
        const outside = [...document.querySelectorAll('body *')].filter((element) => {
          if (!visible(element) || getComputedStyle(element).position === 'fixed') return false;
          const box = element.getBoundingClientRect();
          return box.left < -1 || box.right > innerWidth + 1;
        }).slice(0, 10).map((element) => {
          const box = element.getBoundingClientRect();
          return `${element.tagName.toLowerCase()}.${element.className || ''}:${Math.round(box.left)}/${Math.round(box.right)}`;
        });
        const activeLanguage = document.querySelector('[data-language-option][aria-pressed="true"]');
        const switcherText = document.querySelector('.language-switcher')?.innerText || '';
        const pageText = document.body.innerText.replace(switcherText, '');
        const cjkCount = (pageText.match(/[\u3400-\u9fff]/g) || []).length;
        const languageTargets = [...document.querySelectorAll('.language-option')].map((button) => ({
          w: button.getBoundingClientRect().width,
          h: button.getBoundingClientRect().height
        }));
        const mobileTargets = innerWidth > 620 ? [] : [...document.querySelectorAll('a[href], button, select')]
          .filter(visible)
          .map((element) => ({ text: element.textContent.trim().slice(0, 24), w: element.getBoundingClientRect().width, h: element.getBoundingClientRect().height }))
          .filter((target) => target.w < 44 || target.h < 44);
        const firstRow = document.querySelector('.decision-table tbody tr');
        return {
          overflow: Math.max(document.documentElement.scrollWidth - innerWidth, document.body.scrollWidth - innerWidth),
          outside,
          htmlLanguage: document.documentElement.lang,
          bodyLanguage: document.body.dataset.language,
          activeLanguage: activeLanguage?.dataset.languageOption,
          activeView: document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view,
          visiblePanel: [...document.querySelectorAll('.studio-panel')].filter((panel) => !panel.hidden).map((panel) => panel.id),
          urlLanguage: new URL(location.href).searchParams.get('lang'),
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.content,
          marker: document.querySelector('#tab-overview span')?.textContent.trim(),
          cjkCount,
          languageTargets,
          mobileTargets,
          selectorLabels: firstRow ? [...firstRow.children].map((cell) => cell.dataset.label) : [],
          expectedView,
          expectedLanguage
        };
      }, { expectedView: view, expectedLanguage: locale.app });

      if (audit.overflow > 1 || audit.outside.length) failures.push(`${locale.query}/${view}@${width}: overflow ${audit.overflow}; ${audit.outside.join(', ')}`);
      if (audit.htmlLanguage !== locale.html || audit.bodyLanguage !== locale.app || audit.activeLanguage !== locale.app || audit.urlLanguage !== locale.query) {
        failures.push(`${locale.query}/${view}@${width}: locale state ${JSON.stringify(audit)}`);
      }
      if (audit.activeView !== view || audit.visiblePanel.length !== 1 || audit.visiblePanel[0] !== `panel-${view}`) {
        failures.push(`${locale.query}/${view}@${width}: view state ${JSON.stringify(audit)}`);
      }
      if (audit.marker !== locale.marker || !audit.title || !audit.description) failures.push(`${locale.query}/${view}@${width}: shell localization ${JSON.stringify(audit)}`);
      if (locale.app === 'en' && audit.cjkCount !== 0) failures.push(`en/${view}@${width}: ${audit.cjkCount} unexpected CJK characters outside the selector`);
      if (locale.app === 'zh' && audit.cjkCount < 80) failures.push(`zh-Hant/${view}@${width}: only ${audit.cjkCount} CJK characters`);
      if (locale.app === 'zh' && view === 'selector' && audit.selectorLabels.some((label) => ['State Profile', 'Technology Family', 'Boundary', 'Candidate Fit'].includes(label))) {
        failures.push(`zh-Hant/selector@${width}: responsive table labels remain English`);
      }
      if (audit.languageTargets.some((target) => target.w < 44 || target.h < 44)) failures.push(`${locale.query}/${view}@${width}: language target below 44px`);
      if (audit.mobileTargets.length) failures.push(`${locale.query}/${view}@${width}: small targets ${JSON.stringify(audit.mobileTargets)}`);
      if (errors.length) failures.push(`${locale.query}/${view}@${width}: ${errors.join(' | ')}`);

      const capture = locale.app === 'zh' && ((width === 1440 && ['overview', 'whitepaper', 'selector'].includes(view)) || (width === 390 && ['overview', 'whitepaper', 'selector'].includes(view)) || (width === 312 && view === 'overview'));
      if (capture) {
        await page.screenshot({ path: path.join(output, `zh-${view}-${width}.png`), fullPage: false });
        await page.locator(`#panel-${view}`).scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `zh-${view}-${width}-panel.png`), fullPage: false });
      }
      await page.close();
    }
  }
}

{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4175/?view=whitepaper&lang=en#chap-node-boundary', { waitUntil: 'networkidle' });
  await page.locator('[data-language-option="zh"]').click();
  const switched = await page.evaluate(() => ({
    language: document.documentElement.lang,
    view: new URL(location.href).searchParams.get('view'),
    locale: new URL(location.href).searchParams.get('lang'),
    hash: location.hash,
    focused: document.activeElement?.dataset.languageOption
  }));
  if (JSON.stringify(switched) !== JSON.stringify({ language: 'zh-Hant', view: 'whitepaper', locale: 'zh-Hant', hash: '#chap-node-boundary', focused: 'zh' })) {
    failures.push(`language switch did not preserve route/focus: ${JSON.stringify(switched)}`);
  }
  await page.goBack({ waitUntil: 'networkidle' });
  const restored = await page.evaluate(() => ({
    language: document.documentElement.lang,
    view: new URL(location.href).searchParams.get('view'),
    locale: new URL(location.href).searchParams.get('lang'),
    hash: location.hash
  }));
  if (JSON.stringify(restored) !== JSON.stringify({ language: 'en', view: 'whitepaper', locale: 'en', hash: '#chap-node-boundary' })) {
    failures.push(`browser history did not restore locale/route: ${JSON.stringify(restored)}`);
  }
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 312, height: 844 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4175/?lang=zh-Hant', { waitUntil: 'networkidle' });
  await page.locator('#menuToggle').click();
  const opened = await page.evaluate(() => {
    const navBox = document.querySelector('#globalNav')?.getBoundingClientRect();
    return {
      expanded: document.querySelector('#menuToggle')?.getAttribute('aria-expanded'),
      label: document.querySelector('#menuToggle')?.getAttribute('aria-label'),
      firstLinkFocused: document.activeElement === document.querySelector('#globalNav a'),
      left: navBox?.left,
      right: navBox?.right
    };
  });
  if (opened.expanded !== 'true' || opened.label !== '關閉導覽選單' || !opened.firstLinkFocused || opened.left < -1 || opened.right > 313) {
    failures.push(`zh-Hant mobile menu contract failed: ${JSON.stringify(opened)}`);
  }
  await page.keyboard.press('Escape');
  const closed = await page.evaluate(() => ({
    expanded: document.querySelector('#menuToggle')?.getAttribute('aria-expanded'),
    label: document.querySelector('#menuToggle')?.getAttribute('aria-label'),
    focusRestored: document.activeElement === document.querySelector('#menuToggle')
  }));
  if (JSON.stringify(closed) !== JSON.stringify({ expanded: 'false', label: '開啟導覽選單', focusRestored: true })) {
    failures.push(`zh-Hant mobile menu close contract failed: ${JSON.stringify(closed)}`);
  }
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4175/?view=selector&lang=en', { waitUntil: 'networkidle' });
  const select = page.locator('#filter-family');
  await select.selectOption('Reprogrammable embedded NVM');
  const before = await page.locator('#decision-body tr').count();
  await page.locator('[data-language-option="zh"]').click();
  const preserved = await page.evaluate(() => ({
    family: document.querySelector('#filter-family')?.value,
    rows: document.querySelectorAll('#decision-body tr').length,
    label: document.querySelector('#filter-family option:checked')?.textContent,
    exportNote: document.querySelector('.matrix-export-note')?.textContent
  }));
  if (before !== 1 || preserved.family !== 'Reprogrammable embedded NVM' || preserved.rows !== 1 || !preserved.label.includes('可重複寫入') || !preserved.exportNote.includes('canonical')) {
    failures.push(`matrix filter/export boundary was not preserved: ${JSON.stringify(preserved)}`);
  }
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4175/?view=templates&lang=zh-Hant', { waitUntil: 'networkidle' });
  const copyContract = await page.evaluate(() => ({
    label: document.querySelector('[data-copy-outline]')?.textContent.trim(),
    outline: document.querySelector('[data-copy-outline]')?.dataset.copyOutline
  }));
  if (!copyContract.label?.includes('複製範本大綱') || !/[\u3400-\u9fff]/.test(copyContract.outline || '')) {
    failures.push(`localized template copy contract failed: ${JSON.stringify(copyContract)}`);
  }
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${locales.length} locales × ${views.length} views × ${widths.length} widths; complete shell/content localization, route preservation and mobile fit.`);
