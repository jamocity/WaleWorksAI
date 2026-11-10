export type CareerRoadmap = {
  summary: string;
  outcomes: string[];
  foundations: string[];
  tools: string[];
  stages: { title: string; detail: string }[];
  portfolioProjects: string[];
};

export const CAREER_ROADMAPS: Record<string, CareerRoadmap> = {
  'Software Development': {
    summary: 'Design, build, test and maintain software that solves real user and business problems.',
    outcomes: ['Build accessible interfaces or reliable services', 'Work with APIs, data and version control', 'Test changes and explain technical decisions'],
    foundations: ['Programming fundamentals', 'Data structures and problem solving', 'Git and collaborative workflows', 'HTTP, APIs and databases', 'Testing, debugging and accessibility'],
    tools: ['JavaScript / TypeScript', 'HTML and CSS', 'Git and GitHub', 'React / Next.js', 'SQL and API clients'],
    stages: [
      { title: 'Build the foundations', detail: 'Learn one language well, practise small exercises, understand the browser or runtime, and use Git for every project.' },
      { title: 'Build complete applications', detail: 'Create responsive interfaces, connect APIs, persist data and handle loading, errors and authentication safely.' },
      { title: 'Work like a team', detail: 'Use branches, pull requests, code reviews, issue tracking, tests and clear technical documentation.' },
      { title: 'Show evidence', detail: 'Publish two or three finished projects with a live demo, repository, screenshots and honest explanations of your contribution.' },
    ],
    portfolioProjects: ['A responsive service-booking application', 'A role-based inventory or task API', 'A tested dashboard connected to a database'],
  },
  'Data & Analytics': {
    summary: 'Turn raw information into reliable analysis, dashboards and decisions that stakeholders can act on.',
    outcomes: ['Clean and validate datasets', 'Define metrics and analyse trends', 'Communicate findings with clear visuals'],
    foundations: ['Spreadsheets and data quality', 'SQL querying and joins', 'Statistics and analytical reasoning', 'Data visualisation', 'Business communication'],
    tools: ['Excel / Google Sheets', 'SQL', 'Power BI / Tableau', 'Python (pandas)', 'Git for analysis projects'],
    stages: [
      { title: 'Learn to inspect data', detail: 'Practise sorting, filtering, cleaning, missing-value checks and documenting assumptions in spreadsheets.' },
      { title: 'Query and analyse', detail: 'Use SQL to join tables, group measures, define metrics and check that totals reconcile.' },
      { title: 'Visualise responsibly', detail: 'Build dashboards with clear labels, suitable charts, useful filters and a short explanation of limitations.' },
      { title: 'Present a recommendation', detail: 'Turn analysis into a concise insight: what changed, why it may have changed, what is known and what should happen next.' },
    ],
    portfolioProjects: ['Retail sales performance analysis', 'Customer support response-time dashboard', 'Public dataset quality audit and insight report'],
  },
  Cybersecurity: {
    summary: 'Reduce digital risk by monitoring systems, investigating alerts and helping organisations respond safely.',
    outcomes: ['Recognise common threats and security signals', 'Triage and document incidents', 'Apply defensive controls and safe procedures'],
    foundations: ['Networking and operating systems', 'Identity and access management', 'Security principles and risk', 'Logs and incident triage', 'Clear evidence handling'],
    tools: ['Linux command line', 'Wireshark', 'SIEM learning labs', 'Nmap in authorised labs only', 'Python / PowerShell basics'],
    stages: [
      { title: 'Understand systems', detail: 'Learn how networks, Windows and Linux systems, accounts and permissions work before investigating alerts.' },
      { title: 'Practise defensive analysis', detail: 'Use legal training labs to inspect sample logs, classify alerts and distinguish normal activity from suspicious patterns.' },
      { title: 'Follow incident process', detail: 'Record evidence, assess impact, escalate appropriately and avoid destructive or unauthorised actions.' },
      { title: 'Document your lab work', detail: 'Publish sanitised lab reports that describe the scenario, evidence, reasoning, containment and lessons.' },
    ],
    portfolioProjects: ['Sample authentication-log investigation', 'Home-lab network inventory and hardening report', 'Phishing-awareness analysis using synthetic examples'],
  },
  'Cloud & DevOps': {
    summary: 'Help teams deploy and operate applications reliably through automation, infrastructure and observability.',
    outcomes: ['Deploy and configure applications', 'Automate repeatable delivery tasks', 'Monitor services and troubleshoot failures'],
    foundations: ['Linux and networking', 'Git and scripting', 'Cloud concepts and IAM', 'Containers and CI/CD', 'Monitoring and reliability'],
    tools: ['Linux', 'Docker', 'GitHub Actions', 'AWS / Azure / Google Cloud fundamentals', 'Terraform fundamentals'],
    stages: [
      { title: 'Learn infrastructure basics', detail: 'Practise Linux, DNS, HTTP, SSH, environment variables, permissions and shell scripting.' },
      { title: 'Package applications', detail: 'Containerise a small app and understand images, ports, storage, secrets and health checks.' },
      { title: 'Automate delivery', detail: 'Create a CI pipeline that runs checks and builds an application when code changes.' },
      { title: 'Operate and explain', detail: 'Deploy a sample service, add basic logs and health monitoring, then document a rollback and incident response.' },
    ],
    portfolioProjects: ['Containerised web application', 'CI pipeline with automated tests', 'Cloud deployment with architecture and cost notes'],
  },
  'IT Support & Systems Administration': {
    summary: 'Keep people productive by diagnosing device, account, network and application issues safely.',
    outcomes: ['Triage and prioritise service requests', 'Troubleshoot common endpoint issues', 'Communicate clearly and document resolutions'],
    foundations: ['Windows and Linux basics', 'Networking fundamentals', 'Accounts and permissions', 'Hardware and software support', 'Ticketing and customer communication'],
    tools: ['Windows tools', 'Linux terminal', 'Microsoft 365 fundamentals', 'Remote-support concepts', 'Ticketing practice environments'],
    stages: [
      { title: 'Build technical foundations', detail: 'Understand operating systems, files, users, permissions, devices, IP addressing and common connectivity issues.' },
      { title: 'Practise structured troubleshooting', detail: 'Use a repeatable process: clarify symptoms, assess impact, reproduce, test one change at a time and verify.' },
      { title: 'Communicate professionally', detail: 'Write useful tickets, set expectations, protect credentials and escalate when risk or access exceeds your role.' },
      { title: 'Create a support portfolio', detail: 'Document fictional tickets and lab exercises with symptoms, evidence, actions, outcome and prevention.' },
    ],
    portfolioProjects: ['Home-lab network and device inventory', 'Knowledge-base guide for common support issues', 'Sample service-desk ticket triage report'],
  },
  'QA & Software Testing': {
    summary: 'Improve product quality by finding defects, designing useful tests and communicating risk clearly.',
    outcomes: ['Write reproducible bug reports', 'Design test cases and coverage', 'Automate stable, valuable checks'],
    foundations: ['Software development lifecycle', 'Test design techniques', 'Web and API basics', 'Defect lifecycle', 'Automation fundamentals'],
    tools: ['Browser DevTools', 'Postman', 'Playwright / Cypress', 'Jira-style issue tracking', 'Git'],
    stages: [
      { title: 'Learn test thinking', detail: 'Practise equivalence classes, boundary values, negative cases, exploratory testing and risk-based prioritisation.' },
      { title: 'Test web and APIs', detail: 'Inspect network requests, validate API responses and test realistic user journeys across browsers and devices.' },
      { title: 'Write strong bug reports', detail: 'Include environment, steps, expected and actual results, evidence, severity and reproducibility.' },
      { title: 'Automate critical paths', detail: 'Use Playwright or Cypress to automate a few high-value journeys and run them consistently in CI.' },
    ],
    portfolioProjects: ['Test plan for a registration and login flow', 'API test collection with edge cases', 'Playwright regression suite for a sample storefront'],
  },
  'UI/UX & Product Design': {
    summary: 'Understand user needs and translate them into accessible, usable product experiences.',
    outcomes: ['Research user problems', 'Create flows, wireframes and prototypes', 'Evaluate usability and communicate design decisions'],
    foundations: ['User research and synthesis', 'Information architecture', 'Interaction and visual design', 'Accessibility', 'Usability testing'],
    tools: ['Figma', 'FigJam', 'Accessibility checkers', 'Prototype testing', 'Design documentation'],
    stages: [
      { title: 'Understand the problem', detail: 'Define users, context and constraints. Use interviews or evidence rather than assuming what users need.' },
      { title: 'Map the experience', detail: 'Create journey maps, task flows and information architecture before polishing screens.' },
      { title: 'Prototype and test', detail: 'Build low- and high-fidelity prototypes, test representative tasks and record observed friction.' },
      { title: 'Explain design decisions', detail: 'Present the problem, evidence, alternatives, accessibility choices, iterations and remaining questions.' },
    ],
    portfolioProjects: ['Redesign a confusing service flow', 'Mobile-first student service prototype', 'Usability study with findings and design iterations'],
  },
  'AI & Machine Learning': {
    summary: 'Build data-informed applications and models, while evaluating quality, limitations and responsible use.',
    outcomes: ['Prepare data and evaluate model outputs', 'Build a small AI-enabled application', 'Explain limitations and safety considerations'],
    foundations: ['Python programming', 'Statistics and linear algebra basics', 'Data preparation', 'Machine-learning evaluation', 'Responsible AI and privacy'],
    tools: ['Python', 'Jupyter', 'pandas / scikit-learn', 'Git', 'Model APIs and evaluation datasets'],
    stages: [
      { title: 'Strengthen Python and data skills', detail: 'Learn functions, files, packages, notebooks, data cleaning and basic descriptive statistics.' },
      { title: 'Understand model evaluation', detail: 'Train simple baseline models and learn splits, metrics, overfitting, leakage and error analysis.' },
      { title: 'Build a useful prototype', detail: 'Create a narrow application and test it on realistic examples, including failures and edge cases.' },
      { title: 'Publish responsible evidence', detail: 'Document data sources, evaluation method, limitations, privacy decisions and appropriate human oversight.' },
    ],
    portfolioProjects: ['Exploratory data analysis notebook', 'Baseline classification model with error analysis', 'Small AI assistant with evaluation examples and safety notes'],
  },
  'Networking & Infrastructure': {
    summary: 'Design, configure and troubleshoot the networks and infrastructure that connect systems.',
    outcomes: ['Understand network addressing and routing', 'Diagnose connectivity issues', 'Document infrastructure and security decisions'],
    foundations: ['OSI and TCP/IP concepts', 'IPv4 addressing and subnetting', 'Switching and routing', 'DNS, DHCP and firewalls', 'Network troubleshooting'],
    tools: ['Cisco Packet Tracer', 'Wireshark', 'Linux networking tools', 'Network diagrams', 'Configuration labs'],
    stages: [
      { title: 'Learn network fundamentals', detail: 'Practise addressing, subnetting, ports, protocols, DNS, DHCP, switching and routing.' },
      { title: 'Build a safe lab', detail: 'Use a simulator or isolated lab to configure small networks and observe how traffic moves.' },
      { title: 'Troubleshoot methodically', detail: 'Use ping, traceroute, DNS checks and packet captures to isolate a fault without changing production systems.' },
      { title: 'Document your design', detail: 'Publish diagrams, addressing plans, configurations with secrets removed, test evidence and troubleshooting notes.' },
    ],
    portfolioProjects: ['Small office network design in Packet Tracer', 'Subnetting and IP allocation plan', 'Packet-capture analysis of a sample connectivity issue'],
  },
  'Product Management & Business Analysis': {
    summary: 'Connect user and business needs to clear requirements, prioritised work and measurable product outcomes.',
    outcomes: ['Discover and define problems', 'Write testable requirements', 'Align stakeholders around scope and outcomes'],
    foundations: ['Stakeholder analysis', 'User stories and acceptance criteria', 'Process mapping', 'Prioritisation', 'Product metrics and communication'],
    tools: ['Miro / FigJam', 'Jira-style boards', 'Spreadsheets', 'SQL basics', 'Prototyping tools'],
    stages: [
      { title: 'Explore the problem', detail: 'Identify users and stakeholders, map the current process and gather evidence of unmet needs.' },
      { title: 'Define requirements', detail: 'Write user stories, acceptance criteria, process diagrams and assumptions that can be tested.' },
      { title: 'Prioritise delivery', detail: 'Compare value, urgency, effort and risk. Make trade-offs explicit and keep scope manageable.' },
      { title: 'Measure outcomes', detail: 'Define success measures, review feedback and explain what should change in the next iteration.' },
    ],
    portfolioProjects: ['Requirements pack for a campus service app', 'Current-to-future process map', 'Prioritised product backlog with acceptance criteria'],
  },
  'Technical Writing': {
    summary: 'Make complex technical information understandable, accurate and useful to its intended audience.',
    outcomes: ['Write clear task-based documentation', 'Structure information for discovery', 'Validate instructions with users or technical owners'],
    foundations: ['Audience and task analysis', 'Plain-language writing', 'Information architecture', 'Technical accuracy', 'Version control and review'],
    tools: ['Markdown', 'Git / GitHub', 'Docs platforms', 'Screenshots and diagrams', 'Basic HTML'],
    stages: [
      { title: 'Study the audience and task', detail: 'Identify what the reader needs to accomplish, what they already know and where they may get stuck.' },
      { title: 'Write task-based guides', detail: 'Use clear prerequisites, numbered steps, expected results, warnings and troubleshooting notes.' },
      { title: 'Review technical accuracy', detail: 'Validate each instruction with a technical owner or test environment and keep examples current.' },
      { title: 'Publish a documentation sample', detail: 'Create a small guide set with consistent structure, diagrams, change history and feedback.' },
    ],
    portfolioProjects: ['Quick-start guide for an open-source tool', 'Troubleshooting knowledge-base article set', 'API endpoint documentation with examples'],
  },
  'Exploring IT careers': {
    summary: 'Compare different IT roles through short exercises and projects before committing to a specialisation.',
    outcomes: ['Understand what different IT teams do', 'Try small tasks across several role families', 'Choose a direction using evidence from practice'],
    foundations: ['Digital and programming fundamentals', 'Problem solving and communication', 'Basic data and web literacy', 'Reflection on interests and strengths'],
    tools: ['Browser developer tools', 'Spreadsheets', 'GitHub', 'Figma', 'Beginner-friendly labs'],
    stages: [
      { title: 'Explore role families', detail: 'Read role descriptions and identify the problems each team solves in a typical organisation.' },
      { title: 'Try short practical tasks', detail: 'Complete a small data exercise, a simple web task, a test plan and a basic troubleshooting exercise.' },
      { title: 'Reflect on the work', detail: 'Record what you enjoyed, what challenged you and which skills you want to strengthen.' },
      { title: 'Choose a first direction', detail: 'Select one or two paths to explore more deeply, then revisit the roadmap as your interests change.' },
    ],
    portfolioProjects: ['A small portfolio project from one chosen path', 'A comparison of three IT roles and their daily work', 'A reflection log from three practical simulations'],
  },
};
