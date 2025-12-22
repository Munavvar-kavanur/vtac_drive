import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Folder from '@/models/Folder';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    const folders = await Folder.find({}).select('name isTrash path parent user');
    return NextResponse.json({
        count: folders.length,
        folders
    });
}
