'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, LogOut } from 'lucide-react';

export default function AdminSettingsPage() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [codEnabled, setCodEnabled] = useState(false);
    const [topBarText, setTopBarText] = useState('');
    const [topBarEnabled, setTopBarEnabled] = useState(true);
    const [topBarSaving, setTopBarSaving] = useState(false);

    const [storePhone, setStorePhone] = useState('');
    const [storeEmail, setStoreEmail] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storeLocation, setStoreLocation] = useState('');
    const [contactSaving, setContactSaving] = useState(false);

    useEffect(() => {
        verifyAdmin();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.settings) {
                if (data.settings.payment_cod_enabled !== undefined) {
                    setCodEnabled(data.settings.payment_cod_enabled);
                }
                if (data.settings.top_bar_content !== undefined) {
                    setTopBarText(data.settings.top_bar_content);
                }
                if (data.settings.top_bar_enabled !== undefined) {
                    setTopBarEnabled(data.settings.top_bar_enabled === true || data.settings.top_bar_enabled === 'true');
                }
                if (data.settings.store_phone) setStorePhone(data.settings.store_phone);
                if (data.settings.store_email) setStoreEmail(data.settings.store_email);
                if (data.settings.store_address) setStoreAddress(data.settings.store_address);
                if (data.settings.store_location) setStoreLocation(data.settings.store_location);
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        }
    };

    const handleToggleCod = async (enabled: boolean) => {
        // Optimistic update
        setCodEnabled(enabled);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'payment_cod_enabled', value: enabled })
            });
        } catch (err) {
            console.error('Failed to update settings');
            setCodEnabled(!enabled); // Revert on error
        }
    };

    const handleToggleTopBar = async (enabled: boolean) => {
        setTopBarEnabled(enabled);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'top_bar_enabled', value: enabled })
            });
        } catch (err) {
            console.error('Failed to update top bar status');
            setTopBarEnabled(!enabled);
        }
    };

    const handleSaveTopBar = async () => {
        setTopBarSaving(true);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'top_bar_content', value: topBarText })
            });
        } catch (err) {
            console.error('Failed to update top bar');
        } finally {
            setTopBarSaving(false);
        }
    };

    const handleSaveContactInfo = async () => {
        setContactSaving(true);
        try {
            const updates = [
                { key: 'store_phone', value: storePhone },
                { key: 'store_email', value: storeEmail },
                { key: 'store_address', value: storeAddress },
                { key: 'store_location', value: storeLocation }
            ];

            for (const update of updates) {
                await fetch('/api/admin/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(update)
                });
            }
            alert('Contact information updated successfully!');
        } catch (err) {
            console.error('Failed to update contact info');
            alert('Failed to update contact info');
        } finally {
            setContactSaving(false);
        }
    };

    const verifyAdmin = async () => {
        try {
            const response = await fetch('/api/admin/verify');
            const data = await response.json();

            if (!data.authenticated) {
                router.push('/admin-login');
                return;
            }

            setAdmin(data.admin);
        } catch (error) {
            router.push('/admin-login');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin-login');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="animate-spin" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--color-mango-600)',
                    borderRadius: '50%'
                }}></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
                Admin Settings
            </h1>

            {/* Admin Info Card */}
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--color-mango-100)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={30} color="var(--color-mango-600)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {admin?.name || 'Admin'}
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                            {admin?.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '500'
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Change Password Card */}
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Lock size={24} color="var(--color-mango-600)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        Change Password
                    </h2>
                </div>

                <form onSubmit={handleChangePassword}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                        <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Minimum 6 characters
                        </small>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#d1fae5',
                            color: '#065f46',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '0.75rem 2rem',
                            background: submitting ? '#9ca3af' : 'var(--color-mango-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Payment Settings Card */}
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginTop: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>💳</span> Payment Settings
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #eee', borderRadius: '0.5rem' }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Cash on Delivery</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Enable or disable COD option at checkout</div>
                    </div>

                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                        <input
                            type="checkbox"
                            checked={codEnabled}
                            onChange={(e) => handleToggleCod(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute', cursor: 'pointer', inset: 0,
                            backgroundColor: codEnabled ? '#16a34a' : '#ccc',
                            borderRadius: '34px',
                            transition: '0.4s'
                        }}></span>
                        <span style={{
                            position: 'absolute', content: '""', height: '18px', width: '18px',
                            left: codEnabled ? '28px' : '4px', bottom: '3px',
                            backgroundColor: 'white', borderRadius: '50%',
                            transition: '0.4s'
                        }}></span>
                    </label>
                </div>
            </div>

            {/* Appearance Settings Card */}
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginTop: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎨</span> Appearance Settings
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', padding: '1rem', border: '1px solid #eee', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Top Bar Announcement</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>Show or hide the promo bar at the very top</div>
                    </div>

                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                        <input
                            type="checkbox"
                            checked={topBarEnabled}
                            onChange={(e) => handleToggleTopBar(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute', cursor: 'pointer', inset: 0,
                            backgroundColor: topBarEnabled ? '#16a34a' : '#ccc',
                            borderRadius: '34px',
                            transition: '0.4s'
                        }}></span>
                        <span style={{
                            position: 'absolute', content: '""', height: '18px', width: '18px',
                            left: topBarEnabled ? '28px' : '4px', bottom: '3px',
                            backgroundColor: 'white', borderRadius: '50%',
                            transition: '0.4s'
                        }}></span>
                    </label>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Top Bar Announcement
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={topBarText}
                            onChange={(e) => {
                                if (e.target.value.length <= 100) setTopBarText(e.target.value);
                            }}
                            placeholder="Enter announcement text..."
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                paddingRight: '4rem',
                                border: '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                fontSize: '1rem'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.8rem',
                            color: topBarText.length >= 100 ? 'red' : '#9ca3af'
                        }}>
                            {topBarText.length}/100
                        </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Displayed at the very top of every page. Keep it short and catchy.
                    </p>
                </div>

                <button
                    onClick={handleSaveTopBar}
                    disabled={topBarSaving}
                    style={{
                        padding: '0.5rem 1.5rem',
                        background: topBarSaving ? '#9ca3af' : 'var(--color-mango-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: topBarSaving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {topBarSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Contact Settings Card */}
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginTop: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📞</span> Contact Settings
                </h2>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number</label>
                        <input
                            type="text"
                            value={storePhone}
                            onChange={(e) => setStorePhone(e.target.value)}
                            placeholder="+91 99940 50456"
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            value={storeEmail}
                            onChange={(e) => setStoreEmail(e.target.value)}
                            placeholder="contact@salemfarmmango.com"
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Farm Address</label>
                        <textarea
                            value={storeAddress}
                            onChange={(e) => setStoreAddress(e.target.value)}
                            rows={3}
                            placeholder="New No.1/80, Vattakkadu..."
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Google Maps Link</label>
                        <input
                            type="text"
                            value={storeLocation}
                            onChange={(e) => setStoreLocation(e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem' }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <button
                        onClick={handleSaveContactInfo}
                        disabled={contactSaving}
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: contactSaving ? '#9ca3af' : 'var(--color-mango-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: contactSaving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {contactSaving ? 'Saving...' : 'Save Contact Info'}
                    </button>
                </div>
            </div>
        </div>
    );
}
