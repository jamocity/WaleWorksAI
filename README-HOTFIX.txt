WaleWorks AI — Workday Simulation Route Hotfix

Purpose
The simulation catalogue links to /dashboard/work-simulations/<slug>, but the deployed build output previously showed only /dashboard/work-simulations and did not show the dynamic [slug] route. This patch adds the missing simulation detail route, its interactive runner, and its submission API route.

Install
1. Stop the local Next.js server (Ctrl+C).
2. Extract the contents of this ZIP directly into the WaleWorksAI project root (the folder containing package.json).
3. When prompted, allow the added files/folders to be merged. Do not replace unrelated files.
4. Confirm these files exist:
   - app/dashboard/work-simulations/[slug]/page.tsx
   - components/work-simulation-runner.tsx
   - app/api/work-simulations/submit/route.ts
5. Run npm run build.
6. If the build succeeds, commit and push the changes to main. Vercel should then deploy automatically.

Database
The route can render without a new database table. Submitting a simulation requires public.work_simulation_attempts. If that table does not exist yet, run the separate additive SQL migration supplied with this hotfix in Supabase SQL Editor. Do not rerun schema.sql or reset the database.

Safety
This patch does not include .env files, credentials, node_modules, .next, or .git.
