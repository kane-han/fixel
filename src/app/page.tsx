'use client';

import { Header } from '@/components/layout/Header';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { LoginModal } from '@/components/auth/LoginModal';
import { ToastProvider } from '@/components/ui/Toast';

export default function HomePage() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <LoginModal />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              AI가 알아서
              <span className="text-primary-500"> 보정</span>해주니까
            </h1>
            <p className="text-lg text-gray-400 max-w-lg mx-auto">
              누끼따기, 톤 보정, 업스케일까지.
              <br />
              사진 한 장이면 충분합니다.
            </p>
          </div>

          {/* Upload */}
          <ImageUploader />

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: '배경 제거',
                desc: 'AI가 1초 만에 깔끔하게 누끼를 따줍니다',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ),
                title: '톤 보정',
                desc: '밝기, 대비, 채도, 색온도를 자유롭게 조절',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                ),
                title: '업스케일',
                desc: '작은 이미지도 고화질로 확대',
              },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-800 flex items-center justify-center text-primary-500">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-gray-600 border-t border-gray-900">
          FIXEL — Fix + Pixel. AI 기반 사진 보정 서비스.
        </footer>
      </div>
    </ToastProvider>
  );
}
