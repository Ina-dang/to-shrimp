/**
 * 상대 URL을 절대 URL로 변환
 * @param url 처리할 URL (상대, 프로토콜 상대, 절대 가능)
 * @param base 기준이 되는 베이스 URL
 * @returns 절대 URL 또는 undefined
 */
export function toAbsoluteUrl(
  url: string | undefined | null,
  base: string
): string | undefined {
  if (!url) return undefined;

  try {
    // 프로토콜 상대 URL 처리 (//example.com/...)
    if (url.startsWith('//')) return `https:${url}`;

    // 이미 절대 URL이면 그대로 반환
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // 루트 기준 상대 경로 처리 (/path/to/resource)
    if (url.startsWith('/')) return new URL(url, base).toString();

    // 나머지 문자열은 그대로 반환
    return url;
  } catch {
    // URL 처리 실패 시 undefined 반환
    return undefined;
  }
}

/**
 * 이미지 src 후보 중 첫 번째 유효한 절대 URL 반환
 * @param el Cheerio 요소 또는 attr 메서드가 있는 객체
 * @param base 베이스 URL
 * @returns 이미지 절대 URL 또는 undefined
 */
export function pickImageSrc(
  el: { attr: (name: string) => string | undefined },
  base: string
): string | undefined {
  const candidates = [
    el.attr('src'),
    el.attr('data-src'),
    el.attr('data-original'),
    el.attr('data-lazy-src'),
    el.attr('data-image'),
  ];

  for (const c of candidates) {
    const abs = toAbsoluteUrl(c || undefined, base);
    if (abs) return abs; // 첫 번째 유효한 절대 URL 반환
  }

  return undefined; // 유효한 이미지 없으면 undefined
}
