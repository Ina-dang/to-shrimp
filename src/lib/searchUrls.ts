/**
 * Heyprice 검색 URL 생성
 * @param q 검색어
 * @returns Heyprice 모바일 검색 URL
 */
export function buildHeypriceUrl(q: string): string {
  const query = encodeURIComponent(q); // URL 인코딩
  return `https://m.heyprice.co.kr/auction/buy?level1=&shop_id=yhauc&keyword=${query}&type4=`;
}

/**
 * Japangift 검색 URL 생성
 * @param q 검색어
 * @returns Japangift 모바일 검색 URL
 */
export function buildJapangiftUrl(q: string): string {
  const query = encodeURIComponent(q); // URL 인코딩
  return `https://m.japangift.co.kr/hey/search?keyword=${query}&type=buy&type2=jp`;
}

/**
 * Japan24 검색 URL 생성
 * @param q 검색어
 * @returns Japan24 모바일 검색 URL
 */
export function buildJapan24Url(q: string): string {
  const query = encodeURIComponent(q); // URL 인코딩
  return `https://m.japan24.co.kr/hey/search?keyword=${query}&type=buy`;
}
