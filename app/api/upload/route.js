
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import File from '@/models/File';
import User from '@/models/User';
import { getStorageAdapter } from '@/lib/storage/StorageManager';

import { getSession } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('file');
        const parentId = formData.get('parentId') || null;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Upload to Storage Provider
        // Note: In App Router Route Handlers, 'file' is a Blob/File object similar to browser
        const adapter = getStorageAdapter('google_drive');
        const uploadResult = await adapter.upload(file, parentId);

        // 2. create DB Model
        const newFile = await File.create({
            name: file.name,
            mimeType: file.type,
            size: Math.round(file.size / 1024), // KB
            folder: parentId === 'null' ? null : parentId, // Handle string 'null' from formData
            user: session.userId,
            storageProvider: 'google_drive',
            externalId: uploadResult.externalId,
            externalUrl: uploadResult.externalUrl,
            downloadUrl: uploadResult.downloadUrl
        });

        // 3. Update User Storage Usage
        await User.findByIdAndUpdate(session.userId, {
            $inc: { storageUsage: file.size }
        });

        return NextResponse.json({
            success: true,
            file: JSON.parse(JSON.stringify(newFile))
        });

    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
