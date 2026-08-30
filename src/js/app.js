import { renderPhase1KB } from './modules/phase1_kb_view.js';
import { renderPhase2Reader } from './modules/phase2_reader.js';
import { renderPhase3Templates } from './modules/phase3_template_view.js';
import { renderPhase4Metadata } from './modules/phase4_meta_view.js';
import { renderMatrix } from './modules/matrix.js';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_QUERY_KEY,
  LANGUAGE_STORAGE_KEY,
  languageQueryValue,
  normalizeLanguage,
  t
} from '../data/i18n.js';

const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates'];
const legacyViewMap = { phase1: 'overview', phase2: 'whitepaper', matrix: 'selector', phase4: 'taxonomy', phase3: 'templates' };
const acceptedLanguageValues = ['en', 'zh', 'zh-tw', 'zh-hant', 'traditional-chinese'];
let currentLanguage = DEFAULT_LANGUAGE;

function safeStorageRead() {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeStorageWrite(language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language === 'zh' ? 'zh' : 'en');
  } catch {
    // URL state remains authoritative when browser storage is unavailable.
  }
}

function languageFromLocation() {
  const raw = new URL(window.location.href).searchParams.get(LANGUAGE_QUERY_KEY);
  if (!raw || !acceptedLanguageValues.includes(raw.toLowerCase())) return null;
  return normalizeLanguage(raw);
}

function resolveInitialLanguage() {
  return languageFromLocation() ?? (safeStorageRead() ? normalizeLanguage(safeStorageRead()) : DEFAULT_LANGUAGE);
}

function requestedView() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('view') || 'overview';
  return views.includes(raw) ? raw : (legacyViewMap[raw] || 'overview');
}

function setView(view, { updateHistory = true, focus = false } = {}) {
  const next = views.includes(view) ? view : 'overview';
  document.body.dataset.activeView = next;
  document.querySelectorAll('.view-tab').forEach((tab) => {
    const active = tab.dataset.view === next;
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  document.querySelectorAll('.studio-panel').forEach((panel) => {
    panel.hidden = panel.id !== `panel-${next}`;
  });

  if (updateHistory) {
    const url = new URL(window.location.href);
    if (next === 'overview') url.searchParams.delete('view');
    else url.searchParams.set('view', next);
    url.searchParams.set(LANGUAGE_QUERY_KEY, languageQueryValue(currentLanguage));
    if (next !== 'whitepaper' && url.hash.startsWith('#chap-')) url.hash = '';
    window.history.pushState({ view: next, language: currentLanguage }, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

function renderPanels({ preserveMatrixFamily = true } = {}) {
  const previousFamily = preserveMatrixFamily ? document.querySelector('#filter-family')?.value : null;
  renderPhase1KB(document.querySelector('#panel-overview'), currentLanguage);
  renderPhase2Reader(document.querySelector('#panel-whitepaper'), currentLanguage);
  renderMatrix(document.querySelector('#panel-selector'), currentLanguage);
  renderPhase4Metadata(document.querySelector('#panel-taxonomy'), currentLanguage);
  renderPhase3Templates(document.querySelector('#panel-templates'), currentLanguage);

  if (previousFamily) {
    const nextFilter = document.querySelector('#filter-family');
    if ([...nextFilter.options].some((option) => option.value === previousFamily)) {
      nextFilter.value = previousFamily;
      nextFilter.dispatchEvent(new Event('change'));
    }
  }
}

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n, currentLanguage);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml, currentLanguage);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria, currentLanguage));
  });

  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-Hant' : 'en';
  document.body.dataset.language = currentLanguage;
  document.title = t('meta.title', currentLanguage);
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = t('meta.description', currentLanguage);

  document.querySelectorAll('[data-language-option]').forEach((button) => {
    const active = button.dataset.languageOption === currentLanguage;
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  const switcher = document.querySelector('.language-switcher');
  if (switcher) switcher.setAttribute('aria-label', t('language.group', currentLanguage));
  syncMenuLabel();
}

function syncLocalizedLinks() {
  document.querySelectorAll('[data-view-link]').forEach((link) => {
    const url = new URL(window.location.href);
    const view = link.dataset.viewLink;
    if (view === 'overview') url.searchParams.delete('view');
    else url.searchParams.set('view', view);
    url.searchParams.set(LANGUAGE_QUERY_KEY, languageQueryValue(currentLanguage));
    url.hash = link.dataset.viewHash ? `#${link.dataset.viewHash}` : '';
    link.href = `${url.pathname}${url.search}${url.hash}`;
  });
}

function commitLanguage(language, {
  historyMode = 'none',
  persist = true,
  rerender = true,
  preserveMatrixFamily = true
} = {}) {
  const next = normalizeLanguage(language);
  const changed = next !== currentLanguage;
  currentLanguage = next;

  if (rerender && changed) renderPanels({ preserveMatrixFamily });
  applyStaticTranslations();
  syncLocalizedLinks();
  if (persist) safeStorageWrite(currentLanguage);

  if (historyMode !== 'none') {
    const url = new URL(window.location.href);
    url.searchParams.set(LANGUAGE_QUERY_KEY, languageQueryValue(currentLanguage));
    const method = historyMode === 'push' ? 'pushState' : 'replaceState';
    window.history[method](
      { view: requestedView(), language: currentLanguage },
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
  }
}

function routeFromLocation({ scrollChapter = false, syncLanguage = false } = {}) {
  const url = new URL(window.location.href);
  if (syncLanguage) {
    const routeLanguage = languageFromLocation();
    if (routeLanguage && routeLanguage !== currentLanguage) {
      commitLanguage(routeLanguage, { historyMode: 'none', persist: true, rerender: true });
    }
  }

  const chapterRoute = url.hash.startsWith('#chap-');
  const hasExplicitView = url.searchParams.has('view');
  let next = requestedView();

  if (chapterRoute && !hasExplicitView) next = 'whitepaper';
  if (chapterRoute && next !== 'whitepaper') {
    url.hash = '';
    window.history.replaceState({ view: next, language: currentLanguage }, '', `${url.pathname}${url.search}`);
  }

  setView(next, { updateHistory: false });
  if (chapterRoute && next === 'whitepaper' && scrollChapter) {
    requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' }));
  } else if (next !== 'overview' && scrollChapter) {
    requestAnimationFrame(() => document.querySelector('.view-dock')?.scrollIntoView({ block: 'start' }));
  }
}

function initTabs() {
  const tabs = [...document.querySelectorAll('.view-tab')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let target = index;
      if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
      else target = (index + 1) % tabs.length;
      setView(tabs[target].dataset.view, { focus: true });
    });
  });
  window.addEventListener('popstate', () => routeFromLocation({ scrollChapter: true, syncLanguage: true }));
}

