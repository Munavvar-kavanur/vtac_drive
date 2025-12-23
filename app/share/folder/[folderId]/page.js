
import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import File from '@/models/File';
import { notFound } from 'next/navigation';
import {
    Folder as FolderIcon, FileText, Download, HardDrive,
    FileImage, FileAudio, FileVideo, FileCode, FileArchive
} from 'lucide-react';
import Link from 'next/link';
import '@/app/globals.css';

export default async function SharedFolderPage({ params }) {
    await dbConnect();
    const { folderId } = await params;

    let folder;
    try {
        folder = await Folder.findById(folderId);
    } catch (e) {
        return notFound();
    }

    if (!folder) {
        return notFound();
    }

    // Fetch contents
    const folders = await Folder.find({ parent: folderId, isTrash: { $ne: true } });
    const files = await File.find({ folder: folderId, isTrash: { $ne: true } });

    // --- Helpers ---
    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (mime) => {
        if (!mime) return <FileText size={20} className="text-slate-500" />;
        if (mime.startsWith('image/')) return <FileImage size={20} className="text-blue-400" />;
        if (mime.startsWith('audio/')) return <FileAudio size={20} className="text-purple-400" />;
        if (mime.startsWith('video/')) return <FileVideo size={20} className="text-red-400" />;
        if (mime.includes('pdf')) return <FileText size={20} className="text-red-500" />;
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <FileArchive size={20} className="text-orange-400" />;
        if (mime.includes('javascript') || mime.includes('html') || mime.includes('css') || mime.includes('json')) return <FileCode size={20} className="text-green-400" />;
        return <FileText size={20} className="text-blue-400" />;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <HardDrive size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">V-TAC Drive</span>
                    </div>
                </div>

                {/* Folder Header Card */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/60 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                        <div className="h-20 w-20 bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl ring-1 ring-white/10 shrink-0">
                            <FolderIcon size={40} className="text-blue-400 fill-blue-500/10" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{folder.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="bg-slate-800/80 px-3 py-1 rounded-full border border-white/5">{files.length} files</span>
                                <span className="bg-slate-800/80 px-3 py-1 rounded-full border border-white/5">{folders.length} folders</span>
                            </div>
                        </div>

                        {files.length > 0 && (
                            <a
                                href={`/share/folder/${folderId}/download-all`}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-semibold hover:-translate-y-0.5"
                            >
                                <Download size={20} />
                                <span>Download ZIP</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-6">
                    {/* Folders List */}
                    {folders.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Folders</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folders.map(f => (
                                    <Link
                                        href={`/share/folder/${f._id}`}
                                        key={f._id}
                                        className="group glass-panel p-4 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all flex items-center gap-3"
                                    >
                                        <FolderIcon size={24} className="text-blue-400 fill-blue-500/10 group-hover:scale-110 transition-transform" />
                                        <span className="truncate text-slate-200 group-hover:text-white font-medium">{f.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files List */}
                    {files.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Files</h3>
                            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 bg-slate-900/40">
                                <div className="divide-y divide-white/5">
                                    {files.map(file => (
                                        <div key={file._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors gap-4 group">
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                                    {getFileIcon(file.mimeType)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-200 truncate group-hover:text-white">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                {file.shareToken ? (
                                                    <a
                                                        href={`/share/${file.shareToken}`}
                                                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 px-4 py-2 rounded-lg border border-blue-500/20 hover:border-blue-500 transition-all font-medium"
                                                    >
                                                        <Download size={16} />
                                                        <span className="hidden sm:inline">Download</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-600 px-2">Protected</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {files.length === 0 && folders.length === 0 && (
                        <div className="text-center py-24">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FolderIcon size={32} className="text-slate-600" />
                            </div>
                            <h3 className="text-slate-400 font-medium">This folder is empty</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
