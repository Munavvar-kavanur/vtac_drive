import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null, // Null means root directory
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    path: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            name: String
        }
    ], // Breadcrumb trail for faster lookups
    isPublic: {
        type: Boolean,
        default: false,
    },
    shareLink: {
        type: String,
        unique: true,
        sparse: true,
    },
    isTrash: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Compound index to prevent duplicate folder names in the same directory for a user
FolderSchema.index({ user: 1, parent: 1, name: 1 }, { unique: true });

// Force model recompilation if schema changed (Development HMR fix)
if (process.env.NODE_ENV !== 'production') {
    delete mongoose.models.Folder;
}

export default mongoose.models.Folder || mongoose.model('Folder', FolderSchema);
