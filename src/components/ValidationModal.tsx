import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateUsulan } from '@/lib/api';
import { toast } from 'sonner';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  usulan: any;
  onSuccess: () => void;
}

export function ValidationModal({ isOpen, onClose, usulan, onSuccess }: ValidationModalProps) {
  const [catatan, setCatatan] = useState('');
  const [anggaran, setAnggaran] = useState('');
  const [volume, setVolume] = useState('');
  const [satuan, setSatuan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usulan) {
      setCatatan('');
      setAnggaran(usulan.anggaran || '');
      setVolume(usulan.volume || '');
      setSatuan(usulan.satuan || '');
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
      await validateUsulan(usulan.id_usulan, {
        status,
        catatan,
        validator: 'Admin', // In a real app, get from auth context
        anggaran,
        volume,
        satuan
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Validasi Usulan: {usulan.id_usulan}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
            <div className="col-span-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border">
              {usulan.masalah}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">OPD Tujuan</Label>
            <div className="col-span-3">{usulan.opd_tujuan_akhir}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Volume <span className="text-red-500">*</span></Label>
            <div className="col-span-3">
              <Input
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Contoh: 10"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Satuan <span className="text-red-500">*</span></Label>
            <div className="col-span-3">
              <Input
                value={satuan}
                onChange={(e) => setSatuan(e.target.value)}
                placeholder="Contoh: Paket"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">Anggaran <span className="text-red-500">*</span></Label>
            <div className="col-span-3">
              <Input
                value={anggaran}
                onChange={(e) => setAnggaran(e.target.value)}
                placeholder="Contoh: 100000000"
                className="font-mono"
              />
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
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              {catatan.length}/10 karakter minimal. Catatan ini akan disimpan ke kolom Rekomendasi SKPD.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
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
