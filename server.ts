import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const db = new Database('usulan.db');

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS usulan (
    id_usulan TEXT PRIMARY KEY,
    tanggal_usul TEXT,
    pengusul TEXT,
    usulan TEXT,
    masalah TEXT,
    alamat_lokasi TEXT,
    usulan_ke TEXT,
    opd_tujuan_awal TEXT,
    opd_tujuan_akhir TEXT,
    status_existing TEXT,
    catatan TEXT,
    rekomendasi_sekwan TEXT,
    rekomendasi_mitra TEXT,
    rekomendasi_skpd TEXT,
    rekomendasi_tapd TEXT,
    volume TEXT,
    satuan TEXT,
    anggaran TEXT,
    jenis_belanja TEXT,
    sub_kegiatan TEXT,
    kategori TEXT,
    status_validasi TEXT DEFAULT 'DRAFT',
    catatan_validasi TEXT,
    tanggal_validasi TEXT,
    validator TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API Routes

// Get Dashboard Stats
app.get('/api/stats', (req, res) => {
  try {
    const total_usulan = (db.prepare("SELECT COUNT(*) as count FROM usulan").get() as any).count;
    const total_hibah = (db.prepare("SELECT COUNT(*) as count FROM usulan WHERE kategori = 'HIBAH'").get() as any).count;
    const total_pokir = (db.prepare("SELECT COUNT(*) as count FROM usulan WHERE kategori = 'POKIR'").get() as any).count;
    const diterima = (db.prepare("SELECT COUNT(*) as count FROM usulan WHERE status_validasi = 'DITERIMA'").get() as any).count;
    const ditolak = (db.prepare("SELECT COUNT(*) as count FROM usulan WHERE status_validasi = 'DITOLAK'").get() as any).count;
    const dikembalikan = (db.prepare("SELECT COUNT(*) as count FROM usulan WHERE status_validasi = 'DIKEMBALIKAN'").get() as any).count;

    res.json({
      total_usulan,
      total_hibah,
      total_pokir,
      diterima,
      ditolak,
      dikembalikan
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get Usulan List
app.get('/api/usulan', (req, res) => {
  const { kategori, search, status, opd, page = 1, limit = 10 } = req.query;
  
  let query = "SELECT * FROM usulan WHERE 1=1";
  const params: any[] = [];

  if (kategori) {
    query += " AND kategori = ?";
    params.push(kategori);
  }
  if (status && status !== 'ALL') {
    query += " AND status_validasi = ?";
    params.push(status);
  }
  if (opd && opd !== 'ALL') {
    query += " AND opd_tujuan_akhir = ?";
    params.push(opd);
  }
  if (search) {
    const searchCols = [
      'id_usulan', 'tanggal_usul', 'pengusul', 'usulan', 'masalah',
      'alamat_lokasi', 'usulan_ke', 'opd_tujuan_awal', 'opd_tujuan_akhir',
      'status_existing', 'catatan', 'rekomendasi_sekwan', 'rekomendasi_mitra',
      'rekomendasi_skpd', 'rekomendasi_tapd', 'volume', 'satuan', 'anggaran',
      'jenis_belanja', 'sub_kegiatan', 'status_validasi', 'catatan_validasi',
      'validator'
    ];
    const likeClauses = searchCols.map(col => `${col} LIKE ?`).join(' OR ');
    query += ` AND (${likeClauses})`;
    searchCols.forEach(() => params.push(`%${search}%`));
  }

  query += " ORDER BY created_at DESC";

  try {
    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
    const data = db.prepare(paginatedQuery).all(...params, Number(limit), offset);
    
    // Total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    const total = (db.prepare(countQuery).get(...params) as any).count;

    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Check Duplicates
app.post('/api/usulan/check-duplicates', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT id_usulan FROM usulan WHERE id_usulan IN (${placeholders})`;
    const existing = db.prepare(query).all(...ids).map((row: any) => row.id_usulan);
    res.json({ existing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check duplicates' });
  }
});

// Import Usulan
app.post('/api/usulan/import', (req, res) => {
  const { data } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const insert = db.prepare(`
      INSERT INTO usulan (
        id_usulan, tanggal_usul, pengusul, usulan, masalah, alamat_lokasi,
        usulan_ke, opd_tujuan_awal, opd_tujuan_akhir, status_existing, catatan,
        rekomendasi_sekwan, rekomendasi_mitra, rekomendasi_skpd, rekomendasi_tapd,
        volume, satuan, anggaran, jenis_belanja, sub_kegiatan, kategori, status_validasi
      ) VALUES (
        @id_usulan, @tanggal_usul, @pengusul, @usulan, @masalah, @alamat_lokasi,
        @usulan_ke, @opd_tujuan_awal, @opd_tujuan_akhir, @status_existing, @catatan,
        @rekomendasi_sekwan, @rekomendasi_mitra, @rekomendasi_skpd, @rekomendasi_tapd,
        @volume, @satuan, @anggaran, @jenis_belanja, @sub_kegiatan, @kategori, 'DRAFT'
      )
    `);

    const insertMany = db.transaction((usulans) => {
      let imported = 0;
      for (const usulan of usulans) {
        try {
          insert.run(usulan);
          imported++;
        } catch (err: any) {
          // Skip duplicates silently during transaction if any slipped through
          if (err.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            throw err;
          }
        }
      }
      return imported;
    });

    const importedCount = insertMany(data);
    res.json({ success: true, imported: importedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Validate Usulan
app.post('/api/usulan/:id/validate', (req, res) => {
  const { id } = req.params;
  const { status, catatan, validator, anggaran } = req.body;

  if (!status || !catatan || catatan.length < 10) {
    return res.status(400).json({ error: 'Status and catatan (min 10 chars) are required' });
  }

  if (status === 'DITERIMA' && (!anggaran || anggaran.trim() === '' || anggaran === '0')) {
    return res.status(400).json({ error: 'Anggaran is required when accepting usulan' });
  }

  try {
    const update = db.prepare(`
      UPDATE usulan 
      SET status_validasi = ?, catatan_validasi = ?, rekomendasi_skpd = ?, tanggal_validasi = CURRENT_TIMESTAMP, validator = ?, anggaran = ?
      WHERE id_usulan = ?
    `);
    
    const result = update.run(status, catatan, catatan, validator || 'System', anggaran || null, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usulan not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate usulan' });
  }
});

// Bulk Delete
app.post('/api/usulan/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM usulan WHERE id_usulan IN (${placeholders})`;
    const result = db.prepare(query).run(...ids);
    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete usulan' });
  }
});

// Clear All Data
app.delete('/api/usulan/clear', (req, res) => {
  const { kategori } = req.query;
  
  try {
    let result;
    if (kategori) {
      result = db.prepare('DELETE FROM usulan WHERE kategori = ?').run(kategori);
    } else {
      result = db.prepare('DELETE FROM usulan').run();
    }
    res.json({ success: true, deleted: result.changes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
