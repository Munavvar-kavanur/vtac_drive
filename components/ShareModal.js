'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Share2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { generateShareLink } from '@/app/actions/share-actions';

export default function ShareModal({ isOpen, onClose, item }) {
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize link on mount (safe because parent keys component by item._id)
    // Initialize link on mount (safe because parent keys component by item._id)
    useEffect(() => {
        if (item?.isPublic && item?.shareToken && typeof window !== 'undefined') {
            // Use setTimeout to avoid "synchronous setState" build error
            const timer = setTimeout(() => {
                setGeneratedLink(`${window.location.origin}/share/${item.shareToken}`);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [item]); // Run when item exists (on mount)

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await generateShareLink(item.type, item._id);
        if (result.success) {
            setGeneratedLink(result.link);
        }
        setIsLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Share ${item.name}`}>
            <div className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-purple-500/10 rounded-full flex items-center justify-center ring-1 ring-purple-500/30">
                        <Share2 size={40} className="text-purple-500" />
                    </div>
                </div>

                <p className="text-center text-slate-300">
                    Share <span className="font-semibold text-white">&quot;{item.name}&quot;</span> with others via a public link.
                </p>

                {!generatedLink ? (
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Generating...' : <><LinkIcon size={18} /> Generate Link</>}
                    </button>
                ) : (
                    <div className="bg-slate-900 p-4 rounded-xl border border-white/10 space-y-2">
                        <label className="text-xs text-slate-500 uppercase font-semibold">Public Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={generatedLink}
                                className="flex-1 bg-transparent text-slate-300 focus:outline-none text-sm font-mono truncate"
                            />
                            <button
                                onClick={handleCopy}
                                className="text-purple-400 hover:text-white transition-colors"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
