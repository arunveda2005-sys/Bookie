import { useState } from 'react';
import { api } from '../api/client';

export default function SearchTest({ videoId }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testQueries = [
        "what is this about",
        "intelligent animal",
        "fear and danger",
        "main topic",
        "important concept"
    ];

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSearch = async (searchQuery) => {
        const queryToUse = searchQuery || query;
        if (!queryToUse.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const data = await api.search(videoId, queryToUse);
            setResults(data.results);
            console.log('Search results:', data.results);
        } catch (err) {
            setError(err.message);
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
                🔬 Test Semantic Search
            </h3>

            <div className="mb-4">
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter search query..."
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading || !query.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? '⏳' : '🔍'} Search
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="text-gray-400 text-sm">Quick tests:</span>
                    {testQueries.map((testQuery) => (
                        <button
                            key={testQuery}
                            onClick={() => {
                                setQuery(testQuery);
                                handleSearch(testQuery);
                            }}
                            disabled={loading}
                            className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 disabled:opacity-50"
                        >
                            {testQuery}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded p-3 mb-4">
                    <p className="text-red-400">❌ Error: {error}</p>
                </div>
            )}

            {loading && (
                <div className="text-center py-8">
                    <p className="text-gray-400">Searching...</p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm">
                        Found {results.length} results (sorted by relevance)
                    </p>
                    {results.map((result, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-700 rounded p-4 border-l-4 border-blue-500"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-blue-400 font-bold">
                                    ⏱️ {formatTime(result.timestamp)}
                                </span>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400">Relevance Score</span>
                                    <div className="text-lg font-bold text-green-400">
                                        {(result.relevance_score * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-200">{result.text}</p>

                            {/* Visual relevance bar */}
                            <div className="mt-2 bg-gray-600 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
                                    style={{ width: `${result.relevance_score * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && results.length === 0 && query && (
                <div className="text-center py-8">
                    <p className="text-gray-400">No results found for "{query}"</p>
                </div>
            )}

            {!loading && !query && results.length === 0 && (
                <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded p-4">
                    <p className="text-blue-300 text-sm">
                        💡 <strong>Tip:</strong> Semantic search understands meaning, not just keywords!
                        Try searching for concepts like "intelligent animal" and it will find "smart" or "clever" mentions.
                    </p>
                </div>
            )}
        </div>
    );
}
