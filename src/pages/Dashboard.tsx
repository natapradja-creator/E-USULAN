import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchStats } from '@/lib/api';
import { FileText, CheckCircle, XCircle, RefreshCcw, Layers, BarChart3, Loader2, Package, Box, Users, ArrowRight, FileBox, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ title, value, icon: Icon, colorClass, linkTo }: { title: string, value: number | string, icon: any, colorClass: string, linkTo: string }) {
  return (
    <div className={`rounded-3xl p-6 flex flex-col justify-between h-40 ${colorClass}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <div className="p-2 bg-white/40 rounded-full">
          <Icon className="h-5 w-5 text-gray-800" />
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-5xl font-semibold text-gray-900 tracking-tight">{value}</div>
        <Link to={linkTo} className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center transition-colors">
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

import { CircularProgress } from '@/components/ui/circular-progress';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Gagal memuat data dari server');
      });
  }, []);

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-red-500 space-y-4">
      <XCircle className="h-12 w-12" />
      <p className="text-lg font-medium">Terjadi Kesalahan</p>
      <div className="bg-red-50 p-4 rounded-md border border-red-200 w-full max-w-2xl overflow-auto">
        <p className="text-sm font-mono text-red-800 break-words">{error}</p>
      </div>
      <p className="text-xs text-gray-400 mt-4">Pastikan database sudah terhubung dengan benar di Vercel.</p>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 space-y-4">
      <CircularProgress size={48} strokeWidth={4} color="text-blue-600" />
      <p className="text-sm font-medium animate-pulse">Memuat dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Usulan" 
          value={stats.total_usulan} 
          icon={Package} 
          colorClass="bg-[#E2F7D8]" 
          linkTo="/usulan" 
        />
        <StatCard 
          title="Total Hibah" 
          value={stats.total_hibah} 
          icon={FileBox} 
          colorClass="bg-[#D0F0FD]" 
          linkTo="/hibah" 
        />
        <StatCard 
          title="Total Pokir" 
          value={stats.total_pokir} 
          icon={Box} 
          colorClass="bg-[#E0D4FC]" 
          linkTo="/pokir" 
        />
        <StatCard 
          title="Total Musrembang" 
          value={stats.total_musrembang || 0} 
          icon={Users} 
          colorClass="bg-[#FFF4CC]" 
          linkTo="/musrembang" 
        />
        <StatCard 
          title="Belum Diverifikasi" 
          value={stats.total_draft || 0} 
          icon={Clock} 
          colorClass="bg-[#F0E6EF]" 
          linkTo="/usulan?status=DRAFT" 
        />
        <StatCard 
          title="Diterima" 
          value={stats.diterima} 
          icon={CheckCircle} 
          colorClass="bg-[#FFD6D6]" 
          linkTo="/usulan?status=DITERIMA" 
        />
        <StatCard 
          title="Ditolak" 
          value={stats.ditolak} 
          icon={XCircle} 
          colorClass="bg-[#D1D5FF]" 
          linkTo="/usulan?status=DITOLAK" 
        />
        <StatCard 
          title="Dikembalikan" 
          value={stats.dikembalikan} 
          icon={RefreshCcw} 
          colorClass="bg-[#B9FBC0]" 
          linkTo="/usulan?status=DIKEMBALIKAN" 
        />
      </div>
    </div>
  );
}
