import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'seller' | 'entusiasta' | 'blocked';
  plan?: string;
  shop_name?: string;
  shop_description?: string;
  shop_logo?: string;
  shop_slug?: string;
  phone?: string;
  document?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!Cookies.get('access_token'),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
}));
