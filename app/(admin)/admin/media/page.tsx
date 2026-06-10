'use client';

import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Loader2, Trash2, Copy, Check, X, Grid, List } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { bytesToSize } from '@/lib/utils';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = () => {
    setLoading(true);
    fetch('/api/media')
      .then((r) => r.json())
      .then((d) => setFiles(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(uploadFiles)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/media', { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.success) toast.error(`Failed to upload ${file.name}`);
      }
      toast.success('Files uploaded successfully!');
      fetchMedia();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if ((await res.json()).success) {
      toast.success('File deleted');
      fetchMedia();
    } else {
      toast.error('Failed to delete');
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(id);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground text-sm">{files.length} files stored</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-muted rounded-lg">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="gradient"
            loading={uploading}
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Images, Videos, PDFs, Documents</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : files.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No media files yet</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div key={file._id} className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {isImage(file.mimeType) ? (
                  <Image src={file.url} alt={file.alt || file.originalName} fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 p-3">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                      {file.mimeType.split('/')[1]}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(file.url, file._id)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Copy URL"
                >
                  {copied === file._id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deleteFile(file._id)}
                  className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate">{file.originalName}</p>
                <p className="text-[10px] text-muted-foreground">{bytesToSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {['File', 'Type', 'Size', 'Uploaded', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id} className="border-b border-border/50 hover:bg-accent/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {isImage(file.mimeType) ? (
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm text-foreground truncate max-w-xs">{file.originalName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground font-mono">{file.mimeType}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{bytesToSize(file.size)}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(file.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => copyUrl(file.url, file._id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        {copied === file._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteFile(file._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
