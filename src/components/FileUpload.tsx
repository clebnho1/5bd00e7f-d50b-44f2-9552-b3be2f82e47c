
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Trash2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploadProps {
  folder?: string;
  onUploadComplete?: (fileData: any) => void;
  acceptedTypes?: string;
}

export function FileUpload({ 
  folder = 'general', 
  onUploadComplete,
  acceptedTypes = "*/*" 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { uploadFile, uploading, uploadProgress } = useFileUpload();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    const result = await uploadFile(file, folder);
    if (result && onUploadComplete) {
      onUploadComplete(result);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Arquivos
        </CardTitle>
        <CardDescription>
          Arraste e solte arquivos aqui ou clique para selecionar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <Upload className="h-12 w-12 mx-auto text-primary" />
              </div>
              <div className="space-y-2">
                <p>Enviando arquivo...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  Clique para selecionar ou arraste arquivos aqui
                </p>
                <p className="text-sm text-gray-500">
                  Máximo 10MB por arquivo
                </p>
              </div>
              <Button variant="outline" disabled={uploading}>
                <File className="w-4 h-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
