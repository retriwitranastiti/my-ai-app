import React, { useState, useEffect } from 'react';
import { getCurrentUser, getProposals, saveProposals } from '../services/storage';
import { Proposal } from '../types';
import { FileText, MapPin, X, Eye, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
// Import layanan AI
import { mintaAnalisisAI } from '../aiService'; 

export default function VerifikatorDashboard() {
  const user = getCurrentUser();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Scoring & Feedback state
  const [skorKewenangan, setSkorKewenangan] = useState<number>(0);
  const [skorRkpd, setSkorRkpd] = useState<number>(0);
  const [catatan, setCatatan] = useState('');

  // AI State
  const [hasilAI, setHasilAI] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setProposals(getProposals());
  }, []);

  const handleAiAnalysis = async () => {
    if (!viewProposal) return;
    setIsAiLoading(true);
    try {
      const dataUntukAI = {
        judul: viewProposal.judul,
        deskripsi: viewProposal.deskripsi,
        anggaran: "Sesuai dokumen RAB", // Bisa disesuaikan jika ada field anggaran
        prioritas: viewProposal.prioritasRkpd
      };
      const hasil = await mintaAnalisisAI(dataUntukAI);
      setHasilAI(hasil);
    } catch (error) {
      setHasilAI("Gagal mendapatkan analisis AI. Periksa koneksi atau API Key.");
    } finally {
      setIsAiLoading(false);
    }
  };

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
    setHasilAI(""); // Reset hasil AI
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

      {/* Tabel Usulan Menunggu (Sama seperti kode asli kamu) */}
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
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Tidak ada usulan baru.</td>
                  </tr>
                ) : (
                  pendingProposals.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                      <td className="px-6 py-4 text-slate-600">{p.judul}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setViewProposal(p)} className="bg-[#0A192F] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#112240]">Proses</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Riwayat Kurasi (Sama seperti kode asli kamu) */}
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
                {processedProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                    <td className="px-6 py-4 text-slate-600">{p.judul}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.totalSkor ?? '-'}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setViewProposal(p)} className="text-[#0A192F] p-2 hover:bg-slate-100 rounded-full"><Eye size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {viewProposal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Detail & Kurasi Usulan</h3>
              <button onClick={() => { setViewProposal(null); setActionType(null); setHasilAI(""); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-lg font-bold text-slate-900">{viewProposal.judul}</h4>
                <p className="text-slate-700 text-sm my-2">{viewProposal.deskripsi}</p>
                
                {/* TOMBOL ANALISIS AI BARU */}
                {viewProposal.status === 'Menunggu PD' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    {!hasilAI ? (
                      <button 
                        onClick={handleAiAnalysis}
                        disabled={isAiLoading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
                      >
                        {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        <span>{isAiLoading ? "AI Sedang Menganalisis..." : "Gunakan Analisis AI Gemini"}</span>
                      </button>
                    ) : (
                      <div className="bg-white border-2 border-purple-100 rounded-xl p-4 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><Sparkles size={40} /></div>
                        <h5 className="text-purple-700 font-bold text-sm mb-2 flex items-center">
                           <Sparkles size={16} className="mr-1"/> Rekomendasi AI Gemini:
                        </h5>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {hasilAI}
                        </div>
                        <button onClick={() => setHasilAI("")} className="mt-2 text-[10px] text-slate-400 hover:underline">Hapus analisis</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Area */}
              {viewProposal.status === 'Menunggu PD' ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900">Tindakan Kurasi</h4>
                  {!actionType ? (
                    <div className="flex space-x-4">
                      <button onClick={() => setActionType('approve')} className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-xl font-medium flex justify-center items-center space-x-2">
                        <CheckCircle2 size={20} /> <span>Setujui Usulan</span>
                      </button>
                      <button onClick={() => setActionType('reject')} className="flex-1 bg-red-50 text-red-700 border border-red-200 py-3 rounded-xl font-medium flex justify-center items-center space-x-2">
                        <XCircle size={20} /> <span>Tolak Usulan</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleProcess} className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm">
                       <h5 className={`font-bold ${actionType === 'approve' ? 'text-blue-700' : 'text-red-700'}`}>
                        {actionType === 'approve' ? 'Form Persetujuan' : 'Form Penolakan'}
                      </h5>
                      {actionType === 'approve' && (
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Skor Kewenangan" className="border p-2 rounded" onChange={(e) => setSkorKewenangan(Number(e.target.value))} />
                          <input type="number" placeholder="Skor RKPD" className="border p-2 rounded" onChange={(e) => setSkorRkpd(Number(e.target.value))} />
                        </div>
                      )}
                      <textarea required className="w-full border p-2 rounded" placeholder="Catatan..." value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                      <button type="submit" className={`w-full py-2.5 rounded-lg text-white ${actionType === 'approve' ? 'bg-blue-600' : 'bg-red-600'}`}>Simpan</button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg">
                   <p className="text-sm font-bold">Status: {viewProposal.status}</p>
                   <p className="text-sm">Catatan: {viewProposal.catatanVerifikator || viewProposal.alasanPenolakan}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}