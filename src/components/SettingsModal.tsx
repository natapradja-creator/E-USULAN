import React, { useState } from 'react';
import { useSecurity } from '@/context/SecurityContext';
import { Key, Lock, ShieldCheck, X, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { hasPin, setPin, lock } = useSecurity();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      return;
    }

    setLoading(true);
    try {
      await setPin(newPin, hasPin ? currentPin : undefined);
      // Reset state on success
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      onClose();
    } catch (err) {
      // Error handled by context toast
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePin = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus PIN keamanan?')) return;
    
    setLoading(true);
    try {
      await setPin('', currentPin);
      setCurrentPin('');
      onClose();
    } catch (err) {
      // Error handled by context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl relative overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Keamanan Sistem</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Status PIN</Label>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${hasPin ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-muted-foreground">
                    {hasPin ? 'PIN Aktif' : 'PIN Belum Diatur'}
                  </span>
                </div>
              </div>
              {hasPin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={lock}
                  className="gap-2 h-8"
                >
                  <Lock className="h-4 w-4" />
                  Kunci Sekarang
                </Button>
              )}
            </div>

            <form onSubmit={handleSetPin} className="space-y-4 pt-2">
              {hasPin && (
                <div className="space-y-2">
                  <Label htmlFor="currentPin">PIN Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPin"
                      type={showPins ? "text" : "password"}
                      placeholder="Masukkan PIN lama"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPin">{hasPin ? 'PIN Baru' : 'Atur PIN Baru'}</Label>
                <Input
                  id="newPin"
                  type={showPins ? "text" : "password"}
                  placeholder="Masukkan PIN baru"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Konfirmasi PIN Baru</Label>
                <Input
                  id="confirmPin"
                  type={showPins ? "text" : "password"}
                  placeholder="Ulangi PIN baru"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  required
                />
                {newPin && confirmPin && newPin !== confirmPin && (
                  <p className="text-xs text-red-500 font-medium">PIN Konfirmasi tidak cocok</p>
                )}
              </div>

              <div className="flex items-center gap-2 py-1">
                <button 
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  {showPins ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPins ? 'Sembunyikan' : 'Lihat PIN'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 gap-2" 
                  disabled={loading || !newPin || newPin !== confirmPin}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {hasPin ? 'Ganti PIN' : 'Simpan PIN'}
                </Button>
                
                {hasPin && (
                  <Button 
                    type="button"
                    variant="destructive" 
                    onClick={handleRemovePin}
                    disabled={loading || !currentPin}
                    title="Hapus PIN"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t border-border text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
          Natapradja Security System
        </div>
      </div>
    </div>
  );
};
