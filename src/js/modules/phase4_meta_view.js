import { phase4Metadata } from '../../data/phase4_metadata.js';
import { localize, t } from '../../data/i18n.js';

export function renderPhase4Metadata(container, language = 'en') {
  if (!container) return;
  const { schemaVersion, packageId, packageRevision, povContractId, povScopeId, canonicalFields, operationalFields, publicRecords } = phase4Metadata;
  const U = (key) => t(key, language);
  const L = (value) => localize(value, language);
  const formatValues = (values) => Array.isArray(values) ? values.map(L).join(' · ') : L(values);

  container.innerHTML = `
    <header class="panel-heading taxonomy-heading">
      <div><p class="eyebrow dark">${U('taxonomy.eyebrow')}</p><h2>${U('taxonomy.title')}</h2></div>
      <p>${U('taxonomy.intro')}</p>
    </header>
    <section class="content-section" aria-labelledby="canonical-title">
      <div class="section-label"><span>01</span><div><p>${U('taxonomy.contract.kicker')}</p><h3 id="canonical-title">${U('taxonomy.contract.title')}</h3></div></div>
      <ol class="schema-flow">
        ${canonicalFields.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><h4>${L(item.field)}</h4><p>${L(item.purpose)}</p><small>${item.internalKey} · ${L(item.type)} · ${item.required ? U('taxonomy.required') : U('taxonomy.optional')} · ${item.indexed ? U('taxonomy.indexed') : U('taxonomy.notIndexed')}</small><small>${U('taxonomy.values')} · ${formatValues(item.values)}</small><small>${U('taxonomy.visibility')} · ${L(item.visibility)}</small><small>${U('taxonomy.example')} · ${L(item.example)}</small></div></li>`).join('')}
      </ol>
    </section>
    <section class="content-section operational-section" aria-labelledby="operations-title">
      <div class="section-label"><span>02</span><div><p>${U('taxonomy.operations.kicker')}</p><h3 id="operations-title">${U('taxonomy.operations.title')}</h3></div></div>
      <div class="operational-fields">${operationalFields.map((field, index) => `<span><b>${String(index + 1).padStart(2, '0')}</b><strong>${L(field.displayName)}</strong><small>${field.internalKey} · ${L(field.type)}</small><small>${field.required ? U('taxonomy.required') : U('taxonomy.optional')} · ${field.indexed ? U('taxonomy.indexed') : U('taxonomy.notIndexed')} · ${L(field.visibility)}</small></span>`).join('')}</div>
    </section>
    <section class="content-section" aria-labelledby="records-title">
      <div class="section-label"><span>03</span><div><p>${U('taxonomy.records.kicker')}</p><h3 id="records-title">${U('taxonomy.records.title')}</h3></div></div>
      <div class="record-grid">
        ${publicRecords.map((item) => `
          <article data-record-id="${item.RecordID}" data-record-revision="${item.RecordRevision}" data-migration-id="${item.MigrationID}">
            <header><span>${item.RecordID}</span><b>${L(item.ReviewStatus)}</b></header>
            <h4>${L(item.Title)}</h4>
            <dl><div><dt>${U('taxonomy.technologyFamily')}</dt><dd>${L(item.TechnologyFamily)}</dd></div><div><dt>${U('taxonomy.stateContract')}</dt><dd>${L(item.StateContract)}</dd></div><div><dt>${U('taxonomy.applicationDomain')}</dt><dd>${L(item.ApplicationDomain)}</dd></div><div><dt>${U('taxonomy.processNode')}</dt><dd>${L(item.ProcessNode)}</dd></div><div><dt>${U('taxonomy.evidenceClass')}</dt><dd>${L(item.EvidenceClass)}</dd></div><div><dt>${U('taxonomy.source')}</dt><dd><a href="${item.SourceLocator}" target="_blank" rel="noreferrer">${item.SourceID} · ${L(item.SourceActor)} ↗</a></dd></div><div><dt>${U('taxonomy.lastReviewed')}</dt><dd>${item.LastReviewed} · ${item.ReviewerKey}</dd></div><div><dt>${U('taxonomy.lineage')}</dt><dd>${item.RecordRevision} · ${item.ContentOwnerKey} · ${item.EditorialPublisherKey} · ${L(item.Visibility)}</dd></div></dl>
            <p><b>${U('taxonomy.limitation')}</b>${L(item.Limitation)}</p>
          </article>
        `).join('')}
      </div>
    </section>
    <aside class="sharepoint-transfer" data-schema-version="${schemaVersion}" data-package-id="${packageId}" data-package-revision="${packageRevision}" data-pov-contract-id="${povContractId}" data-pov-scope-id="${povScopeId}">
      <div><p>${U('taxonomy.transfer')}</p><h3>${U('taxonomy.transferTitle')}</h3></div>
      <p>${U('taxonomy.transferBody')}</p>
    </aside>
  `;
}
