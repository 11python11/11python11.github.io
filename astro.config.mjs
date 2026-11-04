import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * GitHub Actions 里会自动注入 GITHUB_REPOSITORY（格式：owner/repo）。
 * 这样部署到 GitHub Pages 时不需要手动改 site / base：
 *   - 仓库名为 owner.github.io  -> https://owner.github.io/
 *   - 其他仓库（例如 blog）      -> https://owner.github.io/blog/
 * 本地开发时没有该环境变量，默认 http://localhost:4321/。
 */
const repository = process.env.GITHUB_REPOSITORY ?? '';
const [owner, repo] = repository.split('/');

const isUserSite =
  Boolean(owner && repo) &&
  repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

const site =
  process.env.SITE_URL ??
  (owner ? `https://${owner}.github.io` : 'http://localhost:4321');

const base =
  process.env.BASE_PATH ??
  (repo ? (isUserSite ? '/' : `/${repo}`) : '/');

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // 明暗双主题：暗色变量写入 --shiki-dark，由 global.css 接管
      themes: {
        light: 'github-light',
        dark: 'one-dark-pro',
      },
    },
  },
});
