# Sistem Manajemen Usulan (e-Pokir, e-Hibah, & Musrembang)

Aplikasi web full-stack untuk mengelola, memvalidasi, dan melacak data usulan (Pokir, Hibah, dan Musrembang) dengan antarmuka yang modern, cepat, dan responsif.

## 🌟 Fitur Utama (Pembaruan Terkini)

*   **Dashboard Interaktif & Animatif**: Ringkasan statistik usulan (Total Usulan, Hibah, Pokir, Musrembang, dan Belum Diverifikasi/Draft). Dilengkapi animasi *hover* pada setiap card untuk pengalaman visual yang interaktif.
*   **Visualisasi Detail Status**: Kemampuan melihat rincian komposisi (breakdown) dari status Diterima, Ditolak, dan Dikembalikan melalui *visual progress bar* yang menunjukkan porsi kategori Hibah, Pokir, dan Musrembang secara instan.
*   **Manajemen Kategori Fleksibel**: Saat memvalidasi, pengguna dapat mengubah kategori usulan (misal dari Hibah dipindahkan silang ke Musrembang).
*   **Manajemen Data Usulan**: Tabel data usulan yang dilengkapi dengan fitur pencarian global di seluruh kolom.
*   **Import Data Massal (Excel)**: Mendukung import data usulan dalam jumlah besar dengan algoritma pencegahan duplikasi data.
*   **Sistem Validasi**: 
    *   Validasi usulan dengan status: **Terima**, **Tolak**, atau **Kembalikan**.
    *   Pewajiban pengisian **Anggaran**, **Volume**, dan **Satuan** untuk usulan yang diterima.
    *   Pencatatan catatan/rekomendasi SKPD secara detail.
*   **Pencarian & Pengurutan Cerdas**: Fitur pencarian yang mencakup seluruh kolom data, serta fitur penyortiran maju/mundur (ASC/DESC).
*   **Kolom Tabel Fleksibel (Resizable Columns)**: Lebar kolom tabel dapat diatur secara manual (drag-to-resize).
*   **Hapus Massal Aman**: Fitur hapus banyak data sekaligus dengan konfirmasi modal.

## 💻 Tech Stack

