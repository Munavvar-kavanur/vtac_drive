'use server';

import dbConnect from '@/lib/db';
import File from '@/models/File';
import User from '@/models/User';
import { createNotification } from './notification-actions';

import { getStorageAdapter } from '@/lib/storage/StorageManager';
import { getSession } from '@/lib/auth';

export async function uploadFile(formData) {
    // Legacy support or small files
    await dbConnect();

    const file = formData.get('file');
    const parentId = formData.get('parentId') || null;

    if (!file) return { success: false, error: 'No file provided' };

    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const adapter = getStorageAdapter('google_drive');
        const uploadResult = await adapter.upload(file, parentId);

        const newFile = await File.create({
            name: file.name,
            mimeType: file.type,
            size: Math.round(file.size / 1024),
            folder: parentId,
            user: session.userId,
            storageProvider: 'google_drive',
            externalId: uploadResult.externalId,
            externalUrl: uploadResult.externalUrl,
            downloadUrl: uploadResult.downloadUrl
        });

        await User.findByIdAndUpdate(session.userId, {
            $inc: { storageUsage: file.size }
        });

        await createNotification(
            session.userId,
            'success',
            'File Uploaded',
            `"${file.name}" has been successfully uploaded.`
        );

        return { success: true, file: JSON.parse(JSON.stringify(newFile)) };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

export async function getUploadSession(fileName, mimeType, fileSize, parentId, origin) {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized: User not logged in' };

    const finalMimeType = mimeType || 'application/octet-stream';

    try {
        const adapter = getStorageAdapter('google_drive');
        // Ensure fileSize is passed as string if expected by adapter, or number. Adapter expects number/string usually.
        const uploadUrl = await adapter.getResumableUploadUrl(fileName, finalMimeType, fileSize, parentId, origin);

        if (!uploadUrl) {
            return { success: false, error: 'Failed to generate upload URL (Provider returned null)' };
        }

        return { success: true, uploadUrl };
    } catch (error) {
        console.error('Get Upload Session Error:', error);
        return { success: false, error: `Upload Init Failed: ${error.message}` };
    }
}

// Renamed from completeUpload to finalizeUpload to match usage in previous steps, 
// or kept distinct if the architecture requires it. 
// Based on previous file content, finalizeUpload was the main one used. I'll include both if unsure or just finalize.
// The broken file showed finalizeUpload.

export async function finalizeUpload(fileData, parentId) {
    // fileData should contain: { id, name, mimeType, size, webViewLink, webContentLink } from Google Drive response
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized: Session expired' };

    try {
        if (!fileData || !fileData.id) {
            console.error('Finalize recieved invalid file data:', fileData);
            return { success: false, error: 'Invalid upload data received from provider' };
        }

        const newFile = await File.create({
            name: fileData.name || 'Untitled',
            mimeType: fileData.mimeType || 'application/octet-stream',
            size: Math.round(parseInt(fileData.size || 0) / 1024),
            folder: parentId,
            user: session.userId,
            storageProvider: 'google_drive',
            externalId: fileData.id,
            externalUrl: fileData.webViewLink,
            downloadUrl: fileData.webContentLink
        });

        await User.findByIdAndUpdate(session.userId, {
            $inc: { storageUsage: parseInt(fileData.size || 0) }
        });

        await createNotification(
            session.userId,
            'success',
            'File Uploaded',
            `"${fileData.name}" has been successfully uploaded.`
        );

        return { success: true, file: JSON.parse(JSON.stringify(newFile)) };
    } catch (error) {
        console.error('Finalize Upload Error:', error);
        return { success: false, error: `Finalization Failed: ${error.message}` };
    }
}

export async function deleteFile(fileId) {
    await dbConnect();
    const session = await getSession();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');
        if (file.externalId && adapter.trash) {
            await adapter.trash(file.externalId);
        }

        await File.findByIdAndUpdate(fileId, { isTrash: true });

        if (session) {
            await createNotification(
                session.userId,
                'warning',
                'File Moved to Trash',
                `"${file.name}" has been moved to trash.`
            );
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        await File.findByIdAndUpdate(fileId, { isTrash: true });
        return { success: true, warning: 'Cloud sync failed' };
    }
}

export async function restoreFile(fileId) {
    await dbConnect();
    const session = await getSession();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');
        if (file.externalId && adapter.restore) {
            await adapter.restore(file.externalId);
        }

        await File.findByIdAndUpdate(fileId, { isTrash: false });

        if (session) {
            await createNotification(
                session.userId,
                'info',
                'File Restored',
                `"${file.name}" has been restored from trash.`
            );
        }

        return { success: true };
    } catch (error) {
        console.error('Restore error:', error);
        return { success: false, error: 'Restore failed' };
    }
}

export async function deleteFilePermanently(fileId) {
    await dbConnect();
    const session = await getSession();

    const file = await File.findById(fileId);
    if (!file) return { success: false, error: 'File not found' };

    try {
        const adapter = getStorageAdapter(file.storageProvider || 'google_drive');
        if (file.externalId) {
            await adapter.delete(file.externalId);
        }

        await File.findByIdAndDelete(fileId);

        if (file.user) {
            await User.findByIdAndUpdate(file.user, { $inc: { storageUsage: -(file.size * 1024) } });
        }

        if (session) {
            await createNotification(
                session.userId,
                'error',
                'File Deleted Permanently',
                `"${file.name}" has been permanently deleted.`
            );
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
