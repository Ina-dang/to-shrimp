import type { SearchItem } from './types';

/**
 * 검색어 관련성 기반 아이템 필터링
 *
 * @param items SearchItem 배열
 * @param query 검색어
 * @returns 검색어와 관련된 아이템만 반환
 */
export function filterItemsByRelevance(
  items: SearchItem[],
  query: string
): SearchItem[] {
  const q = query.trim().toLowerCase(); // 검색어 소문자 변환
  const hasDigits = /\d/; // 가격 유효성 체크용 정규식

  return items.filter((it) => {
    // 제목에 검색어 포함 여부
    const titleOk = it.title?.toLowerCase().includes(q);

    // 이미지 유효성 확인 (http로 시작해야 함)
    const imageOk = Boolean(it.image && it.image.startsWith('http'));

    // 가격 유효성 확인 (숫자 포함)
    const priceOk =
      typeof it.price === 'string' ? hasDigits.test(it.price) : false;

    // URL 유효성 확인 (http로 시작)
    const urlOk = it.url?.startsWith('http');

    // 모든 조건 만족 시만 필터링 통과
    return titleOk && imageOk && urlOk && priceOk;
  });
}
