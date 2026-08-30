import { phase3Templates } from '../../data/phase3_templates.js';
import { localize, t } from '../../data/i18n.js';

export function renderPhase3Templates(container, language = 'en') {
  if (!container) return;
  const U = (key) => t(key, language);
  const L = (value) => localize(value, language);
  container.innerHTML = `
    <header class="panel-heading template-heading">
      <div><p class="eyebrow dark">${U('templates.eyebrow')}</p><h2>${U('templates.title')}</h2></div>
      <p>${U('templates.intro')}</p>
    </header>
    <div class="template-grid">
      ${phase3Templates.map((template, index) => {
        const outline = `${L(template.title)}\n\n${template.sections.map((section) => `${L(section.heading)}\n${L(section.body)}`).join('\n\n')}`;
        return `
          <article class="template-card">
            <header><span>${String(index + 1).padStart(2, '0')}</span><p>${L(template.type)}</p></header>
            <h3>${L(template.title)}</h3>
            <p class="template-audience">${L(template.targetAudience)}</p>
            <p class="template-summary">${L(template.summary)}</p>
            <ol>${template.sections.map((section, sectionIndex) => `<li><span>${String(sectionIndex + 1).padStart(2, '0')}</span><div><b>${L(section.heading)}</b><p>${L(section.body)}</p></div></li>`).join('')}</ol>
            <button class="copy-button" type="button" data-copy-outline="${escapeAttribute(outline)}">${U('templates.copy')} <span aria-hidden="true">＋</span></button>
          </article>
        `;
      }).join('')}
    </div>
    <aside class="template-rule"><p>${U('templates.rule')}</p><h3>${U('templates.ruleTitle')}</h3><span>${U('templates.ruleBody')}</span></aside>
  `;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '&#10;');
}
