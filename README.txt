WaleWorks AI workspace page TypeScript fix

Extract this ZIP into the project root (the folder containing package.json). It replaces only app/dashboard/projects/[id]/workspace/page.tsx. It keeps the Supabase select string literal for TypeScript inference and fetches pending invitation email addresses separately for the project owner only. No database migration is required.

Then run: npm run build
