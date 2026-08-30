import { matrixPackageMetadata, nvmIpSpecs } from '../../data/nvm_specs.js';
import { localize, t } from '../../data/i18n.js';

export function renderMatrix(container, language = 'en') {
  if (!container) return;
  const U = (key, variables = {}) => t(key, language, variables);
  const L = (value) => localize(value, language);
  container.innerHTML = `
    <header class="panel-heading selector-heading">
      <div><p class="eyebrow dark">${U('matrix.eyebrow')}</p><h2>${U('matrix.title')}</h2></div>
      <p>${U('matrix.intro', { count: nvmIpSpecs.length })}</p>
    </header>
    <section class="selector-controls" aria-label="${U('matrix.filters')}">
      <label for="filter-family"><span>${U('matrix.filterFamily')}</span><select id="filter-family"><option value="ALL">${U('matrix.allProfiles', { count: nvmIpSpecs.length })}</option>${[...new Set(nvmIpSpecs.map((item) => item.family))].map((family) => `<option value="${family}">${L(family)}</option>`).join('')}</select></label>
      <div class="matrix-actions">
        <button id="btn-export-csv" class="button secondary small" type="button" title="${U('matrix.exportCsvTitle')}"><span aria-hidden="true">↓</span> ${U('matrix.exportCsv')}</button>
        <button id="btn-export-json" class="button secondary small" type="button" title="${U('matrix.exportJsonTitle')}"><span aria-hidden="true">↓</span> ${U('matrix.exportJson')}</button>
        <small class="matrix-export-note">${U('matrix.exportNote')}</small>
      </div>
    </section>
    <div class="decision-table-wrap">
      <table class="decision-table">
        <caption>${U('matrix.caption')}</caption>
        <thead><tr><th scope="col">${U('matrix.stateProfile')}</th><th scope="col">${U('matrix.technologyFamily')}</th><th scope="col">${U('matrix.contractNode')}</th><th scope="col">${U('matrix.boundary')}</th><th scope="col">${U('matrix.candidateFit')}</th><th scope="col">${U('matrix.evidenceGate')}</th></tr></thead>
        <tbody id="decision-body">${renderRows(nvmIpSpecs, language)}</tbody>
      </table>
    </div>
    <aside class="selector-gate">
      <div><p>${U('matrix.gate')}</p><h3>${U('matrix.gateTitle')}</h3></div>
      <ol><li><b>01</b><span>${U('matrix.gate1')}</span></li><li><b>02</b><span>${U('matrix.gate2')}</span></li><li><b>03</b><span>${U('matrix.gate3')}</span></li></ol>
    </aside>
  `;

  const filterSelect = container.querySelector('#filter-family');
  const tbody = container.querySelector('#decision-body');
  const currentItems = () => filterSelect?.value === 'ALL' ? nvmIpSpecs : nvmIpSpecs.filter((item) => item.family === filterSelect?.value);
  filterSelect?.addEventListener('change', () => { tbody.innerHTML = renderRows(currentItems(), language); });
  container.querySelector('#btn-export-csv')?.addEventListener('click', async () => exportCSV(currentItems()));
  container.querySelector('#btn-export-json')?.addEventListener('click', async () => exportJSON(currentItems()));
}

function renderRows(items, language = 'en') {
  const U = (key, variables = {}) => t(key, language, variables);
  const L = (value) => localize(value, language);
  return items.map((item) => `
    <tr data-record-id="${item.id}">
      <th scope="row" data-label="${U('matrix.stateProfile')}"><strong>${L(item.profile)}</strong><small>${L(item.updateModel)}</small></th>
      <td data-label="${U('matrix.technologyFamily')}"><span class="family-chip">${L(item.family)}</span></td>
      <td data-label="${U('matrix.contractNode')}"><strong>${L(item.contract)}</strong><small class="matrix-secondary"><b>${U('matrix.nodeLens')}</b>${L(item.nodeLens)}</small></td>
      <td data-label="${U('matrix.boundary')}">${L(item.boundary)}</td>
      <td data-label="${U('matrix.candidateFit')}">${L(item.strongestFit)}</td>
      <td data-label="${U('matrix.evidenceGate')}"><div class="matrix-evidence">
        <span class="status-chip">${L(item.sourceActor)} · ${L(item.evidenceClass)}</span>
        <a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.sourceId} <span aria-hidden="true">↗</span></a>
        <small><b>${U('matrix.scope')}</b>${L(item.scope)}</small><small><b>${U('matrix.limitation')}</b>${L(item.limitation)}</small><small class="matrix-open"><b>${U('matrix.openValidation')}</b>${L(item.openValidation)}</small>
        <time datetime="${item.reviewedDate}">${U('matrix.reviewed', { date: item.reviewedDate })}</time>
      </div></td>
    </tr>
  `).join('');
}

function csvCell(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }
function canonicalRecord(item) {
  return {
    TechnologyFamily: item.technologyFamilyKey,
    StateContract: item.stateContractKey,
    ApplicationDomain: item.applicationDomain,
    ProcessNode: item.processNode,
    EvidenceClass: item.evidenceClass,
    SourceLocator: item.sourceUrl,
    Limitation: item.limitation,
    ReviewStatus: item.reviewStatus,
    Profile: item.profile,
    StateContractDetail: item.contract,
    NodeLens: item.nodeLens,
    UpdateModel: item.updateModel,
    CandidateFit: item.strongestFit,
    Boundary: item.boundary,
    SourceID: item.sourceId,
    SourceActor: item.sourceActor,
    Scope: item.scope,
    OpenValidation: item.openValidation
  };
}
async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
export async function buildGovernedRecords(items = nvmIpSpecs) {
  const canonical = items.map(canonicalRecord);
  const packageContentSHA256 = await sha256(JSON.stringify(canonical));
  return Promise.all(canonical.map(async (record, index) => ({
    SchemaVersion: matrixPackageMetadata.schemaVersion,
    PackageID: matrixPackageMetadata.packageId,
    PackageRevision: matrixPackageMetadata.packageRevision,
    PackageContentSHA256: packageContentSHA256,
    RecordRevision: `${items[index].reviewedDate}:${items[index].id}:r1`,
    RecordSHA256: await sha256(JSON.stringify(record)),
    POVContractID: matrixPackageMetadata.povContractId,
    POVScopeID: matrixPackageMetadata.povScopeId,
    AccountableOwnerPersonKey: matrixPackageMetadata.accountableOwnerPersonKey,
    ContentOwnerKey: matrixPackageMetadata.accountableOwnerPersonKey,
    EditorialPublisherKey: matrixPackageMetadata.editorialPublisherKey,
    Visibility: matrixPackageMetadata.visibility,
    LastReviewed: items[index].reviewedDate,
    MigrationID: items[index].id,
    RecordID: items[index].id,
    ...record
  })));
}
async function exportCSV(items) {
  const records = await buildGovernedRecords(items);
  const keys = Object.keys(records[0]);
  const csvContent = [keys.join(','), ...records.map((item) => keys.map((key) => csvCell(item[key])).join(','))].join('\n');
  download(`data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`, 'nvm_governed_decision_profiles.csv');
}
async function exportJSON(items) {
  const records = await buildGovernedRecords(items);
  download(`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ package: matrixPackageMetadata, records }, null, 2))}`, 'nvm_governed_decision_profiles.json');
}
function download(href, filename) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
