'use client';

import { useState } from 'react';
import { Folder as FolderIcon, FileText, RotateCcw, Trash2 } from 'lucide-react';
import { restoreFile, deleteFilePermanently } from '@/app/actions/file-actions';
import { restoreFolder, deleteFolderPermanently } from '@/app/actions/folder-actions';
import { useRouter } from 'next/navigation';

export default function TrashBrowser({ initialFolders, initialFiles }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState(null);

    const handleRestore = async (item, type) => {
        setLoadingId(item._id);
        try {
            if (type === 'folder') {
                await restoreFolder(item._id);
            } else {
                await restoreFile(item._id);
            }
            router.refresh();
        } catch (error) {
            alert('Failed to restore item');
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDeleteForever = async (item, type) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete "${item.name}"? This cannot be undone.`)) return;

        setLoadingId(item._id);
        try {
            if (type === 'folder') {
                await deleteFolderPermanently(item._id);
            } else {
                await deleteFilePermanently(item._id);
            }
            router.refresh();
        } catch (error) {
            alert('Failed to delete item');
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    if (initialFolders.length === 0 && initialFiles.length === 0) {
        return (
            <div className="glass-panel p-12 rounded-xl text-center flex flex-col items-center justify-center text-slate-400">
                <Trash2 size={48} className="mb-4 opacity-50" />
                <p className="text-lg">Trash is empty</p>
                <p className="text-sm opacity-60">Items moved to trash will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Folders */}
            {initialFolders.map((folder) => (
                <div
                    key={folder._id}
                    className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-3 aspect-square relative group border border-transparent hover:border-red-500/20 transition-all bg-slate-900/40"
                >
                    <FolderIcon size={48} className="text-slate-500 fill-slate-500/10 group-hover:text-slate-400 transition-colors" />
                    <span className="text-sm font-medium text-slate-400 truncate w-full text-center group-hover:text-slate-200">{folder.name}</span>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                        {loadingId === folder._id ? (
                            <span className="loading loading-spinner text-white"></span>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleRestore(folder, 'folder')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-32 justify-center"
                                >
                                    <RotateCcw size={16} /> Restore
                                </button>
                                <button
                                    onClick={() => handleDeleteForever(folder, 'folder')}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-32 justify-center"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {/* Files */}
            {initialFiles.map((file) => (
                <div
                    key={file._id}
                    className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center gap-3 aspect-square relative group border border-transparent hover:border-red-500/20 transition-all bg-slate-900/40"
                >
                    <div className="h-12 w-12 rounded bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-slate-400 transition-colors">
                        <FileText size={24} />
                    </div>
                    <div className="text-center w-full">
                        <p className="text-sm font-medium text-slate-400 truncate group-hover:text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-600">{file.size} KB</p>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                        {loadingId === file._id ? (
                            <span className="loading loading-spinner text-white"></span>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleRestore(file, 'file')}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-32 justify-center"
                                >
                                    <RotateCcw size={16} /> Restore
                                </button>
                                <button
                                    onClick={() => handleDeleteForever(file, 'file')}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-32 justify-center"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
