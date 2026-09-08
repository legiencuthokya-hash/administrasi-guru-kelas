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
import { db, isFirebaseReady, handleFirestoreError, OperationType } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

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
      handleFirestoreError(err, OperationType.WRITE, 'pengaturan/config');
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
      handleFirestoreError(err, OperationType.WRITE, 'users');
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
      handleFirestoreError(err, OperationType.WRITE, 'siswa');
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
      handleFirestoreError(err, OperationType.WRITE, 'absensi');
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
      handleFirestoreError(err, OperationType.WRITE, 'nilai');
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
      handleFirestoreError(err, OperationType.WRITE, 'jurnal');
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
      handleFirestoreError(err, OperationType.WRITE, 'bimbingan');
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

// Cloud Firestore Synchronization (Designed to strictly conserve read/write quota)
export async function syncFromFirestore(user: User): Promise<{
  success: boolean;
  message: string;
  counts?: { [key: string]: number };
}> {
  if (!db) {
    return { success: false, message: 'Koneksi Firestore belum siap.' };
  }

  try {
    const counts: { [key: string]: number } = {};

    // 1. Always pull latest school settings
    try {
      const settingsSnap = await getDoc(doc(db, 'pengaturan', 'config'));
      if (settingsSnap.exists()) {
        const cloudSettings = settingsSnap.data() as SchoolSettings;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cloudSettings));
        counts.pengaturan = 1;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'pengaturan/config');
    }

    if (user.role === 'admin') {
      // Admin: Pull all collections
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (!usersSnap.empty) {
          const list = usersSnap.docs.map((d) => d.data() as User);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
          counts.users = list.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      }

      try {
        const siswaSnap = await getDocs(collection(db, 'siswa'));
        if (!siswaSnap.empty) {
          const list = siswaSnap.docs.map((d) => d.data() as Siswa);
          localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
          counts.siswa = list.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'siswa');
      }

      try {
        const absensiSnap = await getDocs(collection(db, 'absensi'));
        if (!absensiSnap.empty) {
          const list = absensiSnap.docs.map((d) => d.data() as Absensi);
          localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
          counts.absensi = list.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'absensi');
      }

      try {
        const nilaiSnap = await getDocs(collection(db, 'nilai'));
        if (!nilaiSnap.empty) {
          const list = nilaiSnap.docs.map((d) => d.data() as Nilai);
          localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify(list));
          counts.nilai = list.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'nilai');
      }

      try {
        const jurnalSnap = await getDocs(collection(db, 'jurnal'));
        if (!jurnalSnap.empty) {
          const list = jurnalSnap.docs.map((d) => d.data() as JurnalMengajar);
          localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify(list));
          counts.jurnal = list.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'jurnal');
      }

      try {
        const bimbinganSnap = await getDocs(collection(db, 'bimbingan'));
        if (!bimbinganSnap.empty) {
          const list = bimbinganSnap.docs.map((d) => d.data() as BimbinganSiswa);
          localStorage.setItem(STORAGE_KEYS.BIMBINGAN, JSON.stringify(list));
          counts.bimbingan = list.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'bimbingan');
      }

      return {
        success: true,
        message: 'Berhasil menyinkronkan seluruh database instansi dari Cloud Firestore.',
        counts,
      };
    } else {
      // Guru: Strictly pull only assigned class / records to conserve quota
      if (isGuruMapelUmum(user.tanggungJawab)) {
        try {
          const siswaSnap = await getDocs(collection(db, 'siswa'));
          if (!siswaSnap.empty) {
            const list = siswaSnap.docs.map((d) => d.data() as Siswa);
            localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(list));
            counts.siswa = list.length;
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'siswa');
        }
      } else {
        try {
          const qSiswa = query(collection(db, 'siswa'), where('kelas', '==', user.tanggungJawab));
          const snap = await getDocs(qSiswa);
          if (!snap.empty) {
            const teacherSiswa = snap.docs.map((d) => d.data() as Siswa);
            const allLocal = getStoredSiswa().filter((s) => s.kelas !== user.tanggungJawab);
            const merged = [...allLocal, ...teacherSiswa];
            localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(merged));
            counts.siswa = teacherSiswa.length;
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.LIST, 'siswa');
        }
      }

      // Absensi for this class or teacher
      try {
        const qAbsen = isGuruMapelUmum(user.tanggungJawab)
          ? query(collection(db, 'absensi'), where('guruId', '==', user.id))
          : query(collection(db, 'absensi'), where('kelas', '==', user.tanggungJawab));
        const snap = await getDocs(qAbsen);
        if (!snap.empty) {
          const cloudAbsen = snap.docs.map((d) => d.data() as Absensi);
          const otherLocal = getStoredAbsensi().filter(
            (a) => a.guruId !== user.id && a.kelas !== user.tanggungJawab
          );
          localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify([...otherLocal, ...cloudAbsen]));
          counts.absensi = cloudAbsen.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'absensi');
      }

      // Nilai
      try {
        const qNilai = query(collection(db, 'nilai'), where('guruId', '==', user.id));
        const snap = await getDocs(qNilai);
        if (!snap.empty) {
          const cloudNilai = snap.docs.map((d) => d.data() as Nilai);
          const otherLocal = getStoredNilai().filter((n) => n.guruId !== user.id);
          localStorage.setItem(STORAGE_KEYS.NILAI, JSON.stringify([...otherLocal, ...cloudNilai]));
          counts.nilai = cloudNilai.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'nilai');
      }

      // Jurnal
      try {
        const qJurnal = query(collection(db, 'jurnal'), where('guruId', '==', user.id));
        const snap = await getDocs(qJurnal);
        if (!snap.empty) {
          const cloudJurnal = snap.docs.map((d) => d.data() as JurnalMengajar);
          const otherLocal = getStoredJurnal().filter((j) => j.guruId !== user.id);
          localStorage.setItem(STORAGE_KEYS.JURNAL, JSON.stringify([...otherLocal, ...cloudJurnal]));
          counts.jurnal = cloudJurnal.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'jurnal');
      }

      // Bimbingan
      try {
        const qBimb = query(collection(db, 'bimbingan'), where('guruId', '==', user.id));
        const snap = await getDocs(qBimb);
        if (!snap.empty) {
          const cloudBimb = snap.docs.map((d) => d.data() as BimbinganSiswa);
          const otherLocal = getStoredBimbingan().filter((b) => b.guruId !== user.id);
          localStorage.setItem(STORAGE_KEYS.BIMBINGAN, JSON.stringify([...otherLocal, ...cloudBimb]));
          counts.bimbingan = cloudBimb.length;
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'bimbingan');
      }

      return {
        success: true,
        message: `Berhasil menyinkronkan data tugas untuk ${user.tanggungJawab} dari Cloud Firestore.`,
        counts,
      };
    }
  } catch (error) {
    const err = handleFirestoreError(error, OperationType.GET, null);
    return {
      success: false,
      message: `Gagal menyinkronkan dari Firestore: ${err.error}`,
    };
  }
}

