import Link from 'next/link';
import { Cloud, Shield, Zap, Globe, ArrowRight, LayoutDashboard, Database, Lock } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600/20 p-2 rounded-lg">
                            <Cloud size={24} className="text-blue-400" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">CloudManager</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Sign In
                        </Link>

                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Now available in Beta
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            Unified Cloud <br />
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Storage
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                            Access Google Drive, Dropbox, and OneDrive in one seamless interface. Secure, fast, and built for the modern web.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="group px-8 py-4 bg-white text-slate-900 rounded-xl font-bold transition-all hover:bg-blue-50 flex items-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#features"
                                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-white/10 rounded-xl font-medium transition-all backdrop-blur-sm"
                            >
                                Learn More
                            </Link>
                        </div>
                        <div className="pt-8 flex items-center gap-8 text-slate-500">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm">Trusted by 10,000+ users</p>
                        </div>
                    </div>

                    {/* Hero Visual - Dashboard Preview */}
                    <div className="relative perspective-1000">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
                        <div className="relative transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out-expo">
                            <div className="glass-panel rounded-2xl p-2 border border-white/10 shadow-2xl bg-slate-900/80">
                                <div className="bg-slate-950 rounded-xl overflow-hidden aspect-[16/10] relative">
                                    {/* Fake UI Elements */}
                                    <div className="absolute top-0 inset-x-0 h-10 border-b border-white/5 bg-slate-900/50 flex items-center px-4 gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        </div>
                                    </div>
                                    <div className="absolute top-14 left-4 w-48 bottom-4 border-r border-white/5 hidden md:block space-y-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-8 w-[80%] bg-slate-800/50 rounded-lg animate-pulse delay-75" />
                                        ))}
                                    </div>
                                    <div className="absolute top-14 left-56 right-4 bottom-4 grid grid-cols-3 gap-4 p-4">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="bg-slate-800/30 rounded-xl border border-white/5 p-4 flex flex-col gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10" />
                                                <div className="h-4 w-[60%] bg-slate-700/50 rounded" />
                                                <div className="h-3 w-[40%] bg-slate-700/30 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-24 bg-slate-900/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Everything you need in one place</h2>
                        <p className="text-slate-400 text-lg">
                            Connect all your storage providers and manage your files with enterprise-grade tools.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Shield className="text-blue-400" size={32} />,
                                title: 'Bank-Grade Security',
                                desc: 'Your files are encrypted with AES-256 bit encryption before being stored.'
                            },
                            {
                                icon: <Zap className="text-amber-400" size={32} />,
                                title: 'Lightning Fast',
                                desc: 'Optimized transfer protocols ensure your files move at the speed of light.'
                            },
                            {
                                icon: <Globe className="text-emerald-400" size={32} />,
                                title: 'Universal Access',
                                desc: 'Access your files from any device, anywhere in the world, instantly.'
                            },
                            {
                                icon: <LayoutDashboard className="text-purple-400" size={32} />,
                                title: 'Unified Dashboard',
                                desc: 'Drag and drop files between providers with our intuitive interface.'
                            },
                            {
                                icon: <Database className="text-pink-400" size={32} />,
                                title: 'Smart Caching',
                                desc: 'Frequently accessed files are cached locally for offline availability.'
                            },
                            {
                                icon: <Lock className="text-cyan-400" size={32} />,
                                title: 'Private by Design',
                                desc: 'We never scan your files for data. Your privacy represents our priority.'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all hover:-translate-y-1">
                                <div className="mb-4 p-3 rounded-xl bg-slate-950 inline-block ring-1 ring-white/10 group-hover:ring-blue-500/50 transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 relative z-10 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Cloud size={20} className="text-slate-600" />
                        <span className="font-semibold text-slate-500">CloudManager</span>
                    </div>
                    <div className="text-sm text-slate-600">
                        © {new Date().getFullYear()} CloudManager Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="#" className="hover:text-blue-400 transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-blue-400 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
