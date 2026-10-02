import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.NVM_QA_BASE || 'http://127.0.0.1:4175/';
const output = path.resolve(import.meta.dirname, '..', 'qa-output', 'experience');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  headless: process.env.NVM_QA_HEADED !== '1',
  ...(process.env.NVM_QA_BROWSER ? { channel: process.env.NVM_QA_BROWSER } : {})
});
const results = [];
const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates', 'applications', 'security', 'roadmap'];

try {
  for (const language of ['en', 'zh-Hant']) for (const width of [1440, 390, 312]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const open = view => page.goto(`${base}?view=${view}&lang=${language}`, { waitUntil: 'networkidle' });
    await open('overview');
    const initialDom = await page.evaluate(() => ({
      elements: document.querySelectorAll('*').length,
      hiddenElements: [...document.querySelectorAll('.studio-panel[hidden]')].reduce((count, panel) => count + panel.querySelectorAll('*').length, 0)
    }));
    assert.equal(initialDom.hiddenElements, 0, 'Unvisited panels should not be constructed on first load');
    assert.equal(await page.locator('.studio-brand').getAttribute('href'), 'https://hub.samhuang68.org/');
    assert.deepEqual(await page.locator('.portfolio-back-link').evaluateAll(elements => elements.map(element => element.getAttribute('href'))), [
      'https://samhuang68.github.io/#projects', 'https://samhuang68.github.io/#projects'
    ]);
    assert.equal(await page.locator('#globalNav [data-i18n="nav.research"]').getAttribute('href'), 'https://hub.samhuang68.org/#layer-resources');

    // Every deferred panel must still work on first visit and after a locale change.
    for (const view of views) {
      await page.locator(`#tab-${view}`).click();
      assert.ok(await page.locator(`#panel-${view}`).isVisible());
      assert.ok(await page.locator(`#panel-${view}`).locator('h2').count());
    }
    await page.locator(`[data-language-option="${language === 'en' ? 'zh' : 'en'}"]`).click();
    for (const view of views) {
      await page.locator(`#tab-${view}`).click();
      assert.ok(await page.locator(`#panel-${view}`).isVisible());
      assert.ok(await page.locator(`#panel-${view}`).innerText());
    }

    await open('applications');
    const cases = await page.locator('[data-atlas-case-select] option').evaluateAll(elements => elements.map(element => element.value));
    const chooseCase = async id => width <= 620
      ? page.locator('[data-atlas-case-select]').selectOption(id)
      : page.locator(`[data-atlas-case="${id}"]`).click();
    await chooseCase(cases[1]);
    await page.locator('#tab-security').click();
    await page.locator('#tab-applications').click();
    await chooseCase(cases[2]);
    await page.goBack({ waitUntil: 'networkidle' });
    await page.goBack({ waitUntil: 'networkidle' });
    assert.equal(new URL(page.url()).searchParams.get('case'), cases[1]);
    assert.equal(await page.locator('#atlas-case-detail').getAttribute('data-case-id'), cases[1]);
    await page.goForward({ waitUntil: 'networkidle' });
    await page.goForward({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#atlas-case-detail').getAttribute('data-case-id'), cases[2]);

    await open('selector');
    await page.locator('#filter-family').selectOption('Reprogrammable embedded NVM');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#filter-family').inputValue(), 'Reprogrammable embedded NVM');
    assert.equal(await page.locator('#decision-body tr').count(), 1);
    await page.locator('#tab-security').click();
    await page.locator('#tab-selector').click();
    await page.locator('#filter-family').selectOption('ALL');
    await page.goBack({ waitUntil: 'networkidle' });
    await page.goBack({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#filter-family').inputValue(), 'Reprogrammable embedded NVM');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#btn-export-json').click();
    const download = await downloadPromise;
    const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(exported.records.length, 1);
    assert.ok(exported.records[0].RecordSHA256 && exported.records[0].Limitation);

    for (const fragment of ['chap-[', 'chap-%E0%A4%A', 'chap-unknown', 'chap-%73tate-contract']) {
      await page.goto(`${base}?view=whitepaper&lang=${language}#${fragment}`, { waitUntil: 'networkidle' });
      assert.ok(await page.locator('#panel-whitepaper').isVisible());
      assert.deepEqual(errors, [], 'Malformed and encoded chapter links must not throw');
    }

    for (const mode of ['clipboard', 'legacy', 'denied', 'legacy-throws']) {
      await open('templates');
      await page.evaluate(mode => {
        window.copiedOutline = null;
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
          writeText: async text => {
            if (mode !== 'clipboard') throw new DOMException('Blocked by browser', 'NotAllowedError');
            window.copiedOutline = text;
          }
        } });
        document.execCommand = () => {
          if (mode === 'legacy-throws') throw new Error('Legacy clipboard unavailable');
          if (mode === 'legacy') window.copiedOutline = document.activeElement.value;
          return mode === 'legacy';
        };
      }, mode);
      const button = page.locator('[data-copy-outline]').first();
      const expectedOutline = await button.getAttribute('data-copy-outline');
      await button.click();
      const manual = page.locator('[data-copy-fallback]').first();
      if (mode === 'clipboard' || mode === 'legacy') {
        await page.waitForFunction(() => document.querySelector('#toast').classList.contains('show'));
        assert.equal(await page.evaluate(() => window.copiedOutline), expectedOutline);
        assert.ok(await button.evaluate(element => element === document.activeElement));
        assert.ok(await manual.isHidden());
        assert.match(await page.locator('#toast').innerText(), language === 'en' ? /copied/i : /已複製/);
      } else {
        await manual.waitFor({ state: 'visible' });
        const field = manual.locator('textarea');
        assert.equal(await field.inputValue(), expectedOutline);
        assert.ok(await field.evaluate(element => element === document.activeElement && element.selectionStart === 0 && element.selectionEnd === element.value.length));
        assert.match(await page.locator('#toast').innerText(), language === 'en' ? /unavailable/i : /無法自動複製/);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: path.join(output, `manual-copy-${language}-${width}.png`) });
      }
      assert.deepEqual(errors, []);
    }
    results.push({ language, width, initialDom, history: 'pass', matrixReloadAndExport: 'pass', chapterFragments: 'pass', clipboardModes: 'pass' });
    await page.close();
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ base, browser: process.env.NVM_QA_BROWSER || 'chromium', results }, null, 2));
  console.log('PASS: 2 languages × 3 widths; deferred panels, history, filter reload/export, chapter fragments and four clipboard outcomes.');
} finally {
  await browser.close();
}