// Backup / Seed All Local Data to Cloud Firestore (Admin function)
export async function backupAllToFirestore(): Promise<{
  success: boolean;
  message: string;
  totalRecords: number;
}> {
  if (!db) {
    return { success: false, message: 'Koneksi Firestore belum siap.', totalRecords: 0 };
  }

  try {
    let total = 0;

    // 1. Settings
    const settings = getStoredSettings();
    await setDoc(doc(db, 'pengaturan', 'config'), settings);
    total += 1;

    // 2. Users
    const users = getStoredUsers();
    for (const u of users) {
      await setDoc(doc(db, 'users', u.id), u);
      total += 1;
    }

    // 3. Siswa
    const siswa = getStoredSiswa();
    for (const s of siswa) {
      await setDoc(doc(db, 'siswa', s.id), s);
      total += 1;
    }

    // 4. Absensi
    const absensi = getStoredAbsensi();
    for (const a of absensi) {
      await setDoc(doc(db, 'absensi', a.id), a);
      total += 1;
    }

    // 5. Nilai
    const nilai = getStoredNilai();
    for (const n of nilai) {
      await setDoc(doc(db, 'nilai', n.id), n);
      total += 1;
    }

    // 6. Jurnal
    const jurnal = getStoredJurnal();
    for (const j of jurnal) {
      await setDoc(doc(db, 'jurnal', j.id), j);
      total += 1;
    }

    // 7. Bimbingan
    const bimbingan = getStoredBimbingan();
    for (const b of bimbingan) {
      await setDoc(doc(db, 'bimbingan', b.id), b);
      total += 1;
    }

    return {
      success: true,
      message: `Berhasil mencadangkan ${total} data ke Cloud Firestore secara lengkap.`,
      totalRecords: total,
    };
  } catch (error) {
    const err = handleFirestoreError(error, OperationType.WRITE, null);
    return {
      success: false,
      message: `Gagal mencadangkan ke Firestore: ${err.error}`,
      totalRecords: 0,
    };
  }
}
