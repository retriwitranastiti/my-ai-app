export type Role = 'pengusul' | 'verifikator' | 'admin';

export interface User {
  id: string;
  role: Role;
  name: string;
  email?: string; // Used as username for pengusul
  username?: string; // Used for admin and verifikator
  password?: string;
  instansi?: string; // For pengusul and verifikator
  batasWaktuAktif?: string; // For verifikator (YYYY-MM-DD)
}

export type ProposalStatus = 'Menunggu PD' | 'Ditolak PD' | 'Disetujui PD' | 'Validasi Final Bapperida';

export interface Proposal {
  id: string;
  pengusulId: string;
  namaInstansi: string;
  judul: string;
  deskripsi: string;
  linkLokasi: string;
  prioritasRkpd: string;
  kakFile: string; // Base64
  kakFileName: string;
  rabFile: string; // Base64
  rabFileName: string;
  status: ProposalStatus;
  createdAt: string;
  
  // Verifikator PD fields
  verifikatorId?: string;
  skorAdministrasi?: number; // Auto 40 if files exist
  skorKewenangan?: number; // 0-30
  skorRkpd?: number; // 0-30
  totalSkor?: number;
  catatanVerifikator?: string;
  alasanPenolakan?: string;
  verifikasiAt?: string;

  // Admin Bapperida fields
  adminId?: string;
  catatanKhususBapperida?: string;
  validasiFinalAt?: string;
}
