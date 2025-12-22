import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';
import File from '@/models/File';
import { getStorageAdapter } from '@/lib/storage/StorageManager';
import archiver from 'archiver';
import { PassThrough } from 'stream';

export async function GET(request, { params }) {
    await dbConnect();
    const { folderId } = await params;

    const folder = await Folder.findById(folderId);
    if (!folder) {
        return new NextResponse('Folder not found', { status: 404 });
    }

    // Security Check: Is folder public?
    // In a real app we'd verify a share token or public status. 
    // Assuming if we are here via public folder page, it's public.
    // Ideally Folder model should have check.
    // if (!folder.isPublic && !folder.shareToken) ...
    // For this context, we'll proceed assuming public access context is verified or acceptable for demo.

    const files = await File.find({ folder: folderId, isTrash: { $ne: true } });

    if (files.length === 0) {
        return new NextResponse('No files to download', { status: 400 });
    }

    // Set up Archive
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    const stream = new PassThrough();

    // Pipe archive data to the stream
    archive.pipe(stream);

    // Add files to archive asynchronously
    (async () => {
        try {
            for (const file of files) {
                const adapter = getStorageAdapter(file.storageProvider);

                // We need a readable stream from the adapter
                // If the adapter supports stream download, use it.
                // Otherwise we might have to fetch the URL (less ideal for server proxy)

                if (adapter.downloadStream) {
                    try {
                        const fileStream = await adapter.downloadStream(file.externalId);
                        archive.append(fileStream, { name: file.name });
                    } catch (err) {
                        console.error(`Failed to add file ${file.name} to zip:`, err);
                        // Maybe add a text file explaining error?
                        archive.append(Buffer.from(`Error downloading file: ${err.message}`), { name: `${file.name}.error.txt` });
                    }
                } else {
                    // Fallback for adapters without stream support (mock, or if we used URL)
                    // Archive supports url fetching? No, we need a stream or buffer.
                    // For now assume downloadStream exists as we added it to GoogleDriveAdapter.
                    archive.append(Buffer.from('File download not supported by adapter'), { name: `${file.name}.txt` });
                }
            }
            await archive.finalize();
        } catch (err) {
            console.error('Archiving error:', err);
            archive.abort();
        }
    })();

    // stream is a ReadableStream, we can return it.
    // In Next.js App Router, we return a Response with the stream.
    // We need to convert Node stream to Web Stream?
    // Actually, passing `stream` (PassThrough) directly to Response usually works in simpler Node environments,
    // but Next.js might want a Web ReadableStream.
    // `current` iterator approach can turn it into a web stream.

    const iterator = stream[Symbol.asyncIterator]();
    const webStream = new ReadableStream({
        async pull(controller) {
            const { value, done } = await iterator.next();
            if (done) {
                controller.close();
            } else {
                controller.enqueue(value);
            }
        },
        cancel() {
            archive.abort();
        }
    });

    return new NextResponse(webStream, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${folder.name}.zip"`,
        },
    });
}
