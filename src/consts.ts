/**
 * 站点信息 —— 先改这里。
 * 名字、简介、邮箱、GitHub 都在这个文件里，改完重新构建即可。
 */
export const SITE = {
  name: '技术小卷毛',
  latinName: '技术小卷毛',
  title: '技术小卷毛 · 记录与思考',
  description: '一个关于技术、折腾与日常的个人博客。写下来，就是最好的思考。',
  intro: '记录技术，记录生活，沉淀思考，慢慢生长。',
  since: 2026,
  location: '中国',
  email: '',
  github: 'https://github.com/11python11',
};

export const NAV = [
  { label: '首页', href: '/' },
];

/**
 * 照片墙 —— 把照片放进 public/images/photowall/，在这里登记即可。
 * title / meta 会作为照片说明显示。
 */
export const PHOTOS = [
  {
    src: '/images/photowall/competition-2026.jpg',
    title: '赛场留影',
    meta: 'COMPETITION · 2026',
    alt: '2026 年广西职业院校技能大赛赛场合影',
    width: 1440,
    height: 1080,
  },
  {
    src: '/images/photowall/challenge-cup-2026.png',
    title: '挑战杯区赛 · 三等奖',
    meta: 'CHALLENGE CUP · 2026',
    alt: '第十二届挑战杯广西大学生创业计划竞赛三等奖证书',
    width: 2048,
    height: 1487,
  },
  {
    src: '/images/photowall/innovation-2026.jpg',
    title: '创新创业 · 三等奖',
    meta: 'INNOVATION · 2026',
    alt: '中国国际大学生创新大赛校级选拔赛三等奖证书',
    width: 2844,
    height: 1988,
  },
  {
    src: '/images/photowall/skills-2026.jpg',
    title: '技能大赛 · 铜奖',
    meta: 'SKILLS · 2026',
    alt: '2026 年广西职业院校技能大赛新一代信息技术赛道团体铜奖证书',
    width: 1848,
    height: 1279,
  },
  {
    src: '/images/photowall/cyber-defense-2026.jpg',
    title: '教育护网 · 二等奖',
    meta: 'CYBER DEFENSE · 2026',
    alt: '2026 年广西教育系统网络安全攻防演习攻击队二等奖证书',
    width: 1706,
    height: 1279,
  },
  {
    src: '/images/photowall/robot-ai-2026.jpg',
    title: '机器人及 AI · 三等奖',
    meta: 'ROBOT & AI · 2026',
    alt: '第二十八届中国机器人及人工智能大赛广西赛区应用赛智能驾驶三等奖证书',
    width: 1456,
    height: 1080,
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
