'use client';

import { Search, Bell, Plus, FileText, Folder, User as UserIcon, LogOut, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { searchFiles } from '@/app/actions/search-actions';
import { getUser, updateProfileImage } from '@/app/actions/user-actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NotificationsDropdown from './NotificationsDropdown';
import { getNotifications } from '@/app/actions/notification-actions';

export default function Topbar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ folders: [], files: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const searchRef = useRef(null);
    const profileRef = useRef(null);
    const fileInputRef = useRef(null);
    const notificationRef = useRef(null);
    const router = useRouter();

    // Fetch user on mount
    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            if (userData) setUser(userData);
        }
        fetchUser();
    }, []);

    // Fetch Notifications
    const fetchNotifications = async () => {
        const result = await getNotifications();
        if (result.success) {
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);

        // Listen for internal triggers (e.g. after upload)
        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refresh-notifications', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refresh-notifications', handleRefresh);
        };
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                const data = await searchFiles(query);
                setResults(data);
                setIsOpen(true);
            } else {
                setResults({ folders: [], files: [] });
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (path) => {
        setIsOpen(false);
        setQuery('');
        router.push(path);
    };

    const handleLogout = async () => {
        const { logout } = await import('@/app/actions/auth-actions');
        await logout();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await updateProfileImage(formData);
        if (result.success) {
            setUser(prev => ({ ...prev, image: result.imageUrl }));
        } else {
            alert(result.error);
        }
        setIsUploading(false);
        setShowProfileMenu(false);
    };

    return (
        <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && setIsOpen(true)}
                        placeholder="Search files, folders..."
                        className="w-full bg-slate-800/50 border border-transparent focus:border-blue-500/50 text-slate-200 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Search Results Dropdown */}
                {isOpen && (results.folders.length > 0 || results.files.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden glass-panel">
                        {results.folders.length > 0 && (
                            <div className="p-2">
                                <h3 className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">Folders</h3>
                                {results.folders.map(folder => (
                                    <button
                                        key={folder._id}
                                        onClick={() => handleNavigate(`/dashboard/folders/${folder._id}`)}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-slate-300 text-sm transition-colors text-left"
                                    >
                                        <Folder size={16} className="text-blue-400" />
                                        <span>{folder.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {results.files.length > 0 && (
                            <div className="p-2 border-t border-white/5">
                                <h3 className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">Files</h3>
                                {results.files.map(file => (
                                    <button
                                        key={file._id}
                                        onClick={() => handleNavigate('#')} // Todo: File preview
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-slate-300 text-sm transition-colors text-left"
                                    >
                                        <FileText size={16} className="text-slate-400" />
                                        <span>{file.name}</span>
                                        <span className="ml-auto text-xs text-slate-500">{file.size} KB</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-all relative ${showNotifications ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <NotificationsDropdown
                            notifications={notifications}
                            unreadCount={unreadCount}
                            onRefresh={fetchNotifications}
                            onClose={() => setShowNotifications(false)}
                        />
                    )}
                </div>

                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('trigger-upload'))}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} />
                    <span className="font-medium">New Upload</span>
                </button>

                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="relative h-9 w-9 rounded-full ring-2 ring-white/10 hover:ring-white/30 transition-all cursor-pointer overflow-hidden"
                    >
                        {user && user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {user ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </button>

                    {showProfileMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden glass-panel z-50">
                            <div className="p-4 border-b border-white/5">
                                <p className="text-white font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
                                    disabled={isUploading}
                                >
                                    <Upload size={16} />
                                    <span>{isUploading ? 'Uploading...' : 'Change Avatar'}</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="p-2 border-t border-white/5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
