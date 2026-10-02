import { fidoSecurity } from '../../data/fido_security.js';
import { localize, t } from '../../data/i18n.js';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const slug = (value) => String(value || '').toLowerCase().replaceAll(' ', '-');

export function renderFidoSecurity(container, language = 'en') {
  if (!container) return;
  const U = (key) => t(key, language);
  const L = (value) => localize(value, language);
  const sourceMap = new Map(fidoSecurity.sources.map((source) => [source.id, source]));
  const sourceTrail = (sourceIds = []) => sourceIds.map((id) => escapeHtml(id)).join(' · ');
  const diagramHref = language === 'zh'
    ? './fido2-hardware-trust-map-zh.html'
    : './fido2-hardware-trust-map.html';

  container.innerHTML = `
    <header class="panel-heading fido-heading">
      <div>
        <p class="eyebrow dark">${escapeHtml(U('fido.eyebrow'))}</p>
        <h2>${escapeHtml(L(fidoSecurity.title))}</h2>
      </div>
      <p>${escapeHtml(L(fidoSecurity.lede))}</p>
    </header>

    <aside class="fido-scope-banner" aria-labelledby="fido-scope-title">
      <div>
        <p>${escapeHtml(U('fido.scope.kicker'))}</p>
        <h3 id="fido-scope-title">${escapeHtml(U('fido.scope.title'))}</h3>
      </div>
      <p>${escapeHtml(U('fido.scope.body'))}</p>
      <dl>
        <div><dt>${escapeHtml(U('fido.scope.protocol'))}</dt><dd>WebAuthn + CTAP</dd></div>
        <div><dt>${escapeHtml(U('fido.scope.assurance'))}</dt><dd>FIDO L1–L3+</dd></div>
        <div><dt>${escapeHtml(U('fido.scope.mapping'))}</dt><dd>${escapeHtml(U('fido.scope.mappingValue'))}</dd></div>
      </dl>
    </aside>

    <section class="content-section fido-verdicts" aria-labelledby="fido-verdicts-title">
      <div class="section-label"><span>01</span><div><p>${escapeHtml(U('fido.verdicts.kicker'))}</p><h3 id="fido-verdicts-title">${escapeHtml(U('fido.verdicts.title'))}</h3></div></div>
      <div class="fido-verdict-grid">
        ${fidoSecurity.verdicts.map((item, index) => `
          <article>
            <header><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(L(item.label))}</p></header>
            <h4>${escapeHtml(L(item.headline))}</h4>
            <p>${escapeHtml(L(item.body))}</p>
            <footer><b>${escapeHtml(item.evidenceClass)}</b><span>${item.sourceIds.map((id) => escapeHtml(id)).join(' · ')}</span></footer>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section fido-ceremonies" aria-labelledby="fido-ceremonies-title">
      <div class="section-label"><span>02</span><div><p>${escapeHtml(U('fido.ceremonies.kicker'))}</p><h3 id="fido-ceremonies-title">${escapeHtml(U('fido.ceremonies.title'))}</h3></div></div>
      <div class="fido-ceremony-grid">
        ${fidoSecurity.ceremonies.map((ceremony) => `
          <article class="is-${escapeHtml(ceremony.id)}">
            <header><span>${escapeHtml(ceremony.sequence)}</span><div><p>${escapeHtml(L(ceremony.title))}</p><h4>${escapeHtml(L(ceremony.question))}</h4></div></header>
            <ol>
              ${ceremony.steps.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(L(step))}</p></li>`).join('')}
            </ol>
            <footer><b>${escapeHtml(U('fido.boundary'))}</b><span>${escapeHtml(L(ceremony.boundary))}</span><small>${sourceTrail(ceremony.sourceIds)}</small></footer>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section fido-keys" aria-labelledby="fido-keys-title">
      <div class="section-label"><span>03</span><div><p>${escapeHtml(U('fido.keys.kicker'))}</p><h3 id="fido-keys-title">${escapeHtml(U('fido.keys.title'))}</h3></div></div>
      <div class="fido-key-grid">
        ${fidoSecurity.keyClasses.map((item, index) => `
          <article>
            <header><span>${String(index + 1).padStart(2, '0')}</span><h4>${escapeHtml(L(item.name))}</h4></header>
            <p>${escapeHtml(L(item.role))}</p>
            <dl>
              <div><dt>${escapeHtml(U('fido.keys.persistence'))}</dt><dd>${escapeHtml(L(item.persistence))}</dd></div>
              <div><dt>${escapeHtml(U('fido.keys.boundary'))}</dt><dd>${escapeHtml(L(item.boundary))}</dd></div>
            </dl>
            <footer>${sourceTrail(item.sourceIds)}</footer>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section fido-storage" aria-labelledby="fido-storage-title">
      <div class="section-label"><span>04</span><div><p>${escapeHtml(U('fido.storage.kicker'))}</p><h3 id="fido-storage-title">${escapeHtml(U('fido.storage.title'))}</h3></div></div>
      <div class="fido-storage-grid">
        ${fidoSecurity.storageModels.map((model, index) => `
          <article>
            <header><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(L(model.label))}</p></header>
            <h4>${escapeHtml(L(model.title))}</h4>
            <strong>${escapeHtml(L(model.nvmPressure))}</strong>
            <p>${escapeHtml(L(model.body))}</p>
            <footer>
              <small>${escapeHtml(model.evidenceClass)} · ${sourceTrail(model.semanticSourceIds)}</small>
              <b>${escapeHtml(U('fido.candidates'))}</b>
              <span>${escapeHtml(L(model.candidates))}</span>
              <small>${escapeHtml(model.candidateStatus)} · ${sourceTrail(model.candidateSourceIds)}</small>
            </footer>
          </article>
        `).join('')}
      </div>
      <div class="fido-backup-axis" aria-labelledby="fido-backup-axis-title">
        <header><p>${escapeHtml(U('fido.backup.kicker'))}</p><h4 id="fido-backup-axis-title">${escapeHtml(U('fido.backup.title'))}</h4></header>
        <div>
          ${fidoSecurity.backupEligibility.map((item) => `
            <article>
              <span>${escapeHtml(L(item.label))}</span>
              <div><h5>${escapeHtml(L(item.title))}</h5><p>${escapeHtml(L(item.body))}</p></div>
              <strong>${escapeHtml(L(item.state))}</strong>
              <small>${sourceTrail(item.sourceIds)}</small>
            </article>
          `).join('')}
        </div>
      </div>
      <p class="fido-storage-boundary"><b>${escapeHtml(U('fido.storage.boundaryLabel'))}</b> ${escapeHtml(U('fido.storage.boundary'))}</p>
    </section>

    <section class="fido-explorer" aria-labelledby="fido-explorer-title">
      <div class="fido-explorer-visual" aria-hidden="true">
        <span></span><span></span><span></span><i></i>
      </div>
      <div>
        <p>${escapeHtml(U('fido.explorer.kicker'))}</p>
        <h3 id="fido-explorer-title">${escapeHtml(U('fido.explorer.title'))}</h3>
        <span>${escapeHtml(U('fido.explorer.body'))}</span>
        <a href="${escapeHtml(diagramHref)}" target="_blank" rel="noreferrer">${escapeHtml(U('fido.explorer.cta'))}<b aria-hidden="true">↗</b></a>
        <small>${escapeHtml(U('fido.explorer.boundary'))}</small>
      </div>
    </section>

    <section class="content-section fido-memory" aria-labelledby="fido-memory-title">
      <div class="section-label"><span>05</span><div><p>${escapeHtml(U('fido.memory.kicker'))}</p><h3 id="fido-memory-title">${escapeHtml(U('fido.memory.title'))}</h3></div></div>
      <div class="fido-memory-table" role="region" aria-label="${escapeHtml(U('fido.memory.tableAria'))}" tabindex="0">
        <table>
          <thead><tr><th>${escapeHtml(U('fido.memory.technology'))}</th><th>${escapeHtml(U('fido.memory.asset'))}</th><th>${escapeHtml(U('fido.memory.value'))}</th><th>${escapeHtml(U('fido.memory.limit'))}</th><th>${escapeHtml(U('fido.memory.status'))}</th></tr></thead>
          <tbody>
            ${fidoSecurity.memoryRoles.map((role) => `
              <tr>
                <th scope="row">${escapeHtml(L(role.technology))}</th>
                <td>${escapeHtml(L(role.asset))}</td>
                <td>${escapeHtml(L(role.value))}</td>
                <td>${escapeHtml(L(role.limit))}</td>
                <td><span>${escapeHtml(role.status)}</span><small>${sourceTrail(role.sourceIds)}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="content-section fido-examples" aria-labelledby="fido-examples-title">
      <div class="section-label"><span>06</span><div><p>${escapeHtml(U('fido.examples.kicker'))}</p><h3 id="fido-examples-title">${escapeHtml(U('fido.examples.title'))}</h3></div></div>
      <p class="fido-examples-intro">${escapeHtml(U('fido.examples.intro'))}</p>
      <div class="fido-example-grid">
        ${fidoSecurity.namedExamples.map((item, index) => `
          <article>
            <header><span>${String(index + 1).padStart(2, '0')}</span><b>${escapeHtml(item.evidenceClass)}</b></header>
            <h4>${escapeHtml(L(item.product))}</h4>
            <strong>${escapeHtml(L(item.pattern))}</strong>
            <p>${escapeHtml(L(item.insight))}</p>
            <footer>${sourceTrail(item.sourceIds)}</footer>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section fido-assurance" aria-labelledby="fido-assurance-title">
      <div class="section-label"><span>07</span><div><p>${escapeHtml(U('fido.assurance.kicker'))}</p><h3 id="fido-assurance-title">${escapeHtml(U('fido.assurance.title'))}</h3></div></div>
      <div class="fido-assurance-list">
        ${fidoSecurity.assuranceMatrix.map((item, index) => `
          <article>
            <header>
              <span>${String(index + 1).padStart(2, '0')}</span>
              <div><h4>${escapeHtml(L(item.threat))}</h4><p>${escapeHtml(L(item.levelScope))}</p></div>
              <b>${escapeHtml(L(item.certificationClaimStatus))}</b>
            </header>
            <dl>
              <div><dt>${escapeHtml(U('fido.assurance.outcome'))}</dt><dd>${escapeHtml(L(item.outcome))}</dd><small>${escapeHtml(item.requirementStatus)} · ${sourceTrail(item.requirementSourceIds)}</small></div>
              <div><dt>${escapeHtml(U('fido.assurance.patterns'))}</dt><dd>${escapeHtml(L(item.patterns))}</dd><small>${escapeHtml(item.patternStatus)} · ${sourceTrail(item.patternSourceIds)}</small></div>
              <div class="is-caution"><dt>${escapeHtml(U('fido.assurance.caution'))}</dt><dd>${escapeHtml(L(item.caution))}</dd><small>${escapeHtml(U('fido.assurance.toe'))}: ${escapeHtml(L(item.toeScope))} · ${sourceTrail(item.cautionSourceIds)}</small></div>
            </dl>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section fido-eucleak" aria-labelledby="fido-eucleak-title">
      <div class="section-label"><span>08</span><div><p>${escapeHtml(U('fido.eucleak.kicker'))}</p><h3 id="fido-eucleak-title">${escapeHtml(L(fidoSecurity.eucleak.title))}</h3></div></div>
      <div class="fido-eucleak-shell">
        <div class="fido-eucleak-copy">
          <p>${escapeHtml(L(fidoSecurity.eucleak.summary))}</p>
          <ol>${fidoSecurity.eucleak.conditions.map((condition, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(L(condition))}</p></li>`).join('')}</ol>
        </div>
        <aside><p>${escapeHtml(U('fido.eucleak.lesson'))}</p><strong>${escapeHtml(L(fidoSecurity.eucleak.lesson))}</strong><span>${fidoSecurity.eucleak.sourceIds.join(' · ')}</span></aside>
      </div>
    </section>

    <section class="content-section fido-claims" aria-labelledby="fido-claims-title">
      <div class="section-label"><span>09</span><div><p>${escapeHtml(U('fido.claims.kicker'))}</p><h3 id="fido-claims-title">${escapeHtml(U('fido.claims.title'))}</h3></div></div>
      <div class="fido-claim-list">
        ${fidoSecurity.claims.map((item, index) => `
          <article>
            <span>${String(index + 1).padStart(2, '0')}</span>
            <div><p>${escapeHtml(L(item.claim))}</p><b class="is-${slug(L(item.status))}">${escapeHtml(L(item.status))}</b></div>
            <strong>${escapeHtml(L(item.correction))}</strong>
            <small>${sourceTrail(item.sourceIds)}</small>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section fido-gates" aria-labelledby="fido-gates-title">
      <div class="section-label"><span>10</span><div><p>${escapeHtml(U('fido.gates.kicker'))}</p><h3 id="fido-gates-title">${escapeHtml(U('fido.gates.title'))}</h3></div></div>
      <ol>
        ${fidoSecurity.decisionGates.map((gate, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(L(gate))}</p></li>`).join('')}
      </ol>
    </section>

    <section class="content-section fido-sources" aria-labelledby="fido-sources-title">
      <div class="section-label"><span>11</span><div><p>${escapeHtml(U('fido.sources.kicker'))}</p><h3 id="fido-sources-title">${escapeHtml(U('fido.sources.title'))}</h3></div></div>
      <p class="fido-sources-intro">${escapeHtml(U('fido.sources.intro'))}</p>
      <div class="fido-source-list">
        ${fidoSecurity.sources.map((source, index) => `
          <article>
            <span>${String(index + 1).padStart(2, '0')}</span>
            <div><b>${escapeHtml(source.class)}</b><h4>${escapeHtml(L(source.label))}</h4><p>${escapeHtml(L(source.actor))} · ${escapeHtml(L(source.locator))}</p></div>
            <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(U('fido.sources.open'))}<span aria-hidden="true">↗</span></a>
          </article>
        `).join('')}
      </div>
      <footer><b>${escapeHtml(U('fido.sources.reviewed'))}</b><time datetime="${escapeHtml(fidoSecurity.reviewedDate)}">${escapeHtml(fidoSecurity.reviewedDate)}</time><span>${escapeHtml(U('fido.sources.pov'))}: ${escapeHtml(L(fidoSecurity.pov))}</span></footer>
    </section>
  `;

  const evidenceCollections = [
    fidoSecurity.verdicts,
    fidoSecurity.ceremonies,
    fidoSecurity.keyClasses,
    fidoSecurity.storageModels,
    fidoSecurity.backupEligibility,
    fidoSecurity.memoryRoles,
    fidoSecurity.namedExamples,
    fidoSecurity.assuranceMatrix,
    [fidoSecurity.eucleak],
    fidoSecurity.claims
  ];
  for (const collection of evidenceCollections) {
    for (const item of collection) {
      const sourceIds = [
        ...(item.sourceIds || []),
        ...(item.semanticSourceIds || []),
        ...(item.candidateSourceIds || []),
        ...(item.requirementSourceIds || []),
        ...(item.patternSourceIds || []),
        ...(item.cautionSourceIds || [])
      ];
      for (const sourceId of sourceIds) {
      if (!sourceMap.has(sourceId)) throw new Error(`Unknown FIDO evidence source: ${sourceId}`);
      }
    }
  }
}
