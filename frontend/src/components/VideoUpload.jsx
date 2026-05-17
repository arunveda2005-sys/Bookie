import { useState, useCallback } from 'react';
import { api } from '../api/client';
import { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

export default function VideoUpload({ onVideoUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        // Check file type
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid video file (MP4, WebM, MKV)');
            return;
        }

        // Check file size (max 500MB)
        if (file.size > 500 * 1024 * 1024) {
            setError('File size should be less than 500MB');
            return;
        }

        setFile(file);
        setFileName(file.name);
        setError(null);
    };

    const removeFile = () => {
        setFile(null);
        setFileName('');
        setError(null);
    };

    const uploadFile = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const result = await api.uploadVideo(file);
            onVideoUploaded(result.video_id);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload video. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    Upload Your Video
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Get AI-powered insights, summaries, and bookmarks from your educational videos
                </p>
            </div>

            <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-900/10' : 'border-gray-700 hover:border-gray-600'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="space-y-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800">
                        <FiUpload className="h-8 w-8 text-blue-400" />
                    </div>
                    
                    {!file ? (
                        <>
                            <div className="text-sm text-gray-400">
                                <label 
                                    htmlFor="file-upload" 
                                    className="relative cursor-pointer font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                                >
                                    <span>Upload a file</span>
                                    <input 
                                        id="file-upload" 
                                        name="file-upload" 
                                        type="file" 
                                        className="sr-only"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">MP4, WebM, or MKV up to 500MB</p>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <FiFile className="h-5 w-5 text-blue-400" />
                                    <span className="text-sm font-medium text-gray-200 truncate max-w-xs">
                                        {fileName}
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={removeFile}
                                    className="text-gray-400 hover:text-gray-200"
                                    disabled={uploading}
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={uploadFile}
                                disabled={uploading}
                                className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                                    uploading 
                                        ? 'bg-blue-600 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FiUpload className="mr-2 h-5 w-5" />
                                        Process Video
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-start">
                    <FiAlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-200">Error</h3>
                        <div className="mt-1 text-sm text-red-400">{error}</div>
                    </div>
                </div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Fast Processing</h3>
                    <p className="text-gray-400 text-sm">Quickly process your videos with our AI-powered system</p>
                </div>

                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">AI-Powered</h3>
                    <p className="text-gray-400 text-sm">Get smart summaries and insights from your videos</p>
                </div>

                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Secure & Private</h3>
                    <p className="text-gray-400 text-sm">Your files are processed securely and never shared</p>
                </div>
            </div>
        </div>
    );
}
