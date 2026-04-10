import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { checkDuplicates, importUsulan } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  kategori: 'HIBAH' | 'POKIR';
  onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, kategori, onSuccess }: ImportModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset data when modal opens
  useEffect(() => {
    if (isOpen) {
      setData([]);
    }
  }, [isOpen]);

  const handleClose = () => {
    setData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const getVal = (row: any, searchKeys: string[]) => {
          const normalizedSearchKeys = searchKeys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
          for (const key of Object.keys(row)) {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedSearchKeys.includes(normalizedKey)) {
              return String(row[key]).trim();
            }
          }
          return '';
        };

        // Map and validate structure
        const mappedData = parsedData.map((row: any) => {
          return {
            id_usulan: getVal(row, ['idusulan', 'id', 'no', 'nomor', 'kode']),
            tanggal_usul: getVal(row, ['tanggalusul', 'tanggal', 'date', 'waktu']),
            pengusul: getVal(row, ['pengusul', 'nama', 'namapengusul', 'dari']),
            usulan: getVal(row, ['usulan', 'namausulan', 'judul', 'kegiatan']),
            masalah: getVal(row, ['masalah', 'latarbelakang', 'deskripsi', 'uraian']),
            alamat_lokasi: getVal(row, ['alamatlokasi', 'alamat', 'lokasi', 'tempat']),
            kecamatan: getVal(row, ['kecamatan', 'kec']),
            usulan_ke: getVal(row, ['usulanke', 'ke']),
            opd_tujuan_awal: getVal(row, ['opdtujuanawal', 'opdawal', 'tujuanawal']),
            opd_tujuan_akhir: getVal(row, ['opdtujuanakhir', 'opdakhir', 'opd', 'tujuan']),
            status_existing: getVal(row, ['statusexisting', 'status']),
            catatan: getVal(row, ['catatan', 'keterangan']),
            rekomendasi_sekwan: getVal(row, ['rekomendasisekwan', 'sekwan']),
            rekomendasi_mitra: getVal(row, ['rekomendasimitra', 'mitra']),
            rekomendasi_skpd: getVal(row, ['rekomendasiskpd', 'skpd']),
            rekomendasi_tapd: getVal(row, ['rekomendasitapd', 'tapd']),
            volume: getVal(row, ['volume', 'vol', 'jumlah']),
            satuan: getVal(row, ['satuan', 'unit']),
            anggaran: getVal(row, ['anggaran', 'biaya', 'pagu', 'rupiah', 'harga']),
            jenis_belanja: getVal(row, ['jenisbelanja', 'jenis']),
            sub_kegiatan: getVal(row, ['subkegiatan', 'kegiatan']),
            kategori: kategori,
            _status: 'PENDING'
          };
        }).filter(item => item.id_usulan !== ''); // Filter out empty rows

        // Check duplicates
        const ids = mappedData.map(d => d.id_usulan);
        if (ids.length > 0) {
          const { existing } = await checkDuplicates(ids);
          const finalData = mappedData.map(d => {
            const isDuplicate = existing.includes(d.id_usulan);
            return {
              ...d,
              _status: isDuplicate ? 'DUPLIKAT' : 'VALID',
              _selected: !isDuplicate // Select valid rows by default
            };
          });
          setData(finalData);
        } else {
          setData([]);
          toast.error('Gagal: Kolom "ID Usulan" (atau ID/No) tidak ditemukan atau file kosong.');
        }
        setLoading(false);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error(error);
      toast.error('Gagal membaca file Excel');
      setLoading(false);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setData(prev => prev.map(row => 
      row._status === 'VALID' ? { ...row, _selected: checked } : row
    ));
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setData(prev => prev.map(row => 
      row.id_usulan === id && row._status === 'VALID' ? { ...row, _selected: checked } : row
    ));
  };

  const handleImport = async () => {
    const selectedData = data.filter(d => d._status === 'VALID' && d._selected);
    if (selectedData.length === 0) {
      toast.error('Tidak ada data yang dipilih untuk diimport');
      return;
    }

    setLoading(true);
    try {
      // Remove _status and _selected before sending to API
      const payload = selectedData.map(({ _status, _selected, ...rest }) => rest);
      await importUsulan(payload);
      toast.success(`Berhasil import ${selectedData.length} data`);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('Gagal import data');
    } finally {
      setLoading(false);
    }
  };

  const validCount = data.filter(d => d._status === 'VALID').length;
  const selectedCount = data.filter(d => d._status === 'VALID' && d._selected).length;
  const duplicateCount = data.filter(d => d._status === 'DUPLIKAT').length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Data {kategori}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex items-center gap-4">
            <label className={buttonVariants({ variant: "outline", className: "cursor-pointer" })}>
              Pilih File Excel
              <input
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={loading}
              />
            </label>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Memproses data...
              </div>
            )}
            {!loading && data.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span>Total: <strong>{data.length}</strong></span>
                <span className="text-green-600">Valid: <strong>{validCount}</strong></span>
                <span className="text-blue-600">Dipilih: <strong>{selectedCount}</strong></span>
                <span className="text-red-600">Duplikat: <strong>{duplicateCount}</strong></span>
              </div>
            )}
          </div>

          {data.length > 0 && (
            <div className="flex-1 border rounded-md overflow-y-auto min-h-[300px] max-h-[60vh]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-[40px] text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={validCount > 0 && selectedCount === validCount}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        disabled={validCount === 0}
                      />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ID Usulan</TableHead>
                    <TableHead>Pengusul</TableHead>
                    <TableHead>Usulan</TableHead>
                    <TableHead>OPD Tujuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, i) => (
                    <TableRow key={i} className={row._status === 'DUPLIKAT' ? 'bg-red-50/50' : ''}>
                      <TableCell className="text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={row._selected || false}
                          onChange={(e) => handleSelectRow(row.id_usulan, e.target.checked)}
                          disabled={row._status !== 'VALID'}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={row._status === 'VALID' ? 'default' : 'destructive'} className={row._status === 'VALID' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {row._status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.id_usulan}</TableCell>
                      <TableCell>{row.pengusul}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={row.usulan}>{row.usulan}</TableCell>
                      <TableCell>{row.opd_tujuan_akhir}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-between items-center">
          <div className="flex-1">
            {data.length > 0 && duplicateCount > 0 && (
              <Button 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={async () => {
                  const duplicatesToUpdate = data.filter(d => d._status === 'DUPLIKAT' && d.kecamatan);
                  if (duplicatesToUpdate.length === 0) {
                    toast.error('Tidak ada data duplikat yang memiliki kolom kecamatan untuk diupdate');
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const { updateKecamatanBulk } = await import('@/lib/api');
                    const res = await updateKecamatanBulk(duplicatesToUpdate);
                    toast.success(`Berhasil mengupdate kecamatan untuk ${res.updated} data`);
                    onSuccess();
                    handleClose();
                  } catch (e) {
                    toast.error('Gagal mengupdate kecamatan');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                Update Kecamatan Saja ({duplicateCount} Duplikat)
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>Batal</Button>
            <Button onClick={handleImport} disabled={loading || selectedCount === 0}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Import Data Baru ({selectedCount})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
