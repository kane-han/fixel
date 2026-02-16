# Supabase 설정 가이드

## 1. Google OAuth 설정

### Supabase 대시보드
1. **Authentication > Providers > Google** 활성화
2. `Redirect URL` 복사 (형식: `https://xxx.supabase.co/auth/v1/callback`)

### Google Cloud Console
1. [Google Cloud Console](https://console.cloud.google.com/) > API 및 서비스 > 사용자 인증 정보
2. **OAuth 2.0 클라이언트 ID** 생성 (웹 애플리케이션)
3. **승인된 리디렉션 URI**에 Supabase의 Redirect URL 추가
4. 생성된 `Client ID`, `Client Secret` 복사

### Supabase에 입력
1. Authentication > Providers > Google
2. `Client ID`, `Client Secret` 입력
3. 저장

### 로컬 개발 추가 설정
- **승인된 JavaScript 원본**: `http://localhost:3000`
- **승인된 리디렉션 URI**:
  - `https://xxx.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback` (로컬 테스트용)

---

## 2. Storage 버킷 설정 (24시간 자동 삭제)

### 버킷 생성
Supabase 대시보드 > Storage > New Bucket:
- **Name**: `user-images`
- **Public**: No (RLS 사용)

### RLS 정책 (SQL Editor에서 실행)

```sql
-- 인증된 사용자만 자신의 폴더에 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 인증된 사용자만 자신의 파일 조회 가능
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 인증된 사용자만 자신의 파일 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 24시간 자동 삭제 (pg_cron)

```sql
-- pg_cron 확장 활성화 (Supabase 대시보드 > Database > Extensions에서 활성화)

-- 매시간 실행: 24시간 이상 된 파일 삭제
SELECT cron.schedule(
  'cleanup-expired-images',
  '0 * * * *',
  $$
  DELETE FROM storage.objects
  WHERE bucket_id = 'user-images'
    AND created_at < NOW() - INTERVAL '24 hours';
  $$
);
```

---

## 3. 환경변수 확인

`.env.local`에 다음 값이 모두 설정되어야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLIPDROP_API_KEY=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- **ANON_KEY**: 클라이언트에서 사용 (RLS 적용됨)
- **SERVICE_ROLE_KEY**: 서버에서만 사용 (RLS 우회, 절대 노출 금지)
