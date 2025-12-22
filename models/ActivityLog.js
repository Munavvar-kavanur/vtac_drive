import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['UPLOAD', 'DOWNLOAD', 'DELETE', 'MOVE', 'RENAME', 'SHARE', 'LOGIN', 'CREATE_FOLDER'],
    },
    details: {
        type: String, // Readable description
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId, // ID of file or folder affected
    },
    targetModel: {
        type: String,
        enum: ['File', 'Folder'],
    },
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
