import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UsulanTable } from '@/components/UsulanTable';
import { ImportModal } from '@/components/ImportModal';
import { Upload, FileText } from 'lucide-react';

interface UsulanPageProps {
  kategori: 'HIBAH' | 'POKIR' | 'ALL' | 'Musrembang';
}

export function UsulanPage({ kategori }: UsulanPageProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const title = kategori === 'ALL' ? 'Semua Usulan' : `Data ${kategori}`;
  const description = kategori === 'ALL' 
    ? 'Kelola dan validasi semua data usulan dari Excel.' 
    : `Kelola dan validasi usulan ${kategori.toLowerCase()} dari Excel.`;

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        {kategori !== 'ALL' && (
          <Button onClick={() => setIsImportOpen(true)} className="gap-2 w-full sm:w-auto h-9 text-sm">
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
        )}
      </div>

      <div className="bg-card text-card-foreground p-3 md:p-6 rounded-lg border border-border shadow-sm overflow-hidden">
        <UsulanTable key={kategori} kategori={kategori} refreshTrigger={refreshTrigger} />
      </div>

      {kategori !== 'ALL' && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          kategori={kategori as 'HIBAH' | 'POKIR' | 'Musrembang'}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
