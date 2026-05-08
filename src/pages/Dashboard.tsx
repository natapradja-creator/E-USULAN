import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchStats } from '@/lib/api';
import { FileText, CheckCircle, XCircle, RefreshCcw, Layers, BarChart3, Loader2, Package, Box, Users, ArrowRight, FileBox, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ title, value, icon: Icon, colorClass, linkTo }: { title: string, value: number | string, icon: any, colorClass: string, linkTo: string }) {
  return (
    <div className={`rounded-3xl p-5 md:p-6 flex flex-col justify-between h-36 md:h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorClass}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm md:font-medium text-foreground text-opacity-90 leading-tight">{title}</h3>
        <div className="p-1.5 md:p-2 bg-background/40 dark:bg-black/20 rounded-full">
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight">{value}</div>
        <Link to={linkTo} className="text-[10px] md:text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
          View <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
        </Link>
      </div>
    </div>
  );
}

function DetailedStatCard({ title, value, breakdown, icon: Icon, colorClass, linkTo }: { title: string, value: number | string, breakdown: any, icon: any, colorClass: string, linkTo: string }) {
  const total = typeof value === 'number' ? value : parseInt(value as string) || 0;
  const hibahPct = total === 0 ? 0 : (breakdown.hibah / total) * 100;
  const pokirPct = total === 0 ? 0 : (breakdown.pokir / total) * 100;
  const musrembangPct = total === 0 ? 0 : (breakdown.musrembang / total) * 100;

  return (
    <div className={`rounded-3xl p-5 md:p-6 flex flex-col justify-between h-auto min-h-[10rem] md:min-h-[12rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorClass}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm md:font-medium text-foreground text-opacity-90 leading-tight">{title}</h3>
        <div className="p-1.5 md:p-2 bg-background/40 dark:bg-black/20 rounded-full">
          <Icon className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
        </div>
      </div>
      <div className="flex justify-between items-end mb-4">
        <div className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight">{value}</div>
        <Link to={linkTo} className="text-[10px] md:text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
          View <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
        </Link>
      </div>
      <div className="space-y-3 mt-auto">
        <div className="h-2 w-full bg-background/50 dark:bg-black/20 rounded-full flex overflow-hidden">
          <div style={{ width: `${hibahPct}%` }} className="bg-blue-500" title={`Hibah: ${breakdown.hibah}`} />
          <div style={{ width: `${pokirPct}%` }} className="bg-purple-500" title={`Pokir: ${breakdown.pokir}`} />
          <div style={{ width: `${musrembangPct}%` }} className="bg-orange-500" title={`Musrembang: ${breakdown.musrembang}`} />
        </div>
        <div className="flex flex-wrap gap-x-2 md:gap-x-3 gap-y-1 text-[10px] md:text-xs text-foreground text-opacity-80">
          <div className="flex items-center whitespace-nowrap"><span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 bg-blue-500"></span>Hibah ({breakdown.hibah})</div>
          <div className="flex items-center whitespace-nowrap"><span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 bg-purple-500"></span>Pokir ({breakdown.pokir})</div>
          <div className="flex items-center whitespace-nowrap"><span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5 bg-orange-500"></span>Musrembang ({breakdown.musrembang})</div>
        </div>
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
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-900/50 w-full max-w-2xl overflow-auto">
        <p className="text-sm font-mono text-red-800 dark:text-red-400 break-words">{error}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Pastikan database sudah terhubung dengan benar di Vercel.</p>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground space-y-4">
      <CircularProgress size={48} strokeWidth={4} color="text-blue-600" />
      <p className="text-sm font-medium animate-pulse">Memuat dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Usulan" 
          value={stats.total_usulan} 
          icon={Package} 
          colorClass="bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-900/50" 
          linkTo="/usulan" 
        />
        <StatCard 
          title="Total Hibah" 
          value={stats.total_hibah} 
          icon={FileBox} 
          colorClass="bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-900/50" 
          linkTo="/hibah" 
        />
        <StatCard 
          title="Total Pokir" 
          value={stats.total_pokir} 
          icon={Box} 
          colorClass="bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-900/50" 
          linkTo="/pokir" 
        />
        <StatCard 
          title="Total Musrembang" 
          value={stats.total_musrembang || 0} 
          icon={Users} 
          colorClass="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-900/50" 
          linkTo="/musrembang" 
        />
        <DetailedStatCard 
          title="Belum Diverifikasi" 
          value={stats.total_draft || 0}
          breakdown={stats.breakdowns?.draft || { hibah: 0, pokir: 0, musrembang: 0 }}
          icon={Clock} 
          colorClass="bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800/50" 
          linkTo="/usulan?status=DRAFT" 
        />
        <DetailedStatCard 
          title="Diterima" 
          value={stats.diterima}
          breakdown={stats.breakdowns?.diterima || { hibah: 0, pokir: 0, musrembang: 0 }}
          icon={CheckCircle} 
          colorClass="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-900/50" 
          linkTo="/usulan?status=DITERIMA" 
        />
        <DetailedStatCard 
          title="Ditolak" 
          value={stats.ditolak}
          breakdown={stats.breakdowns?.ditolak || { hibah: 0, pokir: 0, musrembang: 0 }}
          icon={XCircle} 
          colorClass="bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50" 
          linkTo="/usulan?status=DITOLAK" 
        />
        <DetailedStatCard 
          title="Dikembalikan" 
          value={stats.dikembalikan}
          breakdown={stats.breakdowns?.dikembalikan || { hibah: 0, pokir: 0, musrembang: 0 }}
          icon={RefreshCcw} 
          colorClass="bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-900/50" 
          linkTo="/usulan?status=DIKEMBALIKAN" 
        />
      </div>
    </div>
  );
}
