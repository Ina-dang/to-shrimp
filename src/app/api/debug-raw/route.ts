import { fetchHtml, withRetry } from '@/lib/fetch';
import {
  buildHeypriceUrl,
  buildJapan24Url,
  buildJapangiftUrl,
} from '@/lib/searchUrls';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q)
    return new Response(JSON.stringify({ error: 'q required' }), {
      status: 400,
    });

  const urls = {
    heyprice: buildHeypriceUrl(q),
    japangift: buildJapangiftUrl(q),
    japan24: buildJapan24Url(q),
  };

  const out: any = { q, urls, results: {} };
  for (const [key, url] of Object.entries(urls)) {
    try {
      const html = await withRetry(() => fetchHtml(url));
      out.results[key] = {
        ok: true,
        length: html.length,
        head: html.slice(0, 400),
      };
    } catch (e: any) {
      out.results[key] = {
        ok: false,
        error: String(e?.message || e),
      };
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
}
