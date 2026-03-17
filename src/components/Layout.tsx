import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser } from '../services/storage';
import { LogOut, User } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-[#0A192F] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0A192F] font-bold text-xl">
                B
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">E-Kurasi Bapperida</h1>
                <p className="text-xs text-[#D4AF37]">Provinsi Sumatera Utara</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User size={16} className="text-[#D4AF37]" />
                <span className="font-medium">{user.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs uppercase tracking-wider text-slate-300">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
