'use server';

import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import File from '@/models/File';


import { getStorageAdapter } from '@/lib/storage/StorageManager';

export async function generateShareLink(type, id) {
    await dbConnect();

    // Only supporting File sharing via public link for now
    if (type === 'file') {
        const file = await File.findById(id);
        if (!file || !file.externalId) {
            return { success: false, error: 'File not found or not synced' };
        }

        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');

        // Ensure the file is accessible publicly in the cloud so the system can serve it
        if (adapter instanceof Object && adapter.makePublic) {
            await adapter.makePublic(file.externalId);
        }

        // Generate a unique short token for the system share page
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 6; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
            || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const systemShareLink = `${baseUrl}/share/${token}`;

        await File.findByIdAndUpdate(id, {
            isPublic: true,
            shareToken: token,
            // externalUrl is still useful for direct cloud access if needed internally
        });

        return { success: true, link: systemShareLink };
    }

    // Check if it's a folder, for now mock
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    return { success: true, link: `${baseUrl}/share/folder/${id}` };
}
