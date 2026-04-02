import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchUsulan, bulkDeleteUsulan, clearUsulan } from '@/lib/api';
import { ValidationModal } from './ValidationModal';
import { Search, ChevronLeft, ChevronRight, FileText, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface UsulanTableProps {
  kategori: 'HIBAH' | 'POKIR';
  refreshTrigger: number;
}

export function UsulanTable({ kategori, refreshTrigger }: UsulanTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(() => {
    const saved = localStorage.getItem(`usulan_limit_${kategori}`);
    return saved ? Number(saved) : 10;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [opd, setOpd] = useState('ALL');

  // Save limit to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`usulan_limit_${kategori}`, limit.toString());
  }, [limit, kategori]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Modal
  const [selectedUsulan, setSelectedUsulan] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsulan({
        kategori,
        search,
        status,
        opd,
        page,
        limit: limit === -1 ? 1000000 : limit
      });
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setSelectedIds([]); // Reset selection on page change
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Gagal memuat data');
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kategori, page, limit, status, opd, refreshTrigger]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DITERIMA': return <Badge className="bg-green-500">Diterima</Badge>;
      case 'DITOLAK': return <Badge variant="destructive">Ditolak</Badge>;
      case 'DIKEMBALIKAN': return <Badge variant="secondary">Dikembalikan</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map(row => row.id_usulan));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setLoading(true);
    try {
      await bulkDeleteUsulan(selectedIds);
      toast.success(`Berhasil menghapus ${selectedIds.length} data`);
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await clearUsulan(kategori);
      toast.success(`Berhasil menghapus semua data ${kategori}`);
      setIsClearModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus semua data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari di semua kolom..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="DITERIMA">Diterima</SelectItem>
              <SelectItem value="DITOLAK">Ditolak</SelectItem>
              <SelectItem value="DIKEMBALIKAN">Dikembalikan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsClearModalOpen(true)} disabled={loading || total === 0} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
          <div className="text-sm text-gray-500 ml-2">
            Total: {total} data
          </div>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[40px] text-center whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="whitespace-nowrap">ID Usulan</TableHead>
                <TableHead className="whitespace-nowrap">Tanggal Usul</TableHead>
                <TableHead className="whitespace-nowrap">Pengusul</TableHead>
                <TableHead className="whitespace-nowrap min-w-[200px]">Usulan</TableHead>
                <TableHead className="whitespace-nowrap min-w-[200px]">Masalah</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Alamat Lokasi</TableHead>
                <TableHead className="whitespace-nowrap">Usulan Ke</TableHead>
                <TableHead className="whitespace-nowrap">OPD Tujuan Awal</TableHead>
                <TableHead className="whitespace-nowrap">OPD Tujuan Akhir</TableHead>
                <TableHead className="whitespace-nowrap">Status Existing</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Catatan</TableHead>
                <TableHead className="whitespace-nowrap">Rekomendasi Sekwan</TableHead>
                <TableHead className="whitespace-nowrap">Rekomendasi Mitra</TableHead>
                <TableHead className="whitespace-nowrap">Rekomendasi SKPD</TableHead>
                <TableHead className="whitespace-nowrap">Rekomendasi TAPD</TableHead>
                <TableHead className="whitespace-nowrap">Volume</TableHead>
                <TableHead className="whitespace-nowrap">Satuan</TableHead>
                <TableHead className="whitespace-nowrap">Anggaran</TableHead>
                <TableHead className="whitespace-nowrap">Jenis Belanja</TableHead>
                <TableHead className="whitespace-nowrap">Sub Kegiatan</TableHead>
                <TableHead className="whitespace-nowrap">Status Validasi</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Catatan Validasi</TableHead>
                <TableHead className="whitespace-nowrap">Validator</TableHead>
                <TableHead className="whitespace-nowrap">Tgl Validasi</TableHead>
                <TableHead className="text-right whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-20 text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p>Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-20 text-red-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <AlertTriangle className="h-8 w-8" />
                      <p className="font-medium">Gagal memuat data</p>
                      <p className="text-sm text-gray-500">{error}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-10 text-gray-500">
                    Tidak ada data ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id_usulan} className="hover:bg-gray-50">
                    <TableCell className="text-center whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedIds.includes(row.id_usulan)}
                        onChange={() => handleSelect(row.id_usulan)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{row.id_usulan}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.tanggal_usul}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{row.pengusul}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={row.usulan}>{row.usulan}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={row.masalah}>{row.masalah}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={row.alamat_lokasi}>{row.alamat_lokasi}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.usulan_ke}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.opd_tujuan_awal}</TableCell>
                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{row.opd_tujuan_akhir}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.status_existing}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={row.catatan}>{row.catatan}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.rekomendasi_sekwan}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.rekomendasi_mitra}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.rekomendasi_skpd}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.rekomendasi_tapd}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.volume}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.satuan}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.anggaran}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.jenis_belanja}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.sub_kegiatan}</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(row.status_validasi)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={row.catatan_validasi}>{row.catatan_validasi || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.validator || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{row.tanggal_validasi ? format(new Date(row.tanggal_validasi), 'dd MMM yyyy HH:mm') : '-'}</TableCell>
                    <TableCell className="text-right whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedUsulan(row)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Detail & Validasi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-500">Baris per halaman</p>
          <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
              <SelectItem value="-1">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Halaman {page} dari {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0 || loading}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ValidationModal
        isOpen={!!selectedUsulan}
        onClose={() => setSelectedUsulan(null)}
        usulan={selectedUsulan}
        onSuccess={loadData}
      />

      <Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Semua Data {kategori}?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen semua data usulan {kategori} dari database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsClearModalOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleClearAll} disabled={loading}>
              Ya, Hapus Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
