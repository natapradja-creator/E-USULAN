import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateUsulan } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Minus } from 'lucide-react';
import { terbilang } from '@/lib/utils';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  usulan: any;
  onSuccess: () => void;
}

function useHistoryCache(key: string, maxItems = 10) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`history_${key}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, [key]);

  const addHistory = (item: string) => {
    if (!item || item.trim() === '') return;
    const newHistory = [item, ...history.filter(h => h !== item)].slice(0, maxItems);
    setHistory(newHistory);
    localStorage.setItem(`history_${key}`, JSON.stringify(newHistory));
  };

  return { history, addHistory };
}

export function ValidationModal({ isOpen, onClose, usulan, onSuccess }: ValidationModalProps) {
  const [catatan, setCatatan] = useState('');
  const [anggaran, setAnggaran] = useState('');
  const [volume, setVolume] = useState('');
  const [satuan, setSatuan] = useState('');
  const [kategori, setKategori] = useState('');
  const [loading, setLoading] = useState(false);

  const { history: anggaranHistory, addHistory: addAnggaranHistory } = useHistoryCache('anggaran');
  const { history: catatanHistory, addHistory: addCatatanHistory } = useHistoryCache('catatan');

  useEffect(() => {
    if (usulan) {
      setCatatan('');
      setAnggaran(usulan.anggaran || '');
      setVolume(usulan.volume || '');
      setSatuan(usulan.satuan || '');
      setKategori(usulan.kategori || '');
    }
  }, [usulan]);

  const handleValidate = async (status: 'DITERIMA' | 'DITOLAK' | 'DIKEMBALIKAN') => {
    if (catatan.length < 10) {
      toast.error('Catatan wajib diisi minimal 10 karakter');
      return;
    }

    if (status === 'DITERIMA') {
      if (!anggaran || anggaran.trim() === '' || anggaran === '0') {
        toast.error('Anggaran wajib diisi jika usulan diterima');
        return;
      }
      if (!volume || volume.trim() === '') {
        toast.error('Volume wajib diisi jika usulan diterima');
        return;
      }
      if (!satuan || satuan.trim() === '') {
        toast.error('Satuan wajib diisi jika usulan diterima');
        return;
      }
    }

    setLoading(true);
    try {
      addAnggaranHistory(anggaran);
      addCatatanHistory(catatan);

      await validateUsulan(usulan.id_usulan, {
        status,
        catatan,
        validator: 'Admin', // In a real app, get from auth context
        anggaran,
        volume,
        satuan,
        kategori
      });
      toast.success(`Usulan berhasil ${status.toLowerCase()}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Gagal memvalidasi usulan');
    } finally {
      setLoading(false);
    }
  };

  if (!usulan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Validasi Usulan: {usulan.id_usulan}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 overflow-y-auto flex-1 pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Pengusul</Label>
            <div className="col-span-3">{usulan.pengusul}</div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right font-bold mt-1">Usulan</Label>
            <div className="col-span-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
              {usulan.usulan}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right font-bold mt-1">Masalah</Label>
            <div className="col-span-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">
              {usulan.masalah}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right font-bold mt-1">Alamat Lokasi</Label>
            <div className="col-span-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border whitespace-pre-wrap">
              {usulan.alamat_lokasi || '-'}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right font-bold mt-1">Kecamatan</Label>
            <div className="col-span-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
              {usulan.kecamatan || '-'}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">OPD Tujuan</Label>
            <div className="col-span-3">{usulan.opd_tujuan_akhir}</div>
          </div>
          
          {usulan.kategori === 'HIBAH' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Kategori <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select value={kategori} onValueChange={setKategori}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIBAH">Hibah</SelectItem>
                    <SelectItem value="Musrembang">Musrembang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Volume <span className="text-red-500">*</span></Label>
            <div className="col-span-3">
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setVolume(v => String(Math.max(0, (parseInt(v) || 0) - 1)))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Contoh: 10"
                  className="text-center w-32"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setVolume(v => String((parseInt(v) || 0) + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Satuan <span className="text-red-500">*</span></Label>
            <div className="col-span-3">
              <Input
                list="satuan-options"
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                placeholder="Contoh: Paket"
              />
              <datalist id="satuan-options">
                <option value="Paket" />
                <option value="Unit" />
                <option value="Ruang" />
                <option value="Meter" />
                <option value="M2" />
                <option value="Titik" />
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right font-bold mt-2">Anggaran <span className="text-red-500">*</span></Label>
            <div className="col-span-3">
              <Input
                list="anggaran-options"
                value={anggaran}
                onChange={(e) => setAnggaran(e.target.value)}
                placeholder="Contoh: 100000000"
                className="font-mono"
              />
              <datalist id="anggaran-options">
                {anggaranHistory.map((h, i) => <option key={i} value={h} />)}
              </datalist>
              {parseInt(anggaran) > 0 && (
                <div className="mt-2 text-sm text-gray-700 italic border-l-2 border-blue-500 pl-2 py-1 bg-blue-50/50">
                  {terbilang(parseInt(anggaran))} Rupiah
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Wajib diisi jika usulan akan diterima.
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <Label htmlFor="catatan" className="font-bold mb-2 block">Catatan Validasi / Rekomendasi SKPD <span className="text-red-500">*</span></Label>
            <Textarea
              id="catatan"
              placeholder="Masukkan catatan validasi (minimal 10 karakter)..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="min-h-[100px] w-full"
            />
            {catatanHistory.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Riwayat:</span>
                {catatanHistory.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCatatan(h)}
                    title={h}
                    className="text-[11px] px-2.5 py-1 bg-gray-50 hover:bg-gray-200 text-gray-700 rounded-full truncate max-w-[200px] border transition-colors cursor-pointer"
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {catatan.length}/10 karakter minimal. Catatan ini akan disimpan ke kolom Rekomendasi SKPD.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => handleValidate('DITOLAK')}
              disabled={loading || catatan.length < 10}
            >
              Tolak
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleValidate('DIKEMBALIKAN')}
              disabled={loading || catatan.length < 10}
            >
              Kembalikan
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => handleValidate('DITERIMA')}
              disabled={loading || catatan.length < 10}
            >
              Terima
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
