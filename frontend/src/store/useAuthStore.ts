import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isEnrolled: boolean;
  hasCompletedPretest: boolean;
  setAuth: (token: string, user: User) => void;
  setEnrolled: (status: boolean) => void;
  setHasCompletedPretest: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isEnrolled: false,
      hasCompletedPretest: false,
      setAuth: (token, user) => set({ token, user }),
      setEnrolled: (status) => set({ isEnrolled: status }),
      setHasCompletedPretest: (status) => set({ hasCompletedPretest: status }),
      logout: () => set({ token: null, user: null, isEnrolled: false, hasCompletedPretest: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
