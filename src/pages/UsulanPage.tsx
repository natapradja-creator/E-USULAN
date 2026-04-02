import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UsulanTable } from '@/components/UsulanTable';
import { ImportModal } from '@/components/ImportModal';
import { Upload, FileText } from 'lucide-react';

interface UsulanPageProps {
  kategori: 'HIBAH' | 'POKIR';
}

export function UsulanPage({ kategori }: UsulanPageProps) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data {kategori}</h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan validasi usulan {kategori.toLowerCase()} dari Excel.
          </p>
        </div>
        <Button onClick={() => setIsImportOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <UsulanTable key={kategori} kategori={kategori} refreshTrigger={refreshTrigger} />
      </div>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        kategori={kategori}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
