import * as cheerio from 'cheerio';
import { fetchHtml, withRetry } from '../fetch'; // HTML 가져오기 및 재시도 로직
import type { SearchItem, SiteParser } from '../types'; // 타입 정의
import { pickImageSrc, toAbsoluteUrl } from '../url'; // 이미지 URL 처리 유틸

/**
 * 검색 URL 생성 (403이라서 안쓰는중..)
 * @param query 검색어
 * @returns BigBadToyStore 검색 URL
 */
function buildSearchUrl(query: string): string {
  const q = encodeURIComponent(query); // URL 인코딩
  return `https://www.bigbadtoystore.com/Search?SearchText=${q}&o=4`;
}

/**
 * HTML 파싱 후 검색 결과 추출
 * @param html 사이트에서 가져온 HTML
 * @returns SearchItem 배열
 */
function parse(html: string): SearchItem[] {
  const $ = cheerio.load(html); // cheerio 로 HTML 로드
  const items: SearchItem[] = [];

  // 기본 구조에서 Product 링크 탐색
  $('.ProductListing .Product a').each((_, el) => {
    const anchor = $(el);
    const href = anchor.attr('href');
    const title = (anchor.attr('title') || anchor.text()).trim();
    const container = anchor.closest('.Product');

    // 이미지 추출 (첫번째 img 태그)
    const img = pickImageSrc(
      container.find('img').first(),
      'https://www.bigbadtoystore.com'
    );

    // 가격 정보 추출
    const price = container.find('.price, .Price').first().text().trim();

    if (title && href) {
      const url = toAbsoluteUrl(href, 'https://www.bigbadtoystore.com');
      if (url && url.includes('bigbadtoystore.com')) {
        items.push({
          id: url,
          title,
          url,
          image: img,
          price: price || undefined,
          source: 'bbts', // 출처 표기
        });
      }
    }
  });

  // Fallback: HTML 구조가 바뀐 경우 대비, 매우 일반적인 링크 스캔
  if (items.length === 0) {
    $('a').each((_, el) => {
      const a = $(el);
      const href = a.attr('href') || '';
      const title = a.attr('title') || a.text().trim();
      if (href.includes('/Product/') && title) {
        const url = toAbsoluteUrl(href, 'https://www.bigbadtoystore.com');
        if (url) items.push({ id: url, title, url, source: 'bbts' });
      }
    });
  }

  // 중복 제거 후 최대 30개까지 반환
  return dedupe(items).slice(0, 30);
}

/**
 * 중복 제거 함수
 * @param items SearchItem 배열
 * @returns 중복 제거된 SearchItem 배열
 */
function dedupe(items: SearchItem[]): SearchItem[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const key = it.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * BigBadToyStore 파서
 * SiteParser 인터페이스 구현
 */
export const bbtsParser: SiteParser = {
  source: 'bbts', // 출처
  async search(query, signal) {
    const url = buildSearchUrl(query); // 검색 URL 생성
    // HTML 가져오기 + 재시도 로직
    const html = await withRetry(() => fetchHtml(url, { signal }));
    return parse(html); // HTML 파싱 후 결과 반환
  },
};
