import React, { useState, useEffect } from 'react';
import { getCurrentUser, getProposals, saveProposals } from '../services/storage';
import { Proposal } from '../types';
import { FileText, MapPin, X, Eye, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
// Langsung panggil library Google di sini agar tidak butuh file tambahan
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // FUNGSI ANALISIS AI (Sudah terhubung ke Gemini 3 Flash)
  const handleAiAnalysis = async () => {
    if (!viewProposal) return;
    setIsAiLoading(true);
    try {
      // Mengambil API Key yang sudah kamu masukkan di Vercel
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setHasilAI("Error: API Key tidak ditemukan di Vercel Settings.");
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Menggunakan model Gemini 3 Flash sesuai pilihanmu di AI Studio
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
      
      const prompt = `Analisis usulan ini untuk Verifikator Pemerintah Daerah:
      Judul Usulan: ${viewProposal.judul}
      Deskripsi: ${viewProposal.deskripsi}
      Prioritas RKPD: ${viewProposal.prioritasRkpd}
      
      Berikan rekomendasi singkat:
      1. Apakah masuk dalam kewenangan daerah?
      2. Apakah selaras dengan prioritas RKPD?
      3. Berikan saran skor (0-30 untuk kewenangan, 0-30 untuk RKPD).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setHasilAI(text);
    } catch (error) {
      console.error("AI Error:", error);
      setHasilAI("Gagal terhubung ke AI. Pastikan API Key benar dan kuota gratis masih tersedia.");
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
    setHasilAI("");
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Menunggu PD': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Menunggu PD</span>;
      case 'Ditolak PD': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Ditolak PD</span>;
      case 'Disetujui PD': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Disetujui PD</span>;
      case 'Validasi Final Bapperida': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Validasi Final</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const pendingProposals = proposals.filter(p => p.status === 'Menunggu PD');
  const processedProposals = proposals.filter(p => p.status !== 'Menunggu PD');

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Verifikator PD</h2>
        <p className="text-slate-500 text-sm mt-1">Sistem Kurasi dengan Bantuan AI Gemini 3</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Instansi</th>
                <th className="px-6 py-4 font-semibold">Judul Usulan</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingProposals.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Tidak ada usulan masuk.</td></tr>
              ) : (
                pendingProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.namaInstansi}</td>
                    <td className="px-6 py-4 text-slate-600">{p.judul}</td>
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

      {viewProposal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">Detail Usulan</h3>
              <button onClick={() => {setViewProposal(null); setHasilAI("");}} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-lg text-slate-900">{viewProposal.judul}</h4>
                <p className="text-sm text-slate-600 mt-2">{viewProposal.deskripsi}</p>
                
                {viewProposal.status === 'Menunggu PD' && (
                  <div className="mt-4 pt-4 border-t">
                    {!hasilAI ? (
                      <button 
                        onClick={handleAiAnalysis}
                        disabled={isAiLoading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
                      >
                        {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        <span>{isAiLoading ? "Sedang Menganalisis..." : "Gunakan Analisis AI Gemini"}</span>
                      </button>
                    ) : (
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative">
                        <div className="flex items-center text-indigo-700 font-bold text-sm mb-2">
                          <Sparkles size={16} className="mr-1" /> Rekomendasi AI Gemini:
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{hasilAI}</p>
                        <button onClick={() => setHasilAI("")} className="mt-3 text-[10px] text-indigo-400 hover:underline">Hapus analisis</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {viewProposal.status === 'Menunggu PD' && (
                <div className="space-y-4">
                  {!actionType ? (
                    <div className="flex space-x-4">
                      <button onClick={() => setActionType('approve')} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Setujui Usulan</button>
                      <button onClick={() => setActionType('reject')} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100">Tolak Usulan</button>
                    </div>
                  ) : (
                    <form onSubmit={handleProcess} className="space-y-4 border-2 border-slate-100 p-5 rounded-2xl">
                      <h5 className={`font-bold ${actionType === 'approve' ? 'text-blue-600' : 'text-red-600'}`}>
                        {actionType === 'approve' ? 'Form Skor & Verifikasi' : 'Alasan Penolakan'}
                      </h5>
                      {actionType === 'approve' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Skor Kewenangan (0-30)</label>
                            <input type="number" max="30" className="w-full border-2 border-slate-100 p-2.5 rounded-lg mt-1 focus:border-blue-500 outline-none" onChange={(e)=>setSkorKewenangan(Number(e.target.value))} required />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Skor RKPD (0-30)</label>
                            <input type="number" max="30" className="w-full border-2 border-slate-100 p-2.5 rounded-lg mt-1 focus:border-blue-500 outline-none" onChange={(e)=>setSkorRkpd(Number(e.target.value))} required />
                          </div>
                        </div>
                      )}
                      <textarea className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-blue-500 outline-none h-24" placeholder="Berikan catatan verifikasi..." onChange={(e)=>setCatatan(e.target.value)} required />
                      <div className="flex space-x-3">
                        <button type="submit" className="flex-2 bg-[#0A192F] text-white py-3 px-8 rounded-xl font-bold">Simpan Hasil</button>
                        <button type="button" onClick={()=>setActionType(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Batal</button>
                      </div>
                    </form>
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
