import { setTimeout as delay } from 'timers/promises';

/**
 * fetchHtml 옵션 인터페이스
 */
export interface FetchOptions {
  headers?: Record<string, string>; // 추가 HTTP 헤더
  signal?: AbortSignal; // 요청 취소용 signal
}

/**
 * 기본 HTTP 헤더
 * 브라우저처럼 보이게 User-Agent 포함
 */
const defaultHeaders: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko,en;q=0.9',
};

/**
 * HTML을 가져오는 fetch 함수
 * @param url 요청 URL
 * @param options FetchOptions
 * @returns HTML 문자열
 */
export async function fetchHtml(
  url: string,
  options: FetchOptions = {}
): Promise<string> {
  const res = await fetch(url, {
    headers: { ...defaultHeaders, ...options.headers },
    signal: options.signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return await res.text();
}

/**
 * 재시도 로직 wrapper
 * @param fn 재시도할 비동기 함수
 * @param retries 최대 재시도 횟수 (기본 2)
 * @param backoffMs 지수 백오프 기본 시간 (기본 400ms)
 * @returns 함수 결과 반환
 * @throws 마지막 오류
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  backoffMs = 400
): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(); // 시도
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break; // 마지막 재시도면 중단
      // 지수 백오프(delay)
      await delay(backoffMs * Math.pow(2, attempt));
    }
  }

  // 마지막 오류 throw
  throw lastErr instanceof Error ? lastErr : new Error('Unknown error');
}
