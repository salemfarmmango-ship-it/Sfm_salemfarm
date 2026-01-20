'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, LayoutGrid, User } from 'lucide-react';
import React from 'react';

export const BottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/shop', label: 'Shop', icon: ShoppingBag },
        { href: '/categories', label: 'Category', icon: LayoutGrid },
        { href: '/account', label: 'Account', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <div className="hidden-desktop" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0.75rem 0.5rem',
            zIndex: 9999, // Ensure it's above everything
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: isActive(item.href) ? 'var(--color-green-700)' : '#9ca3af',
                        fontSize: '0.75rem',
                        fontWeight: isActive(item.href) ? '600' : '400',
                        gap: '4px',
                        flex: 1
                    }}
                >
                    <item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 2} />
                    <span>{item.label}</span>
                </Link>
            ))}
        </div>
    );
};
