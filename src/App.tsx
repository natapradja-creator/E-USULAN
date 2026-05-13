import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Dashboard } from '@/pages/Dashboard';
import { UsulanPage } from '@/pages/UsulanPage';
import License from '@/pages/License';
import { LayoutDashboard, FileText, Layers, Menu, Search, Bell, Settings, User, ChevronDown, Package, Box, Users, ArrowUpRight, FileBox, Shield, Key, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SecurityProvider, useSecurity } from '@/context/SecurityContext';
import { LockScreen } from '@/components/LockScreen';
import { SettingsModal } from '@/components/SettingsModal';

function Sidebar({ isOpen, toggleSidebar, isMobile }: { isOpen: boolean, toggleSidebar: () => void, isMobile: boolean }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Semua Usulan', path: '/usulan', icon: Package },
    { name: 'Hibah', path: '/hibah', icon: FileText },
    { name: 'Musrembang', path: '/musrembang', icon: Box },
    { name: 'Pokir', path: '/pokir', icon: Layers },
    { name: 'License', path: '/license', icon: Shield },
  ];

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform' : 'relative transition-all duration-300'}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        bg-[#111111] dark:bg-black text-white min-h-screen flex flex-col 
        ${!isMobile ? (isOpen ? 'w-64' : 'w-16') : 'w-64'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {(isOpen || isMobile) && (
            <div className="flex items-center gap-2 font-bold text-[#A6F4C5] truncate">
              <Grid className="h-5 w-5" />
              <span className="text-sm">SISTEM USULAN</span>
            </div>
          )}
          {!isMobile && (
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-white/10 transition-colors mx-auto">
              <Grid className="h-6 w-6 text-white" />
            </button>
          )}
          {isMobile && (
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-white/10 transition-colors">
              <Menu className="h-6 w-6 text-white rotate-90" />
            </button>
          )}
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={isMobile ? toggleSidebar : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#A6F4C5] text-black dark:bg-[#A6F4C5] dark:text-black' 
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                } ${(!isOpen && !isMobile) && 'justify-center'}`}
                title={!isOpen && !isMobile ? item.name : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {(isOpen || isMobile) && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 flex flex-col gap-3 border-t border-white/10">
          <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${(!isOpen && !isMobile) && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            {(isOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">ADMIN</p>
                <p className="text-[10px] text-gray-500 truncate">Admin System</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function TopNav({ toggleSidebar, isMobile, onSettingsClick }: { toggleSidebar: () => void, isMobile: boolean, onSettingsClick: () => void }) {
  const { isGlobalLocked, sessionUnlocked, lockSession } = useSecurity();

  return (
    <header className="h-16 flex items-center justify-between lg:justify-end px-4 md:px-8 bg-background border-b border-border sticky top-0 z-30">
      {isMobile && (
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-accent transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      )}
      <div className="flex items-center gap-2 md:gap-4 font-sans">
        {isGlobalLocked && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${sessionUnlocked ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200 animate-pulse'}`}>
            <Shield className={`w-3.5 h-3.5 ${sessionUnlocked ? 'text-green-600' : 'text-red-600'}`} />
            <span className="hidden xs:inline uppercase tracking-tight">{sessionUnlocked ? 'Sesi Terbuka' : 'Terkunci'}</span>
          </div>
        )}
        
        <ThemeToggle />
        
        <div className="w-8 h-8 rounded-full bg-accent overflow-hidden border border-border">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={onSettingsClick} 
            className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
            title="Keamanan"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          {sessionUnlocked && (
            <button 
              onClick={lockSession} 
              className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
              title="Keluar Sesi"
            >
              <Key className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isGlobalLocked, sessionUnlocked } = useSecurity();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-[#A6F4C5]/30">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {isGlobalLocked && !sessionUnlocked && (
          <div className="bg-red-600 text-white text-[10px] md:text-xs py-1 px-4 text-center font-bold uppercase tracking-wider animate-pulse z-[60]">
            Mode Terbatas (Read-Only) - Silahkan buka kunci untuk melakukan perubahan data
          </div>
        )}
        <TopNav 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isMobile={isMobile} 
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/5">
          {children}
        </main>
        <footer className="py-4 text-center text-[10px] md:text-xs text-muted-foreground border-t border-border bg-background">
          created by Mukki - Natapradja Project &copy; 2026
        </footer>
      </div>
      <Toaster position="top-right" richColors />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="sistem-usulan-theme">
      <SecurityProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/usulan" element={<UsulanPage kategori="ALL" />} />
              <Route path="/hibah" element={<UsulanPage kategori="HIBAH" />} />
              <Route path="/musrembang" element={<UsulanPage kategori="Musrembang" />} />
              <Route path="/pokir" element={<UsulanPage kategori="POKIR" />} />
              <Route path="/license" element={<License />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SecurityProvider>
    </ThemeProvider>
  );
}

