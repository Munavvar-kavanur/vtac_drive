'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getUser() {
    await dbConnect();
    const session = await getSession();
    if (!session) return null;

    const user = await User.findById(session.userId).lean();
    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
}

export async function updateProfileImage(formData) {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const file = formData.get('file');
    if (!file) return { success: false, error: 'No file provided' };

    // In a real app we would upload to cloud storage
    // For this demo, we'll convert small images to base64 or just fail for large ones
    // Or simpler: Just pretend we uploaded and return a mock URL if no cloud storage for public assets configured

    // Let's implement a simple base64 for now for small images (< 1MB)
    if (file.size > 1024 * 1024) {
        return { success: false, error: 'Image too large (max 1MB)' };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        await User.findByIdAndUpdate(session.userId, {
            image: base64
        });

        revalidatePath('/dashboard');
        return { success: true, imageUrl: base64 };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
    }
}

export async function getStorageStats() {
    await dbConnect();
    const session = await getSession();

    // Default stats if no session
    if (!session) {
        return { used: 0, total: 1073741824 }; // 1GB
    }

    const user = await User.findById(session.userId);
    if (!user) {
        return { used: 0, total: 1073741824 };
    }

    return {
        used: user.storageUsage || 0,
        total: user.storageQuota || 1073741824
    };
}
