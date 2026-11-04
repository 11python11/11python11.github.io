/**
 * 站点信息 —— 先改这里。
 * 名字、简介、邮箱、GitHub 都在这个文件里，改完重新构建即可。
 */
export const SITE = {
  name: 'Rui',
  latinName: 'RUI',
  title: 'Rui · 记录与思考',
  description: '一个关于技术、折腾与日常的个人博客。写下来，就是最好的思考。',
  intro:
    '在这里记录技术、折腾与生活。相信「写下来」是最好的思考方式，也是最快的成长路径。',
  since: 2026,
  location: '中国',
  email: '',
  github: 'https://github.com/11python11',
};

export const NAV = [
  { label: '文章', href: '/blog/' },
  { label: '折腾', href: '/notes/' },
  { label: '归档', href: '/archive/' },
  { label: '标签', href: '/tags/' },
  { label: '关于', href: '/about/' },
];

/**
 * 评论（giscus）—— 默认关闭。
 * 开启步骤：
 * 1. 把仓库设为 Public，并在 GitHub 上安装 giscus App
 * 2. 打开 https://giscus.app/zh-CN ，填入仓库，得到 repo / repoId / category / categoryId
 * 3. 把下面四项填上，重新部署即可。
 */
export const GISCUS = {
  repo: '',
  repoId: '',
  category: '',
  categoryId: '',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'top',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
};
