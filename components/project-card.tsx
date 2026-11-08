import Link from 'next/link';
import { ArrowUpRight, CalendarDays, LockKeyhole, Globe2 } from 'lucide-react';
import type { Project } from '@/lib/types';
import { formatDate, formatStatus } from '@/lib/utils';

export function ProjectCard({ project, href }: { project: Project; href?: string }) {
  const destination = href ?? `/dashboard/projects/${project.id}`;
  return (
    <article className="project-card">
      <div className="project-card-topline">
        <span className="category-label">{project.category}</span>
        <span className={`visibility-chip ${project.visibility}`}>
          {project.visibility === 'public' ? <Globe2 size={12} /> : <LockKeyhole size={12} />}
          {project.visibility}
        </span>
      </div>
      <Link href={destination} className="project-card-title">
        <h3>{project.title}</h3><ArrowUpRight size={17} />
      </Link>
      <p className="project-card-description">{project.description || 'Add a short description to help people understand what you are building.'}</p>
      <div className="project-card-tags">
        <span>{project.discipline}</span>
        {project.skills?.slice(0, 2).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <div className="project-progress-wrap">
        <span className={`project-status-label ${project.status}`}>{formatStatus(project.status)}</span>
      </div>
      <div className="project-card-footer">
        <span><CalendarDays size={13} /> Updated {formatDate(project.updated_at)}</span>
        <Link href={destination} aria-label={`Open ${project.title}`}><ArrowUpRight size={17} /></Link>
      </div>
    </article>
  );
}
