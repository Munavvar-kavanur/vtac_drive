'use client';

import { useEffect, useState } from 'react';
import { getStorageStats } from '@/app/actions/user-actions';

export default function StorageWidget() {
    const [stats, setStats] = useState({ used: 0, total: 1073741824 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await getStorageStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch storage stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Listen for upload/delete events to refresh stats
        const handleRefresh = () => fetchStats();
        window.addEventListener('refresh-storage-stats', handleRefresh);

        return () => window.removeEventListener('refresh-storage-stats', handleRefresh);
    }, []);

    const percentage = Math.min(100, Math.round((stats.used / stats.total) * 100));

    // Helper to format bytes
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="glass-panel p-4 rounded-xl mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Storage</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                {formatSize(stats.used)} of {formatSize(stats.total)} used
            </p>
        </div>
    );
}
