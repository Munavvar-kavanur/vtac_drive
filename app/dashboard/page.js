import { FileText, Image as ImageIcon, Film, Music } from 'lucide-react';
import { getDashboardStats } from '@/app/actions/dashboard-actions';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import DashboardUploader from '@/components/RootFileUploader';

// Simple size formatter helper
const formatSize = (kb) => {
    if (kb === 0) return '0 B';
    if (kb < 1024) return Math.round(kb) + ' KB';
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(1) + ' MB';
    return (mb / 1024).toFixed(1) + ' GB';
};

const getIconForType = (type) => {
    switch (type) {
        case 'Images': return ImageIcon;
        case 'Media': return Film;
        case 'Audio': return Music;
        default: return FileText;
    }
};

const getBgColorForType = (type) => {
    switch (type) {
        case 'Images': return 'bg-purple-500/10 text-purple-400';
        case 'Media': return 'bg-orange-500/10 text-orange-400';
        case 'Audio': return 'bg-green-500/10 text-green-400';
        default: return 'bg-blue-500/10 text-blue-400';
    }
}


export default async function DashboardPage() {
    const data = await getDashboardStats();

    // Map stats key to display label and order
    const statCards = [
        { key: 'Images', label: 'Images' },
        { key: 'Documents', label: 'Documents' },
        { key: 'Media', label: 'Media' },
        { key: 'Audio', label: 'Audio' }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {data.user.name}</h1>
                <p className="text-slate-400">Here&apos;s what&apos;s happening with your storage today.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map((card) => {
                    const stat = data.stats[card.key] || { count: 0, size: 0 };
                    const Icon = getIconForType(card.key);
                    const colorClass = getBgColorForType(card.key);

                    return (
                        <div key={card.key} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className={`h-12 w-12 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
                                <Icon size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{formatSize(stat.size)}</h3>
                            <p className="text-slate-400 text-sm">{card.label} • {stat.count} files</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Files Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Recent Files</h2>
                    <Link href="/dashboard/recent" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
                </div>

                {data.recentFiles.length > 0 ? (
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-white/5 text-slate-300 font-medium border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Size</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Modified</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.recentFiles.map((file) => (
                                    <tr key={file._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <FileText size={16} />
                                            </div>
                                            <span className="text-slate-200 font-medium truncate max-w-[200px]">{file.name}</span>
                                        </td>
                                        <td className="px-6 py-4">{formatSize(file.size)}</td>
                                        <td className="px-6 py-4 truncate max-w-[150px]">{file.mimeType}</td>
                                        <td className="px-6 py-4">{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Could add a simple dropdown or link to view here */}
                                            <span className="text-xs text-slate-600">View in Files</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-12 glass-panel rounded-2xl border border-white/5">
                        <p className="text-slate-400">No recent files found.</p>
                    </div>
                )}
            </div>

            <DashboardUploader />
        </div>
    );
}
