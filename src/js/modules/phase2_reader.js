/**
 * Phase-2: Interactive White Paper Reader Module
 */

import { phase2Whitepaper } from '../../data/phase2_paper.js';

export function renderPhase2Reader(containerEl) {
  if (!containerEl) return;

  const { title, subtitle, author, version, publishDate, chapters } = phase2Whitepaper;

  containerEl.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <span class="phase-badge">Phase-2 Technical White Paper</span>
      <h2 style="font-size: 2.2rem; margin-top: 0.5rem; color: #fff; line-height: 1.2;">${title}</h2>
      <p style="color: var(--accent-cyan); font-size: 1.1rem; margin-top: 0.5rem;">${subtitle}</p>
      <div style="display: flex; gap: 1.5rem; margin-top: 1rem; color: var(--text-muted); font-size: 0.85rem;">
        <span>✍️ ${author}</span>
        <span>🏷️ ${version}</span>
        <span>📅 ${publishDate}</span>
      </div>
    </div>

    <div class="reader-container">
      <!-- Table of Contents Sidebar -->
      <div class="glass-card reader-toc">
        <h4 style="color: var(--accent-blue); margin-bottom: 1rem; font-size: 0.95rem;">CHAPTERS</h4>
        <nav id="toc-nav">
          ${chapters.map((ch, idx) => `
            <a href="#chap-${ch.id}" class="toc-item ${idx === 0 ? 'active' : ''}">
              <span style="font-weight: 700; opacity: 0.6; margin-right: 0.4rem;">${ch.number}</span> ${ch.title.split('&')[0]}
            </a>
          `).join('')}
        </nav>
      </div>

      <!-- Main Whitepaper Content -->
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        ${chapters.map(ch => `
          <div id="chap-${ch.id}" class="glass-card" style="padding: 2rem;">
            <div style="color: var(--accent-cyan); font-weight: 800; font-size: 0.9rem; letter-spacing: 0.1em; margin-bottom: 0.4rem;">
              CHAPTER ${ch.number}
            </div>
            <h3 style="font-size: 1.5rem; color: #fff; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
              ${ch.title}
            </h3>
            <div style="color: var(--text-secondary); line-height: 1.8; font-size: 0.98rem; white-space: pre-line;">
              ${ch.content}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
