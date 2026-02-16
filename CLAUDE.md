# FIXEL (Fix + Pixel) — AI 사진 보정 웹 서비스

## 기술 스택
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth: Google OAuth, Storage)
- Clipdrop API (배경 제거, 업스케일)
- Canvas API (클라이언트 이미지 처리)
- Zustand (상태 관리 + Undo/Redo)

## 코드 구조 맵

```
fixel/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Pretendard 폰트, 글로벌 스타일
│   │   ├── page.tsx                # 랜딩 페이지 (Hero + ImageUploader)
│   │   ├── globals.css             # Tailwind + 체크보드 패턴
│   │   ├── editor/page.tsx         # 에디터 (3패널: 툴바|캔버스|사이드바)
│   │   ├── auth/callback/route.ts  # Google OAuth 콜백
│   │   └── api/
│   │       ├── remove-bg/route.ts  # Clipdrop 배경 제거 프록시
│   │       ├── upscale/route.ts    # Clipdrop 업스케일 프록시
│   │       └── download/route.ts   # 다운로드 API
│   │
│   ├── components/
│   │   ├── layout/     Header
│   │   ├── upload/     ImageUploader (드래그앤드롭)
│   │   ├── editor/     EditorCanvas, EditorToolbar, EditorSidebar, UndoRedoBar
│   │   ├── tools/      BackgroundRemoval, TouchupBrush, BackgroundReplace,
│   │   │               ToneAdjustment, UpscalePanel, CropPanel, DownloadPanel
│   │   ├── auth/       LoginModal
│   │   └── ui/         Button, Slider, ColorPicker, LoadingSpinner, Toast, Modal
│   │
│   ├── lib/
│   │   ├── supabase/   client.ts, server.ts, middleware.ts
│   │   ├── canvas/     core.ts, edge-refine.ts, brush.ts, composite.ts,
│   │   │               tone-adjust.ts, crop.ts, watermark.ts, export.ts
│   │   ├── api/        clipdrop.ts
│   │   └── utils/      image-validation.ts, file-helpers.ts, keyboard.ts
│   │
│   ├── stores/         editor-store.ts (Zustand), auth-store.ts
│   ├── hooks/          useAuth.ts, useKeyboardShortcuts.ts
│   └── types/          editor.ts, api.ts
│
├── public/
│   ├── fonts/          PretendardVariable.woff2
│   └── backgrounds/    배경 이미지 (TODO)
│
├── middleware.ts       Supabase 세션 갱신
└── tailwind.config.ts  디자인 시스템 (#16be63 primary)
```

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `CLIPDROP_API_KEY` — Clipdrop API key
- `NEXT_PUBLIC_APP_URL` — 앱 URL (localhost:3000)

## 주요 데이터 플로우
1. 이미지 업로드 → FileReader → base64 data URL → Zustand store
2. 배경 제거: 클라이언트 → /api/remove-bg → Clipdrop API → base64 반환
3. 톤 보정: Canvas API filter (밝기/대비/채도/색온도)
4. 다운로드: 비로그인=워터마크 합성(클라이언트), 로그인=원본

## 코드 패턴
- 상태: Zustand (editor-store.ts에 전체 에디터 상태)
- 히스토리: pushHistory() → base64 스냅샷 배열 (최대 20)
- API 프록시: Next.js Route Handler → Clipdrop (API 키 보호)
- Canvas 처리: lib/canvas/ 모듈별 분리, 동적 import 사용
