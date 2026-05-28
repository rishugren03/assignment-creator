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

1. **API Request**: Frontend sends form data (and optional file) to Express API.
2. **Job Queuing**: Backend adds a job to BullMQ (Redis-backed).
3. **AI Worker**: BullMQ worker picks up the job, calls Gemini API with a structured prompt, and parses the JSON response.
4. **Data Persistence**: Results are stored in MongoDB.
5. **Real-time Notification**: Worker emits a status update via Socket.io to the frontend.
6. **Result View**: Frontend redirects to the result page to show the formatted question paper.

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

