import { getTrashedItems } from '@/app/actions/dashboard-actions';
import TrashBrowser from '@/components/TrashBrowser';

export default async function TrashPage() {
    const data = await getTrashedItems();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-2">Trash</h1>
            <p className="text-slate-400 mb-6 text-sm">Items in trash will be permanently deleted after 30 days (not implemented). Restore them or delete them forever.</p>

            <TrashBrowser
                initialFolders={data.folders}
                initialFiles={data.files}
            />
        </div>
    );
}
