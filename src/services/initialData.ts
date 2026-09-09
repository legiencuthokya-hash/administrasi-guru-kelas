import { SchoolSettings, Siswa, User, JadwalSlot, DAFTAR_KELAS, HariSekolah } from '../types';

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
    id: 'user-guru-1a',
    username: 'guru1a',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Siti Rahayu, S.Pd.SD',
    nip: '19760415 200501 2 008',
    tanggungJawab: '1A',
    tandaTanganUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><path d="M10,40 Q35,15 65,35 T115,25 Q135,45 150,20" stroke="%230f172a" stroke-width="2" fill="none"/></svg>',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-1b',
    username: 'guru1b',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Rina Astuti, S.Pd.',
    nip: '19830312 200902 2 005',
    tanggungJawab: '1B',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-2a',
    username: 'guru2a',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Budi Santoso, S.Pd.SD',
    nip: '19820719 200801 1 012',
    tanggungJawab: '2A',
    tandaTanganUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><path d="M15,45 Q45,20 75,40 T125,30 Q145,50 155,25" stroke="%230f172a" stroke-width="2" fill="none"/></svg>',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-2b',
    username: 'guru2b',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Tri Wahyudi, S.Pd.',
    nip: '19860520 201101 1 009',
    tanggungJawab: '2B',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-3a',
    username: 'guru3a',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Sri Wahyuni, S.Pd.SD',
    nip: '19800921 200604 2 015',
    tanggungJawab: '3A',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-3b',
    username: 'guru3b',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Maya Indah, S.Pd.',
    nip: '19870814 201403 2 006',
    tanggungJawab: '3B',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-4a',
    username: 'guru4a',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Agus Pratama, S.Pd.',
    nip: '19881105 201502 1 003',
    tanggungJawab: '4A',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-4b',
    username: 'guru4b',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Dian Kusuma, S.Pd.',
    nip: '19890422 201701 2 004',
    tanggungJawab: '4B',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-5a',
    username: 'guru5a',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Endang Lestari, S.Pd.',
    nip: '19790312 200312 2 004',
    tanggungJawab: '5A',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-5b',
    username: 'guru5b',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Wawan Setiawan, S.Pd.',
    nip: '19841210 201001 1 014',
    tanggungJawab: '5B',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-6a',
    username: 'guru6a',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Bambang Irawan, S.Pd.',
    nip: '19750820 199903 1 005',
    tanggungJawab: '6A',
    tandaTanganUrl: '',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-guru-6b',
    username: 'guru6b',
    password: 'Garuda123',
    role: 'guru',
    nama: 'Ratna Juwita, S.Pd.',
    nip: '19810617 200701 2 011',
    tanggungJawab: '6B',
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
  // Kelas 1A
  { id: 's1a-01', nisn: '0151234001', nis: '3101', nama: 'Aditya Pratama Putra', jenisKelamin: 'L', kelas: '1A', agama: 'Islam', status: 'Aktif' },
  { id: 's1a-02', nisn: '0151234002', nis: '3102', nama: 'Aisyah Putri Azzahra', jenisKelamin: 'P', kelas: '1A', agama: 'Islam', status: 'Aktif' },
  { id: 's1a-03', nisn: '0151234003', nis: '3103', nama: 'Bagas Wahyu Nugroho', jenisKelamin: 'L', kelas: '1A', agama: 'Islam', status: 'Aktif' },

  // Kelas 1B
  { id: 's1b-01', nisn: '0151234004', nis: '3104', nama: 'Cantika Dewi Maharani', jenisKelamin: 'P', kelas: '1B', agama: 'Islam', status: 'Aktif' },
  { id: 's1b-02', nisn: '0151234005', nis: '3105', nama: 'David Christian', jenisKelamin: 'L', kelas: '1B', agama: 'Kristen', status: 'Aktif' },
  { id: 's1b-03', nisn: '0151234006', nis: '3106', nama: 'Dinda Ayu Kirana', jenisKelamin: 'P', kelas: '1B', agama: 'Islam', status: 'Aktif' },

  // Kelas 2A
  { id: 's2a-01', nisn: '0141234001', nis: '3001', nama: 'Eka Nur Cahyo', jenisKelamin: 'L', kelas: '2A', agama: 'Islam', status: 'Aktif' },
  { id: 's2a-02', nisn: '0141234002', nis: '3002', nama: 'Fajar Rizky Ramadhan', jenisKelamin: 'L', kelas: '2A', agama: 'Islam', status: 'Aktif' },

  // Kelas 2B
  { id: 's2b-01', nisn: '0141234003', nis: '3003', nama: 'Ghea Amanda Putri', jenisKelamin: 'P', kelas: '2B', agama: 'Islam', status: 'Aktif' },
  { id: 's2b-02', nisn: '0141234004', nis: '3004', nama: 'Gilang Ramadhan', jenisKelamin: 'L', kelas: '2B', agama: 'Islam', status: 'Aktif' },

  // Kelas 3A
  { id: 's3a-01', nisn: '0131234001', nis: '2901', nama: 'Hendra Gunawan', jenisKelamin: 'L', kelas: '3A', agama: 'Islam', status: 'Aktif' },
  { id: 's3a-02', nisn: '0131234002', nis: '2902', nama: 'Indah Permatasari', jenisKelamin: 'P', kelas: '3A', agama: 'Islam', status: 'Aktif' },

  // Kelas 3B
  { id: 's3b-01', nisn: '0131234003', nis: '2903', nama: 'Jihan Khairunnisa', jenisKelamin: 'P', kelas: '3B', agama: 'Islam', status: 'Aktif' },
  { id: 's3b-02', nisn: '0131234004', nis: '2904', nama: 'Kalingga Wardhana', jenisKelamin: 'L', kelas: '3B', agama: 'Islam', status: 'Aktif' },

  // Kelas 4A
  { id: 's4a-01', nisn: '0121234001', nis: '2801', nama: 'Joko Tri Prasetyo', jenisKelamin: 'L', kelas: '4A', agama: 'Islam', status: 'Aktif' },
  { id: 's4a-02', nisn: '0121234002', nis: '2802', nama: 'Kartika Sari Wulandari', jenisKelamin: 'P', kelas: '4A', agama: 'Islam', status: 'Aktif' },

  // Kelas 4B
  { id: 's4b-01', nisn: '0121234003', nis: '2803', nama: 'Kevin Aditya Nugraha', jenisKelamin: 'L', kelas: '4B', agama: 'Islam', status: 'Aktif' },
  { id: 's4b-02', nisn: '0121234004', nis: '2804', nama: 'Lestari Ningsih', jenisKelamin: 'P', kelas: '4B', agama: 'Islam', status: 'Aktif' },

  // Kelas 5A
  { id: 's5a-01', nisn: '0111234001', nis: '2701', nama: 'Luthfi Hakim', jenisKelamin: 'L', kelas: '5A', agama: 'Islam', status: 'Aktif' },
  { id: 's5a-02', nisn: '0111234002', nis: '2702', nama: 'Mega Budiarti', jenisKelamin: 'P', kelas: '5A', agama: 'Islam', status: 'Aktif' },

  // Kelas 5B
  { id: 's5b-01', nisn: '0111234003', nis: '2703', nama: 'Maulana Malik Ibrahim', jenisKelamin: 'L', kelas: '5B', agama: 'Islam', status: 'Aktif' },
  { id: 's5b-02', nisn: '0111234004', nis: '2704', nama: 'Nadya Safitri', jenisKelamin: 'P', kelas: '5B', agama: 'Islam', status: 'Aktif' },

  // Kelas 6A
  { id: 's6a-01', nisn: '0101234001', nis: '2601', nama: 'Naufal Al-Ghifari', jenisKelamin: 'L', kelas: '6A', agama: 'Islam', status: 'Aktif' },
  { id: 's6a-02', nisn: '0101234002', nis: '2602', nama: 'Olivia Salsabila', jenisKelamin: 'P', kelas: '6A', agama: 'Islam', status: 'Aktif' },

  // Kelas 6B
  { id: 's6b-01', nisn: '0101234003', nis: '2603', nama: 'Pandu Wicaksana', jenisKelamin: 'L', kelas: '6B', agama: 'Islam', status: 'Aktif' },
  { id: 's6b-02', nisn: '0101234004', nis: '2604', nama: 'Qonita Rahma Azzahra', jenisKelamin: 'P', kelas: '6B', agama: 'Islam', status: 'Aktif' },
];

