'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function remove() {
    if (!window.confirm('Delete this project and its attached records? This cannot be undone.')) return;
    setLoading(true);
    const supabase = createClient();
    const { data: files, error: fileQueryError } = await supabase.from('project_files').select('storage_path').eq('project_id', projectId);
    if (fileQueryError) { window.alert(fileQueryError.message); setLoading(false); return; }
    const paths = (files ?? []).map((file) => file.storage_path);
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from('project-assets').remove(paths);
      if (storageError) { window.alert(storageError.message); setLoading(false); return; }
    }
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      window.alert(error.message);
      setLoading(false);
      return;
    }
    router.push('/dashboard/projects');
    router.refresh();
  }
  return <button className="button button-danger-ghost" type="button" onClick={remove} disabled={loading}>{loading ? <LoaderCircle size={16} className="spin" /> : <Trash2 size={16} />} Delete project</button>;
}
