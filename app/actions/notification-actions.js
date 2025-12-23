'use server';

import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";

export async function getNotifications() {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const notifications = await Notification.find({ user: session.userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Convert ObjectId and Dates to string for Client Component safety
        const safeNotifications = notifications.map(n => ({
            ...n,
            _id: n._id.toString(),
            user: n.user.toString(),
            createdAt: n.createdAt.toISOString()
        }));

        const unreadCount = await Notification.countDocuments({ user: session.userId, isRead: false });

        return { success: true, notifications: safeNotifications, unreadCount };
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return { success: false, error: error.message };
    }
}

export async function markAsRead(notificationId) {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        if (notificationId === 'all') {
            await Notification.updateMany({ user: session.userId, isRead: false }, { isRead: true });
        } else {
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Internal helper for other actions to use
export async function createNotification(userId, type, title, message, link = null) {
    try {
        await dbConnect();
        await Notification.create({
            user: userId,
            type,
            title,
            message,
            link
        });
        return { success: true };
    } catch (error) {
        console.error('Create notification error:', error);
        return { success: false, error: error.message };
    }
}
