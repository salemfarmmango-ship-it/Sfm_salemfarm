'use client';
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CartProvider } from '@/context/CartContext';
import { BottomNav } from '@/components/common/BottomNav';
import { CartSidebar } from '@/components/common/CartSidebar';
import { NotificationPrompt } from '@/components/common/NotificationPrompt';

import { useEffect } from 'react';

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Register Service Worker for PWA & Push Notifications on load
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const register = () => {
                navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then((reg) => console.log('Service Worker registered:', reg.scope))
                    .catch((err) => console.error('Service Worker registration failed:', err));
            };

            if (document.readyState === 'complete') {
                register();
            } else {
                window.addEventListener('load', register);
                return () => window.removeEventListener('load', register);
            }
        }
    }, []);
    const isAdminRoute = pathname?.startsWith('/admin') || pathname === '/admin-login';

    return (
        <CartProvider>
            {!isAdminRoute && <Navbar />}
            <div style={{ paddingBottom: isAdminRoute ? 0 : '80px' }}>
                {children}
                {!isAdminRoute && <Footer />}
            </div>
            {!isAdminRoute && <BottomNav />}
            <CartSidebar />
            {/* Push notification prompt - shows on non-admin pages */}
            {!isAdminRoute && <NotificationPrompt />}
        </CartProvider>
    );
}

