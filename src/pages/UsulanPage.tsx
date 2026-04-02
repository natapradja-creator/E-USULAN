import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UsulanTable } from '@/components/UsulanTable';
import { ImportModal } from '@/components/ImportModal';
import { Upload, FileText } from 'lucide-react';

interface UsulanPageProps {
  kategori: 'HIBAH' | 'POKIR' | 'ALL';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        {kategori !== 'ALL' && (
          <Button onClick={() => setIsImportOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <UsulanTable key={kategori} kategori={kategori} refreshTrigger={refreshTrigger} />
      </div>

      {kategori !== 'ALL' && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          kategori={kategori as 'HIBAH' | 'POKIR'}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
