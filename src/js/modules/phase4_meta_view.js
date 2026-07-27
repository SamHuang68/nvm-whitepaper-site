/**
 * Phase-4: Metadata & Taxonomy Module
 */

import { phase4Metadata } from '../../data/phase4_metadata.js';

export function renderPhase4Metadata(containerEl) {
  if (!containerEl) return;

  const { taxonomyGroups, searchIndex } = phase4Metadata;

  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <span class="phase-badge">Phase-4 Metadata & Taxonomy</span>
      <h2 style="font-size: 2rem; margin-top: 0.5rem; color: #fff;">SharePoint Metadata & Tagging Architecture</h2>
      <p style="color: var(--text-secondary);">Structured tags for enterprise searchability, filtering, and automated content discovery.</p>
    </div>

    <!-- Taxonomy Groups -->
    <h3 style="color: var(--accent-cyan); margin-bottom: 1rem;">1. Enterprise Taxonomy Taxonomy Groups</h3>
    <div class="grid-2" style="margin-bottom: 2.5rem;">
      ${taxonomyGroups.map(grp => `
        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 1.05rem; color: var(--accent-blue); margin-bottom: 0.75rem;">${grp.category}</h4>
          <div>
            ${grp.tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Search Index Preview -->
    <h3 style="color: var(--accent-cyan); margin-bottom: 1rem;">2. SharePoint Search Index Tagging Preview</h3>
    <div class="glass-card" style="padding: 1.5rem;">
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${searchIndex.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.85rem; border-bottom: 1px solid var(--border-color);">
            <div>
              <h4 style="color: #fff; font-size: 0.98rem; margin-bottom: 0.3rem;">${item.title}</h4>
              <div>
                ${item.tags.map(t => `<span class="tag-pill" style="font-size: 0.7rem;">${t}</span>`).join('')}
              </div>
            </div>
            <button class="btn btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">Inspect JSON-LD</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
