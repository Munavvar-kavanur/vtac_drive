import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mimeType: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null, // Null means root directory
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Cloud Storage Provider specific info
    storageProvider: {
        type: String,
        enum: ['local_mock', 'google_drive', 'dropbox', 'mega'],
        default: 'local_mock',
    },
    externalId: {
        type: String, // ID from the cloud provider
        required: true,
    },
    externalUrl: {
        type: String, // Direct link if available
    },
    downloadUrl: {
        type: String,
    },
    thumbnailUrl: {
        type: String,
    },
    shareToken: {
        type: String,
        unique: true,
        sparse: true,
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    isTrash: {
        type: Boolean,
        default: false,
    },
    lastAccessed: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.File || mongoose.model('File', FileSchema);
