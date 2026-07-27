/**
 * Main Application Orchestrator for NVM 5-Phase Interactive Portal
 */

import { initWatermark } from './modules/watermark.js';
import { renderPhase1KB } from './modules/phase1_kb_view.js';
import { renderPhase2Reader } from './modules/phase2_reader.js';
import { renderPhase3Templates } from './modules/phase3_template_view.js';
import { renderPhase4Metadata } from './modules/phase4_meta_view.js';
import { renderMatrix } from './modules/matrix.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Confidential Watermark
  initWatermark();

  // 2. Render all Phase panels
  renderPhase1KB(document.getElementById('panel-phase1'));
  renderPhase2Reader(document.getElementById('panel-phase2'));
  renderPhase3Templates(document.getElementById('panel-phase3'));
  renderPhase4Metadata(document.getElementById('panel-phase4'));
  renderMatrix(document.getElementById('panel-matrix'));

  // 3. Tab switching logic for Phase-5 Portal
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.phase-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPhase = button.getAttribute('data-phase');

      // Update Tab active states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update Panel active states
      panels.forEach(panel => {
        if (panel.id === `panel-${targetPhase}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
});
