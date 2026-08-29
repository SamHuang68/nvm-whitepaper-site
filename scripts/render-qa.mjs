import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const output = path.resolve(import.meta.dirname, '..', '.loop-engineering', 'rendered-r19');
fs.mkdirSync(output, { recursive: true });
const widths = [1440, 1361, 1360, 1280, 1101, 1100, 901, 900, 768, 621, 620, 390, 312];
const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates'];
const failures = [];
const browser = await chromium.launch({ headless: true });

for (const width of widths) {
  for (const view of views) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText || 'failed'}`));
    await page.goto(`http://127.0.0.1:4175/?view=${view}`, { waitUntil: 'networkidle' });

    const audit = await page.evaluate((expected) => {
      const doc = document.documentElement;
      const body = document.body;
      const active = document.querySelector('.view-tab[aria-selected="true"]');
      const visiblePanels = [...document.querySelectorAll('.studio-panel')].filter((panel) => !panel.hidden);
      const horizontalScrollers = [...document.querySelectorAll('body *')].filter((element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length && ['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
      }).map((element) => `${element.tagName.toLowerCase()}.${element.className || ''}:${element.scrollWidth}/${element.clientWidth}`);
      const outside = [...document.querySelectorAll('body *')].filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return element.getClientRects().length && style.position !== 'fixed' && (box.right > innerWidth + 1 || box.left < -1);
      }).slice(0, 12).map((element) => {
        const box = element.getBoundingClientRect();
        return `${element.tagName.toLowerCase()}.${element.className || ''}:${Math.round(box.left)}/${Math.round(box.right)}`;
      });
      const labelSelectors = [
        '.micro-label', '.contract-card dt', '.technology-list small', '.evidence-note b',
        '.paper-heading dt', '.evidence-contract dt', '.reader-boundary b', '.chapter-takeaways > p',
        '.selector-controls label span', '.selector-controls > p span', '.decision-table thead th',
        '.schema-flow small', '.record-grid header', '.record-grid dt', '.record-grid article > p b'
      ];
      const labelIssues = [...document.querySelectorAll(labelSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => ({ label: element.textContent.trim().slice(0, 28), size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter((item) => item.size < 9);
      const headingSelectors = ['.studio-hero h1', '.panel-heading h2', '.paper-heading h2', '.paper-chapter h3', '.section-label h3', '.selector-gate h3', '.template-card h3'];
      const headingIssues = [...document.querySelectorAll(headingSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => ({ selector: `${element.tagName.toLowerCase()}.${element.className || ''}`, text: element.textContent.trim().slice(0, 46), size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter((item) => item.size > (innerWidth <= 620 ? (item.selector.startsWith('h1.') ? 44.1 : item.selector.startsWith('h2.') ? 38.1 : 30.1) : (item.selector.startsWith('h1.') ? 72.1 : item.selector.startsWith('h2.') ? 64.1 : 56.1)));
      const proseSelectors = [
        '.view-dock-copy span', '.panel-heading > p', '.contract-card > strong', '.contract-card dd', '.evidence-note',
        '.technology-list article > div:not(.technology-name) p', '.node-lens-grid article > strong', '.calibration-boundary span',
        '.selection-sequence p', '.chapter-copy p', '.chapter-takeaways li', '.evidence-contract dd', '.decision-table tbody th',
        '.paper-heading dd', '.reader-index nav span', '.decision-table tbody th small', '.decision-table tbody td', '.selector-gate li span', '.schema-flow p', '.operational-fields span', '.record-grid dd',
        '.record-grid article > p', '.template-card li p', '.template-rule > span'
      ];
      const proseIssues = [...document.querySelectorAll(proseSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => ({ text: element.textContent.trim().slice(0, 46), size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter((item) => item.size < 14.9);
      const punctuationIssues = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
        .filter((element) => element.getClientRects().length && /[.!?]$/.test(element.textContent.trim()))
        .map((element) => element.textContent.trim().slice(0, 70));
      const rgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (value) => {
        const channels = rgb(value).map((channel) => {
          const normalized = channel / 255;
          return normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
        });
        return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
      };
      const contrastRatio = (foreground, background) => {
        const a = luminance(foreground);
        const b = luminance(background);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      };
      const tableContrastIssues = [...document.querySelectorAll('.decision-table tbody th, .decision-table tbody td')]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const style = getComputedStyle(element);
          const rowStyle = getComputedStyle(element.closest('tr'));
          const tableStyle = getComputedStyle(element.closest('.decision-table-wrap'));
          const background = style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? style.backgroundColor : rowStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ? rowStyle.backgroundColor : tableStyle.backgroundColor;
          return { text: element.textContent.trim().slice(0, 36), ratio: contrastRatio(style.color, background) };
        }).filter((item) => item.ratio < 4.5);
      const effectiveBackground = (element) => {
        let node = element;
        while (node) {
          const color = getComputedStyle(node).backgroundColor;
          const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
          if (channels.length >= 3 && (channels.length < 4 || channels[3] > .98)) return color;
          node = node.parentElement;
        }
        return 'rgb(255, 255, 255)';
      };
      const contrastSelectors = [
        '.eyebrow.dark', '.section-label p', '.section-label > span', '.paper-chapter header > p', '.node-lens-grid article > p',
        '.selector-gate li b', '.operational-fields b', '.template-audience', '.view-tab:not([aria-selected="true"]) b',
        '.contract-index span', '.technology-number', '.technology-name span', '.selection-sequence li > span', '.selection-sequence p',
        '.reader-index > p', '.reader-index nav b', '.reader-boundary span', '.decision-table tbody th small',
        '.schema-flow li > span', '.schema-flow p', '.operational-fields small', '.record-grid header b',
        '.template-card > header span', '.template-card > header p', '.template-card li > span', '.template-card li p', '.matrix-evidence time'
      ];
      const generalContrastIssues = [...document.querySelectorAll(contrastSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const style = getComputedStyle(element);
          const size = parseFloat(style.fontSize);
          const weight = Number(style.fontWeight) || 400;
          const threshold = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
          const ratio = contrastRatio(style.color, effectiveBackground(element));
          return { text: element.textContent.trim().slice(0, 36), ratio, threshold };
        }).filter((item) => item.ratio < item.threshold);
      return {
        overflow: Math.max(doc.scrollWidth - doc.clientWidth, body.scrollWidth - body.clientWidth),
        horizontalScrollers,
        outside,
        selected: active?.dataset.view,
        visiblePanel: visiblePanels[0]?.id,
        visibleCount: visiblePanels.length,
        h1Count: document.querySelectorAll('h1').length,
        lang: document.documentElement.lang,
        brand: document.querySelector('.studio-brand')?.href,
        heroSize: parseFloat(getComputedStyle(document.querySelector('.studio-hero h1')).fontSize),
        labelIssues,
        headingIssues,
        proseIssues,
        punctuationIssues,
        tableContrastIssues,
        generalContrastIssues,
        routeContextVisible: expected === 'overview' || [...document.querySelectorAll(`#panel-${expected} .panel-heading, #panel-${expected} .paper-heading, .view-tab[aria-selected="true"]`)]
          .some((element) => { const box = element.getBoundingClientRect(); return box.bottom > 0 && box.top < innerHeight; }),
        expected
      };
    }, view);

    if (audit.overflow > 1) failures.push(`${view}@${width}: document overflow ${audit.overflow}px; ${audit.outside.join(', ')}`);
    if (audit.horizontalScrollers.length) failures.push(`${view}@${width}: horizontal scroller ${audit.horizontalScrollers.join(', ')}`);
    if (audit.selected !== view || audit.visiblePanel !== `panel-${view}` || audit.visibleCount !== 1) failures.push(`${view}@${width}: route/panel ${JSON.stringify(audit)}`);
    if (audit.h1Count !== 1 || audit.lang !== 'en') failures.push(`${view}@${width}: document semantics H1=${audit.h1Count} lang=${audit.lang}`);
    if (audit.brand !== 'https://samhuang68.github.io/secure-storage-knowledge-hub/') failures.push(`${view}@${width}: brand target ${audit.brand}`);
    if (audit.labelIssues.length) failures.push(`${view}@${width}: evidence label floor ${JSON.stringify(audit.labelIssues)}`);
    if (audit.headingIssues.length) failures.push(`${view}@${width}: heading scale ${JSON.stringify(audit.headingIssues)}`);
    if (audit.proseIssues.length) failures.push(`${view}@${width}: mobile prose floor ${JSON.stringify(audit.proseIssues)}`);
    if (audit.punctuationIssues.length) failures.push(`${view}@${width}: display heading punctuation ${JSON.stringify(audit.punctuationIssues)}`);
    if (audit.tableContrastIssues.length) failures.push(`${view}@${width}: decision-table contrast ${JSON.stringify(audit.tableContrastIssues)}`);
    if (audit.generalContrastIssues.length) failures.push(`${view}@${width}: light-surface contrast ${JSON.stringify(audit.generalContrastIssues)}`);
    if (!audit.routeContextVisible) failures.push(`${view}@${width}: active workbench context is not visible in the first viewport`);
    if (width <= 390 && audit.heroSize > 44.1) failures.push(`${view}@${width}: mobile hero ${audit.heroSize}px exceeds 44px`);
    if (errors.length) failures.push(`${view}@${width}: ${errors.join(' | ')}`);

    if (width <= 621) {
      const smallTargets = await page.evaluate(() => [...document.querySelectorAll('a[href], button:not([hidden]), select')].filter((element) => element.getClientRects().length).map((element) => ({ label: element.textContent.trim().slice(0, 30), w: element.getBoundingClientRect().width, h: element.getBoundingClientRect().height })).filter((box) => box.w < 44 || box.h < 44));
      if (smallTargets.length) failures.push(`${view}@${width}: small targets ${JSON.stringify(smallTargets)}`);
      const menu = page.locator('#menuToggle');
      await menu.click();
      const menuAudit = await page.evaluate(() => ({ expanded: document.querySelector('#menuToggle')?.getAttribute('aria-expanded'), focus: document.activeElement === document.querySelector('#globalNav a'), box: document.querySelector('#globalNav')?.getBoundingClientRect().toJSON() }));
      if (menuAudit.expanded !== 'true' || !menuAudit.focus || menuAudit.box.left < -1 || menuAudit.box.right > width + 1) failures.push(`${view}@${width}: menu ${JSON.stringify(menuAudit)}`);
      await page.keyboard.press('Escape');
      const escaped = await page.evaluate(() => document.querySelector('#menuToggle')?.getAttribute('aria-expanded') === 'false' && document.activeElement === document.querySelector('#menuToggle'));
      if (!escaped) failures.push(`${view}@${width}: Escape did not close and restore focus`);
    }

    if (view === 'overview') {
      const firstTab = page.locator('#tab-overview');
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      const keyboard = await page.evaluate(() => ({ selected: document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view, focused: document.activeElement?.dataset?.view, query: new URL(location.href).searchParams.get('view') }));
      if (keyboard.selected !== 'whitepaper' || keyboard.focused !== 'whitepaper' || keyboard.query !== 'whitepaper') failures.push(`overview@${width}: keyboard tab contract ${JSON.stringify(keyboard)}`);
    }

    if ((width === 1440 && ['overview', 'whitepaper', 'selector'].includes(view)) || (width === 390 && ['overview', 'whitepaper', 'selector'].includes(view)) || (width === 312 && view === 'overview')) {
      const captureTab = page.locator(`#tab-${view}`);
      if (await captureTab.getAttribute('aria-selected') !== 'true') await captureTab.click();
      await page.screenshot({ path: path.join(output, `${view}-${width}-viewport.png`), fullPage: false });
      await page.locator(`#panel-${view}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${view}-${width}-panel.png`), fullPage: false });
    }
    await page.close();
  }
}

{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4175/?view=whitepaper#chap-state-contract', { waitUntil: 'networkidle' });
  await page.locator('#tab-selector').click();
  await page.reload({ waitUntil: 'networkidle' });
  const route = await page.evaluate(() => ({
    selected: document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view,
    hash: location.hash,
    view: new URL(location.href).searchParams.get('view')
  }));
  if (route.selected !== 'selector' || route.view !== 'selector' || route.hash) failures.push(`chapter-to-selector reload contract ${JSON.stringify(route)}`);
  await page.goto('http://127.0.0.1:4175/#chap-state-contract', { waitUntil: 'networkidle' });
  const direct = await page.evaluate(() => document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view);
  if (direct !== 'whitepaper') failures.push(`direct chapter route selected ${direct}`);
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${views.length} views × ${widths.length} widths; no horizontal overflow, runtime errors, route mismatch or mobile control failure.`);