export function generateDefaultJadwalForClass(kelas: string): JadwalSlot[] {
  const scheduleMatrix: Record<HariSekolah, string[]> = {
    Senin: [
      'Upacara Bendera',
      'Pendidikan Pancasila',
      'Pendidikan Pancasila',
      // Istirahat 1 (08.55 - 09.10)
      'Bahasa Indonesia',
      'Bahasa Indonesia',
      // Istirahat 2 (10.20 - 10.35)
      'Matematika',
      'Matematika',
      // Istirahat 3 / Ishoma (11.45 - 12.20)
      'Seni Rupa',
      'Seni Rupa',
      'Literasi & Karakter',
    ],
    Selasa: [
      'Matematika',
      'Matematika',
      'Bahasa Indonesia',
      // Istirahat 1
      'Bahasa Indonesia',
      'IPAS (Sains & Sosial)',
      // Istirahat 2
      'IPAS (Sains & Sosial)',
      'Bahasa Jawa',
      // Istirahat 3 / Ishoma
      'Bahasa Jawa',
      'Bimbingan Remedial',
      'Pembiasaan Minat Bakat',
    ],
    Rabu: [
      'Pendidikan Agama & Budi Pekerti',
      'Pendidikan Agama & Budi Pekerti',
      'Pendidikan Agama & Budi Pekerti',
      // Istirahat 1
      'Bahasa Indonesia',
      'Bahasa Indonesia',
      // Istirahat 2
      'Matematika',
      'Matematika',
      // Istirahat 3 / Ishoma
      'P5 (Projek Profil Pelajar Pancasila)',
      'P5 (Projek Profil Pelajar Pancasila)',
      'P5 (Projek Profil Pelajar Pancasila)',
    ],
    Kamis: [
      'PJOK (Pendidikan Jasmani)',
      'PJOK (Pendidikan Jasmani)',
      'PJOK (Pendidikan Jasmani)',
      // Istirahat 1
      'IPAS (Sains & Sosial)',
      'IPAS (Sains & Sosial)',
      // Istirahat 2
      'Bahasa Inggris',
      'Bahasa Inggris',
      // Istirahat 3 / Ishoma
      'Seni Musik',
      'Seni Musik',
      'Penguatan Numerasi',
    ],
    Jumat: [
      'Senam Pagi / Jumat Bersih & Religi',
      'Pendidikan Pancasila',
      'Pendidikan Pancasila',
      // Istirahat 1
      'Bahasa Indonesia',
      'IPAS / Sains Terpadu',
      // Istirahat 2
      'Bimbingan & Refleksi Pekanan',
      'Persiapan Sholat Jumat / Kepulangan',
      // Istirahat 3 / Sholat Jumat & Istirahat (11.45 - 12.20)
      'Sholat Jumat / Istirahat Siang',
      'Ekstrakurikuler Pramuka',
      'Ekstrakurikuler Pramuka',
    ],
  };

  const slots: JadwalSlot[] = [];
  const days: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  for (const hari of days) {
    const mapels = scheduleMatrix[hari];
    for (let jp = 1; jp <= 10; jp++) {
      const mapelName = mapels[jp - 1] || 'Kegiatan Mandiri';
      slots.push({
        id: `${kelas}-${hari}-${jp}`,
        kelas,
        hari,
        jp,
        mapel: mapelName,
        guruNama: mapelName.includes('PJOK')
          ? 'Guru PJOK'
          : mapelName.includes('Agama')
          ? 'Guru PAI'
          : `Wali Kelas ${kelas}`,
        ruang: mapelName.includes('PJOK') || mapelName.includes('Upacara') || mapelName.includes('Senam')
          ? 'Lapangan'
          : `Ruang Kelas ${kelas}`,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return slots;
}

export const INITIAL_JADWAL: JadwalSlot[] = DAFTAR_KELAS.flatMap((k) =>
  generateDefaultJadwalForClass(k)
);

