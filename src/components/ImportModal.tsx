import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { checkDuplicates, importUsulan } from '@/lib/api';
import { toast } from 'sonner';

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
          const finalData = mappedData.map(d => ({
            ...d,
            _status: existing.includes(d.id_usulan) ? 'DUPLIKAT' : 'VALID'
          }));
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

  const handleImport = async () => {
    const validData = data.filter(d => d._status === 'VALID');
    if (validData.length === 0) {
      toast.error('Tidak ada data valid untuk diimport');
      return;
    }

    setLoading(true);
    try {
      // Remove _status before sending to API
      const payload = validData.map(({ _status, ...rest }) => rest);
      await importUsulan(payload);
      toast.success(`Berhasil import ${validData.length} data`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Gagal import data');
    } finally {
      setLoading(false);
    }
  };

  const validCount = data.filter(d => d._status === 'VALID').length;
  const duplicateCount = data.filter(d => d._status === 'DUPLIKAT').length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            {data.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span>Total: <strong>{data.length}</strong></span>
                <span className="text-green-600">Valid: <strong>{validCount}</strong></span>
                <span className="text-red-600">Duplikat: <strong>{duplicateCount}</strong></span>
              </div>
            )}
          </div>

          {data.length > 0 && (
            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
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
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={handleImport} disabled={loading || validCount === 0}>
            Import Data ({validCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
