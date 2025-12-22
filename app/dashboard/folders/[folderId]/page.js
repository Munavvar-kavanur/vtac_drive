import FileBrowser from '@/components/FileBrowser';
import { getFolderContents } from '@/app/actions/folder-actions';
import Breadcrumbs from '@/components/Breadcrumbs';

export default async function FolderPage({ params }) {
    const { folderId } = await params;
    const { folders, files, currentFolder } = await getFolderContents(folderId);

    return (
        <div>
            <Breadcrumbs currentFolder={currentFolder} />
            <h1 className="text-2xl font-bold text-white mb-6">Folder View</h1>
            <FileBrowser initialFolders={folders} initialFiles={files} parentId={folderId} />
        </div>
    );
}
