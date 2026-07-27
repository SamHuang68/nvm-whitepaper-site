/**
 * Internal Confidential Watermark Module
 */

export function initWatermark() {
  if (document.getElementById('watermark-overlay')) return;

  const watermarkEl = document.createElement('div');
  watermarkEl.id = 'watermark-overlay';
  document.body.appendChild(watermarkEl);
}
