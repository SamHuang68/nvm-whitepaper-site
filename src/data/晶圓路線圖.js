import zh from '../../research/NVM晶圓代工路線圖_20260910.json' with { type: 'json' };
import en from '../../research/NVM晶圓代工路線圖英文_20260910.json' with { type: 'json' };
import map from '../../diagrams/晶圓成熟度地圖.json' with { type: 'json' };

const pair = (zh, en) => ({ zh, en });
export const roadmapStatuses = {
  production: pair('量產', 'Production'),
  qualified: pair('認證／資格驗證', 'Qualified'),
  designReady: pair('設計就緒', 'Design-ready'),
  development: pair('開發', 'Development'),
  target: pair('目標', 'Target'),
  unresolved: pair('待確認', 'Unresolved'),
  productionReady: pair('生產準備', 'Production-ready'),
  announced: pair('已宣布', 'Announced')
};
export const roadmap = {
  asOf: zh.asOf,
  scope: pair(zh.scope, en.scope),
  statuses: roadmapStatuses,
  definitions: {
    ...Object.fromEntries(Object.keys(roadmapStatuses).map(id => [id, pair(zh.statusLegend[id], en.statusLegend[id])])),
    target: pair('原公告的前瞻目標；是否完成須另查對應完成紀錄，不能因目標日期已過就視為完成。', 'A forward-looking target in its original announcement; completion requires a separate completion record, not merely the passage of its target date.')
  },
  sources: zh.sources.map(source => {
    const english = en.sources.find(item => item.id === source.id);
    return { ...source, ...Object.fromEntries(['label', 'kind', 'locator', 'claim', 'evidence', 'limit'].map(key => [key, pair(source[key], english[key])])), accessedAt: zh.asOf };
  }),
  records: map.records.map(record => {
    const original = zh.milestones.find(item => item.id === record.milestoneId);
    const english = en.milestones.find(item => item.id === record.milestoneId);
    return {
      ...original, ...record,
      foundry: original.foundry === 'GF' ? 'GF' : 'TSMC',
      timeBasis: record.timeBasis || 'event',
      node: record.node || pair(original.node, english.node),
      claim: record.claim || pair(original.claim, english.claim),
      limit: pair(original.limit, english.limit)
    };
  })
};

export function filterRoadmap({ status = 'all', foundry = 'all', technology = 'all' } = {}) {
  return roadmap.records.filter(item =>
    (status === 'all' || item.status === status) &&
    (foundry === 'all' || item.foundry === foundry) &&
    (technology === 'all' || item.technology === technology));
}
