import gsap from 'gsap';

/* ============================================================
   基础状态
   ============================================================ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const CURTAIN_USED = 'blog:curtain-used';
const CURTAIN_PENDING = 'blog:curtain-pending';
const FIRST_VISIT = 'blog:first-visit';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function storageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* 隐私模式下忽略 */
  }
}

function storageRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* 隐私模式下忽略 */
  }
}

/* ============================================================
   主题切换：按本地时间自动，手动切换仅在当前标签页生效
   ============================================================ */
const THEME_KEY = 'theme';
const NIGHT_START = 18;
const NIGHT_END = 6;

function syncThemeColor(theme: 'light' | 'dark') {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0b0910' : '#f6f1e9');
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

function applyAutoTheme() {
  if (getSessionTheme()) return;

  const next = timeBasedTheme();
  if (document.documentElement.dataset.theme === next) return;

  document.documentElement.dataset.theme = next;
  syncThemeColor(next);
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(next === 'dark'));
  });
  document.dispatchEvent(new Event('themechange'));
}

function initThemeToggle() {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((button) => {
    if (button.dataset.ready === '1') return;
    button.dataset.ready = '1';

    const isDark = document.documentElement.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(isDark));
    syncThemeColor(isDark ? 'dark' : 'light');

    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;

      try {
        sessionStorage.setItem(THEME_KEY, next);
      } catch {
        /* 忽略 */
      }

      button.setAttribute('aria-pressed', String(next === 'dark'));
      syncThemeColor(next);
      document.dispatchEvent(new Event('themechange'));
    });
  });
}

window.setInterval(applyAutoTheme, 60_000);

/* ============================================================
   幕布转场：会话内只播放一次
   ============================================================ */
function getCurtain() {
  return document.getElementById('curtain');
}

function getPanels(curtain: HTMLElement) {
  return Array.from(curtain.querySelectorAll<HTMLElement>('.curtain__panel'));
}

async function curtainIn() {
  const curtain = getCurtain();
  if (!curtain) return;

  const panels = getPanels(curtain);
  const mark = curtain.querySelector<HTMLElement>('.curtain__mark');

  curtain.classList.add('is-animating');
  gsap.set(panels, { yPercent: -101 });

  if (mark) gsap.set(mark, { opacity: 0, y: 8 });

  await new Promise<void>((resolve) => {
    gsap.to(panels, {
      yPercent: 0,
      duration: 0.55,
      ease: 'power3.inOut',
      stagger: 0.045,
      onComplete: resolve,
    });
  });

  if (mark) {
    gsap.to(mark, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' });
  }
}

function curtainOut() {
  const curtain = getCurtain();
  if (!curtain) return;

  const panels = getPanels(curtain);
  const mark = curtain.querySelector<HTMLElement>('.curtain__mark');

  if (mark) gsap.to(mark, { opacity: 0, duration: 0.16 });

  gsap.to(panels, {
    yPercent: 101,
    duration: 0.64,
    ease: 'power4.inOut',
    stagger: 0.05,
    onComplete: () => {
      curtain.classList.remove('is-animating');
      gsap.set(panels, { yPercent: -101 });
    },
  });
}

document.addEventListener('astro:before-preparation', (event) => {
  const preparation = event as Event & { loader?: () => Promise<void> };

  if (reduceMotion) return;
  if (storageGet(CURTAIN_USED) === '1') return;

  const originalLoader = preparation.loader;
  if (!originalLoader) return;

  preparation.loader = async () => {
    storageSet(CURTAIN_USED, '1');
    storageSet(CURTAIN_PENDING, '1');

    await Promise.race([curtainIn(), wait(1100)]);
    await originalLoader.call(preparation);
  };
});

/* ============================================================
   入场动画
   ============================================================ */
function revealPage(delay = 0) {
  if (reduceMotion) return;

  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;

  const items = Array.from(hero.querySelectorAll<HTMLElement>(':scope > *'));
  if (!items.length) return;

  gsap.fromTo(
    items,
    { opacity: 0, y: 36, filter: 'blur(8px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.09,
      delay,
    },
  );
}

/* ============================================================
   磁性按钮
   ============================================================ */
function initMagnetic() {
  if (!canHover || reduceMotion) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
    if (element.dataset.magneticReady === '1') return;
    element.dataset.magneticReady = '1';

    const strength = Number(element.dataset.magnetic) || 0.24;
    const xTo = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'power3.out' });

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * strength);
      yTo((event.clientY - rect.top - rect.height / 2) * strength);
    });

    element.addEventListener('pointerleave', () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/* ============================================================
   光标环
   ============================================================ */
function initCursor() {
  const ring = document.getElementById('cursor-ring');
  if (!ring) return;

  if (!canHover || reduceMotion) {
    ring.style.display = 'none';
    return;
  }

  if (ring.dataset.ready === '1') return;
  ring.dataset.ready = '1';
  ring.style.display = 'block';

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let targetX = x;
  let targetY = y;

  window.addEventListener(
    'pointermove',
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      ring.classList.add('is-visible');
    },
    { passive: true },
  );

  document.addEventListener('pointerover', (event) => {
    const target = event.target as Element | null;
    const interactive = target?.closest('a, button, [data-magnetic], input, textarea, select');
    ring.classList.toggle('is-active', Boolean(interactive));
  });

  const loop = () => {
    if (!ring.isConnected) return;

    x += (targetX - x) * 0.16;
    y += (targetY - y) * 0.16;
    ring.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(loop);
  };

  loop();
}

