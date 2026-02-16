import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: '이미지가 없습니다.' }, { status: 400 });
    }

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // base64 → Blob
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const formData = new FormData();
    formData.append('image_file', new Blob([buffer], { type: 'image/png' }), 'image.png');

    const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `배경 제거 실패: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const resultBase64 = `data:image/png;base64,${resultBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      data: { imageBase64: resultBase64 },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
