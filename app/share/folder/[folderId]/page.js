import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import File from '@/models/File';
import { notFound } from 'next/navigation';
import { Folder as FolderIcon, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import '@/app/globals.css';

// Simple size formatter
const formatSize = (kb) => {
    if (!kb) return '0 B';
    if (kb < 1024) return kb + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
}

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

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="font-bold text-white">C</span>
                </div>
                <span className="font-semibold text-lg text-slate-100">CloudManager</span>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                            <FolderIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{folder.name}</h1>
                            <p className="text-slate-400 text-sm">{files.length} files • {folders.length} folders</p>
                        </div>

                        {files.length > 0 && (
                            <div className="ml-auto">
                                <a
                                    href={`/share/folder/${folderId}/download-all`}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 font-medium"
                                >
                                    <Download size={18} />
                                    <span>Download All</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Folders List */}
                    {folders.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folders.map(f => (
                                <Link href={`/share/folder/${f._id}`} key={f._id} className="glass-panel p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all flex items-center gap-3">
                                    <FolderIcon size={20} className="text-blue-400" />
                                    <span className="truncate">{f.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Files List */}
                    <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-white/5 text-slate-300 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Size</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {files.map(file => (
                                    <tr key={file._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <FileText size={16} className="text-slate-500" />
                                            <span className="text-slate-200">{file.name}</span>
                                        </td>
                                        <td className="px-6 py-4">{formatSize(file.size)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {file.shareToken ? (
                                                <a
                                                    href={`/share/${file.shareToken}`}
                                                    className="text-blue-400 hover:text-blue-300 text-xs bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                                                >
                                                    Safe Download
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-600">Not shared</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {files.length === 0 && folders.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                                            Empty folder
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