function syncMenuLabel() {
  const button = document.querySelector('#menuToggle');
  const nav = document.querySelector('#globalNav');
  if (!button) return;
  button.setAttribute('aria-label', t(nav?.classList.contains('open') ? 'menu.close' : 'menu.open', currentLanguage));
}

function initMobileNavigation() {
  const button = document.querySelector('#menuToggle');
  const nav = document.querySelector('#globalNav');
  const close = (restoreFocus = false) => {
    nav?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    syncMenuLabel();
    if (restoreFocus) button?.focus();
  };

  button?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    syncMenuLabel();
    if (open) nav.querySelector('a')?.focus();
  });
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && nav?.classList.contains('open')) close(true); });
  window.addEventListener('resize', () => { if (window.matchMedia('(min-width: 1081px)').matches) close(); }, { passive: true });
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function initCopyActions() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-outline]');
    if (!button) return;
    const text = button.dataset.copyOutline || '';
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('templates.copied', currentLanguage));
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.className = 'clipboard-fallback';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      showToast(t('templates.copied', currentLanguage));
    }
  });
}

function initLanguageSwitcher() {
  document.querySelectorAll('[data-language-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = normalizeLanguage(button.dataset.languageOption);
      if (next === currentLanguage) return;
      commitLanguage(next, { historyMode: 'push', persist: true, rerender: true });
      button.focus();
    });
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue) return;
    const next = normalizeLanguage(event.newValue);
    if (next === currentLanguage) return;
    commitLanguage(next, { historyMode: 'replace', persist: false, rerender: true });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  currentLanguage = resolveInitialLanguage();
  renderPanels({ preserveMatrixFamily: false });
  applyStaticTranslations();
  syncLocalizedLinks();
  safeStorageWrite(currentLanguage);

  const initialUrl = new URL(window.location.href);
  initialUrl.searchParams.set(LANGUAGE_QUERY_KEY, languageQueryValue(currentLanguage));
  window.history.replaceState(
    { view: requestedView(), language: currentLanguage },
    '',
    `${initialUrl.pathname}${initialUrl.search}${initialUrl.hash}`
  );

  initTabs();
  initMobileNavigation();
  initCopyActions();
  initLanguageSwitcher();
  routeFromLocation({ scrollChapter: true });
});
