import dbConnect from '@/lib/db';
import File from '@/models/File';
import { getStorageAdapter } from '@/lib/storage/StorageManager';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    await dbConnect();
    const { token } = await params;

    const file = await File.findOne({ shareToken: token });

    if (!file || !file.externalId) {
        return new Response('File not found', { status: 404 });
    }

    try {
        const adapter = getStorageAdapter(file.storageProvider);

        // If the adapter supports streaming, use it
        if (adapter.downloadStream) {
            const stream = await adapter.downloadStream(file.externalId);

            // Create headers for the download
            const headers = new Headers();
            headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
            headers.set('Content-Type', file.mimeType || 'application/octet-stream');

            // Return string directly using the readable web stream or node stream
            // Next.js App Router Response supports Node.js Readable streams directly
            return new ComponentResponse(stream, { headers });
        }

        // Fallback for adapters without stream support (though they should have it)
        // Check if externalUrl exists as a backup
        if (file.externalUrl) {
            return Response.redirect(file.externalUrl);
        }

        return new Response('File content not available', { status: 500 });

    } catch (error) {
        console.error('Download error:', error);
        return new Response('Error downloading file', { status: 500 });
    }
}

// Helper for Response construction to avoid naming conflicts if imported
const ComponentResponse = Response;
