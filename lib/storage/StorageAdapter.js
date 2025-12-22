/**
 * Base class for Storage Providers.
 * All adapters must implement these methods.
 */
export class StorageAdapter {
    constructor(config) {
        this.config = config;
    }

    /**
     * Upload a file to the storage provider
     * @param {File} file - The file object to upload
     * @param {string} folderId - The ID of the parent folder (optional)
     * @returns {Promise<{externalId: string, url: string, downloadUrl: string}>}
     */
    async upload(file, folderId) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete a file from the storage provider
     * @param {string} externalId - The ID of the file in the external system
     * @returns {Promise<boolean>}
     */
    async delete(externalId) {
        throw new Error('Method not implemented');
    }

    /**
     * Get a temporary download link
     * @param {string} externalId 
     * @returns {Promise<string>}
     */
    async getDownloadUrl(externalId) {
        throw new Error('Method not implemented');
    }
}
