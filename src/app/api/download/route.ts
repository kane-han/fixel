import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageBase64, format, isAuthenticated } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: '이미지가 없습니다.' }, { status: 400 });
    }

    // 인증된 사용자는 워터마크 없이 반환
    if (isAuthenticated) {
      return NextResponse.json({
        success: true,
        data: { imageBase64 },
      });
    }

    // 비인증 사용자: 서버 사이드 워터마크 합성
    // Canvas API는 브라우저 전용이므로 서버에서는 간단한 텍스트 오버레이
    // 실제로는 sharp 등을 사용하지만, MVP에서는 클라이언트에서 처리
    // 클라이언트 watermark.ts를 호출하도록 안내
    return NextResponse.json({
      success: true,
      data: {
        imageBase64,
        requireClientWatermark: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
