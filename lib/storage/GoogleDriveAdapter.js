import { StorageAdapter } from './StorageAdapter';
import { google } from 'googleapis';
import { Readable } from 'stream';

export class GoogleDriveAdapter extends StorageAdapter {
    constructor(config = {}) {
        super(config);

        const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            console.warn('Google Drive credentials missing');
        }

        this.auth = new google.auth.OAuth2(clientId, clientSecret);
        this.auth.setCredentials({ refresh_token: refreshToken });

        this.drive = google.drive({ version: 'v3', auth: this.auth });
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    }

    async upload(file, folderId) {
        let fileStream;
        let mimeType = file.type || 'application/octet-stream';
        let fileName = file.name || 'uploaded_file';

        if (file instanceof Blob) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fileStream = Readable.from(buffer);
        } else {
            throw new Error('Unsupported file format for upload');
        }

        try {
            const response = await this.drive.files.create({
                requestBody: {
                    name: fileName,
                    mimeType: mimeType,
                    parents: [this.folderId]
                },
                media: {
                    mimeType: mimeType,
                    body: fileStream
                },
                fields: 'id, webViewLink, webContentLink'
            });

            return {
                externalId: response.data.id,
                externalUrl: response.data.webViewLink,
                downloadUrl: response.data.webContentLink
            };
        } catch (error) {
            console.error('Google Drive Upload Error:', error);
            throw error;
        }
    }

    async getResumableUploadUrl(fileName, mimeType, parentFolderId) {
        try {
            // Note: We're using the drive folder ID from env, ignoring parentFolderId for now 
            // as the current Adapter implementation seems to use a single root folder (GOOGLE_DRIVE_FOLDER_ID)
            // If you support subfolders in Drive, you'd map parentFolderId -> driveFolderId here.

            const req = await this.drive.files.create({
                requestBody: {
                    name: fileName,
                    mimeType: mimeType,
                    parents: [this.folderId]
                },
                media: {
                    mimeType: mimeType
                },
                fields: 'id'
            }, {
                // Important: returning the response object to get headers
                responseType: 'json'
            });

            // This is actually not the correct way to get the session URI from the googleapis library 
            // for resumable uploads without uploading data. 
            // The googleapis node library is a bit higher-level and abstracted.
            // A more direct way specifically for getting the *session URI* for the client to use:

            const accessToken = await this.auth.getAccessToken();

            const metadata = {
                name: fileName,
                mimeType: mimeType,
                parents: [this.folderId]
            };

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,webContentLink', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': mimeType,
                    // 'X-Upload-Content-Length': fileSize // Optional
                },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to initiate resumable upload: ${response.status} ${errorText}`);
            }

            const location = response.headers.get('Location');
            if (!location) {
                throw new Error('No upload location header received from Google Drive');
            }

            return location;
        } catch (error) {
            console.error('Get Resumable Upload URL Error:', error);
            throw error;
        }
    }

    async delete(externalId) {
        try {
            await this.drive.files.delete({
                fileId: externalId
            });
            return true;
        } catch (error) {
            console.error('Google Drive Delete Error:', error);
            return false;
        }
    }

    async getDownloadUrl(externalId) {
        return this.makePublic(externalId);
    }

    async makePublic(externalId) {
        try {
            // 1. Add 'anyone' permission with 'reader' role
            await this.drive.permissions.create({
                fileId: externalId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            // 2. Refresh file metadata to ensure links are available
            const result = await this.drive.files.get({
                fileId: externalId,
                fields: 'webViewLink, webContentLink',
            });

            return result.data.webViewLink; // Return view link as the shared link
        } catch (error) {
            console.error('Error making file public:', error);
            return null; // Handle error gracefully
        }
    }

    async downloadStream(externalId) {
        try {
            const response = await this.drive.files.get(
                { fileId: externalId, alt: 'media' },
                { responseType: 'stream' }
            );
            return response.data;
        } catch (error) {
            console.error('Google Drive Download Stream Error:', error);
            throw error;
        }
    }

    async rename(externalId, newName) {
        try {
            await this.drive.files.update({
                fileId: externalId,
                requestBody: {
                    name: newName
                }
            });
            return true;
        } catch (error) {
            console.error('Google Drive Rename Error:', error);
            return false;
        }
    }

    async trash(externalId) {
        try {
            await this.drive.files.update({
                fileId: externalId,
                requestBody: {
                    trashed: true
                }
            });
            return true;
        } catch (error) {
            console.error('Google Drive Trash Error:', error);
            return false;
        }
    }

    async restore(externalId) {
        try {
            await this.drive.files.update({
                fileId: externalId,
                requestBody: {
                    trashed: false
                }
            });
            return true;
        } catch (error) {
            console.error('Google Drive Restore Error:', error);
            return false;
        }
    }
}
