"use client";

import { useCallback, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, UploadCloud } from 'lucide-react';

interface UploadedImage {
  url: string;
  key: string;
  name: string;
}

interface ImageUploaderProps {
  taskId: string;
  userId: string;
  token?: string;
  baseUrl?: string;
}

export default function ImageUploader({
  taskId,
  userId,
  token,
  baseUrl,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    return imageCompression(file, options);
  };

  const uploadSingleFile = async (file: File) => {
    const compressedFile = await compressImage(file);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `images/${Date.now()}-${userId}-${taskId}.${extension}`;

    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('key', key);

    const r2Res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const r2Data = await r2Res.json();
    if (!r2Data.success) {
      throw new Error(r2Data.error || 'Failed to upload to R2');
    }

    const backendUrl = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}/api/tasks/${taskId}/photos`
      : `/api/tasks/${taskId}/photos`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url: r2Data.url }),
    });

    if (!backendRes.ok) {
      throw new Error('Failed to save photo to backend');
    }

    return {
      url: r2Data.url,
      key: r2Data.key,
      name: file.name,
    } satisfies UploadedImage;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Please select only image files');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const total = imageFiles.length;
    let completed = 0;
    const results: UploadedImage[] = [];

    try {
      for (const file of imageFiles) {
        const result = await uploadSingleFile(file);
        results.push(result);
        completed += 1;
        setProgress(Math.round((completed / total) * 100));
      }

      setUploadedImages((prev) => [...prev, ...results]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [taskId, token, userId]);

  const handleDelete = async (image: UploadedImage) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeletingKey(image.key);
    setError(null);

    try {
      const deleteRes = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: image.key }),
      });

      const deleteData = await deleteRes.json();
      if (!deleteData.success) {
        throw new Error(deleteData.error || 'Failed to delete image from storage');
      }

      const backendUrl = baseUrl
        ? `${baseUrl.replace(/\/$/, '')}/api/tasks/${taskId}/photos`
        : `/api/tasks/${taskId}/photos`;

      const backendRes = await fetch(backendUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: image.url }),
      });

      if (!backendRes.ok) {
        throw new Error('Failed to remove image from task');
      }

      setUploadedImages((prev) => prev.filter((img) => img.key !== image.key));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
    } finally {
      setDeletingKey(null);
    }
  };

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files) {
        void handleFiles(event.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-3">
      <div
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          capture="environment"
          onChange={(event) => {
            if (event.target.files) {
              void handleFiles(event.target.files);
            }
          }}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor="image-upload" className="flex cursor-pointer flex-col items-center gap-3">
          <div className="rounded-full bg-muted p-4">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">
              {isDragging ? 'Drop images here' : 'Tap to take a photo or choose files'}
            </p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WebP, and GIF up to 5MB each</p>
          </div>
        </label>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2.5 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">Uploading... {progress}%</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Uploaded ({uploadedImages.length})</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadedImages.map((img) => (
              <div key={img.key} className="group relative overflow-hidden rounded-xl border bg-background">
                <img src={img.url} alt={img.name} className="aspect-square w-full object-cover" />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
                  onClick={() => void handleDelete(img)}
                  disabled={deletingKey === img.key}
                >
                  {deletingKey === img.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
