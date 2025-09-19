import { fetchHtml, withRetry } from '@/lib/fetch';
import {
  buildHeypriceUrl,
  buildJapan24Url,
  buildJapangiftUrl,
} from '@/lib/searchUrls';
import * as cheerio from 'cheerio';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q)
    return new Response(JSON.stringify({ error: 'q required' }), {
      status: 400,
    });

  const sites = [
    {
      key: 'heyprice',
      url: buildHeypriceUrl(q),
      base: 'https://m.heyprice.co.kr',
    },
    {
      key: 'japangift',
      url: buildJapangiftUrl(q),
      base: 'https://m.japangift.co.kr',
    },
    {
      key: 'japan24',
      url: buildJapan24Url(q),
      base: 'https://m.japan24.co.kr',
    },
  ] as const;

  const results: Record<string, any> = {};
  for (const site of sites) {
    try {
      const html = await withRetry(() => fetchHtml(site.url));
      const $ = cheerio.load(html);
      const rows: any[] = [];
      $('.stype_list a[href]').each((_, el) => {
        const a = $(el);
        const href = a.attr('href') || '';
        const text = a.text().trim().slice(0, 80);
        const card = a.closest(
          'li, .card, .item, .goods, .prd, .prd_item, .prdList li'
        );
        const price = card
          .find('.price, .sale_price, .amount, .won, .Price, .goods-price')
          .first()
          .text()
          .trim()
          .slice(0, 40);
        const cls = card.attr('class') || a.attr('class') || '';
        if (!text) return;
        rows.push({
          href: href.slice(0, 120),
          text,
          price,
          cls: cls.slice(0, 120),
        });
        if (rows.length >= 60) return false;
      });
      results[site.key] = { ok: true, count: rows.length, samples: rows };
    } catch (e: any) {
      results[site.key] = { ok: false, error: String(e?.message || e) };
    }
  }

  return new Response(JSON.stringify({ q, results }, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
}
