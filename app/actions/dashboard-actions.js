'use server';

import dbConnect from '@/lib/db';
import File from '@/models/File';
import Folder from '@/models/Folder';
import User from '@/models/User';

import { getSession } from '@/lib/auth';

export async function getDashboardStats() {
    await dbConnect();

    try {
        const session = await getSession();
        if (!session) return { user: { name: 'Guest' }, stats: {}, recentFiles: [] };

        // 1. Get User Info
        const user = await User.findById(session.userId);

        // 2. Aggregate Storage by Type
        const stats = await File.aggregate([
            { $match: { user: user._id, isTrash: { $ne: true } } }, // Exclude trash
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $regexMatch: { input: "$mimeType", regex: "^image/" } }, then: "Images",
                            else: {
                                $cond: {
                                    if: { $regexMatch: { input: "$mimeType", regex: "^video/" } }, then: "Media",
                                    else: {
                                        $cond: {
                                            if: { $regexMatch: { input: "$mimeType", regex: "^audio/" } }, then: "Audio",
                                            else: "Documents"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    count: { $sum: 1 },
                    size: { $sum: "$size" } // Size stored in KB
                }
            }
        ]);

        // Format stats for UI
        const formattedStats = {
            Images: { count: 0, size: 0 },
            Media: { count: 0, size: 0 },
            Audio: { count: 0, size: 0 },
            Documents: { count: 0, size: 0 }
        };

        stats.forEach(item => {
            if (formattedStats[item._id]) {
                formattedStats[item._id] = item;
            } else {
                // Fallback for unexpected types if logic changes, currently all mapped to Documents default
                formattedStats['Documents'].count += item.count;
                formattedStats['Documents'].size += item.size;
            }
        });

        // 3. Get Recent Files
        const recentFiles = await File.find({
            user: user._id,
            isTrash: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return {
            user: { name: user.name, storageUsage: user.storageUsage },
            stats: formattedStats,
            recentFiles: JSON.parse(JSON.stringify(recentFiles))
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return safe defaults
        return {
            user: { name: 'User' },
            stats: {
                Images: { count: 0, size: 0 },
                Documents: { count: 0, size: 0 },
                Media: { count: 0, size: 0 },
                Audio: { count: 0, size: 0 },
            },
            recentFiles: []
        };
    }
}

export async function getTrashedItems() {
    await dbConnect();
    const session = await getSession();
    if (!session) return { files: [], folders: [] };

    try {
        const files = await File.find({ user: session.userId, isTrash: true }).sort({ updatedAt: -1 });
        const folders = await Folder.find({ user: session.userId, isTrash: true }).sort({ updatedAt: -1 });

        return {
            files: JSON.parse(JSON.stringify(files)),
            folders: JSON.parse(JSON.stringify(folders))
        };
    } catch (error) {
        console.error('Error fetching trash:', error);
        return { files: [], folders: [] };
    }
}


