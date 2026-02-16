'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, signOut } = useAuth();
  const { setShowLoginModal } = useAuthStore();

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 shrink-0">
      <a href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <span className="font-bold text-lg tracking-tight">FIXEL</span>
      </a>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-400 hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              로그아웃
            </Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowLoginModal(true)}>
            로그인
          </Button>
        )}
      </div>
    </header>
  );
}
