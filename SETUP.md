# Setup Guide

## Step-by-Step Installation

### 1. Install Prerequisites

#### Python 3.8+
Check if installed:
```bash
python --version
```

If not installed, download from: https://www.python.org/downloads/

#### Node.js 16+
Check if installed:
```bash
node --version
```

If not installed, download from: https://nodejs.org/

#### FFmpeg (Required for audio extraction)
Windows:
```bash
winget install ffmpeg
```

Or download from: https://ffmpeg.org/download.html

Verify installation:
```bash
ffmpeg -version
```

### 2. Backend Setup

Open terminal in project root:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies (this will take a few minutes)
pip install -r requirements.txt
```

**Note**: First time installation downloads AI models (~500MB). Be patient!

#### Optional: Configure Claude API

For better AI summaries (optional):

1. Get API key from: https://console.anthropic.com/
2. Create `.env` file in `backend/` folder:
```
ANTHROPIC_API_KEY=your_key_here
```

Without this, the system still works but uses simpler summaries.

### 3. Frontend Setup

Open a NEW terminal (keep backend terminal open):

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Start the Application

#### Terminal 1 - Backend:
```bash
cd backend
venv\Scripts\activate  # Windows
python main.py
```

Backend runs on: http://localhost:8000

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:5173

### 5. Test the Application

1. Open browser to http://localhost:5173
2. Upload a short video (1-2 minutes for testing)
3. Wait for processing (shows progress)
4. Once ready, watch video and press Ctrl+B to bookmark
5. Try semantic search
6. Export your notes

## Quick Start Scripts (Windows)

Double-click these files:
- `start-backend.bat` - Starts backend server
- `start-frontend.bat` - Starts frontend dev server

## Troubleshooting

### "Module not found" errors
```bash
# Backend
cd backend
venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### "FFmpeg not found"
Install FFmpeg and restart terminal

### Whisper model download fails
Check internet connection. Models are downloaded on first use.

### Port already in use
Change ports in:
- Backend: `main.py` (line: `uvicorn.run(app, host="0.0.0.0", port=8000)`)
- Frontend: `vite.config.js` (add `server: { port: 5174 }`)

### Video processing stuck
- Check backend terminal for errors
- Try smaller video first
- Use smaller Whisper model (edit `transcription.py`)

## System Requirements

**Minimum**:
- 4GB RAM
- 2GB free disk space
- Dual-core CPU

**Recommended**:
- 8GB RAM
- 5GB free disk space
- Quad-core CPU
- GPU (optional, speeds up Whisper)

## First Run Notes

- First video takes longer (downloads models)
- Whisper `base` model: ~140MB
- Sentence transformer model: ~80MB
- Models are cached for future use
- Processing time: ~2x video length

## Development Mode

Both servers run in development mode with:
- Hot reload (auto-restart on code changes)
- Detailed error messages
- CORS enabled for local development

## Production Deployment

See README.md for deployment options (Vercel, Render, etc.)
