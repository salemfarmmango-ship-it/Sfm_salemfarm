'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, ShoppingBag, X } from 'lucide-react';

export const AdminRealtimeNotifier = () => {
    const [notification, setNotification] = useState<{ id: string; amount: number } | null>(null);

    useEffect(() => {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Subscribe to new orders
        const channel = supabase
            .channel('admin-orders')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    const newOrder = payload.new;
                    handleNewOrder(newOrder);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleNewOrder = (order: any) => {
        // Show Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Order Received! 🥭', {
                body: `Order #${order.id} for ₹${order.total_amount} just came in.`,
                icon: '/logo.png',
            });
        }

        // Show UI Toast
        setNotification({ id: order.id, amount: order.total_amount });

        // Play sound if possible
        const audio = new Audio('/notification.mp3'); // We can add a fallback or omit if file missing
        audio.play().catch(() => { /* Ignore audio errors */ });

        // Auto hide toast after 10 seconds
        setTimeout(() => setNotification(null), 10000);
    };

    if (!notification) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out'
        }}>
            <div style={{
                background: 'white',
                border: '2px solid var(--color-mango-500)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                minWidth: '300px'
            }}>
                <div style={{
                    background: 'var(--color-mango-100)',
                    padding: '10px',
                    borderRadius: '50%',
                    color: 'var(--color-mango-600)'
                }}>
                    <ShoppingBag size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1b421b' }}>
                        New Order Received!
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Order #{notification.id} • ₹${notification.amount}
                    </div>
                </div>
                <button
                    onClick={() => setNotification(null)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#999',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
