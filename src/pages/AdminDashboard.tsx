import React, { useState, useEffect } from 'react';
import { getCurrentUser, getProposals, saveProposals, getUsers, saveUsers } from '../services/storage';
import { Proposal, User } from '../types';
import { FileText, MapPin, X, Eye, CheckCircle2, Users, Download, Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const user = getCurrentUser();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'validasi' | 'akun'>('validasi');

  // Modal states
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [catatanKhusus, setCatatanKhusus] = useState('');
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Account Form State
  const [accName, setAccName] = useState('');
  const [accUsername, setAccUsername] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accInstansi, setAccInstansi] = useState('');
  const [accBatasWaktu, setAccBatasWaktu] = useState('');

  useEffect(() => {
    setProposals(getProposals());
    setUsers(getUsers());
  }, []);

  // --- VALIDASI LOGIC ---
  const handleValidasiFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !viewProposal) return;

    const updatedProposals = proposals.map((p) => {
      if (p.id === viewProposal.id) {
        return {
          ...p,
          status: 'Validasi Final Bapperida',
          adminId: user.id,
          catatanKhususBapperida: catatanKhusus,
          validasiFinalAt: new Date().toISOString(),
        };
      }
      return p;
    });

    saveProposals(updatedProposals);
    setProposals(updatedProposals);
    setViewProposal(null);
    setCatatanKhusus('');
  };

  const handleDownloadCSV = () => {
    const finalProposals = proposals.filter(p => p.status === 'Validasi Final Bapperida');
    if (finalProposals.length === 0) {
      alert('Belum ada data usulan final untuk didownload.');
      return;
    }

    const headers = ['ID', 'Instansi', 'Judul Usulan', 'Prioritas RKPD', 'Skor Total', 'Catatan Verifikator', 'Catatan Bapperida', 'Tanggal Validasi'];
    const csvContent = [
      headers.join(','),
      ...finalProposals.map(p => [
        p.id,
        `"${p.namaInstansi}"`,
        `"${p.judul}"`,
        `"${p.prioritasRkpd}"`,
        p.totalSkor,
        `"${p.catatanVerifikator || ''}"`,
        `"${p.catatanKhususBapperida || ''}"`,
        p.validasiFinalAt ? new Date(p.validasiFinalAt).toLocaleDateString('id-ID') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Usulan_Final_Bapperida_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACCOUNT LOGIC ---
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedUsers = [...users];
    
    if (editingUser) {
      updatedUsers = updatedUsers.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: accName, username: accUsername, password: accPassword, instansi: accInstansi, batasWaktuAktif: accBatasWaktu }
          : u
      );
    } else {
      if (users.find(u => u.username === accUsername)) {
        alert('Username sudah digunakan!');
        return;
      }
      const newUser: User = {
        id: `verifikator-${Date.now()}`,
        role: 'verifikator',
        name: accName,
        username: accUsername,
        password: accPassword,
        instansi: accInstansi,
        batasWaktuAktif: accBatasWaktu
      };
      updatedUsers.push(newUser);
    }

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    closeAccountModal();
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      const updatedUsers = users.filter(u => u.id !== id);
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
    }
  };

  const openAccountModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setAccName(u.name);
      setAccUsername(u.username || '');
      setAccPassword(u.password || '');
      setAccInstansi(u.instansi || '');
      setAccBatasWaktu(u.batasWaktuAktif || '');
    } else {
      setEditingUser(null);
      setAccName(''); setAccUsername(''); setAccPassword(''); setAccInstansi(''); setAccBatasWaktu('');
    }
    setIsAccountModalOpen(true);
  };

  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingUser(null);
  };

  // Filtered Data
  const pendingValidation = proposals.filter(p => p.status === 'Disetujui PD');
  const finalProposals = proposals.filter(p => p.status === 'Validasi Final Bapperida');
  const verifikatorUsers = users.filter(u => u.role === 'verifikator');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Admin Bapperida</h2>
          <p className="text-slate-500 text-sm mt-1">Kontrol final usulan dan manajemen akun Verifikator PD.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('validasi')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'validasi' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Validasi Usulan
        </button>
        <button
          onClick={() => setActiveTab('akun')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'akun' ? 'border-[#0A192F] text-[#0A192F]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users size={16} /> <span>Manajemen Akun PD</span>
        </button>
      </div>

      {/* TAB: VALIDASI */}
      {activeTab === 'validasi' && (
        <div className="space-y-8">
          {/* Pending Validation */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Menunggu Validasi Final</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Instansi</th>
                      <th className="px-6 py-4 font-semibold">Judul Usulan</th>
                      <th className="px-6 py-4 font-semibold">Skor PD</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingValidation.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          Tidak ada usulan yang menunggu validasi final.
                        </td>
                      </tr>
                    ) : (
                      pendingValidation.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                          <td className="px-6 py-4 text-slate-600">{p.judul}</td>
                          <td className="px-6 py-4 font-bold text-[#0A192F]">{p.totalSkor}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setViewProposal(p)}
                              className="bg-[#0A192F] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#112240] transition-colors"
                            >
                              Review & Validasi
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Final Validated */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Usulan Final (Tervalidasi)</h3>
              <button
                onClick={handleDownloadCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors shadow-sm"
              >
                <Download size={16} /> <span>Download CSV</span>
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Instansi</th>
                      <th className="px-6 py-4 font-semibold">Judul Usulan</th>
                      <th className="px-6 py-4 font-semibold">Skor Akhir</th>
                      <th className="px-6 py-4 font-semibold">Tanggal Validasi</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {finalProposals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          Belum ada usulan yang divalidasi final.
                        </td>
                      </tr>
                    ) : (
                      finalProposals.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                          <td className="px-6 py-4 text-slate-600">{p.judul}</td>
                          <td className="px-6 py-4 font-bold text-[#0A192F]">{p.totalSkor}</td>
                          <td className="px-6 py-4 text-slate-600">{p.validasiFinalAt ? new Date(p.validasiFinalAt).toLocaleDateString('id-ID') : '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setViewProposal(p)}
                              className="text-[#0A192F] hover:text-[#D4AF37] p-2 rounded-full hover:bg-slate-100 transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AKUN */}
      {activeTab === 'akun' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Manajemen Akun Verifikator PD</h3>
            <button
              onClick={() => openAccountModal()}
              className="bg-[#0A192F] hover:bg-[#112240] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Plus size={16} /> <span>Tambah Akun PD</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Verifikator</th>
                    <th className="px-6 py-4 font-semibold">Instansi</th>
                    <th className="px-6 py-4 font-semibold">Username</th>
                    <th className="px-6 py-4 font-semibold">Batas Waktu Aktif</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifikatorUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Belum ada akun Verifikator PD.
                      </td>
                    </tr>
                  ) : (
                    verifikatorUsers.map((u) => {
                      const isExpired = u.batasWaktuAktif && u.batasWaktuAktif < new Date().toISOString().split('T')[0];
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                          <td className="px-6 py-4 text-slate-600">{u.instansi}</td>
                          <td className="px-6 py-4 text-slate-600">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {u.batasWaktuAktif ? new Date(u.batasWaktuAktif).toLocaleDateString('id-ID') : 'Tidak Terbatas'}
                              {isExpired && ' (Expired)'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => openAccountModal(u)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              title="Edit Akun"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(u.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View/Validate Proposal Modal */}
      {viewProposal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">
                {viewProposal.status === 'Disetujui PD' ? 'Validasi Final Usulan' : 'Detail Usulan Final'}
              </h3>
              <button onClick={() => setViewProposal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{viewProposal.judul}</h4>
                    <p className="text-sm text-slate-500">{viewProposal.namaInstansi}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${viewProposal.status === 'Validasi Final Bapperida' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {viewProposal.status}
                  </span>
                </div>
                <p className="text-slate-700 text-sm mb-4">{viewProposal.deskripsi}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="block text-slate-500 mb-1">Prioritas RKPD</span>
                    <span className="font-medium text-slate-900">{viewProposal.prioritasRkpd}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Tanggal Pengajuan</span>
                    <span className="font-medium text-slate-900">{new Date(viewProposal.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4 border-t border-slate-200">
                  <a href={viewProposal.linkLokasi} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                    <MapPin size={16} /> <span>Buka Maps</span>
                  </a>
                  <a href={viewProposal.kakFile} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                    <FileText size={16} /> <span>Lihat KAK</span>
                  </a>
                  <a href={viewProposal.rabFile} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                    <FileText size={16} /> <span>Lihat RAB</span>
                  </a>
                </div>
              </div>

              {/* Review Skor PD */}
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                <h5 className="font-bold text-blue-900 mb-3 text-sm">Review Penilaian Verifikator PD</h5>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="block text-xs text-slate-500 mb-1">Administrasi</span>
                    <span className="font-bold text-lg text-slate-800">{viewProposal.skorAdministrasi}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="block text-xs text-slate-500 mb-1">Kewenangan</span>
                    <span className="font-bold text-lg text-slate-800">{viewProposal.skorKewenangan}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <span className="block text-xs text-slate-500 mb-1">RKPD</span>
                    <span className="font-bold text-lg text-slate-800">{viewProposal.skorRkpd}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm mb-4">
                  <span className="font-bold text-slate-700">Total Skor Akhir</span>
                  <span className="text-2xl font-black text-blue-700">{viewProposal.totalSkor}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-blue-800 mb-1">Catatan Verifikator:</span>
                  <p className="text-sm text-blue-700 bg-white p-3 rounded-lg border border-blue-100">{viewProposal.catatanVerifikator}</p>
                </div>
              </div>

              {/* Action Area */}
              {viewProposal.status === 'Disetujui PD' ? (
                <form onSubmit={handleValidasiFinal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Catatan Khusus Bapperida (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                      value={catatanKhusus} onChange={(e) => setCatatanKhusus(e.target.value)}
                      placeholder="Tambahkan catatan final jika diperlukan..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium flex justify-center items-center space-x-2 transition-colors shadow-sm"
                  >
                    <CheckCircle2 size={20} /> <span>Validasi Final Usulan</span>
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
                  <h5 className="font-bold text-emerald-900 mb-1 text-sm">Catatan Khusus Bapperida</h5>
                  <p className="text-sm text-emerald-800">{viewProposal.catatanKhususBapperida || '-'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingUser ? 'Edit Akun PD' : 'Tambah Akun PD Baru'}
              </h3>
              <button onClick={closeAccountModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Verifikator</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={accName} onChange={(e) => setAccName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instansi / Perangkat Daerah</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={accInstansi} onChange={(e) => setAccInstansi(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={accUsername} onChange={(e) => setAccUsername(e.target.value)}
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={accPassword} onChange={(e) => setAccPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batas Waktu Aktif</label>
                <input
                  type="date" required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={accBatasWaktu} onChange={(e) => setAccBatasWaktu(e.target.value)}
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button" onClick={closeAccountModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A192F] text-white rounded-lg font-medium hover:bg-[#112240] transition-colors"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
