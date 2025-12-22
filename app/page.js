import Link from 'next/link';
import { Cloud } from 'lucide-react';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1534067783941-51c67a479958?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

            <div className="glass-panel z-10 p-12 rounded-2xl flex flex-col items-center max-w-lg w-full text-center border-t border-white/10">
                <div className="mb-6 p-4 rounded-full bg-blue-500/20 ring-1 ring-blue-500/50">
                    <Cloud size={64} className="text-blue-400" />
                </div>

                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    CloudManager
                </h1>

                <p className="text-slate-300 mb-8 text-lg">
                    Secure, premium storage for your digital life.
                    Manage all your clouds in one place.
                </p>

                <Link
                    href="/dashboard"
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                >
                    Enter Dashboard
                </Link>

                <div className="mt-8 text-sm text-slate-500">
                    Powered by Next.js & MongoDB
                </div>
            </div>
        </main>
    );
}
