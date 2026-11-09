export const CAREER_PATHS = [
  'Software Development',
  'Data & Analytics',
  'Cybersecurity',
  'Cloud & DevOps',
  'IT Support & Systems Administration',
  'QA & Software Testing',
  'UI/UX & Product Design',
  'AI & Machine Learning',
  'Networking & Infrastructure',
  'Product Management & Business Analysis',
  'Technical Writing',
  'Exploring IT careers',
] as const;

export const CAREER_STAGES = [
  { value: 'exploring', label: 'Exploring — I am still choosing a path' },
  { value: 'student', label: 'Student — learning the fundamentals' },
  { value: 'portfolio_building', label: 'Building projects and a portfolio' },
  { value: 'internship_seeking', label: 'Preparing for internships' },
  { value: 'entry_level', label: 'Preparing for my first full-time IT role' },
  { value: 'career_switcher', label: 'Transitioning into an IT career' },
] as const;


/** Specific entry-level roles help WaleWorks tailor scenarios more precisely than a broad career area alone. */
export const CAREER_ROLES_BY_PATH: Record<string, string[]> = {
  'Software Development': ['Junior Frontend Developer', 'Junior Backend Developer', 'Junior Full-stack Developer', 'Junior Mobile App Developer'],
  'Data & Analytics': ['Junior Data Analyst', 'Business Intelligence Analyst', 'Data Engineer', 'Data Scientist'],
  'Cybersecurity': ['Junior Security Operations Analyst', 'Junior Security Analyst', 'Penetration Tester', 'GRC Analyst'],
  'Cloud & DevOps': ['Junior Cloud & DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'Platform Engineer'],
  'IT Support & Systems Administration': ['Junior IT Support Analyst', 'Help Desk Technician', 'Systems Administrator', 'IT Operations Analyst'],
  'QA & Software Testing': ['Junior QA Analyst', 'Manual QA Tester', 'Automation QA Engineer', 'Software Test Engineer'],
  'UI/UX & Product Design': ['Junior Product / UX Designer', 'UI Designer', 'UX Designer', 'UX Researcher'],
  'AI & Machine Learning': ['Junior Data / ML Analyst', 'AI Application Developer', 'Machine Learning Engineer', 'MLOps Engineer'],
  'Networking & Infrastructure': ['Junior Network Support Technician', 'Network Engineer', 'Network Administrator', 'Infrastructure Engineer'],
  'Product Management & Business Analysis': ['Junior Business Analyst', 'Product Analyst', 'Associate Product Manager', 'Scrum Master'],
  'Technical Writing': ['Technical Writer', 'Knowledge Base Specialist', 'Developer Documentation Writer'],
  'Exploring IT careers': ['Exploring IT roles', 'Not sure yet'],
};
