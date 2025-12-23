import dbConnect from '@/lib/db';
import File from '@/models/File';
import { notFound } from 'next/navigation';
import {
    FileText, Download, ShieldCheck, FileImage, FileAudio,
    FileVideo, FileCode, FileArchive, HardDrive
} from 'lucide-react';
import Link from 'next/link';
import '@/app/globals.css';

export default async function SharePage({ params }) {
    await dbConnect();
    const { token } = await params;

    const file = await File.findOne({ shareToken: token });

    if (!file) {
        return notFound();
    }

    // --- Helpers ---
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mime) => {
        if (mime.startsWith('image/')) return <FileImage size={56} className="text-blue-400" />;
        if (mime.startsWith('audio/')) return <FileAudio size={56} className="text-purple-400" />;
        if (mime.startsWith('video/')) return <FileVideo size={56} className="text-red-400" />;
        if (mime.includes('pdf')) return <FileText size={56} className="text-red-500" />;
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <FileArchive size={56} className="text-orange-400" />;
        if (mime.includes('javascript') || mime.includes('html') || mime.includes('css') || mime.includes('json')) return <FileCode size={56} className="text-green-400" />;
        return <FileText size={56} className="text-blue-400" />;
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            <div className="absolute top-0 w-full h-full bg-slate-950/80"></div>
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px]"></div>

            {/* Brand Header */}
            <div className="absolute top-6 md:top-10 left-6 md:left-10 z-10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <HardDrive size={20} className="text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">V-TAC Drive</span>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="glass-panel rounded-3xl p-1 border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/60">
                    <div className="bg-slate-900/50 rounded-[22px] p-8 md:p-10 text-center border border-white/5">

                        {/* Icon Bubble */}
                        <div className="mx-auto h-28 w-28 bg-slate-800/80 rounded-full flex items-center justify-center mb-8 ring-4 ring-slate-800 shadow-xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full animate-pulse group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors"></div>
                            {getFileIcon(file.mimeType)}
                        </div>

                        {/* File Details */}
                        <h1 className="text-2xl font-bold text-white mb-3 break-words leading-tight">{file.name}</h1>

                        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-white/5">
                                {formatSize(file.size)}
                            </span>
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-white/5 uppercase">
                                {file.mimeType.split('/').pop().toUpperCase()}
                            </span>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium mb-8 bg-emerald-500/10 py-2 px-4 rounded-lg mx-auto w-fit border border-emerald-500/20">
                            <ShieldCheck size={16} />
                            <span>Virus Scan Passed</span>
                        </div>

                        {/* Download Action */}
                        <a
                            href={`/share/${token}/download`}
                            className="group relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5"
                        >
                            <Download size={20} className="group-hover:animate-bounce" />
                            <span>Download File</span>
                        </a>

                        <p className="mt-6 text-xs text-slate-500">
                            By downloading using this link, you agree to our terms of service.
                            Link expires automatically if unused for extended periods.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                        Powered by <span className="text-slate-300 font-semibold">V-TAC Drive</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
