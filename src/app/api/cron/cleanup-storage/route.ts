import { NextResponse } from 'next/server';
import { deleteExpiredImages } from '@/lib/supabase/storage';

export async function GET(request: Request) {
  // Vercel Cron 또는 수동 호출 시 CRON_SECRET으로 인증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await deleteExpiredImages(24);

    console.log(`[cron] 정리 완료: ${result.deleted}개 삭제 (기준: ${result.cutoffDate})`);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[cron] 정리 실패:', error);
    return NextResponse.json(
      { success: false, error: '정리 작업 중 오류 발생' },
      { status: 500 }
    );
  }
}
