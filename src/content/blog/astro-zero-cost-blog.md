---
title: 为什么我用 Astro 搭了一个零成本博客
description: 静态站点、内容集合、GitHub Pages 自动部署——这套组合为什么适合个人博客。
pubDate: 2026-11-03
tags:
  - Astro
  - 前端
  - 教程
---

## 选型：先问自己要付出什么

个人博客最容易死掉的环节，不是写作，而是维护。

如果每次想写一篇文章，都要先处理服务器、数据库、插件升级，那大概率写不了几篇。所以我给自己定了三个约束：

1. 内容必须是纯文本，能进 Git
2. 线上不能有需要长期维护的运行时
3. 每个月的固定成本尽可能接近 0

在这个约束下，静态站点生成器几乎是唯一解。

| 方案 | 需要服务器 | 数据在哪 | 月度成本 |
| --- | --- | --- | --- |
| WordPress | 是 | 数据库 | 域名 + 主机 |
| Hexo / Hugo | 否 | Markdown | 0 元起 |
| Astro | 否 | Markdown | 0 元起 |

## 为什么最后选了 Astro

Hexo 和 Hugo 都很成熟，但它们更像是「先有主题，再往里塞内容」。Astro 的写法更接近现代前端：组件、TypeScript、按需引入 JavaScript。

更关键的是三件事。

### 1. 内容集合有类型校验

文章不是丢进文件夹就完事，而是在 `content.config.ts` 里定义 schema：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

少写一个字段、日期格式写错，构建时直接报错。对博客这种「内容即数据」的项目，这比运行时才发现问题好得多。

### 2. 默认不发送 JavaScript

页面该有的 HTML 在构建时就生成好了。粒子背景、磁性按钮这类交互才按需加载脚本，不会为了一个首页把整站拖成几 MB 的 JS。

### 3. 原生 View Transitions

换页动画不需要引入一整套路由库，`ClientRouter` 加上几行 CSS 就能用浏览器原生的转场能力。

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>
```

## 部署：push 即发布

GitHub Pages 的自动化流程很直接：仓库收到 `main` 分支的推送后，Actions 安装依赖、执行构建、把 `dist/` 发布出去。

```yaml
- uses: withastro/action@v3
```

项目站点会部署在 `https://用户名.github.io/仓库名/` 这样的子路径下。这里有一个必须注意的坑：**所有站内绝对路径都要带上 base**，否则线上会 404。我的做法是封装一个 `withBase()`，所有内部链接都从它生成。

## 这套方案的真实成本

- GitHub Pages：0 元
- GitHub Actions：公开仓库的构建额度足够个人博客使用
- 域名：可以先用免费子域名，想换再买

唯一的固定支出是「想折腾域名的时候」。这大概是我能接受的最低维护成本了。

## 它适合谁

如果你满足下面任意两条，这套方案大概率也适合你：

- 愿意用 Markdown 写东西
- 不想维护服务器
- 能接受没有后台编辑器
- 喜欢把网站当成一个可以慢慢改的项目

博客首先是一个写东西的地方。工具越安静，写作越容易开始。
