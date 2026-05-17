# 🎬 Intelligent Video Bookmarking System

An AI-powered web application for watching videos with automatic transcription, smart bookmarking, and semantic search.

## Features

✅ **Automatic Transcription** - Uses Whisper AI to transcribe videos with timestamps
✅ **Smart Bookmarking** - Create bookmarks instantly without pausing (Ctrl+B)
✅ **AI Summaries** - Auto-generated contextual summaries for each bookmark
✅ **Semantic Search** - Search video content by meaning, not just keywords
✅ **Export Notes** - Export bookmarks as formatted Markdown
✅ **Topic Detection** - Automatically detect topic changes in videos

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Python FastAPI
- **Database**: SQLite
- **AI/ML**: Whisper (transcription) + Sentence Transformers (search)
- **Video**: react-player

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- FFmpeg (for audio extraction)

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Optional: Set Claude API key for better summaries
# Create .env file:
echo ANTHROPIC_API_KEY=your_key_here > .env

# Run server
python main.py
```

Backend will run on http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## Usage

1. **Upload Video**: Click to upload any video file (MP4, WebM, MKV)
2. **Wait for Processing**: Transcription takes ~2x video length
3. **Watch & Bookmark**: Press Ctrl+B anytime to create a bookmark
4. **Search**: Use semantic search to find specific topics
5. **Export**: Download your notes as Markdown

## Keyboard Shortcuts

- `Ctrl+B` - Create bookmark at current timestamp

## API Endpoints

- `POST /api/upload-video` - Upload video file
- `GET /api/video/{id}` - Get video metadata
- `GET /api/video/{id}/transcript` - Get transcript
- `POST /api/bookmark` - Create bookmark
- `GET /api/video/{id}/bookmarks` - Get all bookmarks
- `POST /api/search` - Semantic search
- `GET /api/video/{id}/export` - Export notes

## Project Structure

```
video-bookmark-agent/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # SQLite operations
│   ├── transcription.py     # Whisper integration
│   ├── embeddings.py        # Sentence transformers
│   ├── ai_summarizer.py     # AI summaries
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUpload.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── BookmarksList.jsx
│   │   │   └── SemanticSearch.jsx
│   │   ├── api/client.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Configuration

### Whisper Model Size

Edit `backend/transcription.py` to change model:
- `tiny` - Fastest, least accurate
- `base` - Good balance (default)
- `small` - Better accuracy
- `medium` - High accuracy, slower
- `large` - Best accuracy, very slow

### AI Summaries

The system uses Claude API for summaries. Without an API key, it falls back to simple extraction.

To enable Claude:
1. Get API key from https://console.anthropic.com/
2. Create `backend/.env` file
3. Add: `ANTHROPIC_API_KEY=your_key_here`

## Performance Tips

- Use `base` Whisper model for 2x video length processing
- Use `tiny` model for 1x video length (less accurate)
- First video takes longer (downloads models)
- Subsequent videos are faster (models cached)

## Deployment

### Free Hosting Options

- **Frontend**: Vercel (free tier)
- **Backend**: Render.com (free tier)
- **Database**: SQLite on Render disk
- **Videos**: Cloudflare R2 (10GB free)

## Troubleshooting

**Whisper not working?**
- Install FFmpeg: `winget install ffmpeg` (Windows)
- Try smaller model: `tiny` or `base`

**Search too slow?**
- Reduce `top_k` parameter in search
- Use smaller embedding model

**Out of memory?**
- Use smaller Whisper model
- Process shorter videos first

## License

MIT

## Contributing

Pull requests welcome! Focus on:
- Performance improvements
- UI/UX enhancements
- Additional export formats
- Mobile responsiveness
