WaleWorks AI — Ollama timeout fix

This patch replaces one file only:
app/api/projects/[id]/assistant/route.ts

Changes:
- Reduces maximum generated output from 900 to 420 tokens to keep replies focused.
- Sets a 4096-token context window.
- Keeps the local model loaded for 10 minutes to reduce repeat cold starts.
- Increases the local Ollama request timeout from 55 seconds to 150 seconds.
- Leaves the Vercel function maxDuration unchanged. Ollama remains disabled in production.

Install:
1. Stop `npm run dev` with Ctrl+C.
2. Extract this ZIP into the WaleWorksAI project root (same folder as package.json).
3. Merge folders and replace the one matching route.ts file.
4. Restart `npm run dev`.
5. Test the AI Assistant with a short prompt first, then try Review project.

No SQL migration, npm package, environment-variable change, or API key is required.
Do not upload .env.local to GitHub.
