/**
 * Puppeteer 기반 스크린샷 스크립트
 * WSL 환경에서 Windows Chrome을 사용
 */
import puppeteer from 'puppeteer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots');

// Windows Chrome 경로들
const chromePaths = [
  '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Users/aksnr/AppData/Local/Google/Chrome/Application/chrome.exe',
];

async function findChrome() {
  const { accessSync } = await import('fs');
  for (const p of chromePaths) {
    try { accessSync(p); return p; } catch {}
  }
  return null;
}

async function main() {
  const chromePath = await findChrome();

  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  };

  if (chromePath) {
    launchOptions.executablePath = chromePath;
    console.log(`Chrome 경로: ${chromePath}`);
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // 1. 랜딩 페이지
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
  await page.screenshot({ path: join(outDir, '01-landing.png'), fullPage: true });
  console.log('✓ 01-landing.png');

  // 2. 테스트 이미지로 에디터 이동
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    // 간단한 PNG 파일 생성
    const { writeFileSync, unlinkSync } = await import('fs');
    const tmpFile = join(outDir, '_test.png');

    // 1x1 red pixel PNG
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAABkAAAASwCAIAAAAYGKumAAAABGdBTUEAALGPC/xhBQAAAAlwSFlz' +
      'AAAOwQAADsEBuJFr7QAAAAd0SU1FB+cBEAAUNm/KRAAAAABJRU5ErkJggg==', 'base64'
    );
    // 대신 간단한 캔버스 이미지를 JS에서 생성하여 업로드
    const testImageData = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 300;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 400, 300);
      grad.addColorStop(0, '#ff6b6b');
      grad.addColorStop(1, '#4ecdc4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(200, 150, 80, 0, Math.PI * 2);
      ctx.fill();
      return canvas.toDataURL('image/png');
    });

    // DataTransfer로 업로드 시뮬레이션
    await page.evaluate((dataUrl) => {
      const base64 = dataUrl.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const file = new File([bytes], 'test.png', { type: 'image/png' });

      const dt = new DataTransfer();
      dt.items.add(file);
      const input = document.querySelector('input[type="file"]');
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, testImageData);

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));
  }

  // 3. 에디터 페이지
  if (page.url().includes('/editor')) {
    await page.screenshot({ path: join(outDir, '02-editor.png') });
    console.log('✓ 02-editor.png');

    // 4. 각 도구 탭 선택 및 캡처
    const tools = [
      { text: '톤', file: '03-tone-tool.png' },
      { text: '누끼', file: '04-remove-bg-tool.png' },
      { text: '배경', file: '05-background-tool.png' },
      { text: '크롭', file: '06-crop-tool.png' },
    ];

    for (const tool of tools) {
      try {
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await btn.evaluate(el => el.textContent);
          if (text && text.includes(tool.text)) {
            await btn.click();
            await new Promise(r => setTimeout(r, 500));
            break;
          }
        }
        await page.screenshot({ path: join(outDir, tool.file) });
        console.log(`✓ ${tool.file}`);
      } catch (e) {
        console.log(`✗ ${tool.file}: ${e.message}`);
      }
    }
  } else {
    console.log('에디터 페이지 이동 실패 — 랜딩에 머무름');
  }

  await browser.close();
  console.log('\n스크린샷 완료!');
}

main().catch(console.error);
