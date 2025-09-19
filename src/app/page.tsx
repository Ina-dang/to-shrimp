'use client';

import { useState } from 'react';

/**
 * 검색 결과 아이템 타입 정의
 */
type Item = {
  id: string;
  title: string;
  url: string;
  price?: string;
  image?: string;
  source: string;
};

/**
 * Home 컴포넌트: 검색어 입력 후 통합 검색 결과 표시
 */
export default function Home() {
  const [q, setQ] = useState(''); // 검색어 상태
  const [loading, setLoading] = useState(false); // 검색 중 상태
  const [items, setItems] = useState<Item[]>([]); // 검색 결과
  const [error, setError] = useState<string | null>(null); // 에러 메시지

  /**
   * 검색 폼 제출 핸들러
   * - API 호출
   * - 결과 상태 업데이트
   * - 에러 처리
   */
  async function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // API 호출 (서버에서 사이트별 크롤링 후 JSON 반환)
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('검색에 실패했습니다');

      const data = await res.json();
      setItems(data.items || []); // 결과 상태 업데이트
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen p-6 md:p-10'>
      <div className='mx-auto max-w-5xl'>
        <h1 className='text-2xl md:text-3xl font-bold mb-4'>검색 통합 보기</h1>

        {/* 검색창 및 버튼 */}
        <form onSubmit={onSearch} className='flex gap-2 mb-6'>
          <input
            className='flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300'
            placeholder='검색어를 입력하세요'
            value={q}
            onChange={(e) => setQ(e.target.value)} // 입력 시 상태 업데이트
          />
          <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50'
            disabled={loading || q.trim().length === 0} // 검색 불가 조건
          >
            {loading ? '검색중...' : '검색'}
          </button>
        </form>

        {/* 에러 메시지 표시 */}
        {error && <div className='text-red-600 mb-4'>{error}</div>}

        {/* 검색 결과 리스트 */}
        <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {items.map((it) => (
            <li key={it.id} className='border rounded p-3 flex gap-3'>
              {it.image && (
                // 이미지 표시
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.image}
                  alt={it.title}
                  className='w-20 h-20 object-cover rounded'
                />
              )}
              <div className='min-w-0'>
                {/* 제목 링크 */}
                <a
                  href={it.url}
                  target='_blank'
                  rel='noreferrer'
                  className='font-semibold hover:underline line-clamp-2'
                >
                  {it.title}
                </a>

                {/* 출처 및 가격 표시 */}
                <div className='text-sm text-gray-600 mt-1 flex gap-2'>
                  <span className='uppercase'>{it.source}</span>
                  {it.price && <span className='font-medium'>{it.price}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
