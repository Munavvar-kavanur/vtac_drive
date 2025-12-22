'use server';

import dbConnect from '@/lib/db';
import File from '@/models/File';
import Folder from '@/models/Folder';
import User from '@/models/User';

import { getSession } from '@/lib/auth';

export async function searchFiles(query) {
    if (!query || query.length < 2) return { folders: [], files: [] };

    await dbConnect();
    const session = await getSession();
    if (!session) return { folders: [], files: [] };

    try {
        const regex = new RegExp(query, 'i'); // Case-insensitive search

        const folders = await Folder.find({
            user: session.userId,
            name: { $regex: regex }
        }).limit(5).sort({ name: 1 });

        const files = await File.find({
            user: session.userId,
            name: { $regex: regex }
        }).limit(10).sort({ name: 1 });

        return {
            folders: JSON.parse(JSON.stringify(folders)),
            files: JSON.parse(JSON.stringify(files))
        };
    } catch (error) {
        console.error('Search error:', error);
        return { folders: [], files: [] };
    }
}
