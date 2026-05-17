import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import numpy as np

class Database:
    def __init__(self, db_path: str = "video_bookmarks.db"):
        self.db_path = db_path
        self.init_db()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Videos table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                duration REAL,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'processing'
            )
        """)
        
        # Transcript segments
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transcript_segments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id INTEGER NOT NULL,
                start_time REAL NOT NULL,
                end_time REAL NOT NULL,
                text TEXT NOT NULL,
                FOREIGN KEY(video_id) REFERENCES videos(id)
            )
        """)
        
        # Bookmarks
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id INTEGER NOT NULL,
                timestamp REAL NOT NULL,
                user_note TEXT,
                auto_context TEXT,
                transcript_snippet TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                tag TEXT DEFAULT 'custom',
                FOREIGN KEY(video_id) REFERENCES videos(id)
            )
        """)
        
        # Segment embeddings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS segment_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                segment_id INTEGER NOT NULL,
                embedding BLOB NOT NULL,
                FOREIGN KEY(segment_id) REFERENCES transcript_segments(id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def create_video(self, filename: str, duration: float = None) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO videos (filename, duration) VALUES (?, ?)",
            (filename, duration)
        )
        video_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return video_id
    
    def update_video_status(self, video_id: int, status: str):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE videos SET status = ? WHERE id = ?",
            (status, video_id)
        )
        conn.commit()
        conn.close()
    
    def update_video_summary(self, video_id: int, summary: dict) -> bool:
        """
        Update video with summary information
        
        Args:
            video_id: ID of the video
            summary: Dictionary containing summary data
            
        Returns:
            bool: True if update was successful
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # First check if the summary column exists, if not add it
            cursor.execute("PRAGMA table_info(videos)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'summary' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN summary TEXT")
            
            # Update the video with summary
            cursor.execute(
                "UPDATE videos SET summary = ? WHERE id = ?",
                (json.dumps(summary), video_id)
            )
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Error updating video summary: {str(e)}")
            conn.rollback()
            return False
        finally:
            conn.close()
            
    def get_video(self, video_id: int) -> Optional[Dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos WHERE id = ?", (video_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def add_transcript_segments(self, video_id: int, segments: List[Dict]):
        conn = self.get_connection()
        cursor = conn.cursor()
        for seg in segments:
            cursor.execute(
                """INSERT INTO transcript_segments 
                   (video_id, start_time, end_time, text) 
                   VALUES (?, ?, ?, ?)""",
                (video_id, seg['start'], seg['end'], seg['text'])
            )
        conn.commit()
        conn.close()
    
    def get_transcript_segments(self, video_id: int) -> List[Dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM transcript_segments WHERE video_id = ? ORDER BY start_time",
            (video_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def create_bookmark(self, video_id: int, timestamp: float, 
                       user_note: str = None, auto_context: str = None,
                       transcript_snippet: str = None, tag: str = 'custom') -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO bookmarks 
               (video_id, timestamp, user_note, auto_context, transcript_snippet, tag)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (video_id, timestamp, user_note, auto_context, transcript_snippet, tag)
        )
        bookmark_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return bookmark_id
    
    def get_bookmarks(self, video_id: int) -> List[Dict]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM bookmarks WHERE video_id = ? ORDER BY timestamp",
            (video_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def save_embeddings(self, segment_id: int, embedding: np.ndarray):
        conn = self.get_connection()
        cursor = conn.cursor()
        embedding_bytes = embedding.tobytes()
        cursor.execute(
            "INSERT INTO segment_embeddings (segment_id, embedding) VALUES (?, ?)",
            (segment_id, embedding_bytes)
        )
        conn.commit()
        conn.close()
    
    def get_embeddings(self, video_id: int) -> List[np.ndarray]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT se.embedding 
            FROM segment_embeddings se
            JOIN transcript_segments ts ON se.segment_id = ts.id
            WHERE ts.video_id = ?
            ORDER BY ts.start_time
        """, (video_id,))
        rows = cursor.fetchall()
        conn.close()
        return [np.frombuffer(row[0], dtype=np.float32) for row in rows]
    
    def delete_video(self, video_id: int) -> bool:
        """
        Delete a video and all associated data (transcripts, bookmarks, embeddings)
        
        Args:
            video_id: ID of the video to delete
            
        Returns:
            bool: True if deletion was successful
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Delete embeddings first (foreign key constraint)
            cursor.execute("""
                DELETE FROM segment_embeddings 
                WHERE segment_id IN (
                    SELECT id FROM transcript_segments WHERE video_id = ?
                )
            """, (video_id,))
            
            # Delete transcript segments
            cursor.execute("DELETE FROM transcript_segments WHERE video_id = ?", (video_id,))
            
            # Delete bookmarks
            cursor.execute("DELETE FROM bookmarks WHERE video_id = ?", (video_id,))
            
            # Delete video record
            cursor.execute("DELETE FROM videos WHERE id = ?", (video_id,))
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Error deleting video {video_id}: {str(e)}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def get_all_videos(self) -> List[Dict]:
        """Get all videos with their metadata"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM videos ORDER BY upload_date DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def clear_all_data(self) -> bool:
        """
        Clear all data from the database (use with caution!)
        
        Returns:
            bool: True if successful
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("DELETE FROM segment_embeddings")
            cursor.execute("DELETE FROM transcript_segments")
            cursor.execute("DELETE FROM bookmarks")
            cursor.execute("DELETE FROM videos")
            conn.commit()
            return True
        except Exception as e:
            print(f"Error clearing database: {str(e)}")
            conn.rollback()
            return False
        finally:
            conn.close()
