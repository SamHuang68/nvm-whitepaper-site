/**
 * Interactive NVM IP Specification Comparison Matrix
 */

import { nvmIpSpecs } from '../../data/nvm_specs.js';

export function renderMatrix(containerEl) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <span class="phase-badge">Interactive Tool</span>
      <h2 style="font-size: 2rem; margin-top: 0.5rem; color: #fff;">NVM IP Product & PPA Comparison Matrix</h2>
      <p style="color: var(--text-secondary);">Filter and compare silicon-proven Logic OTP, Logic MTP, eFlash, and PUF IP macros across process nodes.</p>
    </div>

    <!-- Filters -->
    <div class="glass-card" style="padding: 1rem 1.5rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
      <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan);">FILTER BY:</span>
      <select id="filter-type" style="background: rgba(0,0,0,0.5); color: #fff; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 4px;">
        <option value="ALL">All NVM Types</option>
        <option value="Logic OTP">Logic OTP</option>
        <option value="Logic MTP">Logic MTP</option>
        <option value="Embedded Flash">Embedded Flash</option>
        <option value="PUF Security">PUF Security</option>
      </select>
    </div>

    <div class="matrix-table-container">
      <table class="matrix-table">
        <thead>
          <tr>
            <th>IP Macro Name</th>
            <th>Type</th>
            <th>Foundry Node</th>
            <th>Density Range</th>
            <th>Extra Masks</th>
            <th>Read Voltage</th>
            <th>Data Retention</th>
            <th>AEC Qualification</th>
            <th>Area / Kb</th>
          </tr>
        </thead>
        <tbody id="matrix-body">
          ${renderTableRows(nvmIpSpecs)}
        </tbody>
      </table>
    </div>
  `;

  // Attach filter event listener
  const filterSelect = document.getElementById('filter-type');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      const filtered = selected === 'ALL' 
        ? nvmIpSpecs 
        : nvmIpSpecs.filter(item => item.type === selected);
      
      document.getElementById('matrix-body').innerHTML = renderTableRows(filtered);
    });
  }
}

function renderTableRows(items) {
  return items.map(item => `
    <tr>
      <td style="font-weight: 700; color: #fff;">${item.name}</td>
      <td><span class="tag-pill" style="color: var(--accent-cyan); border-color: rgba(0,242,254,0.3);">${item.type}</span></td>
      <td>${item.node}</td>
      <td>${item.density}</td>
      <td style="color: ${item.extraMasks === 0 ? '#4ade80' : '#f87171'}; font-weight: 700;">${item.extraMasks} Adders</td>
      <td>${item.readVoltage}</td>
      <td>${item.retention}</td>
      <td>${item.grade}</td>
      <td>${item.areaPerKb}</td>
    </tr>
  `).join('');
}
