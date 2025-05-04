import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setState({ user: null, isLoading: false, error: null });
        return;
      }

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setState({ user: response.data, isLoading: false, error: null });
    } catch (error) {
      setState({ user: null, isLoading: false, error: 'Authentication failed' });
      localStorage.removeItem('token');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setState({ user: response.data.user, isLoading: false, error: null });
      router.push('/dashboard');
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: 'Invalid email or password',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({ user: null, isLoading: false, error: null });
    router.push('/login');
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
  };
} 