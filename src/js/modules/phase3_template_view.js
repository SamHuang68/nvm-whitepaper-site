/**
 * Phase-3: Article Templates Module
 */

import { phase3Templates } from '../../data/phase3_templates.js';

export function renderPhase3Templates(containerEl) {
  if (!containerEl) return;

  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <span class="phase-badge">Phase-3 Article Templates</span>
      <h2 style="font-size: 2rem; margin-top: 0.5rem; color: #fff;">Modular Article & Marketing Templates</h2>
      <p style="color: var(--text-secondary);">Standardized documentation formats for Solution Briefs, Technical Deep Dives, and Product Spec Sheets.</p>
    </div>

    <div class="grid-3">
      ${phase3Templates.map(tpl => `
        <div class="glass-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="display: inline-block; padding: 0.2rem 0.5rem; background: rgba(127, 0, 255, 0.2); color: #d8b4fe; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem;">
              ${tpl.type}
            </span>
            <h3 style="font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">${tpl.title}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">🎯 <strong>Audience:</strong> ${tpl.targetAudience}</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.25rem;">${tpl.summary}</p>
            
            <div style="border-top: 1px dashed var(--border-color); padding-top: 0.85rem;">
              <strong style="font-size: 0.82rem; color: var(--accent-cyan); text-transform: uppercase;">Template Structure:</strong>
              <ul style="margin-top: 0.4rem; padding-left: 1.2rem; font-size: 0.83rem; color: var(--text-secondary);">
                ${tpl.sections.map(s => `<li><strong>${s.heading}:</strong> ${s.body}</li>`).join('')}
              </ul>
            </div>
          </div>
          <button class="btn btn-outline" style="width: 100%; margin-top: 1.5rem; justify-content: center;">
            📄 Use This Template
          </button>
        </div>
      `).join('')}
    </div>
  `;
}
