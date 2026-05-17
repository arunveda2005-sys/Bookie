import { useState, useEffect } from 'react';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';
import VideoManager from './components/VideoManager';

function App() {
    const [videoId, setVideoId] = useState(() => {
        // Try to get videoId from localStorage on initial load
        const savedVideoId = localStorage.getItem('currentVideoId');
        return savedVideoId ? parseInt(savedVideoId) : null;
    });

    // Save videoId to localStorage when it changes
    useEffect(() => {
        if (videoId) {
            localStorage.setItem('currentVideoId', videoId);
        } else {
            localStorage.removeItem('currentVideoId');
        }
    }, [videoId]);

    const handleBackToUpload = () => {
        setVideoId(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
            <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        VideoInsight
                    </h1>
                    {videoId && (
                        <button
                            onClick={handleBackToUpload}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors duration-200 border border-gray-700 hover:border-gray-600"
                        >
                            ← Upload New Video
                        </button>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {!videoId ? (
                    <>
                        <VideoManager
                            currentVideoId={videoId}
                            onVideoDeleted={() => setVideoId(null)}
                        />
                        <VideoUpload onVideoUploaded={setVideoId} />
                    </>
                ) : (
                    <VideoPlayer videoId={videoId} />
                )}
            </main>

            <footer className="border-t border-gray-800 mt-12 py-6">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} VideoInsight. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
