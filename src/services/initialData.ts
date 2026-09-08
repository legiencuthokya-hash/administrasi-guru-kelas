import { SchoolSettings, Siswa, User } from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SD NEGERI MAOSPATI 3',
  npsn: '20509618',
  alamat: 'Jl. Raya Maospati No. 45, Gulun',
  desaKelurahan: 'Gulun',
  kecamatan: 'Kecamatan Maospati',
  kabupatenKota: 'Kabupaten Magetan',
  provinsi: 'Jawa Timur',
  namaKepala: 'Dra. Hj. Sri Winarti, M.Pd.',
  nipKepala: '19680512 199303 2 006',
  logoSekolahUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_Tut_Wuri_Handayani.png',
  logoKabupatenUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Lambang_Kabupaten_Magetan.png/480px-Lambang_Kabupaten_Magetan.png',
  tandaTanganKepalaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="70" viewBox="0 0 180 70"><path d="M15,45 Q40,10 70,35 T120,30 Q145,50 165,25 M45,25 Q60,55 90,45 T140,55" stroke="%231e3a8a" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  lokasiTandaTangan: 'Maospati',
  tahunAjaranAktif: '2025/2026',
  semesterAktif: '2',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    nama: 'Administrator Sekolah',
    nip: '19850101 201001 1 001',
    tanggungJawab: 'Administrator',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-1',
    username: 'guru1',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Siti Rahayu, S.Pd.SD',
    nip: '19760415 200501 2 008',
    tanggungJawab: 'Kelas 1',
    tandaTanganUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><path d="M10,40 Q35,15 65,35 T115,25 Q135,45 150,20" stroke="%230f172a" stroke-width="2" fill="none"/></svg>',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-2',
    username: 'guru2',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Budi Santoso, S.Pd.SD',
    nip: '19820719 200801 1 012',
    tanggungJawab: 'Kelas 2',
    tandaTanganUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><path d="M15,45 Q45,20 75,40 T125,30 Q145,50 155,25" stroke="%230f172a" stroke-width="2" fill="none"/></svg>',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-3',
    username: 'guru3',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Sri Wahyuni, S.Pd.SD',
    nip: '19800921 200604 2 015',
    tanggungJawab: 'Kelas 3',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-4',
    username: 'guru4',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Agus Pratama, S.Pd.',
    nip: '19881105 201502 1 003',
    tanggungJawab: 'Kelas 4',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-5',
    username: 'guru5',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Endang Lestari, S.Pd.',
    nip: '19790312 200312 2 004',
    tanggungJawab: 'Kelas 5',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-6',
    username: 'guru6',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Bambang Irawan, S.Pd.',
    nip: '19750820 199903 1 005',
    tanggungJawab: 'Kelas 6',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-pai',
    username: 'gurupai',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Ahmad Fauzi, S.Pd.I',
    nip: '19840214 200902 1 002',
    tanggungJawab: 'Pendidikan Agama Islam',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-pjok',
    username: 'gurupjok',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Danang Wijaya, S.Pd.Kor',
    nip: '19900618 201903 1 007',
    tanggungJawab: 'PJOK',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SISWA: Siswa[] = [
  // Kelas 1
  { id: 's1-01', nisn: '0151234001', nis: '3101', nama: 'Aditya Pratama Putra', jenisKelamin: 'L', kelas: 'Kelas 1', agama: 'Islam', status: 'Aktif' },
  { id: 's1-02', nisn: '0151234002', nis: '3102', nama: 'Aisyah Putri Azzahra', jenisKelamin: 'P', kelas: 'Kelas 1', agama: 'Islam', status: 'Aktif' },
  { id: 's1-03', nisn: '0151234003', nis: '3103', nama: 'Bagas Wahyu Nugroho', jenisKelamin: 'L', kelas: 'Kelas 1', agama: 'Islam', status: 'Aktif' },
  { id: 's1-04', nisn: '0151234004', nis: '3104', nama: 'Cantika Dewi Maharani', jenisKelamin: 'P', kelas: 'Kelas 1', agama: 'Islam', status: 'Aktif' },
  { id: 's1-05', nisn: '0151234005', nis: '3105', nama: 'David Christian', jenisKelamin: 'L', kelas: 'Kelas 1', agama: 'Kristen', status: 'Aktif' },

  // Kelas 2
  { id: 's2-01', nisn: '0141234001', nis: '3001', nama: 'Eka Nur Cahyo', jenisKelamin: 'L', kelas: 'Kelas 2', agama: 'Islam', status: 'Aktif' },
  { id: 's2-02', nisn: '0141234002', nis: '3002', nama: 'Fajar Rizky Ramadhan', jenisKelamin: 'L', kelas: 'Kelas 2', agama: 'Islam', status: 'Aktif' },
  { id: 's2-03', nisn: '0141234003', nis: '3003', nama: 'Ghea Amanda Putri', jenisKelamin: 'P', kelas: 'Kelas 2', agama: 'Islam', status: 'Aktif' },

  // Kelas 3
  { id: 's3-01', nisn: '0131234001', nis: '2901', nama: 'Hendra Gunawan', jenisKelamin: 'L', kelas: 'Kelas 3', agama: 'Islam', status: 'Aktif' },
  { id: 's3-02', nisn: '0131234002', nis: '2902', nama: 'Indah Permatasari', jenisKelamin: 'P', kelas: 'Kelas 3', agama: 'Islam', status: 'Aktif' },

  // Kelas 4
  { id: 's4-01', nisn: '0121234001', nis: '2801', nama: 'Joko Tri Prasetyo', jenisKelamin: 'L', kelas: 'Kelas 4', agama: 'Islam', status: 'Aktif' },
  { id: 's4-02', nisn: '0121234002', nis: '2802', nama: 'Kartika Sari Wulandari', jenisKelamin: 'P', kelas: 'Kelas 4', agama: 'Islam', status: 'Aktif' },

  // Kelas 5
  { id: 's5-01', nisn: '0111234001', nis: '2701', nama: 'Luthfi Hakim', jenisKelamin: 'L', kelas: 'Kelas 5', agama: 'Islam', status: 'Aktif' },
  { id: 's5-02', nisn: '0111234002', nis: '2702', nama: 'Mega Budiarti', jenisKelamin: 'P', kelas: 'Kelas 5', agama: 'Islam', status: 'Aktif' },

  // Kelas 6
  { id: 's6-01', nisn: '0101234001', nis: '2601', nama: 'Naufal Al-Ghifari', jenisKelamin: 'L', kelas: 'Kelas 6', agama: 'Islam', status: 'Aktif' },
  { id: 's6-02', nisn: '0101234002', nis: '2602', nama: 'Olivia Salsabila', jenisKelamin: 'P', kelas: 'Kelas 6', agama: 'Islam', status: 'Aktif' },
  { id: 's6-03', nisn: '0101234003', nis: '2603', nama: 'Pandu Wicaksana', jenisKelamin: 'L', kelas: 'Kelas 6', agama: 'Islam', status: 'Aktif' },
];
