'use client';
import React, { useState, useEffect } from 'react';
import { Package, Users, BadgeDollarSign, ShoppingBag } from 'lucide-react';

import { MangoLoader } from '@/components/common/MangoLoader';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        customers: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchDashboardData(dateFilter);
    }, [dateFilter]);

    const fetchDashboardData = async (date: string) => {
        setLoading(true);
        try {
            // Fetch everything from our unified stats proxy
            const res = await fetch(`/api/admin/stats?date=${date}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard data');

            setStats({
                revenue: data.revenue || 0,
                orders: data.orders || 0,
                products: data.products || 0,
                customers: data.customers || 0
            });

            setRecentOrders(data.recentOrders || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <MangoLoader />;
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: 'var(--space-8)',
                gap: isMobile ? '1rem' : '0'
            }}>
                <h1>Dashboard Overview</h1>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        background: 'var(--bg-primary)',
                        width: isMobile ? '100%' : 'auto'
                    }}
                />
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: isMobile ? 'var(--space-4)' : 'var(--space-8)',
                marginBottom: 'var(--space-12)'
            }}>
                <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={<BadgeDollarSign />} color="green" />
                <StatCard title="Total Orders" value={stats.orders.toString()} icon={<ShoppingBag />} color="blue" />
                <StatCard title="Total Products" value={stats.products.toString()} icon={<Package />} color="orange" />
                <StatCard title="Total Customers" value={stats.customers.toString()} icon={<Users />} color="purple" />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: 'var(--space-8)'
            }}>
                {/* Recent Orders */}
                <div className="card" style={{ padding: isMobile ? 'var(--space-4)' : 'var(--space-6)', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
                    {recentOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            No orders yet
                        </p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.9rem', minWidth: '450px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                        <th style={{ paddingBottom: '0.5rem' }}>Order</th>
                                        <th style={{ paddingBottom: '0.5rem' }}>Customer</th>
                                        <th style={{ paddingBottom: '0.5rem' }}>Status</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            id={`#${order.id}`}
                                            customer={order.customer_name || 'Guest'}
                                            status={order.status}
                                            amount={`₹${order.total_amount.toLocaleString('en-IN')}`}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        green: { bg: '#dcfce7', text: '#166534' },
        blue: { bg: '#dbeafe', text: '#1e40af' },
        orange: { bg: '#ffedd5', text: '#9a3412' },
        purple: { bg: '#f3e8ff', text: '#6b21a8' },
    };

    return (
        <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: colors[color].bg, color: colors[color].text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
            </div>
        </div>
    );
}

function OrderRow({ id, customer, status, amount }: any) {
    const getStatusStyle = (status: string) => {
        const styles: any = {
            delivered: { bg: '#dcfce7', text: '#166534' },
            shipped: { bg: '#dbeafe', text: '#1e40af' },
            processing: { bg: '#fff7ed', text: '#9a3412' },
            pending: { bg: '#ffedd5', text: '#9a3412' },
            cancelled: { bg: '#fee2e2', text: '#991b1b' },
        };
        return styles[status?.toLowerCase()] || styles.pending;
    };

    const statusStyle = getStatusStyle(status);

    return (
        <tr style={{ borderTop: '1px solid var(--border-light)' }}>
            <td style={{ padding: '0.75rem 0' }}>{id}</td>
            <td style={{ padding: '0.75rem 0' }}>{customer}</td>
            <td style={{ padding: '0.75rem 0' }}>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    textTransform: 'capitalize'
                }}>
                    {status}
                </span>
            </td>
            <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 'bold' }}>{amount}</td>
        </tr>
    );
}
