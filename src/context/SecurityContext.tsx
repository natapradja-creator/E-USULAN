import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SecurityContextType {
  isLocked: boolean;
  hasPin: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setPin: (newPin: string, oldPin?: string) => Promise<void>;
  checkPinStatus: () => Promise<void>;
  loading: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPinStatus = async () => {
    try {
      const res = await fetch('/api/settings/pin-status');
      const data = await res.json();
      setHasPin(data.isSet);
      
      // If PIN is set and session was just started, lock the app
      if (data.isSet && !sessionStorage.getItem('app_unlocked')) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Failed to check PIN status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPinStatus();
  }, []);

  const unlock = async (pin: string) => {
    try {
      const res = await fetch('/api/settings/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsLocked(false);
        sessionStorage.setItem('app_unlocked', 'true');
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Gagal verifikasi PIN');
      return false;
    }
  };

  const lock = () => {
    setIsLocked(true);
    sessionStorage.removeItem('app_unlocked');
  };

  const setPin = async (newPin: string, oldPin?: string) => {
    try {
      const res = await fetch('/api/settings/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin, oldPin }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal mengatur PIN');
      }
      
      setHasPin(!!newPin);
      toast.success(newPin ? 'PIN berhasil diperbarui' : 'PIN berhasil dihapus');
      await checkPinStatus();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <SecurityContext.Provider value={{ isLocked, hasPin, unlock, lock, setPin, checkPinStatus, loading }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
