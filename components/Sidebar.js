import Link from 'next/link';
import {
    LayoutDashboard,
    FolderOpen,
    HardDrive,
    Clock,
    Star,
    Trash2,
    Settings,
    LogOut
} from 'lucide-react';
import StorageWidget from './StorageWidget';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Files', href: '/dashboard/files', icon: FolderOpen },
    { name: 'Cloud Drives', href: '/dashboard/drives', icon: HardDrive },
    { name: 'Recent', href: '/dashboard/recent', icon: Clock },
    { name: 'Starred', href: '/dashboard/starred', icon: Star },
    { name: 'Trash', href: '/dashboard/trash', icon: Trash2 },
];

export default function Sidebar() {
    return (
        <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col h-screen sticky top-0">
            <div className="p-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <span className="font-bold text-white">C</span>
                </div>
                <span className="font-semibold text-lg text-slate-100">CloudManager</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                    >
                        <item.icon size={20} className="group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <StorageWidget />
            </div>
        </aside>
    );
}
