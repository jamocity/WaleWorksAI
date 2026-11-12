# WaleWorks AI Project Assistant — setup

The assistant uses a zero-cost-first hybrid provider arrangement:

- Local development: Ollama running on the same computer as the Next.js server.
- Production: optional Groq cloud API. It stays disabled until a server-side `GROQ_API_KEY` is explicitly configured in Vercel.
- No AI SDK dependency is added. The integration uses server-side `fetch` against the Ollama chat API and Groq's OpenAI-compatible chat-completions endpoint.

## 1. Apply the Supabase migration

Run `supabase/migrations/20261111_project_ai_assistant.sql` once in Supabase SQL Editor. It creates a daily usage counter and two authenticated RPC functions. Row Level Security is enabled and direct table access is revoked. The table stores request counts only; it does not store student prompts, project content or AI responses.

The limit is 10 AI request attempts per account per UTC day. Requests are counted before calling the provider so concurrent requests cannot exceed the limit. If a provider is unavailable after an attempt is counted, that attempt still uses one allowance.

## 2. Local Ollama

Install and start Ollama on the same computer that runs `npm run dev`. Pull the model configured below if it is not already installed:

```powershell
ollama pull llama3.2:3b
```

Append these values to the existing `.env.local`; do not replace Supabase settings already there:

```env
WALEWORKS_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Restart the Next.js development server after changing environment variables. The Next.js server sends prompts to local Ollama at `127.0.0.1`; no hosted AI API key is required. Ollama's local API uses `POST /api/chat` and supports `stream: false`.

## 3. Production / Vercel

A Vercel function cannot reach Ollama running on a student's personal computer. Therefore, with no cloud key configured, the production assistant shows that it is not connected and makes no AI provider call. This is intentional and keeps initial API spending at zero.

When you decide to enable cloud AI, add these variables to Vercel's Production environment:

```env
WALEWORKS_AI_PROVIDER=groq
GROQ_API_KEY=your_private_server_side_key
GROQ_MODEL=openai/gpt-oss-20b
```

Never use a `NEXT_PUBLIC_` prefix for the provider key. Redeploy after saving the variables. Check the provider's current model list and pricing before activating it; a key or free-tier allowance should not be assumed to provide unlimited free use.

## 4. Student privacy

- Students must explicitly enable **Share project details** before server-selected project fields are placed in the model prompt.
- The only project fields sent are title, description, problem statement, objectives, methodology, category, discipline, status, outcomes, lessons learned and skills.
- Uploaded files, private storage objects, external links, team member names, comments and contribution logs are not sent.
- Groq calls require a separate explicit cloud-processing consent checkbox. The user's message and local conversation context are sent to Groq; selected project details are included only when the project-context checkbox is also enabled.
- Conversations are held in client page state only and are not saved in Supabase. The daily counter stores counts only.
- The assistant gives suggestions. It does not update a project automatically, invent achievements or certify a student's skills.

## 5. Test

1. Start Ollama and ensure the selected model is pulled.
2. Restart the Next.js development server.
3. Open an owned project or a project where your account is an accepted contributor.
4. Open **Project workspace** and find **AI Project Assistant**.
5. Ask a question without project context, then enable **Share project details** and ask for a project review.
6. Confirm the remaining daily count changes after a request.
7. Confirm no prompts or model responses are inserted into Supabase.

Run `npm run typecheck`, `npm run lint` and `npm run build` before deploying.
