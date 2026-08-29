import { matrixPackageMetadata, nvmIpSpecs } from '../../data/nvm_specs.js';

export function renderMatrix(container) {
  if (!container) return;
  container.innerHTML = `
    <header class="panel-heading selector-heading">
      <div><p class="eyebrow dark">03 · DECISION MATRIX</p><h2>Compare the state contract<br><em>before comparing a macro</em></h2></div>
      <p>Compare ${nvmIpSpecs.length} bounded architecture profiles. Every row exposes its evidence class, public source, scope, limitation and the next target-specific validation action.</p>
    </header>
    <section class="selector-controls" aria-label="Decision matrix filters">
      <label for="filter-family"><span>FILTER BY TECHNOLOGY FAMILY</span><select id="filter-family"><option value="ALL">All governed profiles (${nvmIpSpecs.length})</option>${[...new Set(nvmIpSpecs.map((item) => item.family))].map((family) => `<option value="${family}">${family}</option>`).join('')}</select></label>
      <div class="matrix-actions">
        <button id="btn-export-csv" class="button secondary small" type="button" title="Export current governed profiles as CSV"><span aria-hidden="true">↓</span> Export CSV</button>
        <button id="btn-export-json" class="button secondary small" type="button" title="Export current governed profiles as JSON"><span aria-hidden="true">↓</span> Export JSON</button>
      </div>
    </section>
    <div class="decision-table-wrap">
      <table class="decision-table">
        <caption>Bounded NVM selection profiles with evidence class, sources, limitations and open validation</caption>
        <thead><tr><th scope="col">State Profile</th><th scope="col">Technology Family</th><th scope="col">State Contract &amp; Node Lens</th><th scope="col">Boundary</th><th scope="col">Candidate Fit</th><th scope="col">Evidence &amp; Next Gate</th></tr></thead>
        <tbody id="decision-body">${renderRows(nvmIpSpecs)}</tbody>
      </table>
    </div>
    <aside class="selector-gate">
      <div><p>SELECTION GATE</p><h3>A categorical fit is not a qualification result</h3></div>
      <ol><li><b>01</b><span>Confirm device stack, voltage options, state owner and power-off behavior</span></li><li><b>02</b><span>Bind retention, update budget and recovery to the target mission profile</span></li><li><b>03</b><span>Close PVT, test, fault and physical evidence on the intended integration</span></li></ol>
    </aside>
  `;

  const filterSelect = container.querySelector('#filter-family');
  const tbody = container.querySelector('#decision-body');
  const currentItems = () => filterSelect?.value === 'ALL' ? nvmIpSpecs : nvmIpSpecs.filter((item) => item.family === filterSelect?.value);
  filterSelect?.addEventListener('change', () => { tbody.innerHTML = renderRows(currentItems()); });
  container.querySelector('#btn-export-csv')?.addEventListener('click', async () => exportCSV(currentItems()));
  container.querySelector('#btn-export-json')?.addEventListener('click', async () => exportJSON(currentItems()));
}

function renderRows(items) {
  return items.map((item) => `
    <tr data-record-id="${item.id}">
      <th scope="row" data-label="STATE PROFILE"><strong>${item.profile}</strong><small>${item.updateModel}</small></th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${item.family}</span></td>
      <td data-label="STATE CONTRACT"><strong>${item.contract}</strong><small class="matrix-secondary"><b>NODE LENS</b>${item.nodeLens}</small></td>
      <td data-label="BOUNDARY">${item.boundary}</td>
      <td data-label="CANDIDATE FIT">${item.strongestFit}</td>
      <td data-label="EVIDENCE & NEXT GATE"><div class="matrix-evidence">
        <span class="status-chip">${item.sourceActor} · ${item.evidenceClass}</span>
        <a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.sourceId} <span aria-hidden="true">↗</span></a>
        <small><b>SCOPE</b>${item.scope}</small><small><b>LIMITATION</b>${item.limitation}</small><small class="matrix-open"><b>OPEN VALIDATION</b>${item.openValidation}</small>
        <time datetime="${item.reviewedDate}">Reviewed ${item.reviewedDate}</time>
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
