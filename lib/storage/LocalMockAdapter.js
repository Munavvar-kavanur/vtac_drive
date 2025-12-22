import { StorageAdapter } from './StorageAdapter';

export class LocalMockAdapter extends StorageAdapter {
    async upload(file, folderId) {
        console.log(`[Mock] Uploading file: ${file.name} to folder: ${folderId}`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            externalId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            externalUrl: '#mock-view',
            downloadUrl: '#mock-download'
        };
    }

    async delete(externalId) {
        console.log(`[Mock] Deleting file: ${externalId}`);
        return true;
    }

    async getDownloadUrl(externalId) {
        return '#mock-download-url';
    }

    async downloadStream(externalId) {
        // Return a simple stream for testing
        const { Readable } = require('stream');
        return Readable.from(['Mock file content']);
    }

    async rename(externalId, newName) {
        console.log(`[Mock] Renaming file: ${externalId} to ${newName}`);
        return true;
    }
}
