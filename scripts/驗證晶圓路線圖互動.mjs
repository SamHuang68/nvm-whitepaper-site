import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { roadmap, filterRoadmap } from '../src/data/晶圓路線圖.js';

const output = new URL('../.loop-engineering/rendered-roadmap/', import.meta.url);
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const receipts = [];
try {
  for (const lang of ['en', 'zh-Hant']) {
    for (const width of [1440, 390, 312]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:4175/?view=roadmap&lang=${lang}`, { waitUntil: 'networkidle' });
      const ids = () => page.locator('.roadmap-record').evaluateAll(elements => elements.map(element => element.dataset.record));
      assert.equal((await ids()).length, roadmap.records.length);
      for (const status of Object.keys(roadmap.statuses)) {
        await page.locator('#roadmap-status').selectOption(status);
        assert.deepEqual(await ids(), filterRoadmap({ status }).sort((a, b) => b.year - a.year).map(item => item.id));
        assert.equal(new URL(page.url()).searchParams.get('maturity'), status);
      }
      await page.locator('#roadmap-status').selectOption('production');
      await page.locator('#roadmap-foundry').selectOption('GF');
      await page.locator('#roadmap-technology').selectOption('RRAM');
      assert.equal((await ids()).length, 0);
      assert.ok(await page.locator('.roadmap-empty').isVisible());
      await page.locator('.roadmap-reset').click();
      await page.locator('#roadmap-status').selectOption('designReady');
      await page.locator('#roadmap-foundry').selectOption('GF');
      await page.locator('#roadmap-technology').selectOption('MRAM');
      assert.deepEqual(await ids(), ['M16-design']);
      const summary = page.locator('[data-evidence="M16-design"] summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.ok(await page.locator('[data-evidence="M16-design"]').evaluate(element => element.open));
      assert.equal(await page.locator('[data-evidence="M16-design"] .roadmap-source').count(), 2);
      for (const link of await page.locator('[data-evidence="M16-design"] a').all()) {
        assert.equal(new URL(await link.getAttribute('href')).protocol, 'https:');
        assert.ok((await link.getAttribute('rel')).includes('noopener'));
      }
      await page.reload({ waitUntil: 'networkidle' });
      assert.deepEqual(await ids(), ['M16-design']);
      const other = lang === 'en' ? 'zh' : 'en';
      await page.locator(`[data-language-option="${other}"]`).click();
      assert.deepEqual(await ids(), ['M16-design']);
      assert.equal(await page.locator('#roadmap-status').inputValue(), 'designReady');
      await page.goBack({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), lang);
      assert.deepEqual(await ids(), ['M16-design']);
      await page.locator('.roadmap-reset').click();
      await page.locator('#tab-roadmap').focus();
      await page.keyboard.press('ArrowLeft');
      assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-view'), 'security');
      await page.keyboard.press('ArrowRight');
      assert.ok(await page.locator('#panel-roadmap').isVisible());
      await page.locator('#panel-roadmap').scrollIntoViewIfNeeded();
      await page.screenshot({ path: fileURLToPath(new URL(`路線圖-${lang}-${width}.png`, output)) });
      await page.locator('.roadmap-results').evaluate(element => element.scrollIntoView({ block: 'start' }));
      await page.screenshot({ path: fileURLToPath(new URL(`里程碑-${lang}-${width}.png`, output)) });
      for (const details of await page.locator('#panel-roadmap details').all()) await details.evaluate(element => { element.open = true; });
      const audit = await page.locator('#panel-roadmap').evaluate(element => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        cjk: (element.innerText.match(/[\u3400-\u9fff]/g) || []).length,
        missing: element.innerText.includes('undefined') || element.innerText.includes('[object Object]'),
        outside: [...element.querySelectorAll('*')].filter(item => item.getClientRects().length && item.getBoundingClientRect().right > innerWidth + 1).length
      }));
      assert.ok(audit.overflow <= 1 && audit.outside === 0, '展開來源後不得橫向溢出');
      assert.ok(!audit.missing);
      if (lang === 'en') assert.equal(audit.cjk, 0, '展開來源後英文仍須完整');
      const text = await page.locator('#panel-roadmap').innerText();
      fs.writeFileSync(new URL(`可見文字-${lang}-${width}.txt`, output), text);
      assert.deepEqual(errors, []);
      receipts.push({ lang, width, records: roadmap.records.length, audit });
      await page.close();
    }
  }
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4175/?view=roadmap&lang=en&maturity=invalid&foundry=invalid&memory=invalid', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.roadmap-record').count(), roadmap.records.length);
  assert.equal(await page.locator('#roadmap-status').inputValue(), 'all');
  await page.close();
  fs.writeFileSync(new URL('互動驗證.json', output), JSON.stringify(receipts, null, 2));
  console.log('晶圓路線圖互動通過：雙語、三種寬度、八種狀態、複合篩選、空結果、重設、鍵盤、來源展開、重新載入與語言往返。');
} finally {
  await browser.close();
}
