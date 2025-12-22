import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ currentFolder }) {
    if (!currentFolder) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 font-medium">
                <span className="flex items-center gap-1 text-white">
                    <Home size={16} /> My Files
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 font-medium overflow-x-auto">
            <Link href="/dashboard/files" className="flex items-center gap-1 hover:text-white transition-colors">
                <Home size={16} />
            </Link>

            {currentFolder.path && currentFolder.path.map((crumb) => (
                <div key={crumb._id} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-600" />
                    <Link
                        href={`/dashboard/folders/${crumb._id}`}
                        className="hover:text-white transition-colors whitespace-nowrap"
                    >
                        {crumb.name}
                    </Link>
                </div>
            ))}

            <div className="flex items-center gap-2">
                <ChevronRight size={14} className="text-slate-600" />
                <span className="text-white whitespace-nowrap">{currentFolder.name}</span>
            </div>
        </div>
    );
}
