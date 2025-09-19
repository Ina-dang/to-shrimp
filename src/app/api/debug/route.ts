import { parsers } from '@/lib/parsers';
import { NextRequest } from 'next/server';
import pLimit from 'p-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q)
    return new Response(JSON.stringify({ error: 'q required' }), {
      status: 400,
    });

  const limit = pLimit(2);
  const results = await Promise.all(
    parsers.map((p) =>
      limit(async () => {
        // Rebuild URLs by calling the parser's private builder indirectly via search page HTML fetch
        // We rely on each parser's search() to compute the URL, but also fetch raw HTML separately to inspect.
        // Run the parser normally
        const items = await p.search(q);
        // Best-effort: discover the URL from first item domain for reference only
        let domain: string | undefined;
        if (items[0]?.url) {
          try {
            domain = new URL(items[0].url).origin;
          } catch {}
        }
        return {
          source: p.source,
          parsedCount: items.length,
          sample: items.slice(0, 5),
          domain,
        };
      })
    )
  );

  return new Response(JSON.stringify({ q, results }, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
}
