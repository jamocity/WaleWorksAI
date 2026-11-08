# WaleWorks AI

**Beyond CVs. Show What You Can Build.**

A GitHub-inspired student project portfolio platform, designed to help university students document practical work, demonstrate skills and share a professional portfolio. This repository implements the Phase 1 MVP using Next.js App Router, React, TypeScript, Tailwind CSS v4 and Supabase.

## What is implemented

### Phase 1 — working MVP code paths

- Supabase email/password registration, login, email-confirmation callback and session refresh.
- Student onboarding and editable professional profile.
- Public/private profile controls, per-section portfolio visibility, a separate private contact-email record, and user-controlled email display.
- Public profile/portfolio at `/u/[username]`.
- Project repository with create, edit, delete, status, discipline, category, objectives, methodology, skills, outcomes and lessons learned.
- Public, private and unlisted project visibility.
- Private Supabase Storage bucket for project evidence; public avatars in a separate bucket. Unlisted projects use link privacy, not confidential access control.
- Public project details at `/p/[id]` and authenticated project workspace details at `/dashboard/projects/[id]`.
- Database-sourced external URLs are revalidated at render time (HTTP/HTTPS only); notification destinations are restricted to same-origin app paths.
- Project search by title/description, profile completion and dashboard summaries.
- Notifications inbox shell with owner-only read/update access.
- SQL tables and RLS groundwork for Phase 2–4 entities.

### Clearly labelled future phases

- Phase 2: invitations, team workspaces, contribution log, milestone management, comments and mentor feedback workflows. The current schema only allows project owners to create pending invitations; client-side acceptance is disabled until invitee consent is implemented.
- Phase 3: server-side AI documentation assistant, structured assessment rubrics, skills extraction and improvement recommendations. AI assessment records are intentionally write-restricted to trusted server-side service-role code; there is no fabricated AI scoring in this MVP.
- Phase 4: challenge publishing/submissions, employer accounts, student discovery and professional contact workflows.

The landing page's workspace illustration is sample UI data only. `lib/data.ts` contains illustrative sample profile/project records for future preview or test fixtures; they are not inserted as real users or assessments. The only database seed is Wale University directory data and a starter skill taxonomy.

## Requirements

- Node.js 20.9+ (Node 22 recommended)
- npm 10+
- A Supabase project

## Run locally

1. Install packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   `NEXT_PUBLIC_SUPABASE_ANON_KEY` is accepted as a legacy fallback. Set `NEXT_PUBLIC_SITE_URL` to your actual deployment origin before sharing portfolios. Do not put the Supabase service-role key in a `NEXT_PUBLIC_` variable or expose it in browser code.

3. In Supabase, open **SQL Editor** and run `supabase/schema.sql` on a new project. Then run `supabase/seed.sql` for the Wale University pilot departments and starter skills.

4. In Supabase Auth settings, configure the site URL and allowed redirect URL:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
   - Add your production domain callback after deployment.

5. Start Next.js:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

6. Run the checks before deployment:

   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

## Supabase architecture

- Browser auth/storage/data operations use the publishable key and the user's session.
- Server components use `@supabase/ssr` and the cookie-backed session.
- `proxy.ts` refreshes the cookie session with verified claims; route/layout authorization and table RLS remain the security boundary.
- Base `profiles` rows are owner-only. Public portfolios query the restricted `public_profiles` view, which filters academic details, skills/interests, achievements and certifications according to section visibility before returning them. `profile_private` holds contact email under owner-only RLS; the view returns it only when the student explicitly enables email display.
- `project-assets` is private. Objects use `<owner_uuid>/<project_uuid>/<filename>` paths and policies check the authenticated owner/project. Project assets are exposed through short-lived signed URLs only when the requesting session has RLS access.
- `avatars` is a public image bucket; upload policies restrict writes to the owning user's folder.
- Structured skill evidence, AI assessments and human reviews are not publicly readable in Phase 1. AI assessment writes and human-review creation are reserved for trusted server-side workflows in later phases.

## Main routes

| Route | Purpose |
|---|---|
| `/` | Product landing page |
| `/auth/signup` | Create a student account |
| `/auth/login` | Sign in |
| `/onboarding` | Complete student profile |
| `/dashboard` | Student overview |
| `/dashboard/projects` | Project repository |
| `/dashboard/projects/new` | Create a project |
| `/dashboard/projects/[id]` | Project detail and evidence upload |
| `/dashboard/projects/[id]/edit` | Edit project |
| `/dashboard/profile` | Edit profile and portfolio visibility |
| `/dashboard/notifications` | Notifications inbox |
| `/dashboard/settings` | Account and privacy settings |
| `/u/[username]` | Public student portfolio |
| `/p/[id]` | Public project detail |

## Important production checks before inviting real students

- Replace pilot branding/contact details and add the official Wale University identity only with permission.
- Add a verified institution onboarding process rather than trusting a free-text university field.
- Configure Supabase Auth email templates, password reset, rate limits, CAPTCHA/abuse protection and domain allowlists.
- Test RLS using at least two student accounts plus an anonymous session. Verify account A cannot read account B's private project or file; verify anonymous visitors cannot query raw profile rows; and verify `public_profiles` filters hidden academic, skill, achievement, certification and email fields.
- Configure Storage limits, malware scanning and retention rules for uploaded documents.
- Add automated tests for project CRUD, visibility, signed file access, profile privacy and account deletion.
- Add privacy policy, terms, safeguarding/reporting route, backup strategy and audit logging before a public launch.
- Add proper role provisioning and verification flows before enabling mentors, employers or university administrators.
- Add pagination and query limits for public discovery when the project count grows.

## Validation status

The source tree has been parsed across all 37 TypeScript/TSX files with zero syntax diagnostics. All local `@/` imports resolve, and all 20 database tables have row-level security enabled. A full dependency-backed Next.js typecheck/build and ESLint run still need to be completed after `npm install`; the package registry timed out in the build environment and the offline npm cache does not contain the dependencies.

## Current implementation boundaries

This is a deployable product codebase, not a hosted production instance. You must connect a Supabase project, run the SQL, and set environment values before authentication, database reads/writes or uploads can run. AI, collaboration and employer discovery are intentionally not represented as active capabilities until their server-side security and workflows are built.
