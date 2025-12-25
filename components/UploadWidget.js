'use client';

import { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, CheckCircle, AlertCircle, File, Loader2 } from 'lucide-react';

export default function UploadWidget({ uploads, onClose }) {
    // Compute sorted list directly during render
    const uploadList = Object.values(uploads).sort((a, b) => b.timestamp - a.timestamp);
    const [isExpanded, setIsExpanded] = useState(true);

    if (uploadList.length === 0) return null;

    const activeUploads = uploadList.filter(u => u.status === 'uploading' || u.status === 'pending').length;
    const completedUploads = uploadList.filter(u => u.status === 'completed').length;
    const failedUploads = uploadList.filter(u => u.status === 'error').length;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={18} className="text-green-500" />;
            case 'error': return <AlertCircle size={18} className="text-red-500" />;
            case 'uploading': return <Loader2 size={18} className="text-blue-500 animate-spin" />;
            default: return <File size={18} className="text-slate-500" />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Header / Summary Bubble */}
            <div
                className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden glass-panel w-80 transition-all duration-300 ease-in-out"
                style={{ height: isExpanded ? 'auto' : '60px' }}
            >
                <div
                    className="p-4 flex items-center justify-between cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {activeUploads > 0 ? (
                                <Loader2 size={16} className="text-blue-400 animate-spin" />
                            ) : (
                                <CheckCircle size={16} className="text-green-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white">
                                {activeUploads > 0 ? `Uploading ${activeUploads} file${activeUploads > 1 ? 's' : ''}...` : 'Uploads Completed'}
                            </h4>
                            <p className="text-xs text-slate-400">
                                {completedUploads} done, {failedUploads} failed
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        {activeUploads === 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* List Area */}
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-2 bg-slate-900/50">
                    {uploadList.map((item) => (
                        <div key={item.id} className="bg-slate-800/50 rounded-lg p-3 border border-white/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-1 relative z-10">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {getStatusIcon(item.status)}
                                    <span className="text-sm text-slate-200 truncate font-medium max-w-[150px]" title={item.name}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">
                                    {item.status === 'uploading' ? `${item.progress}%` : item.status === 'error' ? 'Failed' : 'Done'}
                                </span>
                            </div>

                            {/* Progress Bar Background */}
                            {item.status === 'uploading' && (
                                <div className="h-1 w-full bg-slate-700/50 rounded-full overflow-hidden mt-2 relative z-10">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                            )}

                            {/* Error Message */}
                            {item.status === 'error' && (
                                <p className="text-xs text-red-400 mt-1 truncate pl-7" title={item.error}>
                                    {item.error}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
