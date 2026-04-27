# StudySprint AI

StudySprint AI is a polished, demo-ready student study copilot built for the Synapse Innovation Hack. It turns messy notes, syllabus text, or topic lists into a structured revision workflow with summaries, flashcards, quizzes, weak-topic drills, and a revision sprint plan.

**Live app:** https://studysprint-ai-rohan-santhoshs-projects.vercel.app  
**GitHub repo:** https://github.com/Rohan5commit/StudySprint-AI

## Why this product works for judges

- **Clear problem:** students waste time turning raw notes into an actual study plan.
- **Fast demo value:** the app is understandable in under 30 seconds.
- **Practical AI:** outputs are grounded to the user’s notes instead of gimmicky generation.
- **Reliable fallback:** if the NVIDIA NIM key is absent or the model response fails, the app still works instantly in demo mode.

## Core features

- Topic input / note upload
- AI summary generation
- Quiz generator
- Flashcard generator
- Weak-area practice mode
- Revision planner by exam date or available study time
- Demo-ready sample subject presets
- Progress dashboard with checklist, quiz accuracy, and flashcard mastery

## Exact repo tree

```text
StudySprint-AI/
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── README.md
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts
│   │   └── practice/
│   │       └── route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── flashcards/
│   │   └── page.tsx
│   ├── plan/
│   │   └── page.tsx
│   ├── quiz/
│   │   └── page.tsx
│   ├── workspace/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── app-shell.tsx
│   ├── dashboard-screen.tsx
│   ├── flashcards-screen.tsx
│   ├── landing-page.tsx
│   ├── plan-screen.tsx
│   ├── quiz-screen.tsx
│   └── workspace-screen.tsx
├── docs/
│   ├── architecture-summary.md
│   ├── demo-script.md
│   ├── elevator-pitch.md
│   ├── final-submission-checklist.md
│   ├── sample-demo-inputs.md
│   └── submission-description.md
├── lib/
│   ├── ai.ts
│   ├── demo-presets.ts
│   ├── store.ts
│   ├── study-engine.ts
│   ├── types.ts
│   └── utils.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── vercel.json
```

## Architecture summary

See [`docs/architecture-summary.md`](docs/architecture-summary.md).

High level:

1. **Landing + workspace UI** in Next.js App Router.
2. **Server routes** call NVIDIA NIM for structured JSON generation.
3. **Fallback study engine** creates local summary / quiz / flashcards / plan when AI is unavailable.
4. **Client-side study store** keeps the dashboard, quiz, flashcards, and revision plan in sync without a database.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local`.

```bash
NVIDIA_NIM_API_KEY=
NVIDIA_NIM_MODEL=openai/gpt-oss-20b
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- If `NVIDIA_NIM_API_KEY` is set, the app uses live AI generation.
- If the key is missing, the app falls back to built-in demo logic and still works instantly.

## Demo flow

1. Open the landing page.
2. Click **Launch instant demo** for a guaranteed live walkthrough.
3. Open **Workspace** and swap to another preset or paste your own notes.
4. Generate a study pack.
5. Walk through **Dashboard → Quiz → Flashcards → Revision plan**.
6. Trigger **Generate weak-area drill** after rating topics or answering a few questions.

## Reliability / fallback behavior

- Text uploads are supported directly.
- PDF and image uploads fail gracefully with a clear paste-text fallback message.
- Every AI route has a deterministic fallback path.
- Seeded presets make the product judge-ready even without live inference.

## Submission assets

- Architecture summary: [`docs/architecture-summary.md`](docs/architecture-summary.md)
- Demo script: [`docs/demo-script.md`](docs/demo-script.md)
- Submission description: [`docs/submission-description.md`](docs/submission-description.md)
- Elevator pitch: [`docs/elevator-pitch.md`](docs/elevator-pitch.md)
- Sample inputs: [`docs/sample-demo-inputs.md`](docs/sample-demo-inputs.md)
- Final manual checklist: [`docs/final-submission-checklist.md`](docs/final-submission-checklist.md)
