# Sistem Manajemen Usulan (e-Pokir & e-Hibah)

Aplikasi web full-stack untuk mengelola, memvalidasi, dan melacak data usulan (Pokir dan Hibah) dengan antarmuka yang modern, cepat, dan responsif.

## 🌟 Fitur Utama

*   **Dashboard Interaktif**: Ringkasan statistik usulan (Total Usulan, Hibah, Pokir) dan status validasinya (Diterima, Ditolak, Dikembalikan).
*   **Manajemen Data Usulan**: Tabel data usulan yang dilengkapi dengan fitur pencarian global di seluruh kolom.
*   **Import Data Massal**: Mendukung import data usulan dalam jumlah besar dengan mudah.
*   **Sistem Validasi**: 
    *   Validasi usulan dengan status: **Terima**, **Tolak**, atau **Kembalikan**.
    *   Pewajiban pengisian **Anggaran**, **Volume**, dan **Satuan** untuk usulan yang diterima.
    *   Pencatatan catatan/rekomendasi SKPD secara detail.
*   **Pencarian Cerdas**: Fitur pencarian yang mencakup seluruh kolom data (ID, Pengusul, Isi Usulan, OPD Tujuan, dll).

## 💻 Tech Stack

**Frontend:**
*   [React 19](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS v4](https://tailwindcss.com/)
*   [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
*   [Lucide Icons](https://lucide.dev/)

**Backend & Database:**
*   [Express.js](https://expressjs.com/)
*   [SQLite3](https://github.com/WiseLibs/better-sqlite3) (via `better-sqlite3`)
*   [esbuild](https://esbuild.github.io/) (untuk kompilasi server production)

---

## 📖 Panduan Pengguna (User Guide)

### 1. Melihat Dashboard
Halaman utama menampilkan ringkasan data. Anda dapat melihat berapa banyak usulan yang masuk, serta status validasinya secara *real-time*.

### 2. Mengelola Usulan
Buka menu **Data Usulan** untuk melihat daftar lengkap.
*   **Pencarian**: Gunakan kotak pencarian di bagian atas tabel untuk mencari kata kunci apa saja (nama pengusul, ID, OPD, dll).
*   **Validasi**: Klik tombol **Validasi** pada baris usulan yang diinginkan.
    *   Jika memilih **Terima**, Anda *wajib* mengisi nominal Anggaran, Volume, dan Satuan.
    *   Jika memilih **Tolak** atau **Kembalikan**, Anda hanya diwajibkan mengisi Catatan/Rekomendasi (minimal 10 karakter).

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
├── server.ts          # Entry point backend Express.js & konfigurasi SQLite
├── usulan.db          # File database SQLite (terbuat otomatis saat server berjalan)
├── package.json       # Konfigurasi dependensi dan script NPM
└── vite.config.ts     # Konfigurasi Vite
```

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat *Pull Request* atau buka *Issue* jika Anda menemukan bug atau memiliki saran fitur baru.

## 📄 Lisensi

[MIT License](LICENSE)
