'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Edit2, Share2 } from 'lucide-react';
import { deleteFile } from '@/app/actions/file-actions';
import { useRouter } from 'next/navigation';

export default function FileActionsMenu({ item, onShare, onDelete }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (onDelete) {
            await onDelete(item);
        }
        setIsOpen(false);
        // router.refresh(); // Let the parent handle refresh

    };

    return (
        <div className="absolute top-2 right-2 z-10" ref={menuRef}>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all ${isOpen ? 'opacity-100 bg-white/10 text-white' : 'opacity-0 group-hover:opacity-100'}`}
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden glass-panel flex flex-col z-20">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); onShare(item); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors text-left"
                    >
                        <Share2 size={14} className="text-purple-400" />
                        <span>Share</span>
                    </button>

                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('Rename'); setIsOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white text-sm transition-colors text-left"
                    >
                        <Edit2 size={14} className="text-blue-400" />
                        <span>Rename</span>
                    </button>

                    <div className="h-px bg-white/5 my-1" />

                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-sm transition-colors text-left"
                    >
                        <Trash2 size={14} />
                        <span>Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
}
