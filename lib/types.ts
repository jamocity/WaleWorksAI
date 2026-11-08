export type ProjectVisibility = 'public' | 'private' | 'unlisted';
export type ProjectStatus = 'planning' | 'in_progress' | 'completed';

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  university: string | null;
  department: string | null;
  academic_level: string | null;
  bio: string | null;
  interests: string[];
  skills: string[];
  achievements: string[];
  certifications: string[];
  avatar_url: string | null;
  location: string | null;
  role: 'student' | 'mentor' | 'employer' | 'admin';
  is_public: boolean;
  show_email: boolean;
  professional_visibility: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string;
  problem_statement: string | null;
  objectives: string[];
  methodology: string | null;
  category: string;
  discipline: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  outcomes: string | null;
  lessons_learned: string | null;
  skills: string[];
  external_links: string[];
  cover_image_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectFile = {
  id: string;
  project_id: string;
  owner_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};
