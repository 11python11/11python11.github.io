import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';
import { withBase } from '../utils';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const origin = context.site ?? new URL('https://example.com');
  const rssSite = new URL(`${base}/`, origin);

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: rssSite,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: withBase(`/blog/${post.id}/`),
      categories: post.data.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