**Frontend:**
*   [React 19](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS v4](https://tailwindcss.com/)
*   [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
*   [Lucide Icons](https://lucide.dev/)

**Backend & Database:**
*   [Express.js](https://expressjs.com/)
*   [PostgreSQL](https://www.postgresql.org/) (via `pg`)
*   [esbuild](https://esbuild.github.io/) (untuk kompilasi server production)

---

## 📖 Panduan Pengguna (User Guide)

### 1. Melihat Dashboard
Halaman utama menampilkan ringkasan data. Anda dapat melihat proporsi secara detail (Hibah, Pokir, Musrembang) pada setiap card rekapan hasil validasi beserta perhitungan usulan yang masih berstatus "Belum Diverifikasi" (Draft).

### 2. Mengelola Usulan
Buka menu **Data Usulan** (atau menu spesifik Hibah/Pokir/Musrembang) untuk melihat daftar lengkap.
*   **Pencarian**: Gunakan kotak pencarian di bagian atas tabel.
*   **Ubah Lebar Kolom**: Arahkan kursor ke batas kanan judul kolom hingga muncul ikon panah, lalu geser.
*   **Validasi**: Klik tombol **Detail & Validasi** pada baris usulan.
    *   *Perubahan Kategori*: Pada menu detail validasi, Anda dapat mengubah kategori asal.
    *   Jika **Terima**, Anda *wajib* melengkapi nominal Anggaran, Volume, dan Satuan.
    *   Jika **Tolak/Kembalikan**, Anda wajid mengisi Catatan/Rekomendasi (minimal 10 karakter).

### 3. Panduan Import Data Excel (XLS/XLSX)
Sistem memiliki kecerdasan untuk membaca secara fleksibel judul-judul kolom yang ada di file Excel Anda (tanpa memedulikan susunan/urutan kolom, besar/kecil huruf, atau spasi). Agar baris di file Excel dibaca oleh sistem, **wajib** mengisi ID/Nomor Usulan. Jika baris tidak memiliki ID, baris tersebut akan dilewati.

Berikut adalah nama/judul pilar (header) standar yang dibaca oleh sistem (kiri) beserta variasi judul yang juga dimaklumi oleh sistem (kanan):

| Data yang Disimpan | Contoh Variasi Judul Kolom di Excel yang Diterima | Keterangan |
| :--- | :--- | :--- |
| **ID Usulan** | `ID Usulan`, `ID`, `No`, `Nomor`, `Kode` | **(Wajib)** Menjadi identifier valid/tidaknya baris. |
| **Tanggal Usul** | `Tanggal Usul`, `Tanggal`, `Date`, `Waktu` | (Opsional) Teks format tanggal. |
| **Pengusul** | `Pengusul`, `Nama`, `Nama Pengusul`, `Dari` | (Opsional) |
| **Usulan / Judul** | `Usulan`, `Nama Usulan`, `Judul`, `Kegiatan` | (Opsional) |
| **Masalah / Latar Belakang** | `Masalah`, `Latar Belakang`, `Deskripsi`, `Uraian` | (Opsional) |
| **Alamat / Lokasi** | `Alamat Lokasi`, `Alamat`, `Lokasi`, `Tempat` | (Opsional) |
| **Kecamatan** | `Kecamatan`, `Kec` | (Opsional) |
| **Usulan Ke** | `Usulan Ke`, `Ke` | (Opsional) |
| **OPD Tujuan Awal** | `OPD Tujuan Awal`, `OPD Awal`, `Tujuan Awal` | (Opsional) |
| **OPD Tujuan Akhir** | `OPD Tujuan Akhir`, `OPD Akhir`, `OPD`, `Tujuan` | (Opsional) |
| **Status Existing** | `Status Existing`, `Status` | (Opsional) |
| **Catatan**| `Catatan`, `Keterangan` | (Opsional) |
| **Sekwan (Rekomendasi)** | `Rekomendasi Sekwan`, `Sekwan` | (Opsional) |
| **Mitra (Rekomendasi)** | `Rekomendasi Mitra`, `Mitra` | (Opsional) |
| **SKPD (Rekomendasi)** | `Rekomendasi SKPD`, `SKPD` | (Opsional) |
| **TAPD (Rekomendasi)** | `Rekomendasi TAPD`, `TAPD` | (Opsional) |
| **Volume** | `Volume`, `Vol`, `Jumlah` | (Opsional) |
| **Satuan** | `Satuan`, `Unit` | (Opsional) |
| **Anggaran / Biaya** | `Anggaran`, `Biaya`, `Pagu`, `Rupiah`, `Harga` | (Opsional) Angka atau teks. |
| **Jenis Belanja** | `Jenis Belanja`, `Jenis` | (Opsional) |
| **Sub Kegiatan** | `Sub Kegiatan`, `Kegiatan` | (Opsional) |

*(Note: Sistem mengeliminasi huruf spesial saat mencocokkan, jadi "ID-Usulan" / "id_usulan!" akan tetap terbaca).*

---

## 🛠️ Panduan Developer (Developer Guide)

### Persyaratan Sistem
*   Node.js (versi 18 atau lebih baru)
*   NPM / Yarn / PNPM

### Instalasi

1. Clone repositori ini:
   ```bash
   git clone <url-repo-anda>
   cd <nama-folder-repo>
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

### Menjalankan di Lingkungan Development

Jalankan perintah berikut untuk memulai server frontend (Vite) dan backend (Express) secara bersamaan menggunakan `tsx`:

```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

### Build untuk Production

Untuk mem-build aplikasi untuk lingkungan production (menghasilkan file statis React dan mengkompilasi server Express):

```bash
npm run build
```

Setelah proses build selesai, jalankan server production dengan:

```bash
npm start
```

### Struktur Folder Utama

```text
├── src/
│   ├── components/    # Komponen React yang dapat digunakan kembali (termasuk shadcn/ui)
│   ├── lib/           # Fungsi utilitas dan konfigurasi API client
│   ├── pages/         # Komponen Halaman (Dashboard, UsulanPage)
│   ├── App.tsx        # Entry point aplikasi React
│   └── main.tsx       # Setup React DOM
├── api/
│   └── index.ts       # Entry point backend Express.js & konfigurasi PostgreSQL
├── package.json       # Konfigurasi dependensi dan script NPM
└── vite.config.ts     # Konfigurasi Vite
```

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat *Pull Request* atau buka *Issue* jika Anda menemukan bug atau memiliki saran fitur baru.

## 📄 Lisensi

[MIT License](LICENSE)

---

## 💡 Pembelajaran & Troubleshooting (Vercel + Neon DB)

Selama proses *deployment* aplikasi ini ke Vercel dengan database PostgreSQL dari Neon DB, terdapat beberapa isu krusial yang berhasil diselesaikan. Berikut adalah dokumentasi pembelajarannya agar tidak terulang di masa depan:

### 1. Masalah Parameter `channel_binding=require` pada Neon DB
*   **Masalah:** Neon DB (Vercel Postgres) baru-baru ini menambahkan parameter `?channel_binding=require` pada URL koneksi database mereka untuk alasan keamanan. Sayangnya, *library* standar Node.js yaitu `pg` (node-postgres) belum mendukung parameter ini secara bawaan. Hal ini menyebabkan koneksi ditolak secara diam-diam (*silent connection drop*).
*   **Solusi:** Sebelum memasukkan `DATABASE_URL` ke dalam `new Pool()`, kita harus membersihkan URL tersebut dari string `channel_binding=require` menggunakan `.replace()`.

### 2. Vercel Serverless Function Limit (Error 500: `FUNCTION_INVOCATION_FAILED`)
*   **Masalah:** Saat menggunakan Express.js di Vercel, Vercel akan mengubah *entry point* backend menjadi Serverless Function. Jika file backend (`server.ts`) mengimpor atau mem-bundle *library* development yang besar seperti `vite` (meskipun hanya dijalankan di mode development), ukuran Serverless Function akan membengkak melebihi batas maksimal Vercel (50MB). Akibatnya, fungsi akan *crash* saat *cold start* dan mengembalikan error 500 tanpa log yang jelas.
*   **Solusi:** Pisahkan kode backend murni (Express + Database) ke dalam file tersendiri (misal: `api/index.ts`). Biarkan `server.ts` hanya bertugas untuk menjalankan Vite di komputer lokal. Vercel hanya akan membaca folder `/api` sebagai Serverless Function tanpa ikut mem-bundle Vite.

### 3. Bahaya "Silent Errors" di Frontend
*   **Masalah:** Saat frontend melakukan *fetch* ke backend dan terjadi error, UI seringkali hanya menampilkan pesan generik secara *hardcode* (misal: "Gagal memuat data"). Hal ini sangat menyulitkan proses *debugging* karena kita tidak tahu apakah error berasal dari database, *timeout*, atau *syntax error*.
*   **Solusi:** Tangkap pesan error mentah (*raw error message*) dari backend (`error.message`) dan teruskan ke frontend. Tampilkan pesan error teknis tersebut di UI (bisa dalam kotak merah khusus) agar *developer* langsung tahu akar masalahnya tanpa harus menebak-nebak.

### 4. Vercel Routing (`vercel.json`)
*   **Masalah:** Vercel tidak tahu secara otomatis mana rute yang harus diarahkan ke backend Express dan mana yang diarahkan ke frontend React (SPA).
*   **Solusi:** Wajib membuat file `vercel.json` yang mendefinisikan *rewrites*. Semua *request* yang berawalan `/api/(.*)` diarahkan ke file backend (`api/index.ts`), sedangkan *request* lainnya diarahkan ke `/index.html` agar ditangani oleh React Router.

---

<p align="center">
  <i>created by Mukki - Natapradja Project &copy; 2026</i>
</p>