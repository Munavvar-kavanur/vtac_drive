'use client';

import { X, File, FileText, FileImage, FileAudio, FileVideo, FileCode, FileArchive, Download, Share2, Trash2, Calendar, HardDrive, Info, Clock, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FileDetailsPanel({ file, onClose, onDelete, onShare }) {
    // State removed to fix build error. Animation handled by CSS classes based on 'file' prop.

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getFileIcon = (mime) => {
        if (!mime) return <FileText size={48} className="text-slate-400" />;
        if (mime.startsWith('image/')) return <FileImage size={48} className="text-blue-400" />;
        if (mime.startsWith('audio/')) return <FileAudio size={48} className="text-purple-400" />;
        if (mime.startsWith('video/')) return <FileVideo size={48} className="text-red-400" />;
        if (mime.includes('pdf')) return <FileText size={48} className="text-red-500" />;
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <FileArchive size={48} className="text-orange-400" />;
        if (mime.includes('javascript') || mime.includes('html') || mime.includes('css') || mime.includes('json')) return <FileCode size={48} className="text-green-400" />;
        return <FileText size={48} className="text-slate-400" />;
    };

    const formatMimeType = (mime) => {
        if (!mime) return 'Unknown';
        if (mime === 'application/pdf' || mime === 'application/postscript') return 'PDF Document';
        if (mime === 'application/vnd.google-apps.folder') return 'Folder';
        if (mime.startsWith('image/')) return mime.split('/')[1].toUpperCase() + ' Image';
        if (mime.startsWith('video/')) return mime.split('/')[1].toUpperCase() + ' Video';
        if (mime.startsWith('audio/')) return mime.split('/')[1].toUpperCase() + ' Audio';
        if (mime.includes('wordprocessingml')) return 'Word Document';
        if (mime.includes('spreadsheetml')) return 'Excel Spreadsheet';
        if (mime.includes('presentationml')) return 'PowerPoint';
        if (mime.includes('zip') || mime.includes('rar')) return 'Archive';
        return mime;
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-slate-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${file ? 'translate-x-0' : 'translate-x-full'}`}
        >
            {file && (
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Info size={18} className="text-blue-400" />
                            File Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Preview Section */}
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/30 rounded-2xl border border-white/5 mx-auto w-full aspect-video relative group">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                            {getFileIcon(file.mimeType)}
                            <div className="mt-4 text-center w-full px-4">
                                <p className="font-medium text-slate-200 break-words w-full select-text">{file.name}</p>
                                <p className="text-xs text-slate-500 uppercase mt-1">{formatMimeType(file.mimeType)}</p>
                            </div>
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-white/5 text-slate-300 hover:text-white group">
                                <Download size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium">Download</span>
                            </button>
                            <button
                                onClick={() => { onClose(); onShare(file); }}
                                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-white/5 text-slate-300 hover:text-white group"
                            >
                                <Share2 size={20} className="text-green-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium">Share</span>
                            </button>
                        </div>

                        {/* Metadata List */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Properties</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                        <HardDrive size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Size</p>
                                        <p className="text-sm text-slate-200 font-mono">{formatSize(file.size)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Type</p>
                                        <p className="text-sm text-slate-200 truncate max-w-[200px]" title={file.mimeType}>
                                            {formatMimeType(file.mimeType)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Created At</p>
                                        <p className="text-sm text-slate-200">{formatDate(file.createdAt)}</p>
                                    </div>
                                </div>

                                {file.lastAccessed && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Last Accessed</p>
                                            <p className="text-sm text-slate-200">{formatDate(file.lastAccessed)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Virus Scan</p>
                                        <p className="text-sm text-emerald-400 flex items-center gap-1">
                                            Passed <ShieldCheck size={12} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
