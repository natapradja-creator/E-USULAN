import React, { useState } from 'react';
import { useSecurity } from '@/context/SecurityContext';
import { Key, Unlock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const LockScreen: React.FC = () => {
  const { unlock } = useSecurity();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    setLoading(true);
    const success = await unlock(pin);
    setLoading(false);

    if (success) {
      toast.success('Aplikasi dibuka');
    } else {
      toast.error('PIN Salah');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-sm p-8 bg-card rounded-3xl border border-border shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Key className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Aplikasi Terkunci</h2>
            <p className="text-muted-foreground text-sm">
              Sistem ini dilindungi. Masukkan PIN untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••"
                className="text-center text-2xl tracking-[0.5em] h-14"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold gap-2"
              disabled={loading || !pin}
            >
              {loading ? 'Memverifikasi...' : (
                <>
                  <Unlock className="h-5 w-5" />
                  Buka Kunci
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="h-3 w-3" />
            <span>Keamanan Natapradja Project</span>
          </div>
        </div>
      </div>
    </div>
  );
};