/* ============================================================
   跑马灯：滚动越快，跑得越快
   ============================================================ */
let marqueeAnimations: Animation[] = [];
let lastScrollY = window.scrollY;
let marqueeRate = 1;
let marqueeTickerStarted = false;

function marqueeTick() {
  if (!marqueeAnimations.length) return;

  const current = window.scrollY;
  const velocity = current - lastScrollY;
  lastScrollY = current;

  const target = Math.min(4.5, Math.max(1, 1 + Math.abs(velocity) * 0.055));
  marqueeRate += (target - marqueeRate) * 0.08;

  for (const animation of marqueeAnimations) {
    try {
      animation.playbackRate = marqueeRate;
    } catch {
      /* 动画已销毁时忽略 */
    }
  }
}

function initMarquees() {
  marqueeAnimations = Array.from(document.querySelectorAll('.marquee__track')).flatMap((element) =>
    element.getAnimations(),
  );
  lastScrollY = window.scrollY;

  if (!marqueeTickerStarted) {
    marqueeTickerStarted = true;
    gsap.ticker.add(marqueeTick);
  }
}

/* ============================================================
   粒子背景
   ============================================================ */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

let particleCanvas: HTMLCanvasElement | null = null;
let particleContext: CanvasRenderingContext2D | null = null;
let particleList: Particle[] = [];
let particleWidth = 0;
let particleHeight = 0;
let particleDpr = 1;
let particleFrame = 0;
let particleInView = true;
let particlePointer = { x: -9999, y: -9999 };
let particleColors = { dot: '#14120e', line: '#df3f14' };
let particlePointerBound = false;
let canvasObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

function readParticleColors() {
  const styles = getComputedStyle(document.documentElement);
  particleColors.dot = styles.getPropertyValue('--ink').trim() || '#14120e';
  particleColors.line = styles.getPropertyValue('--accent').trim() || '#df3f14';
}

function rgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(20, 18, 14, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function seedParticles(count: number) {
  particleList = Array.from({ length: count }, () => ({
    x: Math.random() * particleWidth,
    y: Math.random() * particleHeight,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    r: Math.random() * 1.3 + 0.6,
  }));
}

function resizeParticles() {
  if (!particleCanvas || !particleContext) return;

  const rect = particleCanvas.getBoundingClientRect();
  particleWidth = Math.max(1, rect.width);
  particleHeight = Math.max(1, rect.height);
  particleDpr = Math.min(window.devicePixelRatio || 1, 2);

  particleCanvas.width = Math.floor(particleWidth * particleDpr);
  particleCanvas.height = Math.floor(particleHeight * particleDpr);
  particleContext.setTransform(particleDpr, 0, 0, particleDpr, 0, 0);

  const count = Math.min(72, Math.max(24, Math.floor((particleWidth * particleHeight) / 22000)));
  seedParticles(count);
}

function drawParticles() {
  if (!particleContext) return;

  particleContext.clearRect(0, 0, particleWidth, particleHeight);

  const linkDistance = particleWidth < 720 ? 95 : 132;
  const linkDistanceSq = linkDistance * linkDistance;

  for (const particle of particleList) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0 || particle.x > particleWidth) particle.vx *= -1;
    if (particle.y < 0 || particle.y > particleHeight) particle.vy *= -1;

    const dx = particle.x - particlePointer.x;
    const dy = particle.y - particlePointer.y;
    const distance = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));

    if (distance < 110) {
      const force = (110 - distance) / 110;
      particle.x += (dx / distance) * force * 1.1;
      particle.y += (dy / distance) * force * 1.1;
    }

    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    particleContext.fillStyle = rgba(particleColors.dot, 0.42);
    particleContext.fill();
  }

  for (let i = 0; i < particleList.length; i += 1) {
    for (let j = i + 1; j < particleList.length; j += 1) {
      const a = particleList[i];
      const b = particleList[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq > linkDistanceSq) continue;

      const alpha = (1 - Math.sqrt(distanceSq) / linkDistance) * 0.17;
      particleContext.beginPath();
      particleContext.moveTo(a.x, a.y);
      particleContext.lineTo(b.x, b.y);
      particleContext.strokeStyle = rgba(particleColors.line, alpha);
      particleContext.lineWidth = 1;
      particleContext.stroke();
    }
  }
}

function particleLoop() {
  if (!particleCanvas || !particleCanvas.isConnected) {
    particleFrame = 0;
    return;
  }

  particleFrame = requestAnimationFrame(particleLoop);

  if (!particleInView || document.hidden) return;
  drawParticles();
}

function bindParticleEvents() {
  if (particlePointerBound) return;
  particlePointerBound = true;

  window.addEventListener(
    'pointermove',
    (event) => {
      if (!particleCanvas) return;
      const rect = particleCanvas.getBoundingClientRect();
      particlePointer.x = event.clientX - rect.left;
      particlePointer.y = event.clientY - rect.top;
    },
    { passive: true },
  );

  window.addEventListener('pointerleave', () => {
    particlePointer.x = -9999;
    particlePointer.y = -9999;
  });

  document.addEventListener('themechange', readParticleColors);
}

function initParticles() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-particles]');

  if (!canvas) {
    if (particleCanvas) {
      cancelAnimationFrame(particleFrame);
      particleFrame = 0;
      particleCanvas = null;
      particleContext = null;
    }
    return;
  }

  if (particleCanvas === canvas) return;

  if (particleCanvas) cancelAnimationFrame(particleFrame);

  particleCanvas = canvas;
  particleContext = canvas.getContext('2d');
  readParticleColors();
  bindParticleEvents();
  resizeParticles();

  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(resizeParticles);
  resizeObserver.observe(canvas);

  canvasObserver?.disconnect();
  canvasObserver = new IntersectionObserver(
    (entries) => {
      particleInView = entries[0]?.isIntersecting ?? false;
    },
    { threshold: 0 },
  );
  canvasObserver.observe(canvas);

  cancelAnimationFrame(particleFrame);
  particleFrame = requestAnimationFrame(particleLoop);
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
    .map((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      return document.getElementById(id);
    })
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

    const offset = 130;
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
  initCursor();

  const pending = storageGet(CURTAIN_PENDING) === '1';
  const first = storageGet(FIRST_VISIT) !== '1';
  storageSet(FIRST_VISIT, '1');

  if (pending) {
    storageRemove(CURTAIN_PENDING);
    curtainOut();
    revealPage(0.08);
  } else if (first && !reduceMotion) {
    revealPage();
  }

  initMagnetic();
  initMarquees();
  initParticles();
  initCodeBlocks();
  initToc();
});
