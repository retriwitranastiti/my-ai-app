import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, saveUsers, setCurrentUser } from '../services/storage';

export default function Register() {
  const [name, setName] = useState('');
  const [instansi, setInstansi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      setError('Email sudah terdaftar.');
      return;
    }

    const newUser = {
      id: `pengusul-${Date.now()}`,
      role: 'pengusul' as const,
      name,
      instansi,
      email,
      password,
    };

    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    navigate('/pengusul');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#0A192F] px-8 py-8 text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Daftar Akun Pengusul</h2>
          <p className="text-[#D4AF37] text-sm mt-1">E-Kurasi Usulan Forum Bapperida</p>
        </div>
        <div className="px-8 py-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instansi
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all"
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                placeholder="Nama Instansi/Dinas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@instansi.go.id"
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
              className="w-full bg-[#0A192F] text-white py-2.5 rounded-lg font-medium hover:bg-[#112240] transition-colors shadow-md mt-2"
            >
              Daftar Sekarang
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-[#0A192F] font-semibold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
