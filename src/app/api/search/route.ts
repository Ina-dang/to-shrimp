import { parsers } from '@/lib/parsers'; // 사이트별 검색 파서 배열
import type { SearchItem } from '@/lib/types'; // 검색 결과 타입
import { NextRequest } from 'next/server';
import pLimit from 'p-limit'; // 동시 실행 제한 라이브러리
import { z } from 'zod'; // 입력 검증 라이브러리

// 검색어 유효성 검사 스키마
const querySchema = z.object({ q: z.string().min(1).max(100) });

// Next.js 13+ App Router에서 API를 동적으로 처리
export const dynamic = 'force-dynamic';

/**
 * GET 요청 처리 핸들러
 *
 * 1. 쿼리 파라미터 추출
 * 2. 유효성 검사
 * 3. 각 사이트별 검색 파서 실행 (동시 2개 제한)
 * 4. 결과 통합 후 JSON 반환
 */
export async function GET(req: NextRequest) {
  // URL에서 쿼리 파라미터 가져오기
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  // 검색어 유효성 검사
  const parse = querySchema.safeParse({ q });
  if (!parse.success) {
    return new Response(JSON.stringify({ error: 'Invalid query' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // AbortController 생성: 나중에 요청 취소 가능
  const controller = new AbortController();

  // pLimit으로 동시 실행 제한 (2개)
  const limit = pLimit(2);

  // 모든 파서에 대해 검색 수행
  const tasks = parsers.map((p) =>
    limit(async () => {
      try {
        // 각 파서의 search 함수 호출
        // 실패하면 빈 배열 반환 (사이트 다운 등 대비)
        const items = await p.search(parse.data.q, controller.signal);
        return items;
      } catch {
        return [] as SearchItem[];
      }
    })
  );

  // 모든 검색 결과 병합
  const results = (await Promise.all(tasks)).flat();

  // 응답 payload 구성
  const payload = { query: parse.data.q, items: results };

  // JSON 형태로 반환
  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json' },
  });
}
