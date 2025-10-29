import React, { useEffect, useState } from 'react';
import { Button } from '@ui/components/Button';
import { api } from '../services/api';

type CVResponse = {
  fileName: string;
  mimeType: string;
  size: number;
  extractedText: string | null;
};

export function AboutPage() {
  const [cv, setCv] = useState<CVResponse | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/cv').then((res) => setCv(res.data)).catch(() => {});
  }, []);

  const onUpload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/api/cv/upload', form, true);
      setCv(res.data);
    } finally {
      setLoading(false);
    }
  };

  const onReExtract = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/cv/re-extract', {});
      setCv(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">About Me</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-medium">CV</h2>
        <div className="flex items-center gap-2">
          <input type="file" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button onClick={onUpload} disabled={!file || loading}>{loading ? 'Uploading...' : 'Upload'}</Button>
          <Button variant="secondary" onClick={onReExtract} disabled={loading}>Re-Extract</Button>
        </div>
        {cv && (
          <div className="border rounded p-3 bg-white">
            <div className="text-sm text-gray-600">{cv.fileName} • {cv.mimeType} • {(cv.size/1024).toFixed(1)} KB</div>
            <details className="mt-2">
              <summary className="cursor-pointer">Extracted Text</summary>
              <pre className="whitespace-pre-wrap text-sm mt-2">{cv.extractedText || 'No text extracted yet.'}</pre>
            </details>
          </div>
        )}
      </section>
    </div>
  );
}


