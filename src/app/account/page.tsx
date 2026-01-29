'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, MapPin, User as UserIcon, LogOut, ChevronRight, Clock, CheckCircle2, Truck, XCircle, Info, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/dateUtils';
import { Button } from '@/components/ui/Button';
import { MangoLoader } from '@/components/common/MangoLoader';

type Tab = 'overview' | 'orders' | 'addresses' | 'profile';

function AccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get('tab') as Tab) || 'overview';

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [shippingRates, setShippingRates] = useState<any[]>([]);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        is_default: false
    });

    const [viewOrder, setViewOrder] = useState<any | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth');
                return;
            }
            setUser(session.user);
            fetchData(session.user.id);
        };

        checkUser();
    }, [router]);

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            setProfile(profileData);

            // Fetch Orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            setOrders(ordersData || []);

            // Fetch Addresses
            const { data: addressesData } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false });
            setAddresses(addressesData || []);

            // Fetch Shipping Rates
            const { data: ratesData } = await supabase
                .from('shipping_rates')
                .select('*')
                .eq('is_active', true)
                .order('state_name', { ascending: true });
            setShippingRates(ratesData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profileName.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, full_name: profileName }, { onConflict: 'id' });

            if (error) throw error;

            await fetchData(user.id);
            setEditingProfile(false);
            alert('Profile updated successfully!');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(`Failed to update profile: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const [editingId, setEditingId] = useState<number | null>(null);

    const handleAddAddress = async () => {
        if (!user) return;

        if (!editingId && addresses.length >= 4) {
            alert('You can only save up to 4 addresses.');
            return;
        }

        setSubmitting(true);
        try {
            // Ensure profile exists
            if (!profile) {
                await supabase.from('profiles').upsert({ id: user.id, full_name: newAddress.full_name || user.email }, { onConflict: 'id' });
            }

            const addressData = { ...newAddress, user_id: user.id };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('addresses')
                    .update(addressData)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('addresses')
                    .insert([addressData]);
                error = insertError;
            }

            if (error) throw error;

            fetchData(user.id);
            resetForm();
            alert(editingId ? 'Address updated successfully!' : 'Address added successfully!');
        } catch (error: any) {
            console.error('Error saving address:', error);
            alert(`Failed to save address: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        const { error } = await supabase.from('addresses').delete().eq('id', id);
        if (error) {
            alert('Failed to delete address');
        } else {
            fetchData(user.id);
        }
    };

    const handleEditAddress = (address: any) => {
        setNewAddress({
            full_name: address.full_name,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            phone: address.phone,
            is_default: address.is_default
        });
        setEditingId(address.id);
        setShowAddressForm(true);
    };

    const resetForm = () => {
        setNewAddress({
            full_name: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            phone: '',
            is_default: false
        });
        setEditingId(null);
        setShowAddressForm(false);
    };

    const setTab = (tab: Tab) => {
        router.push(`/account?tab=${tab}`);
    };

    if (loading) {
        return <MangoLoader />;
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: <Info size={20} /> },
        { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
        { id: 'addresses', label: 'Addresses', icon: <MapPin size={20} /> },
        { id: 'profile', label: 'Profile Details', icon: <UserIcon size={20} /> },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: '#dcfce7', text: '#166534', icon: <CheckCircle2 size={14} /> };
            case 'shipped': return { bg: '#e0f2fe', text: '#075985', icon: <Truck size={14} /> };
            case 'processing': return { bg: '#fff7ed', text: '#9a3412', icon: <Clock size={14} /> };
            case 'cancelled': return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={14} /> };
            default: return { bg: '#f3f4f6', text: '#374151', icon: <Clock size={14} /> };
        }
    };

    const handleDownloadInvoice = (order: any) => {
        const invoiceWindow = window.open('', '_blank');
        if (!invoiceWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.id}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: bold; color: #166534; }
                    .invoice-title { font-size: 32px; color: #333; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .total { text-align: right; font-size: 20px; font-weight: bold; }
                    .footer { margin-top: 50px; font-size: 14px; color: #666; text-align: center; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">Salem Farm Mango</div>
                    <div style="text-align: right;">
                        <div class="invoice-title">INVOICE</div>
                        <p>#${order.id.toString().padStart(6, '0')}</p>
                        <p>${formatDate(order.created_at)}</p>
                    </div>
                </div>

                <div class="grid">
                    <div>
                        <h3>Billed To:</h3>
                        <p>${order.shipping_address?.full_name}</p>
                        <p>${order.shipping_address?.address_line1}</p>
                        <p>${order.shipping_address?.city}, ${order.shipping_address?.state}</p>
                        <p>${order.shipping_address?.postal_code}</p>
                        <p>${order.shipping_address?.phone}</p>
                    </div>
                    <div>
                        <h3>Status:</h3>
                        <p style="text-transform: uppercase; font-weight: bold;">${order.payment_status} / ${order.status}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Order Total (Items + Shipping)</td>
                            <td style="text-align: right;">₹${order.total_amount}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="total">
                    Total: ₹${order.total_amount}
                </div>

                <div class="footer">
                    <p>Thank you for choosing Salem Farm Mango!</p>
                </div>

                <div class="no-print" style="text-align: center; margin-top: 40px;">
                    <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; background: #166534; color: white; border: none; border-radius: 5px;">Print Invoice / Save as PDF</button>
                </div>
            </body>
            </html>
        `;

        invoiceWindow.document.write(html);
        invoiceWindow.document.close();
    };

    return (
        <div className="container" style={{ padding: 'var(--space-2) var(--space-4)', width: '100%', maxWidth: '100vw' }}>
            <div style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <h1 style={{ fontWeight: 800, color: 'var(--color-green-800)', marginBottom: '0.25rem', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>Account</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your orders, addresses and profile settings.</p>
            </div>

            <div className="account-container">
                {/* Sidebar */}
                <aside className="hidden-mobile" style={{ position: 'sticky', top: '110px' }}>
                    <div className="card" style={{ padding: '0', borderRadius: '1.25rem' }}>
                        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'var(--color-mango-100)',
                                    color: 'var(--color-mango-700)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    flexShrink: 0
                                }}>
                                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-green-800)' }}>{profile?.full_name || 'Customer'}</p>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.user_metadata?.auth_method === 'phone'
                                            ? `+91 ${user?.user_metadata?.phone}`
                                            : user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id as Tab)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem 1.5rem',
                                        border: 'none',
                                        background: activeTab === item.id ? 'var(--color-green-50)' : 'transparent',
                                        color: activeTab === item.id ? 'var(--color-green-700)' : 'inherit',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: activeTab === item.id ? '600' : '400',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    <ChevronRight size={16} style={{ opacity: activeTab === item.id ? 1 : 0.3 }} />
                                </button>
                            ))}
                            <button
                                onClick={handleSignOut}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '1rem 1.5rem',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#dc2626',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    marginTop: '0.5rem',
                                    borderTop: '1px solid var(--border-light)',
                                    textAlign: 'left',
                                    fontWeight: '500'
                                }}
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </aside>

                <div className="hidden-desktop" style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setTab(item.id as Tab)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '1rem',
                                    border: '1px solid',
                                    whiteSpace: 'nowrap',
                                    borderColor: activeTab === item.id ? 'var(--color-green-600)' : 'var(--border-light)',
                                    background: activeTab === item.id ? 'var(--color-green-600)' : 'white',
                                    color: activeTab === item.id ? 'white' : 'inherit',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%'
                                }}
                            >
                                {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <main style={{ minWidth: 0, width: '100%', paddingTop: '0.5rem' }}>
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div className="card account-dashboard-card" style={{
                                background: 'linear-gradient(135deg, var(--color-green-600) 0%, var(--color-green-800) 100%)',
                                color: 'white',
                                border: 'none',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h2 style={{ color: 'white', marginBottom: '0.75rem', fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>Hello, {profile?.full_name || 'Mango Lover'}!</h2>
                                    <p style={{ opacity: 0.9, fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', maxWidth: '500px', lineHeight: '1.6' }}>Welcome to your personal dashboard. Track your fresh mango orders and manage your preferences easily.</p>

                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontWeight: '800' }}>{orders.length}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default City</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800' }}>
                                                {addresses.find(a => a.is_default)?.city || 'Not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="account-cards-grid">
                                <div className="card" style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }} onClick={() => setTab('orders')}>
                                    <div style={{ color: 'var(--color-mango-600)', marginBottom: '0.5rem' }}><Package size={28} /></div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Orders</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check the status of your latest mango shipments.</p>
                                </div>
                                <div className="card" style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }} onClick={() => setTab('addresses')}>
                                    <div style={{ color: 'var(--color-green-600)', marginBottom: '0.5rem' }}><MapPin size={28} /></div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Shipping Addresses</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Add or edit your delivery locations for faster checkout.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                                <h3 style={{ margin: 0 }}>Order History</h3>
                            </div>
                            {orders.length === 0 ? (
                                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <Package size={48} style={{ color: 'var(--border-light)', marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
                                    <Button onClick={() => router.push('/shop')} style={{ marginTop: '1rem' }}>Start Shopping</Button>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--color-gray-50)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                <th style={{ padding: '1rem 1.5rem' }}>Order</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                                <th style={{ padding: '1rem 1.5rem' }}>Total</th>
                                                <th style={{ padding: '1rem 1.5rem' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: '500' }}>#{order.id.toString().padStart(6, '0')}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <span style={{
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '2rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            background: getStatusColor(order.status).bg,
                                                            color: getStatusColor(order.status).text,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            {getStatusColor(order.status).icon}
                                                            {order.status.charAt(0) + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>₹{order.total_amount}</td>
                                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                        <Button variant="outline" size="sm" onClick={() => setViewOrder(order)}>Details</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {viewOrder && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '1rem'
                        }} onClick={() => setViewOrder(null)}>
                            <div style={{
                                background: 'white',
                                borderRadius: '1rem',
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                position: 'relative'
                            }} onClick={e => e.stopPropagation()}>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white' }}>
                                    <h3 style={{ margin: 0 }}>Order #{viewOrder.id.toString().padStart(6, '0')}</h3>
                                    <button onClick={() => setViewOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} /></button>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-gray-50)', borderRadius: '0.5rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Shipping Address</h4>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{viewOrder.shipping_address?.full_name}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{viewOrder.shipping_address?.address_line1}, {viewOrder.shipping_address?.city}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{viewOrder.shipping_address?.state} - {viewOrder.shipping_address?.postal_code}</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Phone: {viewOrder.shipping_address?.phone}</p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        <span>Total Amount</span>
                                        <span>₹{viewOrder.total_amount}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                        <span>Status</span>
                                        <span style={{ textTransform: 'capitalize' }}>{viewOrder.status}</span>
                                    </div>

                                    <Button onClick={() => handleDownloadInvoice(viewOrder)} style={{ width: '100%' }}>
                                        Download Invoice
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'addresses' && (
                        <div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>My Addresses</h3>
                                <Button size="sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => showAddressForm ? resetForm() : setShowAddressForm(true)}>
                                    {showAddressForm ? <XCircle size={18} /> : <Plus size={18} />}
                                    {showAddressForm ? 'Cancel' : 'Add New'}
                                </Button>
                            </div>

                            {showAddressForm && (
                                <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--color-green-200)', background: 'var(--color-green-50)' }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-green-800)' }}>{editingId ? 'Edit Address' : 'Add New Address'}</h4>
                                    <form onSubmit={(e) => { e.preventDefault(); handleAddAddress(); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. John Doe"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                                value={newAddress.full_name}
                                                onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Address Line 1 *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="House No, Building, Street"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                                value={newAddress.address_line1}
                                                onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Address Line 2</label>
                                            <input
                                                type="text"
                                                placeholder="Area, Landmark (Optional)"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                                value={newAddress.address_line2}
                                                onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>City *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Salem"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                                value={newAddress.city}
                                                onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>State *</label>
                                            <select
                                                required
                                                value={newAddress.state}
                                                onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'white' }}
                                            >
                                                <option value="">Select State</option>
                                                {shippingRates.map(rate => (
                                                    <option key={rate.id} value={rate.state_name}>{rate.state_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Postal Code *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 636001"
                                                pattern="[0-9]{6}"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                                value={newAddress.postal_code}
                                                onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '500' }}>Phone Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="e.g. 9876543210"
                                                pattern="[0-9]{10}"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                                value={newAddress.phone}
                                                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0' }}>
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                checked={newAddress.is_default}
                                                onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-mango-600)' }}
                                            />
                                            <label htmlFor="isDefault" style={{ fontSize: '0.95rem', cursor: 'pointer' }}>Set as default shipping address</label>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                            <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
                                                {submitting ? 'Saving Address...' : 'Save Address'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="responsive-grid">
                                {addresses.length === 0 ? (
                                    <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                        <MapPin size={48} style={{ color: 'var(--border-light)', marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
                                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No addresses saved yet.</p>
                                    </div>
                                ) : (
                                    addresses.map(address => (
                                        <div key={address.id} className="card" style={{ padding: '1.5rem', position: 'relative', border: address.is_default ? '2px solid var(--color-green-600)' : '1px solid var(--border-light)' }}>
                                            {address.is_default && (
                                                <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-green-600)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 10 }}>DEFAULT</span>
                                            )}
                                            <h4 style={{ marginBottom: '0.5rem', paddingRight: address.is_default ? '80px' : '0' }}>{address.full_name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{address.address_line1}</p>
                                            {address.address_line2 && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{address.address_line2}</p>}
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{address.city}, {address.state} - {address.postal_code}</p>
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Phone: {address.phone}</p>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                                                <button onClick={() => handleEditAddress(address)} style={{ background: 'none', border: 'none', color: 'var(--color-green-700)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>Edit</button>
                                                <button onClick={() => handleDeleteAddress(address.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>Remove</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (() => {
                        // Detect if user signed up with phone
                        const isPhoneUser = user?.user_metadata?.auth_method === 'phone';
                        const userPhone = isPhoneUser ? user?.user_metadata?.phone : (user?.phone || '');
                        const userEmail = isPhoneUser ? '' : user?.email;

                        return (
                            <div className="card" style={{ padding: 'clamp(1rem, 5vw, 2rem)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
                                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                                    <div className="account-cards-grid" style={{ gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Full Name</label>
                                            <input
                                                type="text"
                                                value={editingProfile ? profileName : (profile?.full_name || '')}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                onFocus={() => {
                                                    if (!editingProfile) {
                                                        setEditingProfile(true);
                                                        setProfileName(profile?.full_name || '');
                                                    }
                                                }}
                                                disabled={!editingProfile}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid var(--border-light)',
                                                    background: editingProfile ? 'white' : '#f9fafb',
                                                    cursor: editingProfile ? 'text' : 'pointer'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Email Address</label>
                                            <input
                                                type="email"
                                                value={userEmail}
                                                placeholder={isPhoneUser ? 'Not linked' : ''}
                                                disabled
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: '#f9fafb', color: '#6b7280' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Phone (Verified)</label>
                                        <input
                                            type="text"
                                            value={userPhone ? `+91 ${userPhone}` : ''}
                                            placeholder={!userPhone ? 'Not linked' : ''}
                                            disabled
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: isPhoneUser ? '#dcfce7' : '#f9fafb', color: isPhoneUser ? '#166534' : '#6b7280', fontWeight: isPhoneUser ? '500' : 'normal' }}
                                        />
                                    </div>
                                    {editingProfile && (
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                            <Button type="submit" disabled={submitting} style={{ flex: 1 }}>
                                                {submitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingProfile(false);
                                                    setProfileName('');
                                                }}
                                                style={{ flex: 1 }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                    {!editingProfile && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name, Email and Phone cannot be changed for security reasons.Contact support for any issues and changes</p>
                                        </div>
                                    )}
                                </form>
                            </div>
                        );
                    })()}
                </main>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AccountContent />
        </Suspense>
    );
}
