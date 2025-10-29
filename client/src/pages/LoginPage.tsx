import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@ui/components/Button';

export function LoginPage() {
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@12345');
  const navigate = useNavigate();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate('/admin');
  };
  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto p-4 space-y-2">
      <h1 className="text-xl font-semibold">Login</h1>
      <input className="border rounded px-2 py-1 w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="border rounded px-2 py-1 w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <Button disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign In'}</Button>
    </form>
  );
}


