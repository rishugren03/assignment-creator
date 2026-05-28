# VedaAI Frontend

Next.js frontend for the VedaAI hiring assignment. The app lets teachers configure an assessment, upload an optional reference document, track AI generation progress, and view a printable question paper.

## What Is Included

- Assessment creation form with title, subject, grade, due date, question types, marks, and instructions.
- PDF/text reference upload for backend generation context.
- Live processing screen powered by Socket.IO assignment status events.
- Result page formatted as a printable exam paper.
- Responsive UI aligned with the provided Figma direction: compact sidebar navigation, white form panels, neutral canvas, black primary actions, and mobile layouts.

## Tech Stack

- Next.js `16.2.6` with App Router
- React `19.2.4`
- TypeScript
- Zustand for local form state
- Axios for API requests
- Socket.IO client for realtime updates
- Lucide React icons

## Prerequisites

- Node.js 22 recommended, matching the Dockerfile base image.
- npm
- Backend service running on `http://localhost:5000`

The frontend currently calls the backend with hardcoded local URLs in:

- `src/app/page.tsx`
- `src/app/processing/[id]/page.tsx`
- `src/app/result/[id]/page.tsx`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. If port `3000` is already occupied, Next.js will choose another available port and print it in the terminal.

In a separate terminal, start the backend from the repository root:

```bash
cd ../backend
npm install
npm run dev
```

## Available Scripts

```bash
npm run dev
```

Runs the local Next.js development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Serves the production build after `npm run build`.

```bash
npm run lint
```

Runs ESLint with the Next.js and TypeScript rules.

## Routes

- `/` - Create a new assessment.
- `/processing/[id]` - Wait for backend generation and realtime status updates.
- `/result/[id]` - Fetch and display the generated paper, with print/PDF export.

## Docker

Build the frontend image:

```bash
docker build -t vedaai-frontend .
```

Run it:

```bash
docker run --rm -p 3000:3000 vedaai-frontend
```

The container still expects the backend API to be reachable at `http://localhost:5000` from the browser environment.

## Notes

- The app no longer depends on `next/font/google`, so production builds do not require network access to fetch Google fonts.
- Print styles are defined globally in `src/app/globals.css` for the result page.
- Before changing Next.js conventions, read the local docs in `node_modules/next/dist/docs/` as required by `AGENTS.md`.
