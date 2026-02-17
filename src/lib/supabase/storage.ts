import { supabaseAdmin } from './admin';
import { randomUUID } from 'crypto';

const BUCKET = 'processed-images';

/**
 * 처리된 이미지를 Supabase Storage에 업로드 (fire-and-forget용)
 * 경로: {prefix}/{YYYY-MM-DD}/{uuid}.png
 */
export async function uploadProcessedImage(
  base64DataUrl: string,
  prefix: 'remove-bg' | 'upscale'
): Promise<string | null> {
  try {
    const base64Data = base64DataUrl.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filePath = `${prefix}/${today}/${randomUUID()}.png`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      console.error('[storage] 업로드 실패:', error.message);
      return null;
    }

    return filePath;
  } catch (err) {
    console.error('[storage] 업로드 오류:', err);
    return null;
  }
}

/**
 * 만료된 이미지 삭제 (날짜 폴더 기반)
 * maxAgeHours 이전의 날짜 폴더에 있는 파일을 모두 삭제
 */
export async function deleteExpiredImages(maxAgeHours: number = 24) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
  const cutoffDate = cutoff.toISOString().slice(0, 10); // YYYY-MM-DD

  const prefixes = ['remove-bg', 'upscale'];
  let totalDeleted = 0;

  for (const prefix of prefixes) {
    // 날짜 폴더 목록 조회
    const { data: folders, error: listError } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000 });

    if (listError) {
      console.error(`[cleanup] ${prefix} 폴더 조회 실패:`, listError.message);
      continue;
    }

    if (!folders) continue;

    // cutoffDate 이전인 폴더만 필터링
    const expiredFolders = folders.filter(
      (f) => f.name <= cutoffDate && f.name.match(/^\d{4}-\d{2}-\d{2}$/)
    );

    for (const folder of expiredFolders) {
      const folderPath = `${prefix}/${folder.name}`;

      // 폴더 내 파일 목록
      const { data: files, error: filesError } = await supabaseAdmin.storage
        .from(BUCKET)
        .list(folderPath, { limit: 1000 });

      if (filesError || !files || files.length === 0) continue;

      const filePaths = files.map((f) => `${folderPath}/${f.name}`);

      const { error: deleteError } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(filePaths);

      if (deleteError) {
        console.error(`[cleanup] ${folderPath} 삭제 실패:`, deleteError.message);
      } else {
        totalDeleted += filePaths.length;
      }
    }
  }

  return { deleted: totalDeleted, cutoffDate };
}
