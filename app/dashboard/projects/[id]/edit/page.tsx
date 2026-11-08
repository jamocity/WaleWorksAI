import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ProjectForm } from '@/components/project-form';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/types';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data } = await supabase.from('projects').select('*').eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!data) notFound();
  return <div className="dashboard-page narrow-page"><Link href={`/dashboard/projects/${id}`} className="back-link"><ArrowLeft size={15} /> Back to project</Link><SectionHeading eyebrow="EDIT REPOSITORY" title="Update your project" description="Keep your project documentation current as the work changes." /><div className="editor-card"><ProjectForm ownerId={user.id} initialProject={data as Project} /></div></div>;
}
