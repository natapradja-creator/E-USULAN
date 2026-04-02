import express from 'express';
import path from 'path';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize PostgreSQL Database
let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/usulan';

// Fix for Neon/Vercel Postgres channel_binding issue with node-postgres
if (connectionString.includes('channel_binding=require')) {
  connectionString = connectionString.replace('?channel_binding=require&', '?')
                                     .replace('&channel_binding=require', '')
                                     .replace('?channel_binding=require', '');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') || connectionString.includes('vercel-storage.com') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined
});

// API Routes

// Init DB Endpoint
app.get('/api/init-db', async (req, res) => {
  try {
    await pool.query(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    res.json({ status: 'ok', message: 'Database initialized successfully' });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ status: 'ok', message: 'API is running', db: pool ? 'configured' : 'missing' });
});

// Get Dashboard Stats
app.get('/api/stats', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const total_usulan = await pool.query("SELECT COUNT(*) as count FROM usulan");
    const total_hibah = await pool.query("SELECT COUNT(*) as count FROM usulan WHERE kategori = 'HIBAH'");
    const total_pokir = await pool.query("SELECT COUNT(*) as count FROM usulan WHERE kategori = 'POKIR'");
    const diterima = await pool.query("SELECT COUNT(*) as count FROM usulan WHERE status_validasi = 'DITERIMA'");
    const ditolak = await pool.query("SELECT COUNT(*) as count FROM usulan WHERE status_validasi = 'DITOLAK'");
    const dikembalikan = await pool.query("SELECT COUNT(*) as count FROM usulan WHERE status_validasi = 'DIKEMBALIKAN'");

    res.json({
      total_usulan: parseInt(total_usulan.rows[0].count),
      total_hibah: parseInt(total_hibah.rows[0].count),
      total_pokir: parseInt(total_pokir.rows[0].count),
      diterima: parseInt(diterima.rows[0].count),
      ditolak: parseInt(ditolak.rows[0].count),
      dikembalikan: parseInt(dikembalikan.rows[0].count)
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: `[DB_ERROR] ${error.message || 'Unknown error'}` });
  }
});

// Get Usulan List
app.get('/api/usulan', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { kategori, search, status, opd, page = 1, limit = 10 } = req.query;
  
  let query = "SELECT * FROM usulan WHERE 1=1";
  let countQueryStr = "SELECT COUNT(*) as count FROM usulan WHERE 1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (kategori) {
    query += ` AND kategori = $${paramIndex}`;
    countQueryStr += ` AND kategori = $${paramIndex}`;
    params.push(kategori);
    paramIndex++;
  }
  if (status && status !== 'ALL') {
    query += ` AND status_validasi = $${paramIndex}`;
    countQueryStr += ` AND status_validasi = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  if (opd && opd !== 'ALL') {
    query += ` AND opd_tujuan_akhir = $${paramIndex}`;
    countQueryStr += ` AND opd_tujuan_akhir = $${paramIndex}`;
    params.push(opd);
    paramIndex++;
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
    const likeClauses = searchCols.map(col => `${col} ILIKE $${paramIndex}`).join(' OR ');
    query += ` AND (${likeClauses})`;
    countQueryStr += ` AND (${likeClauses})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += " ORDER BY created_at DESC";

  try {
    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedQuery = `${query} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    const dataParams = [...params, Number(limit), offset];
    const { rows: data } = await pool.query(paginatedQuery, dataParams);
    
    const { rows: countRows } = await pool.query(countQueryStr, params);
    const total = parseInt(countRows[0].count);

    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Check Duplicates
app.post('/api/usulan/check-duplicates', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const query = `SELECT id_usulan FROM usulan WHERE id_usulan IN (${placeholders})`;
    const { rows } = await pool.query(query, ids);
    res.json({ existing: rows.map(r => r.id_usulan) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check duplicates' });
  }
});

// Import Usulan
app.post('/api/usulan/import', async (req, res) => {
  const { data } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let imported = 0;
    
    const query = `
      INSERT INTO usulan (
        id_usulan, tanggal_usul, pengusul, usulan, masalah, alamat_lokasi,
        usulan_ke, opd_tujuan_awal, opd_tujuan_akhir, status_existing, catatan,
        rekomendasi_sekwan, rekomendasi_mitra, rekomendasi_skpd, rekomendasi_tapd,
        volume, satuan, anggaran, jenis_belanja, sub_kegiatan, kategori, status_validasi
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'DRAFT'
      ) ON CONFLICT (id_usulan) DO NOTHING
    `;

    for (const usulan of data) {
      const values = [
        usulan.id_usulan, usulan.tanggal_usul, usulan.pengusul, usulan.usulan, usulan.masalah, usulan.alamat_lokasi,
        usulan.usulan_ke, usulan.opd_tujuan_awal, usulan.opd_tujuan_akhir, usulan.status_existing, usulan.catatan,
        usulan.rekomendasi_sekwan, usulan.rekomendasi_mitra, usulan.rekomendasi_skpd, usulan.rekomendasi_tapd,
        usulan.volume, usulan.satuan, usulan.anggaran, usulan.jenis_belanja, usulan.sub_kegiatan, usulan.kategori
      ];
      const result = await client.query(query, values);
      if (result.rowCount && result.rowCount > 0) {
        imported++;
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, imported });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to import data' });
  } finally {
    client.release();
  }
});

// Validate Usulan
app.post('/api/usulan/:id/validate', async (req, res) => {
  const { id } = req.params;
  const { status, catatan, validator, anggaran, volume, satuan } = req.body;

  if (!status || !catatan || catatan.length < 10) {
    return res.status(400).json({ error: 'Status and catatan (min 10 chars) are required' });
  }

  if (status === 'DITERIMA') {
    if (!anggaran || anggaran.trim() === '' || anggaran === '0') {
      return res.status(400).json({ error: 'Anggaran is required when accepting usulan' });
    }
    if (!volume || volume.trim() === '') {
      return res.status(400).json({ error: 'Volume is required when accepting usulan' });
    }
    if (!satuan || satuan.trim() === '') {
      return res.status(400).json({ error: 'Satuan is required when accepting usulan' });
    }
  }

  try {
    const query = `
      UPDATE usulan 
      SET status_validasi = $1, catatan_validasi = $2, rekomendasi_skpd = $3, tanggal_validasi = CURRENT_TIMESTAMP, validator = $4, anggaran = $5, volume = $6, satuan = $7
      WHERE id_usulan = $8
    `;
    
    const result = await pool.query(query, [
      status, 
      catatan, 
      catatan, 
      validator || 'System', 
      anggaran || null, 
      volume || null, 
      satuan || null, 
      id
    ]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usulan not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to validate usulan' });
  }
});

// Bulk Delete
app.post('/api/usulan/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const query = `DELETE FROM usulan WHERE id_usulan IN (${placeholders})`;
    const result = await pool.query(query, ids);
    res.json({ success: true, deleted: result.rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete usulan' });
  }
});

// Clear All Data
app.delete('/api/usulan/clear', async (req, res) => {
  const { kategori } = req.query;
  
  try {
    let result;
    if (kategori) {
      result = await pool.query('DELETE FROM usulan WHERE kategori = $1', [kategori]);
    } else {
      result = await pool.query('DELETE FROM usulan');
    }
    res.json({ success: true, deleted: result.rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if not running in Vercel serverless environment
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
