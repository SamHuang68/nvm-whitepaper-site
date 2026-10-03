import { applicationAtlas } from '../../data/application_atlas.js';
import { localize, t } from '../../data/i18n.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const evidenceSlug = (label) => label.toLowerCase().replaceAll(' ', '-');

function locationState() {
  const url = new URL(window.location.href);
  return {
    selectedId: url.searchParams.get('case'),
    rationale: url.searchParams.get('rationale')
  };
}

function replaceLocationState(selectedId, rationale) {
  const url = new URL(window.location.href);
  url.searchParams.set('case', selectedId);
  if (rationale === 'all') url.searchParams.delete('rationale');
  else url.searchParams.set('rationale', rationale);
  window.history.replaceState(
    { ...(window.history.state || {}), case: selectedId, rationale },
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
}

export function renderApplicationAtlas(container, language = 'en', options = {}) {
  if (!container) return;
  const U = (key, variables) => t(key, language, variables);
  const L = (value) => localize(value, language);
  const stateFromUrl = locationState();
  const rationaleIds = new Set(applicationAtlas.rationales.map((item) => item.id));
  const caseIds = new Set(applicationAtlas.cases.map((item) => item.id));
  const initialRationale = rationaleIds.has(options.rationale)
    ? options.rationale
    : rationaleIds.has(stateFromUrl.rationale) ? stateFromUrl.rationale : 'all';
  const initialCase = caseIds.has(options.selectedId)
    ? options.selectedId
    : caseIds.has(stateFromUrl.selectedId) ? stateFromUrl.selectedId : applicationAtlas.cases[0].id;

  const render = (requestedId, requestedRationale, { focus = null, syncUrl = false } = {}) => {
    const rationale = rationaleIds.has(requestedRationale) ? requestedRationale : 'all';
    const visibleCases = applicationAtlas.cases.filter((item) => rationale === 'all' || item.rationale === rationale);
    const selected = visibleCases.find((item) => item.id === requestedId) || visibleCases[0] || applicationAtlas.cases[0];
    const badgeSlug = evidenceSlug(selected.evidenceLabel);

    container.dataset.selectedApplication = selected.id;
    container.dataset.applicationRationale = rationale;
    container.innerHTML = `
      <header class="panel-heading atlas-heading">
        <div><p class="eyebrow dark">${escapeHtml(U('applications.eyebrow'))}</p><h2>${U('applications.title')}</h2></div>
        <p>${escapeHtml(U('applications.intro'))}</p>
      </header>

      <section class="atlas-filter-shell" aria-labelledby="atlas-filter-label">
        <p id="atlas-filter-label">${escapeHtml(U('applications.filterLabel'))}</p>
        <div class="atlas-filter-buttons" role="group" aria-label="${escapeHtml(U('applications.filterAria'))}">
          ${applicationAtlas.rationales.map((item) => `
            <button type="button" data-atlas-rationale="${item.id}" aria-pressed="${item.id === rationale}">${escapeHtml(L(item.label))}</button>
          `).join('')}
        </div>
        <label class="atlas-filter-select">
          <span>${escapeHtml(U('applications.filterLabel'))}</span>
          <select data-atlas-rationale-select aria-label="${escapeHtml(U('applications.filterAria'))}">
            ${applicationAtlas.rationales.map((item) => `<option value="${item.id}"${item.id === rationale ? ' selected' : ''}>${escapeHtml(L(item.label))}</option>`).join('')}
          </select>
        </label>
      </section>

      <div class="atlas-layout">
        <nav class="atlas-case-rail" aria-label="${escapeHtml(U('applications.caseAria'))}">
          <p>${escapeHtml(U('applications.caseLabel'))}</p>
          <div class="atlas-case-list">
            ${visibleCases.map((item) => `
              <button type="button" data-atlas-case="${item.id}" aria-pressed="${item.id === selected.id}" aria-controls="atlas-case-detail" tabindex="${item.id === selected.id ? '0' : '-1'}">
                <span>${item.sequence}</span>
                <strong>${escapeHtml(L(item.title))}</strong>
                <small>${escapeHtml(L(applicationAtlas.rationales.find((entry) => entry.id === item.rationale)?.label))}</small>
              </button>
            `).join('')}
          </div>
        </nav>

        <label class="atlas-case-select">
          <span>${escapeHtml(U('applications.caseLabel'))}</span>
          <select data-atlas-case-select aria-label="${escapeHtml(U('applications.caseAria'))}">
            ${visibleCases.map((item) => `<option value="${item.id}"${item.id === selected.id ? ' selected' : ''}>${item.sequence} · ${escapeHtml(L(item.title))}</option>`).join('')}
          </select>
        </label>

        <article id="atlas-case-detail" class="atlas-detail" data-case-id="${selected.id}" aria-labelledby="atlas-detail-title">
          <header class="atlas-detail-header">
            <div class="atlas-evidence-row">
              <span class="atlas-evidence-badge is-${badgeSlug}">${escapeHtml(selected.evidenceLabel)}</span>
              <span>${escapeHtml(U(`applications.evidence.${badgeSlug}`))}</span>
            </div>
            <p>${escapeHtml(selected.id)} · ${escapeHtml(L(applicationAtlas.rationales.find((item) => item.id === selected.rationale)?.label))}</p>
            <h3 id="atlas-detail-title">${escapeHtml(L(selected.title))}</h3>
            <strong>${escapeHtml(L(selected.subtitle))}</strong>
            <p class="atlas-summary">${escapeHtml(L(selected.summary))}</p>
          </header>

          <figure class="atlas-state-flow">
            <ol>
              <li><small>${escapeHtml(U('applications.stage.trigger'))}</small><strong>${escapeHtml(L(selected.stateFlow.trigger))}</strong><span>${escapeHtml(L(selected.contract.writeCadence))}</span></li>
              <li><small>${escapeHtml(U('applications.stage.payload'))}</small><strong>${escapeHtml(L(selected.stateFlow.payload))}</strong><span>${escapeHtml(L(selected.contract.candidateTechnology))}</span></li>
              <li><small>${escapeHtml(U('applications.stage.reader'))}</small><strong>${escapeHtml(L(selected.stateFlow.reader))}</strong><span>${escapeHtml(L(selected.contract.processLens))}</span></li>
              <li><small>${escapeHtml(U('applications.stage.consumer'))}</small><strong>${escapeHtml(L(selected.stateFlow.consumer))}</strong><span>${escapeHtml(L(selected.subtitle))}</span></li>
            </ol>
            <figcaption>${escapeHtml(U('applications.flowCaption'))}</figcaption>
          </figure>

          <section class="atlas-contract" aria-labelledby="atlas-contract-title">
            <div class="atlas-section-heading"><p>${escapeHtml(U('applications.contract'))}</p><h4 id="atlas-contract-title">${escapeHtml(L(selected.subtitle))}</h4></div>
            <dl class="atlas-contract-grid">
              <div><dt>${escapeHtml(U('applications.payload'))}</dt><dd>${escapeHtml(L(selected.stateFlow.payload))}</dd></div>
              <div><dt>${escapeHtml(U('applications.cadence'))}</dt><dd>${escapeHtml(L(selected.contract.writeCadence))}</dd></div>
              <div><dt>${escapeHtml(U('applications.reader'))}</dt><dd>${escapeHtml(L(selected.stateFlow.reader))}</dd></div>
              <div><dt>${escapeHtml(U('applications.consumer'))}</dt><dd>${escapeHtml(L(selected.stateFlow.consumer))}</dd></div>
              <div><dt>${escapeHtml(U('applications.technology'))}</dt><dd>${escapeHtml(L(selected.contract.candidateTechnology))}</dd></div>
              <div><dt>${escapeHtml(U('applications.process'))}</dt><dd>${escapeHtml(L(selected.contract.processLens))}</dd></div>
            </dl>
          </section>

          <section class="atlas-boundary" aria-labelledby="atlas-boundary-title">
            <div class="atlas-section-heading"><p>${escapeHtml(U('applications.boundary'))}</p><h4 id="atlas-boundary-title">${escapeHtml(selected.evidenceLabel)}</h4></div>
            <div class="atlas-boundary-grid">
              <article class="is-proves"><p>${escapeHtml(U('applications.proves'))}</p><span>${escapeHtml(L(selected.proof))}</span></article>
              <article class="is-limit"><p>${escapeHtml(U('applications.notProves'))}</p><span>${escapeHtml(L(selected.notProof))}</span></article>
              <article class="is-gate"><p>${escapeHtml(U('applications.validation'))}</p><span>${escapeHtml(L(selected.validationGate))}</span></article>
            </div>
          </section>

          <section class="atlas-sources" aria-labelledby="atlas-sources-title">
            <div class="atlas-section-heading"><p>${escapeHtml(U('applications.sources'))}</p><h4 id="atlas-sources-title">${escapeHtml(L(selected.title))}</h4></div>
            <div class="atlas-source-freeze">
              <div><small>${escapeHtml(U('applications.sourceFreeze'))}</small><strong>${escapeHtml(applicationAtlas.freezeId)}</strong></div>
              <span><b>${escapeHtml(U('applications.sourceReviewed'))}</b><time datetime="${escapeHtml(applicationAtlas.reviewedDate)}">${escapeHtml(applicationAtlas.reviewedDate)}</time></span>
              <p>${escapeHtml(U('applications.sourceBoundary'))}</p>
            </div>
            <div class="atlas-source-list">
              ${selected.sources.map((source, index) => `
                <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">
                  <span>${String(index + 1).padStart(2, '0')}</span>
                  <strong>${escapeHtml(L(source.label))}</strong>
                  <small>${escapeHtml(L(source.actor))} · ${escapeHtml(U('applications.sourceOpen'))} ↗</small>
                </a>
              `).join('')}
            </div>
          </section>
        </article>
      </div>

      <p class="visually-hidden" role="status" aria-live="polite">${escapeHtml(U('applications.showing', { title: L(selected.title) }))}</p>

      <aside class="atlas-explorer-callout">
        <div class="atlas-explorer-visual" aria-hidden="true">
          <span></span><span></span><span></span><i></i>
        </div>
        <div class="atlas-explorer-content">
          <p>${escapeHtml(U('applications.explorerKicker'))}</p>
          <h3>${escapeHtml(U('applications.explorerTitle'))}</h3>
          <span>${escapeHtml(U('applications.explorerBody'))}</span>
          <div class="atlas-explorer-list" role="group" aria-label="${escapeHtml(U('applications.explorerListAria'))}">
            ${applicationAtlas.explorers.map((explorer, index) => {
              const boundaryId = `atlas-explorer-${explorer.id}-boundary`;
              return `
                <article class="atlas-explorer-card" data-explorer-id="${escapeHtml(explorer.id)}">
                  <p>${String(index + 1).padStart(2, '0')} · ${escapeHtml(U('applications.explorerLens'))}</p>
                  <h4>${escapeHtml(L(explorer.title))}</h4>
                  <span>${escapeHtml(L(explorer.body))}</span>
                  <a href="${escapeHtml(L(explorer.href))}" target="_blank" rel="noreferrer" aria-describedby="${boundaryId}">${escapeHtml(L(explorer.cta))} <b aria-hidden="true">↗</b></a>
                  <small id="${boundaryId}">${escapeHtml(L(explorer.boundary))}</small>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </aside>

      <section class="content-section atlas-history" aria-labelledby="atlas-history-title">
        <div class="section-label"><span>02</span><div><p>${escapeHtml(U('applications.historyKicker'))}</p><h3 id="atlas-history-title">${U('applications.historyTitle')}</h3></div></div>
        <ol>
          ${applicationAtlas.history.map((item) => `<li><time>${escapeHtml(L(item.year))}</time><h4>${escapeHtml(L(item.title))}</h4><p>${escapeHtml(L(item.body))}</p></li>`).join('')}
        </ol>
        <p class="atlas-history-boundary">${escapeHtml(U('applications.historyBoundary'))}</p>
      </section>

      <section class="content-section atlas-transfer" aria-labelledby="atlas-transfer-title">
        <div class="section-label"><span>03</span><div><p>${escapeHtml(U('applications.transferKicker'))}</p><h3 id="atlas-transfer-title">${escapeHtml(U('applications.transferTitle'))}</h3></div></div>
        <p>${escapeHtml(U('applications.transferBody'))}</p>
        <div>${applicationAtlas.sharePointFields.map((field) => `<code>${escapeHtml(field)}</code>`).join('')}</div>
      </section>
    `;

    if (syncUrl) replaceLocationState(selected.id, rationale);

    container.querySelectorAll('[data-atlas-rationale]').forEach((button) => {
      button.addEventListener('click', () => render(selected.id, button.dataset.atlasRationale, { focus: { type: 'rationale', id: button.dataset.atlasRationale }, syncUrl: true }));
    });
    container.querySelector('[data-atlas-rationale-select]')?.addEventListener('change', (event) => {
      render(selected.id, event.currentTarget.value, { focus: { type: 'rationale-select' }, syncUrl: true });
    });
    container.querySelectorAll('[data-atlas-case]').forEach((button) => {
      button.addEventListener('click', () => render(button.dataset.atlasCase, rationale, { focus: { type: 'case', id: button.dataset.atlasCase }, syncUrl: true }));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const currentIndex = visibleCases.findIndex((item) => item.id === button.dataset.atlasCase);
        const nextIndex = event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? visibleCases.length - 1
            : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + visibleCases.length) % visibleCases.length;
        const next = visibleCases[nextIndex];
        render(next.id, rationale, { focus: { type: 'case', id: next.id }, syncUrl: true });
      });
    });
    container.querySelector('[data-atlas-case-select]')?.addEventListener('change', (event) => {
      render(event.currentTarget.value, rationale, { focus: { type: 'case-select' }, syncUrl: true });
    });

    if (focus) {
      if (focus.type === 'case') container.querySelector(`[data-atlas-case="${focus.id}"]`)?.focus();
      if (focus.type === 'rationale') container.querySelector(`[data-atlas-rationale="${focus.id}"]`)?.focus();
      if (focus.type === 'case-select') container.querySelector('[data-atlas-case-select]')?.focus();
      if (focus.type === 'rationale-select') container.querySelector('[data-atlas-rationale-select]')?.focus();
    }
  };

  render(initialCase, initialRationale);
}
