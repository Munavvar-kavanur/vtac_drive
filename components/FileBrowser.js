'use client';

import { useState, useRef, useEffect } from 'react';
import { Folder as FolderIcon, FileText, MoreVertical, FolderPlus, FilePlus, UploadCloud, Share2 } from 'lucide-react';
import Link from 'next/link';
import CreateFolderModal from './CreateFolderModal';
import ShareModal from './ShareModal';
import UploadWidget from './UploadWidget';
import FileDetailsPanel from './FileDetailsPanel';
import FileActionsMenu from './FileActionsMenu';
import { createFolder, deleteFolder } from '@/app/actions/folder-actions';
import { deleteFile } from '@/app/actions/file-actions';
import { useRouter } from 'next/navigation';

export default function FileBrowser({ initialFolders, initialFiles, parentId }) {
    const [viewMode, setViewMode] = useState('grid');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [shareItem, setShareItem] = useState(null); // Item to share | null
    const [selectedDetailFile, setSelectedDetailFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Multi-file upload state: { [id]: { id, name, size, progress, status, error, timestamp } }
    const [uploads, setUploads] = useState({});

    const fileInputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleTriggerUpload = () => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        };
        window.addEventListener('trigger-upload', handleTriggerUpload);
        return () => window.removeEventListener('trigger-upload', handleTriggerUpload);
    }, []);

    // Helper to update a single upload's state
    const updateUploadState = (id, updates) => {
        setUploads(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    };

    const uploadSingleFile = async (file, uploadId) => {
        try {
            updateUploadState(uploadId, { status: 'uploading', progress: 0 });

            // 1. Get Resumable Session URL from Server
            const { getUploadSession, finalizeUpload } = await import('@/app/actions/file-actions');
            const finalMimeType = file.type || 'application/octet-stream';

            const sessionResult = await getUploadSession(
                file.name,
                finalMimeType,
                file.size,
                parentId,
                window.location.origin
            );

            if (!sessionResult.success) {
                throw new Error(sessionResult.error || 'Failed to init upload session');
            }

            const uploadUrl = sessionResult.uploadUrl;
            if (!uploadUrl) {
                throw new Error('Server returned no upload URL');
            }

            // 2. Upload directly to Google Drive using XMLHttpRequest
            const driveResponse = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        updateUploadState(uploadId, { progress: percent });
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            // If drive response isn't JSON (sometimes happens with empty 200s), handle partially
                            console.warn('Drive response not JSON:', xhr.responseText);
                            resolve({ id: 'unknown', size: file.size });
                        }
                    } else {
                        // Capture more detail on why it failed
                        reject(new Error(`Drive upload failed: ${xhr.status} ${xhr.statusText}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload (CORS or Connectivity)'));
                });

                xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

                xhr.open('PUT', uploadUrl);
                // Important: Google Drive requires the Content-Type to match what was signed
                xhr.setRequestHeader('Content-Type', finalMimeType);
                xhr.send(file);
            });

            // 3. Finalize on Server
            const finalResult = await finalizeUpload(driveResponse, parentId);

            if (!finalResult.success) {
                throw new Error(finalResult.error || 'Failed to finalize upload record');
            }

            updateUploadState(uploadId, { status: 'completed', progress: 100 });

            // Trigger refresh after each successful upload to update UI immediately
            window.dispatchEvent(new CustomEvent('refresh-storage-stats'));
            router.refresh();

        } catch (error) {
            console.error(`Upload failed for ${file.name}:`, error);
            updateUploadState(uploadId, { status: 'error', error: error.message });
        }
    };

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        // Initialize all uploads in 'pending' state
        const newUploads = {};
        const uploadsToStart = [];

        Array.from(files).forEach(file => {
            const id = Math.random().toString(36).substr(2, 9);
            const uploadObj = {
                id,
                name: file.name,
                size: file.size,
                progress: 0,
                status: 'pending',
                timestamp: Date.now()
            };
            newUploads[id] = uploadObj;
            uploadsToStart.push({ file, id });
        });

        setUploads(prev => ({ ...prev, ...newUploads }));

        // Start all uploads concurrently (browser will limit max connections automatically)
        uploadsToStart.forEach(({ file, id }) => {
            uploadSingleFile(file, id);
        });
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div
            className={`space-y-6 relative min-h-[500px] transition-all ${isDragging ? 'bg-blue-500/10 ring-2 ring-blue-500 ring-inset rounded-xl' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
            />

            {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
                        <UploadCloud size={64} className="text-blue-500 mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-white">Drop files to upload</h3>
                    </div>
                </div>
            )}

            <CreateFolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                parentId={parentId}
            />

            <ShareModal
                key={shareItem ? shareItem._id : 'share-modal'}
                isOpen={!!shareItem}
                onClose={() => setShareItem(null)}
                item={shareItem}
            />

            {/* Interaction Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFolderModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-blue-500/20"
                    >
                        <FolderPlus size={16} /> New Folder
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-sm font-medium"
                    >
                        <FilePlus size={16} />
                        Upload File
                    </button>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                            <div className="bg-current rounded-[1px]"></div><div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div><div className="bg-current rounded-[1px]"></div>
                        </div>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <div className="w-4 h-4 flex flex-col gap-1 justify-center">
                            <div className="h-0.5 w-full bg-current rounded-full"></div>
                            <div className="h-0.5 w-full bg-current rounded-full"></div>
                            <div className="h-0.5 w-full bg-current rounded-full"></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Multi-File Upload Widget */}
            <UploadWidget
                uploads={uploads}
                onClose={() => setUploads({})}
            />

            {/* File Details Side Panel */}
            <FileDetailsPanel
                file={selectedDetailFile}
                onClose={() => setSelectedDetailFile(null)}
                onShare={(file) => setShareItem({ ...file, type: 'file' })}
                onDelete={async (file) => {
                    const result = await deleteFile(file._id);
                    if (result.success) {
                        router.refresh();
                    } else {
                        alert(result.error || 'Failed to delete file');
                    }
                }}
            />

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Folders */}
                    {initialFolders.map((folder) => (
                        <Link
                            href={`/dashboard/folders/${folder._id}`}
                            key={folder._id}
                            className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-3 aspect-square hover:bg-slate-800/80 transition-all group cursor-pointer border border-transparent hover:border-blue-500/50 relative"
                        >
                            <FileActionsMenu
                                item={folder}
                                onShare={(item) => setShareItem({ ...item, type: 'folder' })}
                                onDelete={async () => {
                                    if (confirm(`Are you sure you want to delete "${folder.name}"?`)) {
                                        const result = await deleteFolder(folder._id);
                                        if (result.success) {
                                            router.refresh();
                                        } else {
                                            alert(result.error || 'Failed to delete folder');
                                        }
                                    }
                                }}
                            />
                            <FolderIcon size={48} className="text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-200 truncate w-full text-center">{folder.name}</span>
                        </Link>
                    ))}

                    {/* Files */}
                    {initialFiles.map((file) => (
                        <div
                            key={file._id}
                            onClick={() => setSelectedDetailFile(file)} // Trigger details panel
                            className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-3 aspect-square hover:bg-slate-800/80 transition-all group cursor-pointer border border-transparent hover:border-blue-500/50 relative active:scale-95 duration-200"
                        >
                            <FileActionsMenu
                                item={file}
                                onShare={(item) => setShareItem({ ...item, type: 'file' })}
                                onDelete={async (item) => {
                                    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
                                        const result = await deleteFile(item._id);
                                        if (result.success) {
                                            router.refresh();
                                        } else {
                                            alert(result.error || 'Failed to delete file');
                                        }
                                    }
                                }}
                            />
                            <div className="h-12 w-12 rounded bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                                <FileText size={24} />
                            </div>
                            <div className="text-center w-full">
                                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{file.size ? (file.size / 1024).toFixed(1) + ' KB' : '0 KB'}</p>
                            </div>
                        </div>
                    ))}

                    {initialFolders.length === 0 && initialFiles.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-500">
                            This folder is empty. Start by uploading a file!
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden">
                    {/* List view implementation */}
                    <div className="p-4 text-center text-slate-500">List view coming soon</div>
                </div>
            )}
        </div>
    );
}
