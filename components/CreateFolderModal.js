'use client';

import { useState } from 'react';
import Modal from './Modal';
import { createFolder } from '@/app/actions/folder-actions';
import { FolderPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateFolderModal({ isOpen, onClose, parentId }) {
    const [folderName, setFolderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', folderName);
        if (parentId) formData.append('parentId', parentId);

        const result = await createFolder(formData);

        if (result.success) {
            setFolderName('');
            onClose();
            router.refresh(); // Refresh the page to show new folder
        } else {
            alert('Error creating folder');
        }
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Folder">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center ring-1 ring-blue-500/30">
                        <FolderPlus size={40} className="text-blue-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Folder Name</label>
                    <input
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder="e.g. Projects"
                        autoFocus
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !folderName.trim()}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Folder'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
