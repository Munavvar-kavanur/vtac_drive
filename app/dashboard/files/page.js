import FileBrowser from '@/components/FileBrowser';
import { getFolderContents } from '@/app/actions/folder-actions';

export default async function FilesPage() {
    const { folders, files } = await getFolderContents(null); // Root

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">My Files</h1>
            <FileBrowser initialFolders={folders} initialFiles={files} parentId={null} />
        </div>
    );
}
