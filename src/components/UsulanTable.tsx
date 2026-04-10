import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchUsulan, bulkDeleteUsulan, clearUsulan } from '@/lib/api';
import { ValidationModal } from './ValidationModal';
import { Search, ChevronLeft, ChevronRight, FileText, Trash2, AlertTriangle, Loader2, CheckCircle, XCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

import { CircularProgress } from '@/components/ui/circular-progress';

interface UsulanTableProps {
  kategori: 'HIBAH' | 'POKIR' | 'ALL';
  refreshTrigger: number;
}

const ResizableHeader = ({ 
  id, 
  children, 
  width,
  onResize
}: { 
  id: string; 
  children: React.ReactNode; 
  width: number;
  onResize: (id: string, width: number) => void;
}) => {
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(100, startWidth + (moveEvent.pageX - startX));
      onResize(id, newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <TableHead 
      className="relative whitespace-nowrap group border-r border-gray-200 last:border-r-0"
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <div className="overflow-hidden text-ellipsis w-full pr-2">
        {children}
      </div>
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-blue-400 z-10 transition-opacity"
        onMouseDown={startResize}
      />
    </TableHead>
  );
};

export function UsulanTable({ kategori, refreshTrigger }: UsulanTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

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

  // Column Widths
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    id_usulan: 150,
    tanggal_usul: 120,
    pengusul: 150,
    usulan: 300,
    masalah: 300,
    alamat_lokasi: 200,
    kecamatan: 150,
    usulan_ke: 100,
    opd_tujuan_awal: 150,
    opd_tujuan_akhir: 150,
    status_existing: 150,
    catatan: 200,
    rekomendasi_sekwan: 150,
    rekomendasi_mitra: 150,
    rekomendasi_skpd: 150,
    rekomendasi_tapd: 150,
    volume: 100,
    satuan: 100,
    anggaran: 120,
    jenis_belanja: 150,
    sub_kegiatan: 150,
    status_validasi: 150,
    catatan_validasi: 200,
    validator: 120,
    tanggal_validasi: 150,
  });

  const handleResize = (id: string, width: number) => {
    setColWidths(prev => ({ ...prev, [id]: width }));
  };

  const getColStyle = (id: string) => ({
    width: colWidths[id],
    minWidth: colWidths[id],
    maxWidth: colWidths[id],
  });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [opd, setOpd] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Update URL when status changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
    
    // Update URL query params
    if (newStatus === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', newStatus);
    }
    setSearchParams(searchParams);
  };

  // Save limit to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`usulan_limit_${kategori}`, limit.toString());
  }, [limit, kategori]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

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
        limit: limit === -1 ? 1000000 : limit,
        sortBy,
        sortOrder
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
  }, [kategori, page, limit, status, opd, sortBy, sortOrder, refreshTrigger]);

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
      case 'DITERIMA': return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> Diterima</Badge>;
      case 'DITOLAK': return <Badge className="bg-rose-900 text-white border-rose-950 hover:bg-rose-800 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> Ditolak</Badge>;
      case 'DIKEMBALIKAN': return <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/> Dikembalikan</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> Draft</Badge>;
    }
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case 'DITERIMA': return "hover:bg-green-100 bg-green-50";
      case 'DITOLAK': return "hover:bg-rose-100 bg-rose-50";
      case 'DIKEMBALIKAN': return "hover:bg-orange-100 bg-orange-50";
      default: return "hover:bg-gray-100 bg-white";
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
      setIsBulkDeleteModalOpen(false);
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

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch all data matching current filters
      const response = await fetchUsulan({
        kategori,
        search,
        status,
        opd,
        page: 1,
        limit: 1000000, // Fetch all
        sortBy,
        sortOrder
      });

      if (!response.data || response.data.length === 0) {
        toast.error('Tidak ada data untuk diexport');
        return;
      }

      // Format data for Excel
      const exportData = response.data.map((item: any, index: number) => ({
        'No': index + 1,
        'ID Usulan': item.id_usulan,
        'Kategori': item.kategori,
        'Tanggal Usul': item.tanggal_usul,
        'Pengusul': item.pengusul,
        'Usulan': item.usulan,
        'Masalah': item.masalah,
        'Alamat Lokasi': item.alamat_lokasi,
        'Usulan Ke': item.usulan_ke,
        'OPD Tujuan Awal': item.opd_tujuan_awal,
        'OPD Tujuan Akhir': item.opd_tujuan_akhir,
        'Status Existing': item.status_existing,
        'Catatan': item.catatan,
        'Rekomendasi Sekwan': item.rekomendasi_sekwan,
        'Rekomendasi Mitra': item.rekomendasi_mitra,
        'Rekomendasi SKPD': item.rekomendasi_skpd,
        'Rekomendasi TAPD': item.rekomendasi_tapd,
        'Volume': item.volume,
        'Satuan': item.satuan,
        'Anggaran': item.anggaran,
        'Jenis Belanja': item.jenis_belanja,
        'Sub Kegiatan': item.sub_kegiatan,
        'Status Validasi': item.status_validasi,
        'Catatan Validasi': item.catatan_validasi,
        'Validator': item.validator,
        'Tanggal Validasi': item.tanggal_validasi ? format(new Date(item.tanggal_validasi), 'dd/MM/yyyy HH:mm') : ''
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Usulan');
      
      const fileName = `Export_Usulan_${kategori}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Berhasil export data ke Excel');
    } catch (error) {
      console.error(error);
      toast.error('Gagal export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari di semua kolom..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
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
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Urutkan Berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Waktu Dibuat</SelectItem>
              <SelectItem value="tanggal_usul">Tanggal Usul</SelectItem>
              <SelectItem value="pengusul">Pengusul</SelectItem>
              <SelectItem value="anggaran">Anggaran</SelectItem>
              <SelectItem value="status_validasi">Status Validasi</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v); setPage(1); }}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Urutan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Menurun</SelectItem>
              <SelectItem value="ASC">Menaik</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteModalOpen(true)} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || total === 0} className="text-green-700 border-green-200 hover:bg-green-50">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsClearModalOpen(true)} disabled={loading || total === 0} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
          <div className="text-sm text-gray-500 ml-2">
            Total: {total} data
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          Keterangan Warna Baris:
        </span>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div> Diterima</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-900 border border-rose-950"></div> Ditolak</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-300"></div> Dikembalikan</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div> Draft</div>
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
                <ResizableHeader id="id_usulan" width={colWidths.id_usulan} onResize={handleResize}>ID Usulan</ResizableHeader>
                <ResizableHeader id="tanggal_usul" width={colWidths.tanggal_usul} onResize={handleResize}>Tanggal Usul</ResizableHeader>
                <ResizableHeader id="pengusul" width={colWidths.pengusul} onResize={handleResize}>Pengusul</ResizableHeader>
                <ResizableHeader id="usulan" width={colWidths.usulan} onResize={handleResize}>Usulan</ResizableHeader>
                <ResizableHeader id="masalah" width={colWidths.masalah} onResize={handleResize}>Masalah</ResizableHeader>
                <ResizableHeader id="alamat_lokasi" width={colWidths.alamat_lokasi} onResize={handleResize}>Alamat Lokasi</ResizableHeader>
                <ResizableHeader id="kecamatan" width={colWidths.kecamatan} onResize={handleResize}>Kecamatan</ResizableHeader>
                <ResizableHeader id="usulan_ke" width={colWidths.usulan_ke} onResize={handleResize}>Usulan Ke</ResizableHeader>
                <ResizableHeader id="opd_tujuan_awal" width={colWidths.opd_tujuan_awal} onResize={handleResize}>OPD Tujuan Awal</ResizableHeader>
                <ResizableHeader id="opd_tujuan_akhir" width={colWidths.opd_tujuan_akhir} onResize={handleResize}>OPD Tujuan Akhir</ResizableHeader>
                <ResizableHeader id="status_existing" width={colWidths.status_existing} onResize={handleResize}>Status Existing</ResizableHeader>
                <ResizableHeader id="catatan" width={colWidths.catatan} onResize={handleResize}>Catatan</ResizableHeader>
                <ResizableHeader id="rekomendasi_sekwan" width={colWidths.rekomendasi_sekwan} onResize={handleResize}>Rekomendasi Sekwan</ResizableHeader>
                <ResizableHeader id="rekomendasi_mitra" width={colWidths.rekomendasi_mitra} onResize={handleResize}>Rekomendasi Mitra</ResizableHeader>
                <ResizableHeader id="rekomendasi_skpd" width={colWidths.rekomendasi_skpd} onResize={handleResize}>Rekomendasi SKPD</ResizableHeader>
                <ResizableHeader id="rekomendasi_tapd" width={colWidths.rekomendasi_tapd} onResize={handleResize}>Rekomendasi TAPD</ResizableHeader>
                <ResizableHeader id="volume" width={colWidths.volume} onResize={handleResize}>Volume</ResizableHeader>
                <ResizableHeader id="satuan" width={colWidths.satuan} onResize={handleResize}>Satuan</ResizableHeader>
                <ResizableHeader id="anggaran" width={colWidths.anggaran} onResize={handleResize}>Anggaran</ResizableHeader>
                <ResizableHeader id="jenis_belanja" width={colWidths.jenis_belanja} onResize={handleResize}>Jenis Belanja</ResizableHeader>
                <ResizableHeader id="sub_kegiatan" width={colWidths.sub_kegiatan} onResize={handleResize}>Sub Kegiatan</ResizableHeader>
                <ResizableHeader id="status_validasi" width={colWidths.status_validasi} onResize={handleResize}>Status Validasi</ResizableHeader>
                <ResizableHeader id="catatan_validasi" width={colWidths.catatan_validasi} onResize={handleResize}>Catatan Validasi</ResizableHeader>
                <ResizableHeader id="validator" width={colWidths.validator} onResize={handleResize}>Validator</ResizableHeader>
                <ResizableHeader id="tanggal_validasi" width={colWidths.tanggal_validasi} onResize={handleResize}>Tgl Validasi</ResizableHeader>
                <TableHead className="text-right whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-20 text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <CircularProgress size={48} strokeWidth={4} color="text-blue-600" />
                      <p className="text-sm font-medium animate-pulse">Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-20 text-red-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <AlertTriangle className="h-8 w-8" />
                      <p className="font-medium">Gagal memuat data</p>
                      <div className="bg-red-50 p-4 rounded-md border border-red-200 max-w-2xl overflow-auto text-left">
                        <p className="text-sm font-mono text-red-800 break-words">{error}</p>
                      </div>
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
                  <TableRow key={row.id_usulan} className={getRowClassName(row.status_validasi)}>
                    <TableCell className="text-center whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedIds.includes(row.id_usulan)}
                        onChange={() => handleSelect(row.id_usulan)}
                      />
                    </TableCell>
                    <TableCell style={getColStyle('id_usulan')} className="font-mono text-xs truncate" title={row.id_usulan}>{row.id_usulan}</TableCell>
                    <TableCell style={getColStyle('tanggal_usul')} className="truncate" title={row.tanggal_usul}>{row.tanggal_usul}</TableCell>
                    <TableCell style={getColStyle('pengusul')} className="font-medium truncate" title={row.pengusul}>{row.pengusul}</TableCell>
                    <TableCell style={getColStyle('usulan')} className="truncate" title={row.usulan}>{row.usulan}</TableCell>
                    <TableCell style={getColStyle('masalah')} className="truncate" title={row.masalah}>{row.masalah}</TableCell>
                    <TableCell style={getColStyle('alamat_lokasi')} className="truncate" title={row.alamat_lokasi}>{row.alamat_lokasi}</TableCell>
                    <TableCell style={getColStyle('kecamatan')} className="truncate" title={row.kecamatan}>{row.kecamatan}</TableCell>
                    <TableCell style={getColStyle('usulan_ke')} className="truncate" title={row.usulan_ke}>{row.usulan_ke}</TableCell>
                    <TableCell style={getColStyle('opd_tujuan_awal')} className="truncate" title={row.opd_tujuan_awal}>{row.opd_tujuan_awal}</TableCell>
                    <TableCell style={getColStyle('opd_tujuan_akhir')} className="text-sm text-gray-600 truncate" title={row.opd_tujuan_akhir}>{row.opd_tujuan_akhir}</TableCell>
                    <TableCell style={getColStyle('status_existing')} className="truncate" title={row.status_existing}>{row.status_existing}</TableCell>
                    <TableCell style={getColStyle('catatan')} className="truncate" title={row.catatan}>{row.catatan}</TableCell>
                    <TableCell style={getColStyle('rekomendasi_sekwan')} className="truncate" title={row.rekomendasi_sekwan}>{row.rekomendasi_sekwan}</TableCell>
                    <TableCell style={getColStyle('rekomendasi_mitra')} className="truncate" title={row.rekomendasi_mitra}>{row.rekomendasi_mitra}</TableCell>
                    <TableCell style={getColStyle('rekomendasi_skpd')} className="truncate" title={row.rekomendasi_skpd}>{row.rekomendasi_skpd}</TableCell>
                    <TableCell style={getColStyle('rekomendasi_tapd')} className="truncate" title={row.rekomendasi_tapd}>{row.rekomendasi_tapd}</TableCell>
                    <TableCell style={getColStyle('volume')} className="truncate" title={row.volume}>{row.volume}</TableCell>
                    <TableCell style={getColStyle('satuan')} className="truncate" title={row.satuan}>{row.satuan}</TableCell>
                    <TableCell style={getColStyle('anggaran')} className="truncate" title={row.anggaran}>{row.anggaran}</TableCell>
                    <TableCell style={getColStyle('jenis_belanja')} className="truncate" title={row.jenis_belanja}>{row.jenis_belanja}</TableCell>
                    <TableCell style={getColStyle('sub_kegiatan')} className="truncate" title={row.sub_kegiatan}>{row.sub_kegiatan}</TableCell>
                    <TableCell style={getColStyle('status_validasi')} className="truncate">{getStatusBadge(row.status_validasi)}</TableCell>
                    <TableCell style={getColStyle('catatan_validasi')} className="truncate" title={row.catatan_validasi}>{row.catatan_validasi || '-'}</TableCell>
                    <TableCell style={getColStyle('validator')} className="truncate" title={row.validator}>{row.validator || '-'}</TableCell>
                    <TableCell style={getColStyle('tanggal_validasi')} className="truncate" title={row.tanggal_validasi ? format(new Date(row.tanggal_validasi), 'dd MMM yyyy HH:mm') : '-'}>{row.tanggal_validasi ? format(new Date(row.tanggal_validasi), 'dd MMM yyyy HH:mm') : '-'}</TableCell>
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

      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {selectedIds.length} Data Terpilih?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen {selectedIds.length} data usulan yang Anda pilih dari database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={loading}>
              Ya, Hapus Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
