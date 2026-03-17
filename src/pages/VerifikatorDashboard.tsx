import React, { useState, useEffect } from 'react';
import { getCurrentUser, getProposals, saveProposals } from '../services/storage';
import { Proposal } from '../types';
import { FileText, MapPin, X, Eye, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifikatorDashboard() {
  const user = getCurrentUser();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Scoring & Feedback state
  const [skorKewenangan, setSkorKewenangan] = useState<number>(0);
  const [skorRkpd, setSkorRkpd] = useState<number>(0);
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    setProposals(getProposals());
  }, []);

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !viewProposal || !actionType) return;

    const updatedProposals = proposals.map((p) => {
      if (p.id === viewProposal.id) {
        const skorAdministrasi = p.kakFile && p.rabFile ? 40 : 0;
        const totalSkor = skorAdministrasi + Number(skorKewenangan) + Number(skorRkpd);

        return {
          ...p,
          status: actionType === 'approve' ? 'Disetujui PD' : 'Ditolak PD',
          verifikatorId: user.id,
          skorAdministrasi,
          skorKewenangan: Number(skorKewenangan),
          skorRkpd: Number(skorRkpd),
          totalSkor,
          catatanVerifikator: actionType === 'approve' ? catatan : undefined,
          alasanPenolakan: actionType === 'reject' ? catatan : undefined,
          verifikasiAt: new Date().toISOString(),
        };
      }
      return p;
    });

    saveProposals(updatedProposals);
    setProposals(updatedProposals);
    setViewProposal(null);
    setActionType(null);
    setCatatan('');
    setSkorKewenangan(0);
    setSkorRkpd(0);
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

  const pendingProposals = proposals.filter(p => p.status === 'Menunggu PD');
  const processedProposals = proposals.filter(p => p.status !== 'Menunggu PD');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Verifikator PD</h2>
        <p className="text-slate-500 text-sm mt-1">Kurasi dan berikan penilaian pada usulan yang masuk.</p>
      </div>

      {/* Pending Table */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Usulan Menunggu Verifikasi</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Instansi</th>
                  <th className="px-6 py-4 font-semibold">Judul Usulan</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingProposals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada usulan baru.
                    </td>
                  </tr>
                ) : (
                  pendingProposals.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                      <td className="px-6 py-4 text-slate-600">{p.judul}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setViewProposal(p)}
                          className="bg-[#0A192F] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#112240] transition-colors"
                        >
                          Proses
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

      {/* Processed Table */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Riwayat Kurasi PD</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Instansi</th>
                  <th className="px-6 py-4 font-semibold">Judul Usulan</th>
                  <th className="px-6 py-4 font-semibold">Total Skor</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedProposals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Belum ada riwayat kurasi.
                    </td>
                  </tr>
                ) : (
                  processedProposals.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                      <td className="px-6 py-4 text-slate-600">{p.judul}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.totalSkor !== undefined ? p.totalSkor : '-'}</td>
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
      </div>

      {/* View/Process Modal */}
      {viewProposal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Detail & Kurasi Usulan</h3>
              <button onClick={() => { setViewProposal(null); setActionType(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              {/* Proposal Info */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{viewProposal.judul}</h4>
                    <p className="text-sm text-slate-500">{viewProposal.namaInstansi}</p>
                  </div>
                  <StatusBadge status={viewProposal.status} />
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

              {/* Action Area (Only if pending) */}
              {viewProposal.status === 'Menunggu PD' ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Tindakan Kurasi</h4>
                  {!actionType ? (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setActionType('approve')}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-3 rounded-xl font-medium flex justify-center items-center space-x-2 transition-colors"
                      >
                        <CheckCircle2 size={20} /> <span>Setujui Usulan</span>
                      </button>
                      <button
                        onClick={() => setActionType('reject')}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 rounded-xl font-medium flex justify-center items-center space-x-2 transition-colors"
                      >
                        <XCircle size={20} /> <span>Tolak Usulan</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleProcess} className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className={`font-bold ${actionType === 'approve' ? 'text-blue-700' : 'text-red-700'}`}>
                          {actionType === 'approve' ? 'Form Persetujuan & Penilaian' : 'Form Penolakan'}
                        </h5>
                        <button type="button" onClick={() => setActionType(null)} className="text-sm text-slate-500 hover:underline">Batal</button>
                      </div>

                      {actionType === 'approve' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="col-span-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-slate-700">Skor Administrasi (Otomatis)</span>
                              <span className="font-bold text-slate-900">40</span>
                            </div>
                            <p className="text-xs text-slate-500">Diberikan karena file KAK & RAB lengkap.</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Skor Kewenangan (0-30)</label>
                            <input
                              type="number" min="0" max="30" required
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                              value={skorKewenangan} onChange={(e) => setSkorKewenangan(Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Skor RKPD (0-30)</label>
                            <input
                              type="number" min="0" max="30" required
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                              value={skorRkpd} onChange={(e) => setSkorRkpd(Number(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2 pt-3 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-700">Total Skor Akhir:</span>
                            <span className="text-xl font-black text-[#0A192F]">{40 + skorKewenangan + skorRkpd}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {actionType === 'approve' ? 'Catatan Verifikator (Wajib)' : 'Alasan Penolakan (Wajib)'}
                        </label>
                        <textarea
                          required rows={3}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A192F] outline-none"
                          value={catatan} onChange={(e) => setCatatan(e.target.value)}
                          placeholder={actionType === 'approve' ? 'Berikan catatan persetujuan...' : 'Jelaskan alasan usulan ditolak...'}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors shadow-sm ${
                          actionType === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {actionType === 'approve' ? 'Simpan Persetujuan' : 'Konfirmasi Penolakan'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                // View Processed Result
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Hasil Kurasi PD</h4>
                  <div className={`p-5 rounded-xl border ${viewProposal.status === 'Ditolak PD' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    {viewProposal.status === 'Ditolak PD' ? (
                      <div>
                        <h5 className="font-bold text-red-800 mb-2">Alasan Penolakan</h5>
                        <p className="text-red-700 text-sm">{viewProposal.alasanPenolakan}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
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
                        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                          <span className="font-bold text-slate-700">Total Skor</span>
                          <span className="text-2xl font-black text-blue-700">{viewProposal.totalSkor}</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-blue-800 mb-1 text-sm">Catatan Verifikator</h5>
                          <p className="text-blue-700 text-sm">{viewProposal.catatanVerifikator}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {viewProposal.catatanKhususBapperida && (
                    <div className="mt-4 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <h5 className="font-bold text-emerald-800 mb-1 text-sm">Catatan Final Bapperida</h5>
                      <p className="text-emerald-700 text-sm">{viewProposal.catatanKhususBapperida}</p>
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
 
