/* ============================================================
   基础状态
   ============================================================ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const THEME_KEY = 'theme';
const NIGHT_START = 18;
const NIGHT_END = 6;

/* ============================================================
   主题：按本地时间自动，手动切换只在当前标签页生效
   ============================================================ */
function syncThemeColor(theme: 'light' | 'dark') {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0a0f1e' : '#f3f2fb');
  }
}

function getSessionTheme(): 'light' | 'dark' | null {
  try {
    const saved = sessionStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function timeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= NIGHT_START || hour < NIGHT_END ? 'dark' : 'light';
}

function syncToggleState() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
  });
}

function applyAutoTheme() {
  if (getSessionTheme()) return;

  const next = timeBasedTheme();
  if (document.documentElement.dataset.theme === next) return;

  document.documentElement.dataset.theme = next;
  syncThemeColor(next);
  syncToggleState();
  document.dispatchEvent(new Event('themechange'));
}

function initThemeToggle() {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    if (button.dataset.ready === '1') return;
    button.dataset.ready = '1';

    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;

      try {
        sessionStorage.setItem(THEME_KEY, next);
      } catch {
        /* 隐私模式下忽略 */
      }

      syncThemeColor(next);
      syncToggleState();
      document.dispatchEvent(new Event('themechange'));
    });
  });

  const isDark = document.documentElement.dataset.theme === 'dark';
  syncThemeColor(isDark ? 'dark' : 'light');
  syncToggleState();
}

window.setInterval(applyAutoTheme, 60_000);

/* ============================================================
   顶部导航：向下滚动时收起，向上时回来
   ============================================================ */
let lastScrollY = 0;
let topbarBound = false;

function initTopbar() {
  const bar = document.querySelector<HTMLElement>('[data-topbar]');
  if (!bar) return;

  bar.classList.remove('is-hidden');
  lastScrollY = window.scrollY;

  if (topbarBound) return;
  topbarBound = true;

  window.addEventListener(
    'scroll',
    () => {
      const topbar = document.querySelector<HTMLElement>('[data-topbar]');
      if (!topbar) return;

      const current = window.scrollY;
      if (window.innerWidth > 760 && current > 120 && current > lastScrollY + 6) {
        topbar.classList.add('is-hidden');
      } else if (current < lastScrollY - 6 || current <= 120) {
        topbar.classList.remove('is-hidden');
      }

      lastScrollY = current;
    },
    { passive: true },
  );
}

/* ============================================================
   搜索
   ============================================================ */
type SearchEntry = {
  title: string;
  description: string;
  tags: string[];
  date: string;
  url: string;
};

function closeSearch(root: HTMLElement) {
  const results = root.querySelector<HTMLElement>('[data-search-results]');
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  if (results) results.hidden = true;
  if (input) input.setAttribute('aria-expanded', 'false');
}

function highlightText(text: string, query: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const source = text ?? '';
  const term = query.trim().toLowerCase();

  if (!term) {
    fragment.append(source);
    return fragment;
  }

  const lower = source.toLowerCase();
  let cursor = 0;
  let hit = lower.indexOf(term);

  while (hit !== -1) {
    if (hit > cursor) fragment.append(source.slice(cursor, hit));

    const mark = document.createElement('mark');
    mark.className = 'search__mark';
    mark.textContent = source.slice(hit, hit + term.length);
    fragment.append(mark);

    cursor = hit + term.length;
    hit = lower.indexOf(term, cursor);
  }

  if (cursor < source.length) fragment.append(source.slice(cursor));
  return fragment;
}

function renderSearchResults(root: HTMLElement, entries: SearchEntry[], query: string) {
  const results = root.querySelector<HTMLElement>('[data-search-results]');
  const input = root.querySelector<HTMLInputElement>('[data-search-input]');
  if (!results) return;

  results.replaceChildren();

  const term = query.trim().toLowerCase();
  const matches = entries
    .filter((entry) => {
      const title = entry.title.toLowerCase();
      const desc = entry.description.toLowerCase();
      const tags = entry.tags.map((tag) => tag.toLowerCase());
      return title.includes(term) || desc.includes(term) || tags.some((tag) => tag.includes(term));
    })
    .slice(0, 8);

  if (!matches.length) {
    const empty = document.createElement('div');
    empty.className = 'search__empty';
    empty.textContent = `没有找到「${query.trim()}」相关的文章。`;
    results.append(empty);
  } else {
    for (const entry of matches) {
      const link = document.createElement('a');
      link.className = 'search__item';
      link.href = entry.url;

      const head = document.createElement('div');
      head.className = 'search__item-head';

      const title = document.createElement('span');
      title.className = 'search__item-title';
      title.append(highlightText(entry.title, query));

      const date = document.createElement('span');
      date.className = 'search__item-date';
      date.textContent = entry.date;

      head.append(title, date);
      link.append(head);

      if (entry.description) {
        const desc = document.createElement('span');
        desc.className = 'search__item-desc';
        desc.append(highlightText(entry.description, query));
        link.append(desc);
      }

      if (entry.tags.length) {
        const tags = document.createElement('span');
        tags.className = 'search__item-tags';
        for (const tag of entry.tags) {
          const chip = document.createElement('span');
          chip.append(highlightText(tag, query));
          tags.append(chip);
        }
        link.append(tags);
      }

      link.addEventListener('click', () => closeSearch(root));
      results.append(link);
    }
  }

  results.hidden = false;
  input?.setAttribute('aria-expanded', 'true');
}

