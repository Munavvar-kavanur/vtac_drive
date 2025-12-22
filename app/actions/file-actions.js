'use server';

import dbConnect from '@/lib/db';
import File from '@/models/File';
import User from '@/models/User';

import { getStorageAdapter } from '@/lib/storage/StorageManager';
import { getSession } from '@/lib/auth';

export async function uploadFile(formData) {
    await dbConnect();

    const file = formData.get('file');
    const parentId = formData.get('parentId') || null;

    if (!file) return { success: false, error: 'No file provided' };

    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Upload to Storage Provider
        const adapter = getStorageAdapter('google_drive');
        const uploadResult = await adapter.upload(file, parentId);

        // 2. create DB Model
        const newFile = await File.create({
            name: file.name,
            mimeType: file.type,
            size: Math.round(file.size / 1024), // KB
            folder: parentId,
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

        return { success: true, file: JSON.parse(JSON.stringify(newFile)) };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteFile(fileId) {
    await dbConnect();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');
        if (file.externalId && adapter.trash) {
            await adapter.trash(file.externalId);
        }

        await File.findByIdAndUpdate(fileId, { isTrash: true });
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        // Fallback: still mark local as trash even if cloud fails?
        // Ideally yes, to keep UI responsive.
        await File.findByIdAndUpdate(fileId, { isTrash: true });
        return { success: true, warning: 'Cloud sync failed' };
    }
}

export async function restoreFile(fileId) {
    await dbConnect();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');
        if (file.externalId && adapter.restore) {
            await adapter.restore(file.externalId);
        }

        await File.findByIdAndUpdate(fileId, { isTrash: false });
        return { success: true };
    } catch (error) {
        console.error('Restore error:', error);
        return { success: false, error: 'Restore failed' };
    }
}

export async function deleteFilePermanently(fileId) {
    await dbConnect();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');
        if (file.externalId) {
            await adapter.delete(file.externalId);
        }

        await File.findByIdAndDelete(fileId);

        // Decrement usage
        if (file.user) {
            await User.findByIdAndUpdate(file.user, { $inc: { storageUsage: -(file.size * 1024) } });
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

export async function renameFile(fileId, newName) {
    await dbConnect();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');

        // Try to rename in cloud if supported
        if (file.externalId && adapter.rename) {
            const renamed = await adapter.rename(file.externalId, newName);
            if (!renamed) {
                console.warn('Cloud rename failed, but proceeding with local rename');
            }
        }

        await File.findByIdAndUpdate(fileId, { name: newName });
        return { success: true };
    } catch (error) {
        console.error('Rename error:', error);
        return { success: false, error: error.message };
    }
}
