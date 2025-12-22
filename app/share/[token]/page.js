import dbConnect from '@/lib/db';
import File from '@/models/File';
import { notFound } from 'next/navigation';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';
import '@/app/globals.css'; // Ensure global styles are applied

export default async function SharePage({ params }) {
    await dbConnect();
    const { token } = await params;

    const file = await File.findOne({ shareToken: token });

    if (!file) {
        return notFound();
    }

    // Format date
    const date = new Date(file.createdAt).toLocaleDateString();
    const size = Math.round(file.size / 1024) + ' MB'; // Assuming stored in KB, or just use raw if KB

    // Simple size formatter
    const formatSize = (kb) => {
        if (kb < 1024) return kb + ' KB';
        return (kb / 1024).toFixed(1) + ' MB';
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">

            {/* Brand */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="font-bold text-white">C</span>
                </div>
                <span className="font-semibold text-lg text-slate-100">CloudManager</span>
            </div>

            <div className="glass-panel p-8 md:p-12 rounded-2xl max-w-lg w-full text-center border border-white/10 shadow-2xl relative overflow-hidden">

                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

                <div className="h-24 w-24 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl ring-1 ring-white/10">
                    <FileText size={48} className="text-blue-400" />
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-white mb-2 break-words">{file.name}</h1>

                <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-8">
                    <span>{formatSize(file.size)}</span>
                    <span>•</span>
                    <span>{date}</span>
                </div>

                <a
                    href={`/share/${token}/download`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/40 hover:scale-[1.02]"
                >
                    <Download size={20} />
                    Download File
                </a>

                <p className="mt-8 text-xs text-slate-500">
                    Shared via CloudManager • Secure File Transfer
                </p>
            </div>
        </div>
    );
}