function initSearch() {
  document.querySelectorAll<HTMLElement>('[data-search]').forEach((root) => {
    if (root.dataset.ready === '1') return;

    const input = root.querySelector<HTMLInputElement>('[data-search-input]');
    const form = root.querySelector<HTMLFormElement>('[data-search-form]');
    const results = root.querySelector<HTMLElement>('[data-search-results]');
    if (!input || !form || !results) return;

    const indexScript = document.querySelector<HTMLScriptElement>('script[data-search-index]');
    let entries: SearchEntry[] = [];

    try {
      entries = JSON.parse(indexScript?.textContent ?? '[]') as SearchEntry[];
    } catch {
      entries = [];
    }

    if (!entries.length) return;
    root.dataset.ready = '1';

    input.setAttribute('aria-expanded', 'false');

    input.addEventListener('input', () => {
      const query = input.value;
      if (!query.trim()) {
        closeSearch(root);
        return;
      }
      renderSearchResults(root, entries, query);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSearch(root);
        input.blur();
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const first = results.querySelector<HTMLAnchorElement>('.search__item');
      if (first) window.location.href = first.href;
    });
  });
}

document.addEventListener('mousedown', (event) => {
  const target = event.target as Node | null;
  document.querySelectorAll<HTMLElement>('[data-search]').forEach((root) => {
    if (target && !root.contains(target)) closeSearch(root);
  });
});

/* ============================================================
   轮播
   ============================================================ */
const carouselTimers = new Set<number>();

function clearCarouselTimers() {
  carouselTimers.forEach((timer) => window.clearInterval(timer));
  carouselTimers.clear();
}

function initCarousels() {
  clearCarouselTimers();

  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
    if (slides.length < 2) return;

    let current = 0;
    let timer: number | null = null;

    const show = (index: number) => {
      current = index;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        if (active) {
          slide.removeAttribute('tabindex');
        } else {
          slide.setAttribute('tabindex', '-1');
        }
      });

      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', String(active));
      });
    };

    const stop = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        carouselTimers.delete(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      if (reduceMotion) return;

      const delay = Number(root.dataset.interval) || 5000;
      timer = window.setInterval(() => {
        show((current + 1) % slides.length);
      }, delay);
      carouselTimers.add(timer);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', (event) => {
      const next = event.relatedTarget as Node | null;
      if (!next || !root.contains(next)) start();
    });

    show(0);
    start();
  });
}

/* ============================================================
   时钟与运行时长
   ============================================================ */
let clockTimer: number | null = null;

function updateClock() {
  const now = new Date();

  document.querySelectorAll<HTMLElement>('[data-clock]').forEach((element) => {
    element.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  });

  document.querySelectorAll<HTMLElement>('[data-uptime]').forEach((element) => {
    const since = element.dataset.since ? new Date(element.dataset.since) : null;
    if (!since || Number.isNaN(since.getTime())) {
      element.textContent = '刚刚';
      return;
    }

    const diff = Math.max(0, now.getTime() - since.getTime());
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    element.textContent = `${days} 天 ${hours} 小时`;
  });
}

function initClock() {
  updateClock();
  if (clockTimer !== null) return;
  clockTimer = window.setInterval(updateClock, 1000);
}

/* ============================================================
   代码块窗口栏 + 复制
   ============================================================ */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

function initCodeBlocks() {
  document.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre) => {
    if (pre.closest('.code-wrap')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrap';

    const bar = document.createElement('div');
    bar.className = 'code-bar';

    const dots = document.createElement('div');
    dots.className = 'code-bar__dots';
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 3; i += 1) {
      dots.appendChild(document.createElement('i'));
    }

    const language = document.createElement('span');
    language.className = 'code-bar__lang';
    language.textContent = pre.dataset.language || 'code';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'code-bar__copy';
    copyButton.textContent = '复制';

    copyButton.addEventListener('click', async () => {
      const ok = await copyText(pre.textContent ?? '');
      copyButton.textContent = ok ? '已复制' : '复制失败';
      setTimeout(() => {
        copyButton.textContent = '复制';
      }, 1600);
    });

    bar.append(dots, language, copyButton);

    const parent = pre.parentNode;
    if (!parent) return;

    parent.insertBefore(wrapper, pre);
    wrapper.appendChild(bar);
    wrapper.appendChild(pre);
  });
}

/* ============================================================
   文章目录高亮
   ============================================================ */
let tocScrollHandler: (() => void) | null = null;
let tocFrame = 0;

function initToc() {
  if (tocScrollHandler) {
    window.removeEventListener('scroll', tocScrollHandler);
    tocScrollHandler = null;
  }
  if (tocFrame) {
    cancelAnimationFrame(tocFrame);
    tocFrame = 0;
  }

  const toc = document.querySelector<HTMLElement>('[data-toc]');
  if (!toc) return;

  const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const headings = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((heading): heading is HTMLElement => Boolean(heading));

  if (!headings.length) return;

  const activate = (current: HTMLElement | null) => {
    links.forEach((link) => {
      link.classList.toggle(
        'is-active',
        current ? decodeURIComponent(link.hash.slice(1)) === current.id : false,
      );
    });
  };

  const update = () => {
    tocFrame = 0;

    const offset = 120;
    let current: HTMLElement | null = null;

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= offset) {
        current = heading;
      } else {
        break;
      }
    }

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = headings[headings.length - 1] ?? current;
    }

    activate(current);
  };

  tocScrollHandler = () => {
    if (tocFrame) return;
    tocFrame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', tocScrollHandler, { passive: true });
  update();
}

/* ============================================================
   每次换页后统一初始化
   ============================================================ */
document.addEventListener('astro:page-load', () => {
  initThemeToggle();
  initTopbar();
  initSearch();
  initCarousels();
  initClock();
  initCodeBlocks();
  initToc();
});
