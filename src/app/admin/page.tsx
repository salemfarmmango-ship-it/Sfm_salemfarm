'use client';
import React, { useState, useEffect } from 'react';
import { Package, Users, BadgeDollarSign, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

    useEffect(() => {
        fetchDashboardData(dateFilter);
    }, [dateFilter]);

    const fetchDashboardData = async (date: string) => {
        setLoading(true);
        try {
            // Prepare date range
            let startDateStr = '';
            let endDateStr = '';

            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);

                startDateStr = startDate.toISOString();
                endDateStr = endDate.toISOString();
            }

            // Fetch total revenue and order count (Filtered by date)
            let ordersQuery = supabase.from('orders').select('total_amount');
            if (date) {
                ordersQuery = ordersQuery.gte('created_at', startDateStr).lte('created_at', endDateStr);
            }
            const { data: orders } = await ordersQuery;

            const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
            const orderCount = orders?.length || 0;

            // Fetch products count (Total, not filtered)
            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Fetch customers count (New customers filtered by date)
            let customersQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
            if (date) {
                customersQuery = customersQuery.gte('created_at', startDateStr).lte('created_at', endDateStr);
            }
            const { count: customerCount } = await customersQuery;

            // Fetch recent orders with user info (Filtered by date)
            let recentOrdersQuery = supabase
                .from('orders')
                .select(`
                    id,
                    total_amount,
                    status,
                    created_at,
                    profiles:user_id (
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(10); // Increased limit for better visibility

            if (date) {
                recentOrdersQuery = recentOrdersQuery.gte('created_at', startDateStr).lte('created_at', endDateStr);
            }

            const { data: recentOrdersData } = await recentOrdersQuery;

            setStats({
                revenue: totalRevenue,
                orders: orderCount,
                products: productCount || 0,
                customers: customerCount || 0
            });

            setRecentOrders(recentOrdersData || []);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
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
                        background: 'var(--bg-primary)'
                    }}
                />
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
                <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={<BadgeDollarSign />} color="green" />
                <StatCard title="Total Orders" value={stats.orders.toString()} icon={<ShoppingBag />} color="blue" />
                <StatCard title="Total Products" value={stats.products.toString()} icon={<Package />} color="orange" />
                <StatCard title="Total Customers" value={stats.customers.toString()} icon={<Users />} color="purple" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-8)' }}>
                {/* Recent Orders */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
                    {recentOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                            No orders yet
                        </p>
                    ) : (
                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
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
                                        customer={(order.profiles as any)?.full_name || 'Guest'}
                                        status={order.status}
                                        amount={`₹${order.total_amount.toLocaleString('en-IN')}`}
                                    />
                                ))}
                            </tbody>
                        </table>
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
