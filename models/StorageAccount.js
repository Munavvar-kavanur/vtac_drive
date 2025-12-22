import mongoose from 'mongoose';

const StorageAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: String,
        enum: ['google_drive', 'dropbox', 'mega'],
        required: true,
    },
    accessToken: {
        type: String,
        // In a real app, these should be encrypted
    },
    refreshToken: {
        type: String,
    },
    expiryDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.models.StorageAccount || mongoose.model('StorageAccount', StorageAccountSchema);
