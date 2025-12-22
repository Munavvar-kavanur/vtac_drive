import { LocalMockAdapter } from './LocalMockAdapter';
import { GoogleDriveAdapter } from './GoogleDriveAdapter';

export function getStorageAdapter(provider = 'google_drive') {
    switch (provider) {
        case 'google_drive':
            return new GoogleDriveAdapter();
        case 'local_mock':
        default:
            return new LocalMockAdapter();
    }
}
