'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchMe, logout } from '@/lib/redux/slices/authSlice';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!user) dispatch(fetchMe());
  }, [dispatch, user]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return <>{children}</>;
}
