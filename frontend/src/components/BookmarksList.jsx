export default function BookmarksList({ bookmarks, onSeek }) {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const tagColors = {
        definition: 'bg-blue-100 text-blue-800',
        example: 'bg-green-100 text-green-800',
        important: 'bg-red-100 text-red-800',
        custom: 'bg-gray-100 text-gray-800',
    };

    // Helper function to render auto_context
    const renderAutoContext = (autoContext) => {
        if (!autoContext) return null;
        
        // If auto_context is a string, try to parse it as JSON
        if (typeof autoContext === 'string') {
            try {
                autoContext = JSON.parse(autoContext);
            } catch (e) {
                // If parsing fails, just show it as a string
                return (
                    <div className="mt-2 p-2 bg-yellow-900 bg-opacity-30 rounded text-sm text-yellow-200">
                        <strong>AI Summary:</strong> {autoContext}
                    </div>
                );
            }
        }

        // Handle the auto_context object format
        return (
            <div className="mt-2 p-3 bg-yellow-900 bg-opacity-30 rounded text-sm text-yellow-200 space-y-2">
                <div className="font-semibold">
                    {autoContext.title || 'AI Summary'}
                    {autoContext.category && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-800 bg-opacity-50 rounded">
                            {autoContext.category}
                        </span>
                    )}
                </div>
                
                {Array.isArray(autoContext.summary) ? (
                    <ul className="list-disc list-inside space-y-1">
                        {autoContext.summary.map((point, i) => (
                            <li key={i} className="text-yellow-100">{point}</li>
                        ))}
                    </ul>
                ) : (
                    <p>{JSON.stringify(autoContext)}</p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold sticky top-0 bg-gray-800 py-2">
                📑 Bookmarks ({bookmarks.length || 0})
            </h2>

            {(!bookmarks || bookmarks.length === 0) ? (
                <p className="text-gray-400 text-center py-8">
                    No bookmarks yet. Press Ctrl+B while watching to create one!
                </p>
            ) : (
                bookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition"
                        onClick={() => onSeek(bookmark.timestamp)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-primary font-mono font-bold">
                                {formatTime(bookmark.timestamp)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${tagColors[bookmark.tag] || tagColors.custom}`}>
                                {bookmark.tag || 'custom'}
                            </span>
                        </div>

                        {bookmark.transcript_snippet && (
                            <p className="text-sm text-gray-300 mb-2">
                                {bookmark.transcript_snippet}
                            </p>
                        )}

                        {bookmark.auto_context && renderAutoContext(bookmark.auto_context)}

                        {bookmark.user_note && (
                            <p className="mt-2 text-sm italic text-gray-400">
                                📝 {bookmark.user_note}
                            </p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
