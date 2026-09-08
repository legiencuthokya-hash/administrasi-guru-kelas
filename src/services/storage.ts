import {
  Absensi,
  BimbinganSiswa,
  JurnalMengajar,
  Nilai,
  SchoolSettings,
  Siswa,
  TanggungJawab,
  User,
} from '../types';
import { INITIAL_SCHOOL_SETTINGS, INITIAL_SISWA, INITIAL_USERS } from './initialData';
import { db, isFirebaseReady } from './firebase';
import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  USERS: 'sdn3_users_v1',
  SISWA: 'sdn3_siswa_v1',
  ABSENSI: 'sdn3_absensi_v1',
  NILAI: 'sdn3_nilai_v1',
  JURNAL: 'sdn3_jurnal_v1',
  BIMBINGAN: 'sdn3_bimbingan_v1',
  SETTINGS: 'sdn3_settings_v1',
  CURRENT_USER: 'sdn3_current_user_v1',
};

// Check if user is subject teacher that teaches all classes
export function isGuruMapelUmum(tanggungJawab: TanggungJawab): boolean {
  return [
    'Pendidikan Agama Islam',
    'Pendidikan Agama Kristen',
    'Pendidikan Agama Katolik',
    'Pendidikan agama Hindu',
    'Pendidikan agama Budha',
    'PJOK',
  ].includes(tanggungJawab);
}

// 1. Settings
export function getStoredSettings(): SchoolSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SCHOOL_SETTINGS));
  return INITIAL_SCHOOL_SETTINGS;
}

export async function saveStoredSettings(settings: SchoolSettings): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (isFirebaseReady && db) {
    try {
      await setDoc(doc(db, 'pengaturan', 'config'), settings);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// 2. Users (Guru & Admin)
export function getStoredUsers(): User[] {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

export async function saveStoredUsers(users: User[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  if (isFirebaseReady && db) {
    try {
      for (const u of users) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// 3. Siswa
export function getStoredSiswa(): Siswa[] {
  const data = localStorage.getItem(STORAGE_KEYS.SISWA);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(INITIAL_SISWA));
  return INITIAL_SISWA;
}

export async function saveStoredSiswa(siswaList: Siswa[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(siswaList));
  if (isFirebaseReady && db) {
    try {
      for (const s of siswaList) {
        await setDoc(doc(db, 'siswa', s.id), s);
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// Filter students based on authorization rules:
// - Admin: All students
// - Guru Agama & PJOK: All students (because they teach all classes)
// - Guru Kelas: Only students in their respective assigned class
export function getFilteredSiswa(user: User, siswaList: Siswa[]): Siswa[] {
  if (user.role === 'admin') {
    return siswaList;
  }
  if (isGuruMapelUmum(user.tanggungJawab)) {
    return siswaList;
  }
  return siswaList.filter((s) => s.kelas === user.tanggungJawab);
}

// 4. Absensi
export function getStoredAbsensi(): Absensi[] {
  const data = localStorage.getItem(STORAGE_KEYS.ABSENSI);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function saveStoredAbsensi(absensiList: Absensi[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(absensiList));
  if (isFirebaseReady && db) {
    try {
      for (const a of absensiList) {
        await setDoc(doc(db, 'absensi', a.id), a);
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// 5. Nilai
export function getStoredNilai(): Nilai[] {
  const data = localStorage.getItem(STORAGE_KEYS.NILAI);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function saveStoredNilai(nilaiList: Nilai[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(nilaiList));
  if (isFirebaseReady && db) {
    try {
      for (const n of nilaiList) {
        await setDoc(doc(db, 'nilai', n.id), n);
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// 6. Jurnal Mengajar
export function getStoredJurnal(): JurnalMengajar[] {
  const data = localStorage.getItem(STORAGE_KEYS.JURNAL);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function saveStoredJurnal(jurnalList: JurnalMengajar[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(jurnalList));
  if (isFirebaseReady && db) {
    try {
      for (const j of jurnalList) {
        await setDoc(doc(db, 'jurnal', j.id), j);
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// 7. Bimbingan Siswa
export function getStoredBimbingan(): BimbinganSiswa[] {
  const data = localStorage.getItem(STORAGE_KEYS.BIMBINGAN);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export async function saveStoredBimbingan(bimbinganList: BimbinganSiswa[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.BIMBINGAN, JSON.stringify(bimbinganList));
  if (isFirebaseReady && db) {
    try {
      for (const b of bimbinganList) {
        await setDoc(doc(db, 'bimbingan', b.id), b);
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// Current Session
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Teacher Danger Zone: Delete all data created by this teacher (absensi, nilai, jurnal, bimbingan)
export async function deleteTeacherData(guruId: string, kelas?: string): Promise<{
  absensiCount: number;
  nilaiCount: number;
  jurnalCount: number;
  bimbinganCount: number;
}> {
  const allAbsensi = getStoredAbsensi();
  const keptAbsensi = allAbsensi.filter((a) => a.guruId !== guruId && (!kelas || a.kelas !== kelas));
  const absensiCount = allAbsensi.length - keptAbsensi.length;
  await saveStoredAbsensi(keptAbsensi);

  const allNilai = getStoredNilai();
  const keptNilai = allNilai.filter((n) => n.guruId !== guruId && (!kelas || n.kelas !== kelas));
  const nilaiCount = allNilai.length - keptNilai.length;
  await saveStoredNilai(keptNilai);

  const allJurnal = getStoredJurnal();
  const keptJurnal = allJurnal.filter((j) => j.guruId !== guruId);
  const jurnalCount = allJurnal.length - keptJurnal.length;
  await saveStoredJurnal(keptJurnal);

  const allBimbingan = getStoredBimbingan();
  const keptBimbingan = allBimbingan.filter((b) => b.guruId !== guruId && (!kelas || b.kelas !== kelas));
  const bimbinganCount = allBimbingan.length - keptBimbingan.length;
  await saveStoredBimbingan(keptBimbingan);

  return { absensiCount, nilaiCount, jurnalCount, bimbinganCount };
}

// Admin Danger Zone: Delete all teachers
export async function deleteAllTeachers(): Promise<number> {
  const users = getStoredUsers();
  const remaining = users.filter((u) => u.role === 'admin');
  const count = users.length - remaining.length;
  await saveStoredUsers(remaining);
  return count;
}

// Admin Danger Zone: Delete all students
export async function deleteAllStudents(): Promise<number> {
  const students = getStoredSiswa();
  const count = students.length;
  await saveStoredSiswa([]);
  return count;
}

// CSV Template for Siswa
export function getSiswaCsvTemplate(): string {
  return 'NISN,NIS,NAMA,JENIS_KELAMIN(L/P),KELAS(Kelas 1-6),AGAMA(Islam/Kristen/Katolik/Hindu/Budha/Konghucu)\n0151234010,3110,Ahmad Dani Saputra,L,Kelas 1,Islam\n0151234011,3111,Bella Safira,P,Kelas 1,Islam\n';
}

// CSV Template for Guru
export function getGuruCsvTemplate(): string {
  return 'USERNAME,NAMA,NIP,TANGGUNG_JAWAB\nguru_contoh1,Siti Aminah S.Pd,198001012005012001,Kelas 1\nguru_contoh2,Rahmat Hidayat S.Pd.I,198505052010011002,Pendidikan Agama Islam\n';
}

// Parse CSV text to rows
export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    // Handle comma or semicolon separator
    const delimiter = line.includes(';') ? ';' : ',';
    return line.split(delimiter).map((col) => col.trim().replace(/^["']|["']$/g, ''));
  });
}
