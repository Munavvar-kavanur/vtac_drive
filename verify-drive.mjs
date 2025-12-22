
// Scripts usually don't support ES modules directly without package.json "type": "module" or .mjs extension
// We will use .mjs and dynamic imports if needed, or just standard require if possible.
// But this project seems to use ES modules (import/export).
// We'll create a verification script that uses the Adapter directly.

import { GoogleDriveAdapter } from './lib/storage/GoogleDriveAdapter.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: '.env.local' });

async function runVerification() {
    console.log('Starting Google Drive Sync Verification...');

    // Check credentials
    if (!process.env.GOOGLE_DRIVE_CLIENT_ID) {
        console.error('❌ Missing GOOGLE_DRIVE_CLIENT_ID');
        return;
    }

    const adapter = new GoogleDriveAdapter();
    const testFileName = `test_sync_${Date.now()}.txt`;
    const testContent = 'This is a test file for sync verification.';
    const file = new Blob([testContent], { type: 'text/plain' });
    file.name = testFileName;

    let externalId = null;

    try {
        // 1. Upload
        console.log(`\n1. Uploading "${testFileName}"...`);
        const uploadResult = await adapter.upload(file, null);
        externalId = uploadResult.externalId;
        console.log('✅ Upload Successful. ID:', externalId);

        // 2. Trash
        console.log('\n2. Trashing file...');
        const trashResult = await adapter.trash(externalId);
        if (trashResult) console.log('✅ Trash Successful (Moved to Drive Trash).');
        else throw new Error('Trash operation failed');

        // 3. Restore
        console.log('\n3. Restoring file...');
        const restoreResult = await adapter.restore(externalId);
        if (restoreResult) console.log('✅ Restore Successful (Restored from Drive Trash).');
        else throw new Error('Restore operation failed');

        // 4. Trash again (to prepare for delete)
        // Note: Delete often works regardless of trash state, but let's trash it first to simulate flow.
        console.log('\n4. Trashing again...');
        await adapter.trash(externalId);

        // 5. Permanent Delete
        console.log('\n5. Permanently Deleting file...');
        const deleteResult = await adapter.delete(externalId);
        if (deleteResult) console.log('✅ Permanent Delete Successful.');
        else throw new Error('Delete operation failed');

        console.log('\n✨ Verification Complete: Full lifecycle (Upload -> Trash -> Restore -> Delete) matches expectations.');
    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
}

// Mock Blob for Node.js environment if needed
if (typeof Blob === 'undefined') {
    global.Blob = class Blob {
        constructor(content, options) {
            this.content = content;
            this.type = options.type || '';
        }
        async arrayBuffer() {
            return Buffer.from(this.content[0]);
        }
        get size() {
            return this.content[0].length;
        }
    };
}

runVerification();
