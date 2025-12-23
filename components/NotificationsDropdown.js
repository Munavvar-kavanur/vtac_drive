'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { markAsRead } from '@/app/actions/notification-actions';
import { useRouter } from 'next/navigation';

export default function NotificationsDropdown({ notifications, unreadCount, onRefresh, onClose }) {
    const [isMarking, setIsMarking] = useState(false);
    const router = useRouter();

    const handleMarkAllRead = async () => {
        setIsMarking(true);
        await markAsRead('all');
        await onRefresh();
        setIsMarking(false);
    };

    const handleItemClick = async (n) => {
        if (!n.isRead) {
            await markAsRead(n._id);
            onRefresh();
        }
        if (n.link) {
            router.push(n.link);
            onClose();
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-emerald-400" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-400" />;
            case 'error': return <AlertCircle size={16} className="text-red-400" />;
            default: return <Info size={16} className="text-blue-400" />;
        }
    };

    return (
        <div className="absolute top-full right-0 mt-4 w-80 md:w-96 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden glass-panel z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-500/20">
                            {unreadCount} New
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={isMarking}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <Check size={14} /> Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                        <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center">
                            <Bell size={20} className="text-slate-600" />
                        </div>
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => handleItemClick(n)}
                                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                            >
                                <div className="mt-1 shrink-0">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">
                                            {getRelativeTime(n.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                        {n.message}
                                    </p>
                                </div>
                                {!n.isRead && (
                                    <div className="mt-2 shrink-0">
                                        <div className="h-2 w-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
