'use client';
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CartProvider } from '@/context/CartContext';
import { BottomNav } from '@/components/common/BottomNav';
import { CartSidebar } from '@/components/common/CartSidebar';
import { NotificationPrompt } from '@/components/common/NotificationPrompt';

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
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

