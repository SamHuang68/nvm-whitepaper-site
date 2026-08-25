import { nvmIpSpecs } from '../../data/nvm_specs.js';

export function renderMatrix(container) {
  if (!container) return;
  container.innerHTML = `
    <header class="panel-heading selector-heading">
      <div><p class="eyebrow dark">03 · DECISION MATRIX</p><h2>Compare the state contract<br><em>before comparing a macro</em></h2></div>
      <p>These are public decision profiles—not vendor products. Filter by NVM family, then validate the evidence gap for the target process.</p>
    </header>
    <section class="selector-controls" aria-label="Decision matrix filters">
      <label for="filter-family"><span>FILTER BY TECHNOLOGY FAMILY</span><select id="filter-family"><option value="ALL">All public profiles</option>${[...new Set(nvmIpSpecs.map((item) => item.family))].map((family) => `<option value="${family}">${family}</option>`).join('')}</select></label>
      <p><b>${nvmIpSpecs.length}</b><span>ILLUSTRATIVE PROFILES</span></p>
      <p><b>0</b><span>UNQUALIFIED PRODUCT CLAIMS</span></p>
    </section>
    <div class="decision-table-wrap">
      <table class="decision-table">
        <caption>Illustrative NVM selection profiles with explicit evidence boundaries</caption>
        <thead><tr><th scope="col">State profile</th><th scope="col">Technology family</th><th scope="col">State contract</th><th scope="col">Process lens</th><th scope="col">Strongest fit</th><th scope="col">Boundary</th><th scope="col">Evidence status</th></tr></thead>
        <tbody id="decision-body">${renderRows(nvmIpSpecs)}</tbody>
      </table>
    </div>
    <aside class="selector-gate"><div><p>SELECTION GATE</p><h3>A categorical fit is not a qualification result</h3></div><ol><li><b>01</b><span>Confirm device and voltage options</span></li><li><b>02</b><span>Bind retention and endurance to mission profile</span></li><li><b>03</b><span>Close PVT, test and security evidence on target silicon</span></li></ol></aside>
  `;

  container.querySelector('#filter-family')?.addEventListener('change', (event) => {
    const value = event.target.value;
    const items = value === 'ALL' ? nvmIpSpecs : nvmIpSpecs.filter((item) => item.family === value);
    container.querySelector('#decision-body').innerHTML = renderRows(items);
  });
}

function renderRows(items) {
  return items.map((item) => `
    <tr>
      <th scope="row" data-label="STATE PROFILE">${item.profile}<small>${item.updateModel}</small></th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${item.family}</span></td>
      <td data-label="STATE CONTRACT">${item.contract}</td>
      <td data-label="PROCESS LENS">${item.nodeLens}</td>
      <td data-label="STRONGEST FIT">${item.strongestFit}</td>
      <td data-label="BOUNDARY">${item.boundary}</td>
      <td data-label="EVIDENCE STATUS"><span class="status-chip">${item.evidenceStatus}</span></td>
    </tr>
  `).join('');
}
