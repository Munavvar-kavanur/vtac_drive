'use server';

import dbConnect from '@/lib/db';
import File from '@/models/File';
import User from '@/models/User';

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

        return { success: true, file: JSON.parse(JSON.stringify(newFile)) };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

export async function getUploadSession(fileName, mimeType, fileSize, parentId, origin) {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    // Ensure we have a valid mimeType to match client standard
    const finalMimeType = mimeType || 'application/octet-stream';

    try {
        const adapter = getStorageAdapter('google_drive');
        // We handle logic here to map internal parentId to a Drive folder ID if we were doing deep nesting map
        // For now, adapter uses root folder.
        const uploadUrl = await adapter.getResumableUploadUrl(fileName, finalMimeType, fileSize, parentId, origin);

        return { success: true, uploadUrl };
    } catch (error) {
        console.error('Get Upload Session Error:', error);
        return { success: false, error: error.message };
    }
}

export async function completeUpload(fileName, fileSize, mimeType, parentId) {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // Since we don't get the external ID back easily from the client PUT response (it's in the response body of the PUT)
        // usage: client sends us the response body they got from Google
        // BUT: The client response from Google Drive PUT includes 'id', 'name', 'mimeType' etc.
        // So we should ask the client to pass that data back to us.

        // Let's assume the argument needs to be flexible.
        // Actually, the client should query the Drive API or we can just list the latest file?
        // No, the client receives the JSON response from the PUT completion.
        // Let's update the signature to accept the Drive metadata.

        console.error('Incorrect usage of completeUpload. Waiting for implementation details update.');
        throw new Error('Not implemented fully');
    } catch (e) {
        return { success: false, error: e.message };
    }
}

export async function finalizeUpload(fileData, parentId) {
    // fileData should contain: { id, name, mimeType, size, webViewLink, webContentLink } from Google Drive response
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const newFile = await File.create({
            name: fileData.name,
            mimeType: fileData.mimeType,
            size: Math.round(parseInt(fileData.size) / 1024), // Drive returns size in bytes string
            folder: parentId,
            user: session.userId,
            storageProvider: 'google_drive',
            externalId: fileData.id,
            externalUrl: fileData.webViewLink, // We need to fetch this if not returned by Upload response
            downloadUrl: fileData.webContentLink // Same here
        });

        await User.findByIdAndUpdate(session.userId, {
            $inc: { storageUsage: parseInt(fileData.size) }
        });

        return { success: true, file: JSON.parse(JSON.stringify(newFile)) };
    } catch (error) {
        console.error('Finalize Upload Error:', error);
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
