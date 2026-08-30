import { phase2Whitepaper } from '../../data/phase2_paper.js';
import { localize, t } from '../../data/i18n.js';

export function renderPhase2Reader(container, language = 'en') {
  if (!container) return;
  const { title, subtitle, author, editorialPublisher, povContractId, povScopeId, version, publishDate, chapters } = phase2Whitepaper;
  const U = (key) => t(key, language);
  const L = (value) => localize(value, language);

  container.innerHTML = `
    <header class="paper-heading">
      <p class="eyebrow dark">${U('whitepaper.eyebrow')}</p>
      <h2>${L(title)}</h2>
      <p>${L(subtitle)}</p>
      <dl data-pov-contract-id="${povContractId}" data-pov-scope-id="${povScopeId}"><div><dt>${U('whitepaper.author')}</dt><dd>${author}</dd></div><div><dt>${U('whitepaper.publisher')}</dt><dd>${editorialPublisher}</dd></div><div><dt>${U('whitepaper.pov')}</dt><dd title="${povScopeId}">${U('whitepaper.neutral')}</dd></div><div><dt>${U('whitepaper.status')}</dt><dd>${L(version)}</dd></div><div><dt>${U('whitepaper.reviewDate')}</dt><dd>${publishDate}</dd></div></dl>
    </header>
    <div class="reader-layout">
      <aside class="reader-index">
        <p>${U('whitepaper.chapterIndex')}</p>
        <nav aria-label="${U('whitepaper.chapterNav')}">
          ${chapters.map((chapter) => `<a href="#chap-${chapter.id}"><b>${chapter.number}</b><span>${L(chapter.title)}</span></a>`).join('')}
        </nav>
        <div class="reader-boundary"><b>${U('whitepaper.publicRule')}</b><span>${U('whitepaper.publicRuleText')}</span></div>
      </aside>
      <div class="paper-body">
        ${chapters.map((chapter) => `
          <article id="chap-${chapter.id}" class="paper-chapter">
            <header><p>${U('whitepaper.chapter')} ${chapter.number}</p><h3>${L(chapter.title)}</h3><strong>${L(chapter.lede)}</strong></header>
            <div class="chapter-copy">${chapter.paragraphs.map((paragraph) => `<p>${L(paragraph)}</p>`).join('')}</div>
            <div class="chapter-takeaways"><p>${U('whitepaper.takeaways')}</p><ul>${chapter.takeaways.map((item) => `<li>${L(item)}</li>`).join('')}</ul></div>
            <div class="chapter-sources"><p>${U('whitepaper.sources')}</p>${chapter.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer"${source.sourceRole ? ` data-source-role="${source.sourceRole}"` : ''}><b>${source.id}</b><span>${L(source.label)}</span><small>${L(source.actor)} · ${L(source.evidenceClass)}</small></a>`).join('')}</div>
            <dl class="evidence-contract"><div><dt>${U('whitepaper.evidenceClass')}</dt><dd>${L(chapter.evidenceClass)}</dd></div><div><dt>${U('whitepaper.limitation')}</dt><dd>${L(chapter.limitation)}</dd></div><div><dt>${U('whitepaper.openValidation')}</dt><dd>${L(chapter.openValidation)}</dd></div></dl>
          </article>
        `).join('')}
        <aside class="paper-sources">
          <div><p>${U('whitepaper.continue')}</p><h3>${U('whitepaper.hubTitle')}</h3></div>
          <nav><a href="https://samhuang68.github.io/secure-storage-knowledge-hub/memory-evidence.html">${U('whitepaper.openLedger')} <span>↗</span></a><a href="https://samhuang68.github.io/secure-storage-knowledge-hub/memory-physics.html">${U('whitepaper.reviewPhysics')} <span>↗</span></a></nav>
        </aside>
      </div>
    </div>
  `;
}
