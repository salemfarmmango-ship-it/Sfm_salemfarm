'use client';
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CartProvider } from '@/context/CartContext';
import { BottomNav } from '@/components/common/BottomNav';
import { CartSidebar } from '@/components/common/CartSidebar';
import { NotificationPrompt } from '@/components/common/NotificationPrompt';
import { AuthProvider } from '@/context/AuthContext';

import { useEffect, Suspense } from 'react';

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Register Service Worker for PWA & Push Notifications on load
    useEffect(() => {
        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then((reg) => console.log('Service Worker registered:', reg.scope))
                    .catch((err) => console.error('Service Worker registration failed:', err));
            });
        }
    }, []);
    const isAdminRoute = pathname?.startsWith('/admin') || pathname === '/admin-login';

    return (
        <AuthProvider>
            <CartProvider>
                {!isAdminRoute && <Navbar />}
                <div style={{ paddingBottom: isAdminRoute ? 0 : '80px' }}>
                    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div></div>}>
                        {children}
                    </Suspense>
                    {!isAdminRoute && <Footer />}
                </div>
                {!isAdminRoute && <BottomNav />}
                <CartSidebar />
                {/* Push notification prompt - shows on non-admin pages */}
                {!isAdminRoute && <NotificationPrompt />}
            </CartProvider>
        </AuthProvider>
    );
}

