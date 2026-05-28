# VedaAI – AI Assessment Creator

This project is a full-stack AI Assessment Creator that allows teachers to generate structured question papers using AI.

## Features

- **Assignment Creation**: Form-based creation with file upload support (PDF/Text).
- **AI Generation**: Uses Google Gemini to generate structured questions based on subject, grade, and question types.
- **Background Processing**: BullMQ handles generation jobs to ensure responsiveness.
- **Real-time Updates**: WebSockets provide live status updates to the frontend.
- **Professional Output**: Generated papers are styled like realistic physical exam sheets.
- **Responsive Design**: Premium UI inspired by provided Figma designs.

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Zustand, Socket.io-client, Axios, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis, BullMQ, Socket.io.
- **AI**: Google Generative AI (Gemini Pro).

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Gemini API Key

### Installation

1. **Clone the repository** (if you haven't already).
2. **Setup Backend**:
    ```bash
    cd backend
    npm install
    cp .env.example .env # Fill in your Gemini API Key
    npm run dev
    ```
3. **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Docker (Alternative)

You can run everything using Docker Compose:
```bash
GEMINI_API_KEY=your_key docker-compose up --build
```

The frontend runs on `http://localhost:3001` (port 3000 is commonly already in use).

## Architecture

VedaAI is split into three runtime layers: a Next.js frontend, an Express API server, and an asynchronous generation worker backed by Redis/BullMQ. MongoDB stores the assignment request, generation status, and final paper.

```text
Teacher UI (Next.js)
        |
        |  multipart form data
        v
Express API + Multer
        |
        |  create assignment record
        v
MongoDB
        |
        |  enqueue generation job
        v
Redis + BullMQ
        |
        |  process job
        v
Gemini AI Service
        |
        |  validated sections/questions
        v
MongoDB + Socket.io status event
        |
        v
Processing / Result pages
```

### Frontend

- **Create page**: Collects assessment metadata, question type/count/marks configuration, optional instructions, and optional PDF/text reference file.
- **State management**: Zustand keeps form state and generated assignment status local to the app flow.
- **Processing page**: Joins a Socket.io room for the assignment ID and listens for `pending`, `processing`, `completed`, or `failed` updates.
- **Result page**: Fetches the generated assignment by ID, renders it as a physical exam paper, supports regeneration, and uses print-optimized styling for PDF export.

### Backend

- **Express API** exposes assignment endpoints:
  - `POST /api/assignments` creates an assignment and queues AI generation.
  - `GET /api/assignments/:id` returns the current assignment state and generated sections.
  - `POST /api/assignments/:id/regenerate` resets the assignment and queues a new generation job.
- **Multer upload handling** accepts a single reference file. PDF content is extracted with `pdf-parse`; text files are read directly. Temporary uploads are removed after extraction.
- **MongoDB/Mongoose** stores the assignment request, calculated totals, generation status, and generated question sections.
- **BullMQ worker** runs generation outside the request/response cycle so the UI remains responsive while Gemini is producing the assessment.
- **Socket.io** broadcasts job status updates to the assignment-specific room so the processing screen can react immediately.

### Data Model

An assignment contains the title, subject, grade, due date, requested question types, total marks, total questions, optional instructions, generation status, and generated sections. Each section contains questions with text, optional MCQ options, difficulty, marks, and optional correct answer.

## Approach

The implementation focuses on keeping the user-facing flow fast while isolating slower AI work in the background.

1. **Capture structured intent**: The frontend asks for subject, grade, due date, question types, counts, marks, and teacher instructions. This gives the AI prompt enough structure to produce predictable sections instead of a generic worksheet.
2. **Validate before queuing**: The API checks required fields and ensures each question type has a positive count and marks value before writing to MongoDB or creating a BullMQ job.
3. **Convert uploaded context into prompt context**: Optional PDF/text uploads are read on the backend and appended to the additional instructions, allowing the generator to use teacher-provided material without changing the frontend contract.
4. **Use asynchronous processing**: Assignment creation returns quickly with an assignment ID. Generation happens in a BullMQ worker, which updates MongoDB and emits real-time Socket.io status events.
5. **Constrain AI output**: Gemini is prompted to return JSON only. The response is parsed, validated with a schema, and normalized before it is stored.
6. **Make refreshes and reconnects resilient**: The processing page fetches the current assignment state on load and then listens for Socket.io events, so it can recover even if the socket event was missed.
7. **Present a print-ready result**: The generated sections are rendered as a formal question paper with marks, difficulty labels, instructions, and browser print support for PDF export.

## Optional Bonus Implemented
- PDF Export (via browser print with optimized CSS).
- File upload (PDF/Text) for contextual question generation.
- Real-time status tracker (WebSocket).
- Premium "Physical Paper" styling.

## Notes

- If you previously ran MongoDB `latest` via Docker, you may need to reset the compose volume when switching versions:

```bash
docker-compose down -v
```
