import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { roadmap, filterRoadmap } from '../src/data/晶圓路線圖.js';

const research = JSON.parse(readFileSync(new URL('../research/NVM晶圓代工路線圖_20260910.json', import.meta.url)));
const english = JSON.parse(readFileSync(new URL('../research/NVM晶圓代工路線圖英文_20260910.json', import.meta.url)));
const unique = list => assert.equal(new Set(list).size, list.length, '識別碼不得重複');
unique(roadmap.records.map(item => item.id));
unique(roadmap.sources.map(item => item.id));
assert.deepEqual(research.sources.map(s => s.id), english.sources.map(s => s.id));
assert.deepEqual(research.milestones.map(s => s.id), english.milestones.map(s => s.id));
const bilingual = value => {
  assert.ok(value?.zh?.trim() && value?.en?.trim(), '缺少完整雙語');
  assert.ok(!/[\u3400-\u9fff]/u.test(value.en), '英文內容混入中文');
};
for (const [id, label] of Object.entries(roadmap.statuses)) {
  bilingual(label);
  bilingual(roadmap.definitions[id]);
}
for (const source of roadmap.sources) {
  const translation = english.sources.find(item => item.id === source.id);
  assert.equal(source.url, translation.url, '雙語來源網址必須相同');
  assert.equal(source.date, translation.date, '雙語來源日期必須相同');
  for (const key of ['label', 'kind', 'locator', 'claim', 'evidence', 'limit']) bilingual(source[key]);
  const url = new URL(source.url);
  assert.equal(url.protocol, 'https:');
  assert.ok(['gf.com', 'investors.gf.com', 'www.tsmc.com', 'investor.tsmc.com', 'pr.tsmc.com', 'www.sec.gov'].includes(url.hostname));
  assert.equal(source.accessedAt, roadmap.asOf);
}
for (const record of roadmap.records) {
  assert.ok(roadmap.statuses[record.status], '未知成熟度不得回退量產');
  assert.ok(['event', 'target', 'snapshot'].includes(record.timeBasis));
  assert.ok(['GF', 'TSMC'].includes(record.foundry));
  assert.ok(['MRAM', 'RRAM'].includes(record.technology));
  assert.ok(research.milestones.some(item => item.id === record.milestoneId));
  for (const key of ['node', 'claim', 'limit']) bilingual(record[key]);
  assert.ok(record.sourceIds.length);
  record.sourceIds.forEach(id => assert.ok(roadmap.sources.some(source => source.id === id), `來源不存在：${id}`));
}
research.milestones.forEach(item => assert.ok(roadmap.records.some(record => record.milestoneId === item.id), `遺漏研究里程碑：${item.id}`));
const productionIds = ['M01-production', 'M04-production', 'M07-production', 'M08-production', 'M18-production', 'M19-production'];
assert.deepEqual(filterRoadmap({ status: 'production' }).map(item => item.id), productionIds, '量產白名單改變，需重新檢查原始證據');
for (const id of ['M13-design', 'M16-design']) assert.equal(roadmap.records.find(item => item.id === id).status, 'designReady');
assert.equal(roadmap.records.find(item => item.id === 'M03-ready').status, 'productionReady');
assert.equal(roadmap.records.find(item => item.id === 'M17-target').status, 'target');
for (const id of ['M18-production', 'M19-production']) assert.equal(roadmap.records.find(item => item.id === id).timeBasis, 'snapshot');
assert.ok(!filterRoadmap({ status: 'production', foundry: 'GF', technology: 'RRAM' }).length, 'GF RRAM 目標不得提升為量產');
assert.deepEqual(filterRoadmap({ status: 'designReady', foundry: 'GF', technology: 'MRAM' }).map(item => item.id), ['M16-design']);
assert.ok(!filterRoadmap({ status: 'invalid' }).length);
console.log(`晶圓路線圖檢查通過：${roadmap.records.length} 項主張、${roadmap.sources.length} 個來源、${research.milestones.length} 個研究里程碑完整涵蓋。`);
