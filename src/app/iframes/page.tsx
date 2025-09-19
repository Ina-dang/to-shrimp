'use client';

import { useMemo, useState } from 'react';

/**
 * 검색어에 기반한 각 사이트의 URL을 생성하는 커스텀 훅
 * useMemo를 사용하여 검색어(q)가 변경될 때만 URL을 재계산
 */
function useSearchUrls(q: string) {
  return useMemo(() => {
    const query = encodeURIComponent(q.trim()); // 공백 제거 후 URL 인코딩
    return {
      heyprice: `https://m.heyprice.co.kr/auction/buy?level1=&shop_id=yhauc&keyword=${query}&type4=`,
      japangift: `https://m.japangift.co.kr/hey/search?keyword=${query}&type=buy&type2=jp`,
      japan24: `https://m.japan24.co.kr/hey/search?keyword=${query}&type=buy`,
    };
  }, [q]);
}

/**
 * Iframe 기반 검색 페이지 컴포넌트
 * 상단 검색창에 입력한 검색어를 각 사이트 iframe src에 반영
 */
export default function IframeSearchPage() {
  const [q, setQ] = useState(''); // 검색어 상태
  const urls = useSearchUrls(q); // 검색어 기반 사이트별 URL

  return (
    <div className='min-h-screen p-4 md:p-6'>
      <div className='mx-auto max-w-6xl'>
        <h1 className='text-xl md:text-2xl font-semibold mb-3'>10🦆10🦆</h1>

        {/* 검색창 */}
        <form onSubmit={(e) => e.preventDefault()} className='flex gap-2 mb-4'>
          <input
            className='flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300'
            placeholder='검색어를 입력하세요'
            value={q}
            onChange={(e) => setQ(e.target.value)} // 입력 시 상태 업데이트
          />
        </form>

        {/* 각 사이트를 iframe으로 표시 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Panel title='Heyprice' href={urls.heyprice} src={urls.heyprice} />
          <Panel title='Japangift' href={urls.japangift} src={urls.japangift} />
          <Panel title='Japan24' href={urls.japan24} src={urls.japan24} />
        </div>
      </div>
    </div>
  );
}

/**
 * 각 사이트 패널 컴포넌트
 * 제목, 새 탭 링크, iframe 영역, CSP 안내 메시지 포함
 */
function Panel({
  title,
  href,
  src,
}: {
  title: string;
  href: string;
  src: string;
}) {
  return (
    <div className='border rounded overflow-hidden'>
      {/* 패널 헤더: 사이트 이름 + 새 탭 링크 */}
      <div className='flex items-center justify-between px-3 py-2 bg-gray-50 border-b'>
        <span className='font-medium'>{title}</span>
        <a
          className='text-blue-600 hover:underline text-sm'
          href={href}
          target='_blank'
          rel='noreferrer'
        >
          새 탭에서 열기
        </a>
      </div>

      {/* iframe 영역 */}
      <div className='bg-white h-[75vh]'>
        <iframe
          title={title}
          src={src}
          className='w-full h-full'
          sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
        />
      </div>

      {/* CSP/X-Frame-Options 안내 */}
      <div className='px-3 py-2 text-xs text-gray-600'>
        일부 사이트는 보안 정책(CSP/X-Frame-Options)으로 인해 iframe 표시가
        차단될 수 있습니다.
      </div>
    </div>
  );
}
