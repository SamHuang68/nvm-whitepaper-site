import { roadmap, filterRoadmap } from '../../data/晶圓路線圖.js';
import { localize, t } from '../../data/i18n.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const keys = { status: 'maturity', foundry: 'foundry', technology: 'memory' };

export function renderFoundryRoadmap(container, language = 'en') {
  if (!container) return;
  const U = (key, vars) => escapeHtml(t(key, language, vars));
  const L = value => escapeHtml(localize(value, language));
  const foundryName = id => id === 'TSMC' ? U('roadmap.tsmc') : 'GF';
  const params = new URL(location.href).searchParams;
  const allowed = { status: Object.keys(roadmap.statuses), foundry: ['GF', 'TSMC'], technology: ['MRAM', 'RRAM'] };
  const state = Object.fromEntries(Object.entries(keys).map(([key, query]) => [key, allowed[key].includes(params.get(query)) ? params.get(query) : 'all']));
  const options = (key, labels) => `<option value="all">${U('roadmap.all')}</option>${allowed[key].map(id => `<option value="${id}" ${state[key] === id ? 'selected' : ''}>${labels(id)}</option>`).join('')}`;
  container.innerHTML = `
    <header class="panel-heading"><div><p class="eyebrow dark">${U('roadmap.eyebrow')}</p><h2>${U('roadmap.title')}</h2></div><p>${U('roadmap.intro')}</p></header>
    <aside class="roadmap-scope"><strong>${U('roadmap.asOf')} ${roadmap.asOf}</strong><p>${L(roadmap.scope)}</p><p>${U('roadmap.boundary')}</p><p>${U('roadmap.editorial')}</p></aside>
    <form class="roadmap-filters" aria-label="${U('roadmap.filters')}">
      <label for="roadmap-status">${U('roadmap.status')}<select id="roadmap-status" name="status">${options('status', id => L(roadmap.statuses[id]))}</select></label>
      <label for="roadmap-foundry">${U('roadmap.foundry')}<select id="roadmap-foundry" name="foundry">${options('foundry', foundryName)}</select></label>
      <label for="roadmap-technology">${U('roadmap.technology')}<select id="roadmap-technology" name="technology">${options('technology', id => id)}</select></label>
      <button type="button" class="roadmap-reset">${U('roadmap.reset')}</button>
    </form>
    <details class="roadmap-legend"><summary>${U('roadmap.legend')}</summary><dl>${Object.entries(roadmap.statuses).map(([id, label]) => `<div><dt>${L(label)}</dt><dd>${L(roadmap.definitions[id])}</dd></div>`).join('')}</dl></details>
    <p class="roadmap-count" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="roadmap-results"></div>`;

  function sourceMarkup(id, recordId) {
    const source = roadmap.sources.find(item => item.id === id);
    return `<article id="source-${recordId}-${id}" class="roadmap-source">
      <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${L(source.label)} ↗</a>
      <p>${L(source.kind)} · ${U('roadmap.published')} ${escapeHtml(source.date || t('roadmap.undated', language))} · ${U('roadmap.asOf')} ${source.accessedAt}</p>
      <dl><dt>${U('roadmap.locator')}</dt><dd>${L(source.locator)}</dd><dt>${U('roadmap.evidence')}</dt><dd>${L(source.evidence)}</dd><dt>${U('roadmap.sourceClaim')}</dt><dd>${L(source.claim)}</dd><dt>${U('roadmap.limit')}</dt><dd>${L(source.limit)}</dd></dl>
    </article>`;
  }

  function update({ writeUrl = false } = {}) {
    const records = filterRoadmap(state);
    container.querySelector('.roadmap-count').textContent = t('roadmap.count', language, { count: records.length, total: roadmap.records.length });
    container.querySelector('.roadmap-results').innerHTML = records.length ? [...new Set(records.map(item => item.year))].sort((a, b) => b - a).map(year => `
      <section class="roadmap-year" aria-labelledby="roadmap-year-${year}"><h3 id="roadmap-year-${year}">${year}</h3><div class="roadmap-grid">${records.filter(item => item.year === year).map(item => `
        <article class="roadmap-record" id="roadmap-${item.id}" data-status="${item.status}" data-record="${item.id}">
          <header><span>${foundryName(item.foundry)} · ${item.technology}</span><b class="roadmap-badge">${L(roadmap.statuses[item.status])}</b></header>
          <h4>${L(item.node)}</h4>
          <p class="roadmap-time">${U(`roadmap.${item.timeBasis}`)} ${item.timeBasis === 'snapshot' ? roadmap.asOf : item.year}${item.targetPeriod ? ` · ${U('roadmap.targetPeriod')} ${escapeHtml(item.targetPeriod)}` : ''}</p>
          <p class="roadmap-claim">${L(item.claim)}</p>
          <p class="roadmap-limit"><strong>${U('roadmap.limit')}</strong> ${L(item.limit)}</p>
          <details data-evidence="${item.id}"><summary>${U('roadmap.sources', { count: item.sourceIds.length })}</summary>${item.sourceIds.map(id => sourceMarkup(id, item.id)).join('')}</details>
        </article>`).join('')}</div></section>`).join('') : `<p class="roadmap-empty">${U('roadmap.empty')}</p>`;
    if (writeUrl) {
      const url = new URL(location.href);
      for (const [key, query] of Object.entries(keys)) {
        if (state[key] === 'all') url.searchParams.delete(query);
        else url.searchParams.set(query, state[key]);
      }
      history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }
  container.querySelector('form').addEventListener('submit', event => event.preventDefault());
  container.querySelectorAll('select').forEach(select => select.addEventListener('change', () => {
    state[select.name] = select.value;
    update({ writeUrl: true });
  }));
  container.querySelector('.roadmap-reset').addEventListener('click', () => {
    for (const key of Object.keys(keys)) state[key] = 'all';
    container.querySelectorAll('select').forEach(select => { select.value = 'all'; });
    update({ writeUrl: true });
  });
  update();
}
