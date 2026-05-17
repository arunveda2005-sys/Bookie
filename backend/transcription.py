import whisper
from typing import List, Dict

class TranscriptionService:
    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper model
        Models: tiny, base, small, medium, large
        base is good balance of speed/accuracy
        """
        self.model = whisper.load_model(model_size)
    
    def transcribe_video(self, audio_path: str, language: str = None) -> List[Dict]:
        """
        Transcribe audio file and return segments with timestamps
        """
        result = self.model.transcribe(
            audio_path,
            word_timestamps=True,
            language=language  # None for auto-detect
        )
        
        segments = []
        for segment in result['segments']:
            segments.append({
                'start': segment['start'],
                'end': segment['end'],
                'text': segment['text'].strip()
            })
        
        return segments
