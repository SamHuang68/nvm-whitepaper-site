import { phase1KnowledgeBase } from '../../data/phase1_kb.js';
import { localize, t } from '../../data/i18n.js';

export function renderPhase1KB(container, language = 'en') {
  if (!container) return;
  const { stateContracts, technologyFamilies, processLenses, selectionSequence } = phase1KnowledgeBase;
  const U = (key) => t(key, language);
  const L = (value) => localize(value, language);
  const languageQuery = language === 'zh' ? '&lang=zh-Hant' : '&lang=en';

  container.innerHTML = `
    <header class="panel-heading">
      <div><p class="eyebrow dark">${U('overview.eyebrow')}</p><h2>${U('overview.title')}</h2></div>
      <p>${U('overview.intro')}</p>
    </header>

    <section class="content-section" aria-labelledby="contracts-title">
      <div class="section-label"><span>01</span><div><p>${U('overview.contracts.kicker')}</p><h3 id="contracts-title">${U('overview.contracts.title')}</h3></div></div>
      <div class="contract-grid">
        ${stateContracts.map((item) => `
          <article class="contract-card">
            <div class="contract-index"><span>${item.number}</span><i aria-hidden="true"></i></div>
            <p class="micro-label">${L(item.updateCadence)}</p>
            <h4>${L(item.contract)}</h4>
            <strong>${L(item.role)}</strong>
            <dl><div><dt>${U('overview.owner')}</dt><dd>${L(item.owner)}</dd></div><div><dt>${U('overview.question')}</dt><dd>${L(item.selectionQuestion)}</dd></div></dl>
            <p class="evidence-note"><b>${U('overview.limit')}</b>${L(item.evidenceBoundary)}</p>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section technology-section" aria-labelledby="technology-title">
      <div class="section-label"><span>02</span><div><p>${U('overview.technologies.kicker')}</p><h3 id="technology-title">${U('overview.technologies.title')}</h3></div></div>
      <div class="technology-list">
        ${technologyFamilies.map((item, index) => `
          <article>
            <span class="technology-number">0${index + 1}</span>
            <div class="technology-name"><p>${L(item.status)}</p><h4>${L(item.family)}</h4><span>${L(item.mechanism)}</span></div>
            <div><small>${U('overview.strongestFit')}</small><p>${L(item.strongestFit)}</p></div>
            <div><small>${U('overview.processLens')}</small><p>${L(item.processLens)}</p></div>
            <div class="technology-limit"><small>${U('overview.boundary')}</small><p>${L(item.limit)}</p></div>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section" aria-labelledby="node-title">
      <div class="section-label"><span>03</span><div><p>${U('overview.nodes.kicker')}</p><h3 id="node-title">${U('overview.nodes.title')}</h3></div></div>
      <div class="node-lens-grid">
        ${processLenses.map((item) => `
          <article><p>${L(item.range)}</p><h4>${L(item.title)}</h4><span>${L(item.body)}</span><strong>${L(item.decision)}</strong></article>
        `).join('')}
      </div>
      <aside class="calibration-boundary">
        <p>${U('overview.publicBoundary')}</p>
        <div><h4>${U('overview.publishTitle')}</h4><span>${U('overview.publishBody')}</span></div>
        <div><h4>${U('overview.retainTitle')}</h4><span>${U('overview.retainBody')}</span></div>
      </aside>
    </section>

    <section class="content-section sequence-section" aria-labelledby="sequence-title">
      <div class="section-label"><span>04</span><div><p>${U('overview.sequence.kicker')}</p><h3 id="sequence-title">${U('overview.sequence.title')}</h3></div></div>
      <ol class="selection-sequence">
        ${selectionSequence.map((item) => `<li><span>${item.step}</span><div><b>${L(item.name)}</b><p>${L(item.detail)}</p></div></li>`).join('')}
      </ol>
      <a class="inline-cta" href="?view=selector${languageQuery}">${U('overview.sequence.cta')} <span aria-hidden="true">→</span></a>
    </section>
  `;
}
