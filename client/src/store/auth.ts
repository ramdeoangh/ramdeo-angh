import { create } from 'zustand';
import { api } from '../services/api';

type User = { id: number; email: string; role: 'admin' | 'user' } | null;

type State = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<State>((set) => ({
  user: null,
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/api/auth/login', { email, password });
      set({ user: res.data.user });
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    await api.post('/api/auth/logout', {});
    set({ user: null });
  },
  fetchMe: async () => {
    try {
      const res = await api.get('/api/auth/me');
      set({ user: res.data.user });
    } catch {
      set({ user: null });
    }
  }
}));


