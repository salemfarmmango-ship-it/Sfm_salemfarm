'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Package, Users, BarChart, Settings, Home, ShoppingCart, Truck, MessageSquare, LogOut, Tag, Bell } from 'lucide-react';
import { AdminRealtimeNotifier } from '@/components/admin/AdminRealtimeNotifier';
import { MangoLoader } from '@/components/common/MangoLoader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        verifyAdmin();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const verifyAdmin = async () => {
        try {
            const response = await fetch('/api/admin/verify');
            const data = await response.json();

            if (!data.authenticated) {
                router.push('/admin-login');
                return;
            }

            setAuthenticated(true);
        } catch (error) {
            router.push('/admin-login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin-login');
    };

    if (loading) {
        return <MangoLoader />;
    }

    if (!authenticated) {
        return null;
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: <BarChart size={20} /> },
        { href: '/admin/products', label: 'Products', icon: <Package size={20} /> },
        { href: '/admin/categories', label: 'Categories', icon: <Package size={20} /> },
        { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={20} /> },
        { href: '/admin/notifications', label: 'Notifications', icon: <Bell size={20} /> },
        { href: '/admin/reviews', label: 'Reviews', icon: <MessageSquare size={20} /> },
        { href: '/admin/coupons', label: 'Coupons', icon: <Settings size={20} /> },
        { href: '/admin/offers', label: 'Offers', icon: <Tag size={20} /> },
        { href: '/admin/shipping', label: 'Shipping', icon: <Truck size={20} /> },
        { href: '/admin/enquiries', label: 'Enquiries', icon: <MessageSquare size={20} /> },
        { href: '/admin/subscribers', label: 'Subscribers', icon: <Users size={20} /> },
        { href: '/admin/hero', label: 'Hero Section', icon: <Home size={20} /> },
        { href: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Mobile Header */}
            {isMobile && (
                <header style={{
                    height: '64px',
                    background: 'var(--color-mango-900)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1.25rem',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                        <span style={{ fontSize: '1.5rem' }}>🥭</span>
                        <div style={{ fontWeight: 'bold' }}>Admin Panel</div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isSidebarOpen ? '✕' : <BarChart size={24} style={{ transform: 'rotate(90deg)' }} />}
                    </button>
                </header>
            )}

            {/* Admin Sidebar Backdrop (Mobile Only) */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 90
                    }}
                />
            )}

            {/* Admin Sidebar */}
            <aside style={{
                width: isMobile ? '280px' : '260px',
                position: isMobile ? 'fixed' : 'sticky',
                top: 0,
                bottom: 0,
                left: isMobile && !isSidebarOpen ? '-280px' : '0',
                background: 'linear-gradient(180deg, var(--color-mango-800) 0%, var(--color-mango-900) 100%)',
                color: 'white',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                zIndex: 110,
                transition: 'left 0.3s ease',
                height: isMobile ? '100vh' : 'auto'
            }}>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: isMobile ? 'var(--space-8)' : 'var(--space-12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <span style={{ fontSize: '2rem' }}>🥭</span>
                    <div>
                        <div>Admin Panel</div>
                        <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 'normal' }}>
                            Salem Farm Mango
                        </div>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem',
                                    borderRadius: '0.5rem',
                                    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                    color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                                    fontWeight: isActive ? '600' : '500',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}

                    <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Link
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem',
                                borderRadius: '0.5rem',
                                color: '#fbbf24',
                                marginBottom: '0.5rem',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(251,191,36,0.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Home size={20} />
                            Back to Site
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem',
                                borderRadius: '0.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '1rem'
                            }}
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                background: '#f9fafb',
                padding: isMobile ? 'var(--space-4)' : 'var(--space-8)',
                overflowX: 'hidden',
                width: '100%'
            }}>
                <AdminRealtimeNotifier />
                {children}
            </main>
        </div>
    );
}
