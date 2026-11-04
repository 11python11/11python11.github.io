/**
 * 给站内路径拼上部署 base。
 * 例如部署在 https://name.github.io/blog/ 时，
 * withBase('/blog/') 会得到 '/blog/blog/'，这是 Astro 的 base 机制决定的。
 */
export function withBase(path = '/'): string {
  const base = import.meta.env.BASE_URL;
  const root = base.endsWith('/') ? base.slice(0, -1) : base;

  if (!path || path === '/') return root ? `${root}/` : '/';

  return `${root}/${path.replace(/^\/+/, '')}`;
}

/** 2026.11.04 */
export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/** 2026 年 11 月 4 日 */
export function formatDateLong(date: Date): string {
  return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
}

/** 按中英文混排估算阅读时间（分钟） */
export function readingTime(body = ''): number {
  const text = body.replace(/```[\s\S]*?```/g, ' ');
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}

/** 去掉 Markdown 标记，截取一段纯文本摘要 */
export function excerpt(markdown = '', max = 110): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > max ? `${text.slice(0, max)}…` : text;
}
