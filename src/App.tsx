import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Dashboard } from '@/pages/Dashboard';
import { UsulanPage } from '@/pages/UsulanPage';
import { LayoutDashboard, FileText, Layers, Menu, Search, Bell, Settings, User, ChevronDown, Package, Box, Users, ArrowUpRight, FileBox, Shield, Key, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Semua Usulan', path: '/usulan', icon: Package },
    { name: 'Hibah', path: '/hibah', icon: FileText },
    { name: 'Musrembang', path: '/musrembang', icon: Box },
    { name: 'Pokir', path: '/pokir', icon: Layers },
  ];

  return (
    <div className={`bg-[#111111] text-white min-h-screen flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-white/10 transition-colors">
          <Grid className="h-6 w-6 text-white" />
        </button>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#A6F4C5] text-black' 
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              } ${!isOpen && 'justify-center'}`}
              title={!isOpen ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 flex justify-center border-t border-white/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
          <User className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <header className="h-16 flex items-center justify-end px-8 bg-white">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="rounded-full bg-[#111111] text-white hover:bg-gray-800 hover:text-white border-0 h-9 px-4 text-sm font-medium">
          More <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Search className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" className="w-full h-full object-cover" />
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
          created by Mukki - Natapradja Project &copy; 2026
        </footer>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/usulan" element={<UsulanPage kategori="ALL" />} />
          <Route path="/hibah" element={<UsulanPage kategori="HIBAH" />} />
          <Route path="/musrembang" element={<UsulanPage kategori="Musrembang" />} />
          <Route path="/pokir" element={<UsulanPage kategori="POKIR" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

