from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict

class EmbeddingService:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize sentence transformer model
        all-MiniLM-L6-v2 is fast and good for semantic search
        """
        self.model = SentenceTransformer(model_name)
    
    def encode_segments(self, texts: List[str]) -> np.ndarray:
        """
        Encode text segments into embeddings
        """
        return self.model.encode(texts, convert_to_numpy=True)
    
    def detect_topic_boundaries(self, segments: List[Dict], threshold: float = 0.65) -> List[Dict]:
        """
        Detect topic changes by finding similarity drops between consecutive segments
        """
        texts = [seg['text'] for seg in segments]
        embeddings = self.encode_segments(texts)
        
        boundaries = []
        for i in range(len(embeddings) - 1):
            similarity = cosine_similarity(
                [embeddings[i]], 
                [embeddings[i+1]]
            )[0][0]
            
            if similarity < threshold:
                boundaries.append({
                    'timestamp': segments[i+1]['start'],
                    'segment_id': i+1,
                    'confidence': 1 - similarity
                })
        
        return boundaries
    
    def semantic_search(self, query: str, segment_texts: List[str], 
                       segment_data: List[Dict], top_k: int = 10) -> List[Dict]:
        """
        Search for segments semantically similar to query
        """
        # Encode query and segments
        query_embedding = self.model.encode(query, convert_to_numpy=True)
        segment_embeddings = self.encode_segments(segment_texts)
        
        # Find similar segments
        hits = util.semantic_search(query_embedding, segment_embeddings, top_k=top_k)
        
        results = []
        for hit in hits[0]:
            idx = hit['corpus_id']
            results.append({
                'timestamp': segment_data[idx]['start_time'],
                'text': segment_data[idx]['text'],
                'relevance_score': hit['score']
            })
        
        return results
