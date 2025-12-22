import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
    title: 'CloudManager - Premium Storage',
    description: 'Project managing cloud storage across multiple providers.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.variable}>{children}</body>
        </html>
    );
}
