'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootFileUploader() {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        const handleTriggerUpload = () => {
            // Only trigger if this key component is mounted and likely visible
            // Since this is only used in Dashboard page which has no other FileBrowser, it's safe.
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        };
        window.addEventListener('trigger-upload', handleTriggerUpload);
        return () => window.removeEventListener('trigger-upload', handleTriggerUpload);
    }, []);

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);

        // Upload sequentially 
        for (const file of files) {
            try {
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('file', file);
                    // No parentId means root

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                resolve(response);
                            } else {
                                reject(new Error(response.error));
                            }
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    });

                    xhr.addEventListener('error', () => {
                        reject(new Error('Network error during upload'));
                    });

                    xhr.open('POST', '/api/upload');
                    xhr.send(formData);
                });

            } catch (error) {
                console.error('Upload failed:', error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        setIsUploading(false);
        router.refresh();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
            />
            {isUploading && (
                <div className="fixed bottom-8 right-8 bg-slate-900 border border-blue-500/50 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <p className="font-medium">Uploading files...</p>
                        <p className="text-xs text-slate-400">Please wait</p>
                    </div>
                </div>
            )}
        </>
    );
}
