import React, { useState, useEffect } from 'react';
import { getCurrentUser, getProposals, saveProposals } from '../services/storage';
import { Proposal } from '../types';
import { FileText, MapPin, Plus, X, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PengusulDashboard() {
  const user = getCurrentUser();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);

  // Form state
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [linkLokasi, setLinkLokasi] = useState('');
  const [prioritasRkpd, setPrioritasRkpd] = useState('');
  const [kakFile, setKakFile] = useState<{ name: string; base64: string } | null>(null);
  const [rabFile, setRabFile] = useState<{ name: string; base64: string } | null>(null);

  useEffect(() => {
    if (user) {
      const allProposals = getProposals();
      setProposals(allProposals.filter((p) => p.pengusulId === user.id));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'kak' | 'rab') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'kak') setKakFile({ name: file.name, base64 });
        else setRabFile({ name: file.name, base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !kakFile || !rabFile) return;

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      pengusulId: user.id,
      namaInstansi: user.instansi || '',
      judul,
      deskripsi,
      linkLokasi,
      prioritasRkpd,
      kakFile: kakFile.base64,
      kakFileName: kakFile.name,
      rabFile: rabFile.base64,
      rabFileName: rabFile.name,
      status: 'Menunggu PD',
      createdAt: new Date().toISOString(),
    };

    const updatedProposals = [...getProposals(), newProposal];
    saveProposals(updatedProposals);
    setProposals(updatedProposals.filter((p) => p.pengusulId === user.id));
    
    // Reset form
    setJudul(''); setDeskripsi(''); setLinkLokasi(''); setPrioritasRkpd('');
    setKakFile(null); setRabFile(null);
    setIsModalOpen(false);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Menunggu PD':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Menunggu PD</span>;
      case 'Ditolak PD':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Ditolak PD</span>;
      case 'Disetujui PD':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Disetujui PD</span>;
      case 'Validasi Final Bapperida':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Validasi Final</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Pengusul</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola dan pantau usulan instansi Anda.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0A192F] hover:bg-[#112240] text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Buat Usulan Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Judul Usulan</th>
                <th className="px-6 py-4 font-semibold">Prioritas RKPD</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada usulan yang diajukan.
                  </td>
                </tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.judul}</td>
                    <td className="px-6 py-4 text-slate-600">{p.prioritasRkpd}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Form Usulan Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Usulan</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={judul} onChange={(e) => setJudul(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  required rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link Lokasi (Google Maps)</label>
                <input
                  type="url" required placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                  value={linkLokasi} onChange={(e) => setLinkLokasi(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prioritas RKPD</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none bg-white"
                  value={prioritasRkpd} onChange={(e) => setPrioritasRkpd(e.target.value)}
                >
                  <option value="">Pilih Prioritas</option>
                  <option value="Peningkatan Kualitas SDM">Peningkatan Kualitas SDM</option>
                  <option value="Pembangunan Infrastruktur">Pembangunan Infrastruktur</option>
                  <option value="Pemulihan Ekonomi">Pemulihan Ekonomi</option>
                  <option value="Tata Kelola Pemerintahan">Tata Kelola Pemerintahan</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Upload KAK (PDF)</label>
                  <input
                    type="file" accept=".pdf" required
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0A192F]/10 file:text-[#0A192F] hover:file:bg-[#0A192F]/20"
                    onChange={(e) => handleFileChange(e, 'kak')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Upload RAB (Excel/PDF)</label>
                  <input
                    type="file" accept=".pdf,.xls,.xlsx" required
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0A192F]/10 file:text-[#0A192F] hover:file:bg-[#0A192F]/20"
                    onChange={(e) => handleFileChange(e, 'rab')}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A192F] text-white rounded-lg font-medium hover:bg-[#112240] transition-colors"
                >
                  Simpan Usulan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProposal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Detail Usulan</h3>
              <button onClick={() => setViewProposal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-bold text-slate-900">{viewProposal.judul}</h4>
                  <StatusBadge status={viewProposal.status} />
                </div>
                <p className="text-slate-600 text-sm">{viewProposal.deskripsi}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Prioritas RKPD</span>
                  <span className="font-medium text-slate-900">{viewProposal.prioritasRkpd}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="block text-slate-500 mb-1">Tanggal Pengajuan</span>
                  <span className="font-medium text-slate-900">{new Date(viewProposal.createdAt).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <a href={viewProposal.linkLokasi} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                  <MapPin size={16} /> <span>Lihat Lokasi Maps</span>
                </a>
                <a href={viewProposal.kakFile} download={viewProposal.kakFileName} className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                  <FileText size={16} /> <span>Download KAK</span>
                </a>
                <a href={viewProposal.rabFile} download={viewProposal.rabFileName} className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                  <FileText size={16} /> <span>Download RAB</span>
                </a>
              </div>

              {/* Feedback Section */}
              {(viewProposal.catatanVerifikator || viewProposal.alasanPenolakan || viewProposal.catatanKhususBapperida) && (
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                  <h5 className="font-bold text-slate-900">Catatan & Feedback</h5>
                  
                  {viewProposal.alasanPenolakan && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                      <div>
                        <h6 className="text-sm font-bold text-red-800">Alasan Penolakan (Verifikator PD)</h6>
                        <p className="text-sm text-red-700 mt-1">{viewProposal.alasanPenolakan}</p>
                      </div>
                    </div>
                  )}

                  {viewProposal.catatanVerifikator && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                      <CheckCircle2 className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                      <div>
                        <h6 className="text-sm font-bold text-blue-800">Catatan Verifikator PD</h6>
                        <p className="text-sm text-blue-700 mt-1">{viewProposal.catatanVerifikator}</p>
                        {viewProposal.totalSkor !== undefined && (
                          <div className="mt-2 inline-block bg-white px-2 py-1 rounded border border-blue-100 text-xs font-bold text-blue-900">
                            Total Skor: {viewProposal.totalSkor} / 100
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {viewProposal.catatanKhususBapperida && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3">
                      <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                      <div>
                        <h6 className="text-sm font-bold text-emerald-800">Catatan Khusus Bapperida (Final)</h6>
                        <p className="text-sm text-emerald-700 mt-1">{viewProposal.catatanKhususBapperida}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
