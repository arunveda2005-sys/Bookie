import { useState } from 'react';
import { api } from '../api/client';

export default function SemanticSearch({ videoId, onResultClick }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const data = await api.search(videoId, query);
            setResults(data.results);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="mb-6">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search: 'explain gradient descent'..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-2 bg-success text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? '...' : '🔍 Search'}
                </button>
            </div>

            {loading && <p className="mt-2 text-gray-400">Searching...</p>}

            {results.length > 0 && (
                <div className="mt-4 space-y-2">
                    {results.map((result, idx) => (
                        <div
                            key={idx}
                            className="p-3 bg-green-900 bg-opacity-30 rounded cursor-pointer hover:bg-opacity-50 transition"
                            onClick={() => onResultClick(result.timestamp)}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-mono text-success font-bold">
                                    {formatTime(result.timestamp)}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {(result.relevance_score * 100).toFixed(0)}% match
                                </span>
                            </div>
                            <p className="text-sm text-gray-300">{result.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {!loading && results.length === 0 && query && (
                <p className="mt-4 text-gray-400 text-center">No results found</p>
            )}
        </div>
    );
}
