import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, setCurrentUser } from '../services/storage';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = getUsers();
    const user = users.find(
      (u) => (u.email === identifier || u.username === identifier) && u.password === password
    );

    if (user) {
      if (user.role === 'verifikator' && user.batasWaktuAktif) {
        const today = new Date().toISOString().split('T')[0];
        if (user.batasWaktuAktif < today) {
          setError('Akun Anda telah kedaluwarsa. Silakan hubungi Admin Bapperida.');
          return;
        }
      }

      setCurrentUser(user);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'verifikator') navigate('/verifikator');
      else navigate('/pengusul');
    } else {
      setError('Username/Email atau Password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#0A192F] px-8 py-10 text-center">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0A192F] font-bold text-3xl">
            B
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">E-Kurasi Usulan</h2>
          <p className="text-[#D4AF37] text-sm mt-1">Forum Bapperida Provsu</p>
        </div>
        <div className="px-8 py-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username / Email
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan username atau email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#0A192F] text-white py-2.5 rounded-lg font-medium hover:bg-[#112240] transition-colors shadow-md"
            >
              Masuk
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#0A192F] font-semibold hover:underline">
              Daftar Akun Pengusul
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
