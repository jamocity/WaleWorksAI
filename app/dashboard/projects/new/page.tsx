import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { ProjectForm } from '@/components/project-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ discipline?: string }> }) {
  const { discipline } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  return <div className="dashboard-page narrow-page"><Link href="/dashboard/projects" className="back-link"><ArrowLeft size={15} /> Back to projects</Link><SectionHeading eyebrow="NEW REPOSITORY" title="Create a project" description="Start with the problem. Add detail as your work develops." /><div className="editor-card"><ProjectForm ownerId={user.id} initialDiscipline={discipline} /></div></div>;
}
