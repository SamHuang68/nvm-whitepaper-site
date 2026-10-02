import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const output = path.resolve(import.meta.dirname, '..', '.loop-engineering', 'rendered-r22');
fs.mkdirSync(output, { recursive: true });
const widths = [1440, 1361, 1360, 1280, 1101, 1100, 901, 900, 768, 621, 620, 390, 312];
const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates', 'applications', 'security', 'roadmap'];
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
        '.schema-flow small', '.record-grid header', '.record-grid dt', '.record-grid article > p b',
        '.atlas-evidence-badge', '.atlas-state-flow small', '.atlas-contract-grid dt', '.atlas-boundary-grid p',
        '.fido-verdict-grid header p', '.fido-key-grid dt', '.fido-storage-grid header p', '.fido-backup-axis > header p',
        '.fido-memory-table thead th', '.fido-example-grid header b', '.fido-assurance-list dt', '.fido-source-list article b'
      ];
      const labelIssues = [...document.querySelectorAll(labelSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => ({ label: element.textContent.trim().slice(0, 28), size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter((item) => item.size < 9);
      const headingSelectors = ['.studio-hero h1', '.panel-heading h2', '.paper-heading h2', '.paper-chapter h3', '.section-label h3', '.selector-gate h3', '.template-card h3', '.atlas-detail-header h3', '.atlas-explorer-callout h3', '.fido-key-grid h4', '.fido-example-grid h4'];
      const headingIssues = [...document.querySelectorAll(headingSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => ({ selector: `${element.tagName.toLowerCase()}.${element.className || ''}`, text: element.textContent.trim().slice(0, 46), size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter((item) => item.size > (innerWidth <= 620 ? (item.selector.startsWith('h1.') ? 44.1 : item.selector.startsWith('h2.') ? 38.1 : 30.1) : (item.selector.startsWith('h1.') ? 72.1 : item.selector.startsWith('h2.') ? 64.1 : 56.1)));
      const proseSelectors = [
        '.view-dock-copy span', '.panel-heading > p', '.contract-card > strong', '.contract-card dd', '.evidence-note',
        '.technology-list article > div:not(.technology-name) p', '.node-lens-grid article > strong', '.calibration-boundary span',
        '.selection-sequence p', '.chapter-copy p', '.chapter-takeaways li', '.evidence-contract dd', '.decision-table tbody th',
        '.paper-heading dd', '.reader-index nav span', '.decision-table tbody th small', '.decision-table tbody td', '.selector-gate li span', '.schema-flow p', '.operational-fields span', '.record-grid dd',
        '.record-grid article > p', '.template-card li p', '.template-rule > span',
        '.atlas-summary', '.atlas-state-flow span', '.atlas-contract-grid dd', '.atlas-boundary-grid span', '.atlas-explorer-callout > div:last-child > span', '.atlas-explorer-card > span', '.atlas-history li p', '.atlas-history-boundary', '.atlas-transfer > p',
        '.fido-scope-banner > p', '.fido-verdict-grid article > p', '.fido-ceremony-grid li p', '.fido-ceremony-grid footer span',
        '.fido-key-grid article > p', '.fido-key-grid dd', '.fido-storage-grid article > p', '.fido-storage-grid footer span',
        '.fido-backup-axis article p', '.fido-explorer > div:last-child > span', '.fido-memory-table td',
        '.fido-examples-intro', '.fido-example-grid article > p', '.fido-assurance-list dd', '.fido-eucleak-copy > p',
        '.fido-eucleak-copy li p', '.fido-claim-list p', '.fido-claim-list strong', '.fido-gates li p', '.fido-sources-intro'
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
        '.roadmap-time', '.roadmap-count', '.roadmap-record p', '.roadmap-badge', '.roadmap-source a', '.roadmap-scope p', '.roadmap-scope strong',
        '.eyebrow.dark', '.section-label p', '.section-label > span', '.paper-chapter header > p', '.node-lens-grid article > p',
        '.selector-gate li b', '.operational-fields b', '.template-audience', '.view-tab:not([aria-selected="true"]) b',
        '.contract-index span', '.technology-number', '.technology-name span', '.selection-sequence li > span', '.selection-sequence p',
        '.reader-index > p', '.reader-index nav b', '.reader-boundary span', '.decision-table tbody th small',
        '.schema-flow li > span', '.schema-flow p', '.operational-fields small', '.record-grid header b',
        '.template-card > header span', '.template-card > header p', '.template-card li > span', '.template-card li p', '.matrix-evidence time',
        '.fido-verdict-grid footer b', '.fido-key-grid header span', '.fido-storage-grid footer b', '.fido-backup-axis article > span',
        '.fido-memory-table td span', '.fido-example-grid header b', '.fido-assurance-list header > b', '.fido-eucleak-shell aside p'
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

    if (view === 'applications') {
      const atlasAudit = await page.evaluate(() => {
        const rail = document.querySelector('.atlas-case-rail');
        const mobileFilter = document.querySelector('.atlas-filter-select');
        const mobileCase = document.querySelector('.atlas-case-select');
        const detail = document.querySelector('.atlas-detail');
        const flow = document.querySelector('.atlas-state-flow ol');
        const visible = (element) => Boolean(element?.getClientRects().length);
        return {
          selected: detail?.dataset.caseId,
          railVisible: visible(rail),
          mobileFilterVisible: visible(mobileFilter),
          mobileCaseVisible: visible(mobileCase),
          detailOverflow: detail ? detail.scrollWidth - detail.clientWidth : 999,
          flowColumns: flow ? getComputedStyle(flow).gridTemplateColumns.split(' ').length : 0,
          iframeCount: document.querySelectorAll('#panel-applications iframe').length,
          explorerListOverflow: (() => {
            const list = document.querySelector('.atlas-explorer-list');
            return list ? list.scrollWidth - list.clientWidth : 999;
          })(),
          explorers: [...document.querySelectorAll('.atlas-explorer-card')].map((card) => {
            const link = card.querySelector('a');
            const box = link?.getBoundingClientRect();
            const describedBy = link?.getAttribute('aria-describedby') || '';
            return {
              id: card.dataset.explorerId,
              href: link?.getAttribute('href'),
              target: link?.getAttribute('target'),
              rel: link?.getAttribute('rel'),
              describedBy,
              boundaryCount: describedBy ? document.querySelectorAll(`#${describedBy}`).length : 0,
              width: box?.width || 0,
              height: box?.height || 0,
              cardOverflow: card.scrollWidth - card.clientWidth,
              visible: visible(card) && visible(link)
            };
          })
        };
      });
      const expectedExplorerHrefs = ['./nvm-state-path.html', './ocp-ai-nvm-opportunity-map.html'];
      const explorerHrefs = atlasAudit.explorers.map((item) => item.href);
      const explorerContractFailed = JSON.stringify(explorerHrefs) !== JSON.stringify(expectedExplorerHrefs)
        || atlasAudit.explorers.some((item) => !item.visible || item.target !== '_blank' || !item.rel?.split(/\s+/).includes('noreferrer') || item.boundaryCount !== 1 || item.cardOverflow > 1)
        || atlasAudit.explorerListOverflow > 1;
      if (!atlasAudit.selected || atlasAudit.detailOverflow > 1 || atlasAudit.iframeCount || explorerContractFailed) {
        failures.push(`applications@${width}: Atlas contract ${JSON.stringify(atlasAudit)}`);
      }
      if (width <= 620 && atlasAudit.explorers.some((item) => item.width < 44 || item.height < 48)) failures.push(`applications@${width}: explorer target contract ${JSON.stringify(atlasAudit.explorers)}`);
      if (width <= 860 && (atlasAudit.railVisible || !atlasAudit.mobileFilterVisible || !atlasAudit.mobileCaseVisible || atlasAudit.flowColumns !== 1)) {
        failures.push(`applications@${width}: mobile Atlas contract ${JSON.stringify(atlasAudit)}`);
      }
      if (width > 860 && !atlasAudit.railVisible) failures.push(`applications@${width}: desktop case rail is hidden`);
      if (width > 860) {
        const firstCase = page.locator('[data-atlas-case]').first();
        await firstCase.focus();
        await page.keyboard.press('ArrowDown');
        const keyboard = await page.evaluate(() => ({
          pressed: document.querySelector('[data-atlas-case][aria-pressed="true"]')?.dataset.atlasCase,
          focused: document.activeElement?.dataset?.atlasCase,
          route: new URL(location.href).searchParams.get('case')
        }));
        if (keyboard.pressed !== 'APP-AI-HBM-002' || keyboard.focused !== 'APP-AI-HBM-002' || keyboard.route !== 'APP-AI-HBM-002') {
          failures.push(`applications@${width}: case keyboard contract ${JSON.stringify(keyboard)}`);
        }
      }
    }

    if (view === 'security') {
      const securityAudit = await page.evaluate(() => ({
        keyCards: document.querySelectorAll('.fido-key-grid article').length,
        storageCards: document.querySelectorAll('.fido-storage-grid article').length,
        backupCards: document.querySelectorAll('.fido-backup-axis article').length,
        namedExamples: document.querySelectorAll('.fido-example-grid article').length,
        claims: document.querySelectorAll('.fido-claim-list article').length,
        assuranceRows: document.querySelectorAll('.fido-assurance-list article').length,
        requirementTrails: document.querySelectorAll('.fido-assurance-list dl small').length,
        diagramHref: document.querySelector('.fido-explorer a')?.getAttribute('href'),
        iframeCount: document.querySelectorAll('#panel-security iframe').length,
        pov: document.querySelector('.fido-sources > footer span')?.textContent || ''
      }));
      if (securityAudit.keyCards !== 4 || securityAudit.storageCards !== 2 || securityAudit.backupCards !== 2 || securityAudit.namedExamples !== 6 || securityAudit.claims !== 8 || securityAudit.assuranceRows !== 4 || securityAudit.requirementTrails !== 12 || securityAudit.diagramHref !== './fido2-hardware-trust-map.html' || securityAudit.iframeCount || securityAudit.pov.includes('[object Object]')) {
        failures.push(`security@${width}: FIDO content contract ${JSON.stringify(securityAudit)}`);
      }
    }

    if ((width === 1440 && ['overview', 'whitepaper', 'selector', 'applications', 'security', 'roadmap'].includes(view)) || (width === 390 && ['overview', 'whitepaper', 'selector', 'applications', 'security', 'roadmap'].includes(view)) || (width === 312 && ['overview', 'applications', 'security', 'roadmap'].includes(view))) {
      const captureTab = page.locator(`#tab-${view}`);
      if (await captureTab.getAttribute('aria-selected') !== 'true') await captureTab.click();
      await page.screenshot({ path: path.join(output, `${view}-${width}-viewport.png`), fullPage: false });
      await page.locator(`#panel-${view}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${view}-${width}-panel.png`), fullPage: false });
      if (view === 'applications') {
        if (width > 860) await page.locator('[data-atlas-case="APP-DDR5-PMIC-016"]').click();
        else await page.locator('[data-atlas-case-select]').selectOption('APP-DDR5-PMIC-016');
        await page.screenshot({ path: path.join(output, `${view}-${width}-second-case.png`), fullPage: false });
        await page.locator('.atlas-explorer-callout').screenshot({ path: path.join(output, `${view}-${width}-explorers.png`) });
      }
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

for (const [locale, file] of [
  ['en', 'fido2-hardware-trust-map.html'],
  ['zh-Hant-content-en-viewer', 'fido2-hardware-trust-map-zh.html']
]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText || 'failed'}`));
  await page.goto(`http://127.0.0.1:4175/${file}`, { waitUntil: 'networkidle' });
  const pinViewerToTop = async () => {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(50);
  };
  await pinViewerToTop();
  const audit = await page.evaluate(() => {
    const expectedControlIds = ['btn-theme', 'btn-preset', 'btn-motion', 'btn-present', 'btn-export'];
    const toolbar = document.querySelector('.toolbar');
    const toolbarRect = toolbar?.getBoundingClientRect();
    const buttons = expectedControlIds.map((id) => {
      const button = document.getElementById(id);
      if (!button) return { id, present: false, visible: false };
      const style = getComputedStyle(button);
      const visible = !button.hidden && style.display !== 'none' && style.visibility !== 'hidden' && button.getClientRects().length > 0;
      if (!visible) return { id, present: true, visible: false };
        const rect = button.getBoundingClientRect();
        return {
          id: button.id,
          present: true,
          visible: true,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        };
      });
    return {
      lang: document.documentElement.lang,
      documentOverflow: document.documentElement.scrollWidth - innerWidth,
      toolbarOverflow: toolbar ? toolbar.scrollWidth - toolbar.clientWidth : 999,
      toolbarPresent: Boolean(toolbar),
      scrollX,
      scrollY,
      toolbarRect: toolbarRect ? { left: toolbarRect.left, right: toolbarRect.right, top: toolbarRect.top, bottom: toolbarRect.bottom, width: toolbarRect.width, height: toolbarRect.height } : null,
      expectedControlIds,
      controlCounts: Object.fromEntries(expectedControlIds.map((id) => [id, document.querySelectorAll(`[id="${id}"]`).length])),
      buttons,
      credentialKind: document.querySelector('[data-node-id="credentialSource"]')?.dataset.nodeKind,
      lifecycleText: document.querySelector('[data-node-id="immutablePolicy"]')?.dataset.nodeSublabel || '',
      h1Count: document.querySelectorAll('h1').length
    };
  });
  const missingOrInvisible = audit.buttons.filter((button) => !button.present || !button.visible);
  const nonUniqueControlIds = audit.expectedControlIds.filter((id) => audit.controlCounts[id] !== 1);
  const unreachable = audit.buttons.filter((button) => button.visible && (button.left < -1
    || button.right > 391
    || button.top < -1
    || button.bottom > 901
    || button.width < 44
    || button.height < 44));
  if (audit.lang !== 'en') failures.push(`${file}@390: Archify viewer lang fallback 預期為 en，實際為 ${audit.lang}`);
  if (!audit.toolbarPresent) failures.push(`${file}@390: 缺少 Archify toolbar`);
  if (audit.scrollX !== 0 || audit.scrollY !== 0) failures.push(`${file}@390: viewer 必須固定從頁首截圖 ${JSON.stringify({ scrollX: audit.scrollX, scrollY: audit.scrollY })}`);
  if (!audit.toolbarRect || audit.toolbarRect.left < -1 || audit.toolbarRect.right > 391 || audit.toolbarRect.top < -1 || audit.toolbarRect.bottom > 901) failures.push(`${file}@390: toolbar 未完整落在首屏 ${JSON.stringify(audit.toolbarRect)}`);
  if (missingOrInvisible.length || nonUniqueControlIds.length) failures.push(`${file}@390: toolbar 必須完整顯示五個唯一控制 ${JSON.stringify({ missingOrInvisible, nonUniqueControlIds, controlCounts: audit.controlCounts, expected: audit.expectedControlIds })}`);
  if (audit.documentOverflow > 1 || audit.toolbarOverflow > 1) failures.push(`${file}@390: viewer overflow ${JSON.stringify(audit)}`);
  if (unreachable.length) failures.push(`${file}@390: toolbar controls 不可達或小於 44px ${JSON.stringify(unreachable)}`);
  if (audit.credentialKind === 'database') failures.push(`${file}@390: credential material 不得使用 database 語意`);
  if (!/physical vs logical OTP|實體與邏輯 OTP/.test(audit.lifecycleText)) failures.push(`${file}@390: lifecycle 未區分實體與邏輯 OTP`);
  if (audit.h1Count !== 1) failures.push(`${file}@390: 必須只有一個 H1，實際 ${audit.h1Count}`);
  if (errors.length) failures.push(`${file}@390: runtime errors ${errors.join(' | ')}`);
  await pinViewerToTop();
  const captureAudit = await page.evaluate(() => {
    const expectedControlIds = ['btn-theme', 'btn-preset', 'btn-motion', 'btn-present', 'btn-export'];
    const toolbarRect = document.querySelector('.toolbar')?.getBoundingClientRect();
    return {
      scrollX,
      scrollY,
      controlCounts: Object.fromEntries(expectedControlIds.map((id) => [id, document.querySelectorAll(`[id="${id}"]`).length])),
      visibleControlIds: expectedControlIds.filter((id) => {
        const button = document.getElementById(id);
        if (!button) return false;
        const style = getComputedStyle(button);
        return !button.hidden && style.display !== 'none' && style.visibility !== 'hidden' && button.getClientRects().length > 0;
      }),
      toolbarRect: toolbarRect ? { left: toolbarRect.left, right: toolbarRect.right, top: toolbarRect.top, bottom: toolbarRect.bottom } : null
    };
  });
  if (captureAudit.scrollX !== 0 || captureAudit.scrollY !== 0
    || captureAudit.visibleControlIds.length !== Object.keys(captureAudit.controlCounts).length
    || Object.values(captureAudit.controlCounts).some((count) => count !== 1)
    || !captureAudit.toolbarRect || captureAudit.toolbarRect.top < -1 || captureAudit.toolbarRect.bottom > 901) {
    failures.push(`${file}@390: screenshot 前 toolbar 證據不完整 ${JSON.stringify(captureAudit)}`);
  }
  await page.screenshot({ path: path.join(output, `fido-map-${locale}-390.png`), fullPage: false });
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${views.length} views × ${widths.length} widths; no horizontal overflow, runtime errors, route mismatch or mobile control failure.`);
