import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function VideoManager({ currentVideoId, onVideoDeleted }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const loadVideos = async () => {
        try {
            const data = await api.getAllVideos();
            setVideos(data.videos);
        } catch (err) {
            console.error('Failed to load videos:', err);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const handleDeleteVideo = async (videoId) => {
        if (!confirm('Delete this video and all its data?')) return;

        setLoading(true);
        try {
            await api.deleteVideo(videoId);
            await loadVideos();
            if (videoId === currentVideoId) {
                onVideoDeleted?.();
            }
            alert('Video deleted successfully!');
        } catch (err) {
            alert('Failed to delete video: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        setLoading(true);
        try {
            const result = await api.clearAllVideos();
            await loadVideos();
            onVideoDeleted?.();
            alert(`All data cleared! ${result.files_deleted} files deleted.`);
            setShowConfirm(false);
        } catch (err) {
            alert('Failed to clear data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ready': return 'text-green-400';
            case 'processing': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">
                    📁 Video Storage ({videos.length} videos)
                </h3>
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={loading || videos.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                    🗑️ Clear All
                </button>
            </div>

            {showConfirm && (
                <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded p-4 mb-4">
                    <p className="text-white mb-3">
                        ⚠️ Are you sure? This will delete ALL videos, transcripts, bookmarks, and embeddings!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClearAll}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Yes, Delete Everything
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {videos.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No videos uploaded yet</p>
                ) : (
                    videos.map((video) => (
                        <div
                            key={video.id}
                            className={`flex justify-between items-center p-3 rounded ${video.id === currentVideoId
                                    ? 'bg-blue-900 bg-opacity-30 border border-blue-600'
                                    : 'bg-gray-700'
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm truncate">
                                    {video.id === currentVideoId && '▶️ '}
                                    {video.filename}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {formatDate(video.upload_date)} •
                                    <span className={`ml-1 ${getStatusColor(video.status)}`}>
                                        {video.status}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteVideo(video.id)}
                                disabled={loading}
                                className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>

            {loading && (
                <div className="mt-4 text-center text-gray-400">
                    Processing...
                </div>
            )}
        </div>
    );
}
