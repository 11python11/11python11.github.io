/**
 * 站点信息 —— 先改这里。
 * 名字、简介、邮箱、GitHub 都在这个文件里，改完重新构建即可。
 */
export const SITE = {
  name: 'ITrui',
  latinName: 'ITrui',
  title: 'ITrui · 记录与思考',
  description: '一个关于技术、折腾与日常的个人博客。写下来，就是最好的思考。',
  intro:
    '在这里记录技术、折腾与生活。相信「写下来」是最好的思考方式，也是最快的成长路径。',
  since: 2026,
  location: '中国',
  email: '',
  github: 'https://github.com/11python11',
};

export const NAV = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/blog/' },
  { label: '归档', href: '/archive/' },
  { label: '照片墙', href: '/photowall/' },
  { label: '杂谈', href: '/notes/' },
  { label: '关于', href: '/about/' },
];

/**
 * 照片墙 —— 把照片放进 public/images/photowall/，在这里登记即可。
 * title / meta 会作为照片说明显示。
 */
export const PHOTOS = [
  {
    src: '/images/photowall/rooftop-dusk.jpg',
    title: '天台上的黄昏',
    meta: 'CITY · 2026',
    alt: '黄昏时分的城市天台',
    width: 2560,
    height: 1354,
  },
  {
    src: '/images/photowall/desk-morning.jpg',
    title: '清晨的书桌',
    meta: 'DAILY · 2026',
    alt: '阳光照进窗边的书桌',
    width: 2240,
    height: 1579,
  },
  {
    src: '/images/photowall/sea-dusk.jpg',
    title: '海边的日落',
    meta: 'SEA · 2026',
    alt: '粉紫色日落下的海面',
    width: 1680,
    height: 2106,
  },
  {
    src: '/images/photowall/misty-peaks.jpg',
    title: '雾里的山',
    meta: 'MOUNTAIN · 2026',
    alt: '晨雾中的层叠山峦',
    width: 2240,
    height: 1579,
  },
  {
    src: '/images/photowall/rainy-neon.jpg',
    title: '雨夜霓虹',
    meta: 'NIGHT · 2026',
    alt: '雨夜街道的霓虹倒影',
    width: 1680,
    height: 2106,
  },
  {
    src: '/images/photowall/flower-field.jpg',
    title: '紫色花田',
    meta: 'FIELD · 2026',
    alt: '黄昏时分的紫色花田',
    width: 2240,
    height: 1579,
  },
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
