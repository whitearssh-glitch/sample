# AI 대화 — 모바일 앱 UI

React + Vite 기반 모바일 전용 화면 (375px). 6개 화면을 한 앱 안에서 순차 전환합니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 (모바일 뷰 권장).

## 구조

- `src/pages/Page1Intro.tsx` — 1페이지 (미션 소개)
- `public/assets/` — zip에서 추출한 이미지 에셋
- `src/types/pages.ts` — 화면 ID 및 전환 순서

## 화면 전환

1. intro → 2. dialogue → 3. hint → 4. score → 5. popup → 6. complete

Start 버튼으로 다음 화면으로 이동합니다. 2~6페이지는 시안 수신 후 구현 예정입니다.
