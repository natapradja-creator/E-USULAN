import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SecurityContextType {
  isGlobalLocked: boolean;
  isFullLocked: boolean;
  sessionUnlocked: boolean;
  hasPin: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lockSession: () => void;
  toggleGlobalLock: (pin: string, locked: boolean) => Promise<void>;
  toggleFullLock: (pin: string, locked: boolean) => Promise<void>;
  setPin: (newPin: string, oldPin?: string) => Promise<void>;
  checkPinStatus: () => Promise<void>;
  loading: boolean;
  canWrite: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalLocked, setIsGlobalLocked] = useState(false);
  const [isFullLocked, setIsFullLocked] = useState(false);
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPinStatus = async () => {
    try {
      const res = await fetch('/api/settings/lock-status');
      if (res.ok) {
        const data = await res.json();
        setHasPin(data.hasPin);
        setIsGlobalLocked(data.isGlobalLocked);
        setIsFullLocked(data.isFullLocked);
        
        // Restore session from sessionStorage
        const savedSession = sessionStorage.getItem('app_unlocked');
        if (savedSession === 'true') {
          setSessionUnlocked(true);
        }
      }
    } catch (error) {
      console.error('Failed to check lock status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPinStatus();
    
    // Poll for global lock status changes every 30 seconds for live sync
    const interval = setInterval(checkPinStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const unlock = async (pin: string) => {
    try {
      const res = await fetch('/api/settings/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setSessionUnlocked(true);
          sessionStorage.setItem('app_unlocked', 'true');
          return true;
        }
      }
      return false;
    } catch (error) {
      toast.error('Gagal verifikasi PIN');
      return false;
    }
  };

  const lockSession = () => {
    setSessionUnlocked(false);
    sessionStorage.removeItem('app_unlocked');
  };

  const toggleGlobalLock = async (pin: string, locked: boolean) => {
    try {
      const res = await fetch('/api/settings/toggle-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, locked, type: 'global' }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah status kunci');
      }
      
      setIsGlobalLocked(locked);
      toast.info(locked ? 'Mode Read-Only Aktif' : 'Mode Read-Only Nonaktif');
      
      if (!locked) {
        setSessionUnlocked(true);
        sessionStorage.setItem('app_unlocked', 'true');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const toggleFullLock = async (pin: string, locked: boolean) => {
    try {
      const res = await fetch('/api/settings/toggle-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, locked, type: 'full' }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah status kunci');
      }
      
      setIsFullLocked(locked);
      toast.info(locked ? 'Mode Privat Aktif' : 'Mode Privat Nonaktif');
      
      if (!locked) {
        setSessionUnlocked(true);
        sessionStorage.setItem('app_unlocked', 'true');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
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

  // Logic: Can write if NOT globally locked OR session is already unlocked with PIN
  const canWrite = !isGlobalLocked || sessionUnlocked;

  return (
    <SecurityContext.Provider value={{ 
      isGlobalLocked, 
      isFullLocked,
      sessionUnlocked, 
      hasPin, 
      unlock, 
      lockSession, 
      toggleGlobalLock, 
      toggleFullLock,
      setPin, 
      checkPinStatus, 
      loading,
      canWrite
    }}>
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
