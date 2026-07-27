/**
 * Phase-1: Knowledge Base View Renderer
 */

import { phase1KnowledgeBase } from '../../data/phase1_kb.js';

export function renderPhase1KB(containerEl) {
  if (!containerEl) return;

  const { applications, foundryIntelligence, competitorMatrix } = phase1KnowledgeBase;

  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <span class="phase-badge">Phase-1 Knowledge Base</span>
      <h2 style="font-size: 2rem; margin-top: 0.5rem; background: linear-gradient(135deg, #fff, var(--accent-cyan)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        NVM Applications, Foundry Intelligence & Competitor Matrix
      </h2>
      <p style="color: var(--text-secondary); margin-top: 0.25rem;">
        Comprehensive semiconductor intelligence covering Automotive, IoT, AI MCU ecosystems, Foundry PDK status, and NVM IP trade-offs.
      </p>
    </div>

    <!-- Application Domains -->
    <h3 style="color: var(--accent-cyan); margin-bottom: 1rem; border-left: 3px solid var(--accent-cyan); padding-left: 0.5rem;">
      1. Target Application Domains
    </h3>
    <div class="grid-2" style="margin-bottom: 2.5rem;">
      ${applications.map(app => `
        <div class="glass-card" style="padding: 1.5rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">${app.icon}</div>
          <h4 style="font-size: 1.2rem; color: #fff; margin-bottom: 0.4rem;">${app.title}</h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${app.description}</p>
          <div style="background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 6px; font-size: 0.82rem;">
            <strong>Key Metrics:</strong> ${Object.entries(app.keyMetrics).map(([k, v]) => `${k}: <span style="color:var(--accent-cyan)">${v}</span>`).join(' | ')}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Foundry Intelligence -->
    <h3 style="color: var(--accent-cyan); margin-bottom: 1rem; border-left: 3px solid var(--accent-cyan); padding-left: 0.5rem;">
      2. Foundry Qualification Intelligence (TSMC / UMC / GF)
    </h3>
    <div class="grid-3" style="margin-bottom: 2.5rem;">
      ${foundryIntelligence.map(f => `
        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 1.1rem; color: var(--accent-blue); margin-bottom: 0.5rem;">${f.foundry}</h4>
          <div style="margin-bottom: 0.75rem;">
            ${f.nodes.map(node => `<span class="tag-pill">${node}</span>`).join('')}
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${f.features}</p>
          <p style="font-size: 0.82rem; color: var(--accent-cyan);">💡 <strong>Advantage:</strong> ${f.advantage}</p>
        </div>
      `).join('')}
    </div>

    <!-- Competitor Matrix -->
    <h3 style="color: var(--accent-cyan); margin-bottom: 1rem; border-left: 3px solid var(--accent-cyan); padding-left: 0.5rem;">
      3. Technology Trade-off Matrix (Logic NVM vs eFlash vs Emerging)
    </h3>
    <div class="matrix-table-container">
      <table class="matrix-table">
        <thead>
          <tr>
            <th>NVM Technology</th>
            <th>Extra Mask Adder</th>
            <th>Cost Index</th>
            <th>Read Speed</th>
            <th>Data Retention</th>
            <th>Best Suited For</th>
          </tr>
        </thead>
        <tbody>
          ${competitorMatrix.map(row => `
            <tr>
              <td style="font-weight: 600; color: #fff;">${row.type}</td>
              <td style="color: var(--accent-cyan);">${row.maskCount}</td>
              <td>${row.costIndex}</td>
              <td>${row.readSpeed}</td>
              <td>${row.retention}</td>
              <td style="font-size: 0.82rem;">${row.bestFor}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
