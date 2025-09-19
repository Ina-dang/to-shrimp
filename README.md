# 🕵️‍♂️ from-shrimp 통합 검색 프로젝트

> 여러 취향 사이트들의 검색 결과를 한눈에 모아볼 수 있는 **Next.js 기반 웹 프로젝트**

## 🚀 기능 개요

1. **메인 페이지 (`/`)**

   - 검색어를 입력하면 각 사이트별 크롤러가 실행되어 결과를 가져옵니다.
   - 결과는 통합된 리스트 형태로 화면에 표시됩니다.
   - _(현재는 미완성 상태)_

2. **Iframe 페이지 (`/iframes`)**
   - 각 사이트를 `iframe`으로 불러옵니다.
   - 상단 검색창에서 검색어를 입력하면 각 iframe의 `src`가 변경되어 해당 사이트의 검색 결과 페이지를 그대로 보여줍니다.
   - 사이트 이동 없이 한 화면에서 여러 검색 결과를 동시에 확인할 수 있습니다.

## 📂 프로젝트 구조

```
src/
├─ app/
│ ├─ page.tsx # 메인 통합 검색 페이지
│ ├─ iframes/page.tsx # Iframe 검색 페이지
│ └─ api/search/ # (WIP) 사이트별 크롤링 API
│
├─ lib/
│ ├─ parsers/ # 사이트별 HTML 파서 (Cheerio 기반)
│ ├─ fetch.ts # HTML fetch & retry 유틸
│ ├─ url.ts # URL 처리 유틸
│ └─ types.ts # SearchItem, SiteParser 타입 정의
│
└─ assets/ # 정적 자원
```

## ⚙️ 기술 스택

- **Framework**: [Next.js](https://nextjs.org/)
- **Scraping**: [Cheerio](https://cheerio.js.org/)
- **Language**: TypeScript
- **스타일링**: Tailwind CSS

## 🛠️ 설치 & 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 확인
http://localhost:3000
```

## ✅ 진행 상황

- Next.js 프로젝트 셋업
- Iframe 검색 페이지 구현 (`/iframes`)
- 각 사이트별 크롤러 구현
- 통합 검색 결과 페이지 완성

## 📌 참고

### 검색 대상 사이트

- HeyPrice
- JapanGift
- Japan24

## 🧰 사용한 주요 라이브러리

- `cheerio` : HTML 파싱
- `p-limit` : 동시 요청 제한
- `undici` : HTTP 요청
- `zod` : 데이터 검증
- `tailwindcss` : 스타일링
