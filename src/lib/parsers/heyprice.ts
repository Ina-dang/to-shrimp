import * as cheerio from 'cheerio';
import { fetchHtml, withRetry } from '../fetch'; // HTML 가져오기 + 재시도 로직
import { filterItemsByRelevance } from '../filter'; // 검색어 관련성 필터링
import type { SearchItem, SiteParser } from '../types'; // 타입 정의
import { pickImageSrc, toAbsoluteUrl } from '../url'; // 이미지 및 URL 유틸

/**
 * 검색 URL 생성
 * @param query 검색어
 * @returns HeyPrice 모바일 사이트 검색 URL
 */
function buildSearchUrl(query: string): string {
  const q = encodeURIComponent(query); // URL 인코딩
  return `https://m.heyprice.co.kr/auction/buy?level1=&shop_id=yhauc&keyword=${q}&type4=`;
}

/**
 * HTML 파싱 후 검색 결과 추출
 * @param html 사이트 HTML
 * @returns SearchItem 배열
 */
function parse(html: string): SearchItem[] {
  const $ = cheerio.load(html);
  const items: SearchItem[] = [];

  // 필터링용 불용어
  const stopwords = ['로그인', '회원가입', '이용안내', '공지'];

  // 제품 목록 내 a 태그만 스캔
  $('.stype_list a[href]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    const titleAttr = a.attr('title');
    const titleText = a.text().trim();
    const title = (titleAttr || titleText).trim();

    // 상위 카드 요소 선택
    const card = a.closest(
      'li, .card, .item, .goods, .prd, .prd_item, .prdList li'
    );

    // 이미지 추출
    const img = pickImageSrc(
      card.find('img').first(),
      'https://m.heyprice.co.kr'
    );

    // 가격 추출 (클래스 기반 또는 텍스트 기반)
    let price = card
      .find('.price, .sale_price, .amount, .won, .Price')
      .first()
      .text()
      .trim();

    if (!price) {
      // 텍스트에서 숫자+원/円 추출
      const text = card.text();
      const m = text.match(/([0-9][0-9,.]{2,})\s*(원|円)/);
      if (m) price = `${m[1]} ${m[2]}`;
    }

    // 제품 여부 판단
    if (title && href) {
      const url = toAbsoluteUrl(href, 'https://m.heyprice.co.kr');
      const looksLikeProduct =
        url && /auction|buy|item|detail|goods/i.test(url) && !url.endsWith('#');
      const titleOk =
        title.length >= 2 && !stopwords.some((w) => title.includes(w));

      if (
        url &&
        url.includes('m.heyprice.co.kr') &&
        looksLikeProduct &&
        titleOk
      ) {
        items.push({
          id: url!,
          title,
          url: url!,
          image: img,
          price: price || undefined,
          source: 'heyprice', // 출처 표기
        });
      }
    }
  });

  return dedupe(items);
}

/**
 * 중복 제거
 * @param items SearchItem 배열
 * @returns 중복 제거된 배열
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
 * HeyPrice 파서
 * SiteParser 인터페이스 구현
 */
export const heypriceParser: SiteParser = {
  source: 'heyprice', // 출처
  async search(query, signal) {
    const url = buildSearchUrl(query); // 검색 URL 생성
    const html = await withRetry(() => fetchHtml(url, { signal })); // HTML 가져오기
    // 파싱 후 관련성 필터링, 최대 30개 반환
    return filterItemsByRelevance(parse(html), query).slice(0, 30);
  },
};
