import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const mintaAnalisisAI = async (dataUsulan: any) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Anda adalah sistem AI pakar perencana pembangunan daerah untuk Provinsi Sumatera Utara.
    Tugas Anda adalah membantu Verifikator Perangkat Daerah (PD) menganalisis usulan berikut:
    
    Data Usulan:
    - Judul: ${dataUsulan.judul}
    - Deskripsi: ${dataUsulan.deskripsi}
    - Anggaran: ${dataUsulan.anggaran}
    
    Berikan analisis mendalam dalam format berikut:
    1. KELENGKAPAN DOKUMEN: (Analisis apakah deskripsi sudah cukup menjelaskan isi usulan)
    2. KESESUAIAN KEWENANGAN: (Apakah usulan ini sesuai tupoksi PD terkait?)
    3. KESELARASAN RKPD: (Apakah selaras dengan prioritas pembangunan RKPD Sumut?)
    4. SKORING: (Berikan nilai 1-100)
    5. CATATAN FINAL: (Saran untuk verifikator)
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Gagal memuat analisis AI. Pastikan API Key benar.";
  }
};