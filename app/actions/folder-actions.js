'use server';

import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import File from '@/models/File';
import User from '@/models/User';

import { getSession } from '@/lib/auth';
import { getStorageAdapter } from '@/lib/storage/StorageManager';
import { deleteFilePermanently } from './file-actions';

export async function getFolderContents(folderId = null) {
    await dbConnect();

    const session = await getSession();
    if (!session) return { folders: [], files: [], currentFolder: null, error: 'Unauthorized' };

    try {
        const folders = await Folder.find({
            user: session.userId,
            parent: folderId,
            isTrash: { $ne: true }
        }).sort({ name: 1 });

        const files = await File.find({
            user: session.userId,
            folder: folderId,
            isTrash: { $ne: true }
        }).sort({ name: 1 });

        // Fetch current folder to get breadcrumbs/path
        let currentFolder = null;
        if (folderId) {
            currentFolder = await Folder.findById(folderId);
        }

        // Plain object serialization
        return {
            folders: JSON.parse(JSON.stringify(folders)),
            files: JSON.parse(JSON.stringify(files)),
            currentFolder: currentFolder ? JSON.parse(JSON.stringify(currentFolder)) : null
        };
    } catch (error) {
        console.error('Error fetching folder contents:', error);
        return { folders: [], files: [], currentFolder: null };
    }
}

export async function createFolder(formData) {
    await dbConnect();
    const name = formData.get('name');
    const parentId = formData.get('parentId') || null;

    try {
        let path = [];
        if (parentId) {
            const parentFolder = await Folder.findById(parentId);
            if (parentFolder) {
                // Inherit parent's path and add parent itself
                path = [...parentFolder.path, { _id: parentFolder._id, name: parentFolder.name }];
            }
        }

        const session = await getSession();
        if (!session) return { success: false, error: 'Unauthorized' };

        const newFolder = await Folder.create({
            name,
            parent: parentId,
            user: session.userId,
            path: path
        });

        return { success: true, folder: JSON.parse(JSON.stringify(newFolder)) };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

export async function deleteFolder(folderId) {
    await dbConnect();
    console.log('[Debug] deleteFolder called for ID:', folderId);

    const folder = await Folder.findById(folderId);
    if (!folder) {
        console.log('[Debug] Folder not found for ID:', folderId);
        return { success: false, error: 'Folder not found' };
    }

    try {
        // Folders are virtual (DB only), so we just mark as trash locally.
        const updated = await Folder.findByIdAndUpdate(folderId, { isTrash: true }, { new: true });
        console.log('[Debug] Folder updated:', updated);
        if (!updated.isTrash) {
            console.error('[Debug] CRITICAL: Folder isTrash was NOT set to true!');
        }
        return { success: true };
    } catch (error) {
        console.error('Delete folder error:', error);
        return { success: false, error: error.message };
    }
}

export async function restoreFolder(folderId) {
    await dbConnect();
    await Folder.findByIdAndUpdate(folderId, { isTrash: false });
    return { success: true };
}

export async function deleteFolderPermanently(folderId) {
    await dbConnect();

    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        // 1. Find the folder
        const folder = await Folder.findOne({ _id: folderId, user: session.userId });
        if (!folder) return { success: false, error: 'Folder not found' };

        // 2. Find all descendant folders (subfolders)
        // Using path._id to find all subfolders. This assumes 'path' is populated correctly on creation.
        // We find folders where this folder's ID is in their path.
        const subfolders = await Folder.find({
            user: session.userId,
            'path._id': folderId
        });

        // Collect all target folder IDs (the folder itself + all subfolders)
        const allFolderIds = [folderId, ...subfolders.map(f => f._id)];

        // 3. Find all files in these folders
        const files = await File.find({
            user: session.userId,
            folder: { $in: allFolderIds }
        });

        // 4. Delete all files permanently
        // This ensures cloud storage is cleaned up and user storage quota is corrected.
        await Promise.all(files.map(file => deleteFilePermanently(file._id)));

        // 5. Delete the folder documents from DB
        await Folder.deleteMany({
            _id: { $in: allFolderIds },
            user: session.userId
        });

        return { success: true };

    } catch (error) {
        console.error('Delete folder permanently error:', error);
        return { success: false, error: error.message };
    }
}
