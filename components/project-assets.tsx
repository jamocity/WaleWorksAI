'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Image as ImageIcon, LoaderCircle, Trash2, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { ProjectFile } from '@/lib/types';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
]);

export function ProjectAssets({ projectId, ownerId, files, canManage = true }: { projectId: string; ownerId: string; files: (ProjectFile & { signedUrl?: string | null })[]; canManage?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function upload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError('');
    setUploading(true);
    const supabase = createClient();
    try {
      for (const file of Array.from(fileList)) {
        if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than the 15 MB limit.`);
        if (!ACCEPTED.has(file.type)) throw new Error(`${file.name} is not an accepted file type.`);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
        const path = `${ownerId}/${projectId}/${crypto.randomUUID()}-${safeName}`;
        const { error: storageError } = await supabase.storage.from('project-assets').upload(path, file, { upsert: false, contentType: file.type });
        if (storageError) throw storageError;
        const { error: rowError } = await supabase.from('project_files').insert({
          project_id: projectId,
          owner_id: ownerId,
          file_name: file.name,
          storage_path: path,
          mime_type: file.type,
          size_bytes: file.size,
        });
        if (rowError) {
          await supabase.storage.from('project-assets').remove([path]);
          throw rowError;
        }
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function removeFile(file: ProjectFile) {
    setRemoving(file.id);
    setError('');
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from('project-assets').remove([file.storage_path]);
    if (storageError) setError(storageError.message);
    else {
      const { error: rowError } = await supabase.from('project_files').delete().eq('id', file.id).eq('owner_id', ownerId);
      if (rowError) setError(rowError.message);
      router.refresh();
    }
    setRemoving(null);
  }

  return (
    <div className="assets-panel">
      <div className="asset-list">
        {files.length === 0 ? <div className="empty-assets"><FileText size={20} /><span>No files attached yet.</span></div> : files.map((file) => (
          <div className="asset-row" key={file.id}>
            <span className="asset-icon">{file.mime_type?.startsWith('image/') ? <ImageIcon size={17} /> : <FileText size={17} />}</span>
            <div className="asset-copy">{file.signedUrl ? <a href={file.signedUrl} target="_blank" rel="noreferrer">{file.file_name}</a> : <span>{file.file_name}</span>}<small>{file.size_bytes ? `${(file.size_bytes / 1024 / 1024).toFixed(1)} MB` : 'File'}</small></div>
            {canManage && <button type="button" className="icon-button asset-remove" aria-label={`Remove ${file.file_name}`} onClick={() => removeFile(file)} disabled={removing === file.id}>{removing === file.id ? <LoaderCircle size={15} className="spin" /> : <Trash2 size={15} />}</button>}
          </div>
        ))}
      </div>
      {canManage && <>
        <input ref={inputRef} type="file" multiple hidden onChange={(event) => upload(event.target.files)} />
        <button type="button" className="upload-zone" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <LoaderCircle size={20} className="spin" /> : <UploadCloud size={20} />}
          <span><strong>{uploading ? 'Uploading files...' : 'Add project evidence'}</strong><small>PDF, images, documents or MP4 · up to 15 MB each</small></span>
        </button>
        {error && <div className="form-alert error" role="alert">{error}</div>}
      </>}
    </div>
  );
}
