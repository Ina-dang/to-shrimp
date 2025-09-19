import { fetchHtml, withRetry } from '@/lib/fetch';
import {
  buildHeypriceUrl,
  buildJapan24Url,
  buildJapangiftUrl,
} from '@/lib/searchUrls';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// 각 사이트의 HTML 검사 결과 타입 정의
interface SiteDebugResult {
  ok: boolean;
  length?: number;
  head?: string;
  error?: string;
}

interface DebugOutput {
  q: string;
  urls: Record<string, string>;
  results: Record<string, SiteDebugResult>;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!q) {
    return new Response(JSON.stringify({ error: 'q required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const urls: Record<string, string> = {
    heyprice: buildHeypriceUrl(q),
    japangift: buildJapangiftUrl(q),
    japan24: buildJapan24Url(q),
  };

  const out: DebugOutput = { q, urls, results: {} };

  for (const [key, url] of Object.entries(urls)) {
    try {
      const html = await withRetry(() => fetchHtml(url));
      out.results[key] = {
        ok: true,
        length: html.length,
        head: html.slice(0, 400),
      };
    } catch (e: unknown) {
      // unknown 타입으로 잡고, Error인지 확인 후 처리
      const msg = e instanceof Error ? e.message : String(e);
      out.results[key] = {
        ok: false,
        error: msg,
      };
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
}
