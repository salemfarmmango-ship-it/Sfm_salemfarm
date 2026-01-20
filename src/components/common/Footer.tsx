import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setSettings(data.settings || {});
            } catch (err) {
                console.error('Failed to fetch footer settings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: data.message || 'Subscribed successfully!', type: 'success' });
                setEmail('');
            } else {
                setMessage({ text: data.error || 'Failed to subscribe', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer style={{ background: 'var(--color-green-50)', color: 'var(--color-green-900)', paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-8)' }}>
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-8)',
                alignItems: 'start',
                justifyContent: 'space-between'
            }}>

                <div style={{ flex: 1 }}>
                    <Image src="/logo.png" alt="Salem Farm Mango" width={150} height={75} style={{ marginBottom: 'var(--space-4)', objectFit: 'contain' }} />
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-green-800)', maxWidth: '280px' }}>
                        Bringing the authentic taste of Salem's finest mangoes and organic products directly to your home.
                    </p>
                </div>

                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-6)', color: 'var(--color-green-900)' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><Link href="/shop" style={{ borderBottom: '1px solid transparent', transition: 'border-color 0.2s', color: 'inherit', textDecoration: 'none' }}>All Products</Link></li>
                        <li><Link href="/about" style={{ borderBottom: '1px solid transparent', transition: 'border-color 0.2s', color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
                        <li><Link href="/offers" style={{ borderBottom: '1px solid transparent', transition: 'border-color 0.2s', color: 'inherit', textDecoration: 'none' }}>Offers</Link></li>
                        <li><Link href="/faq" style={{ borderBottom: '1px solid transparent', transition: 'border-color 0.2s', color: 'inherit', textDecoration: 'none' }}>FAQs</Link></li>
                    </ul>
                </div>

                <div style={{ flex: 1.2 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-6)', color: 'var(--color-green-900)' }}>Contact Info</h4>
                    <ul style={{ listStyle: 'none', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {settings?.store_phone && (
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Phone size={18} style={{ color: 'var(--color-mango-600)', flexShrink: 0 }} />
                                <span style={{ color: 'var(--color-green-800)' }}>{settings.store_phone}</span>
                            </li>
                        )}
                        {settings?.store_email && (
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Mail size={18} style={{ color: 'var(--color-mango-600)', flexShrink: 0 }} />
                                <span style={{ color: 'var(--color-green-800)' }}>{settings.store_email}</span>
                            </li>
                        )}
                        {settings?.store_address && (
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <MapPin size={18} style={{ marginTop: '0.25rem', flexShrink: 0, color: 'var(--color-mango-600)' }} />
                                <span style={{ color: 'var(--color-green-800)', lineHeight: '1.4' }}>{settings.store_address}</span>
                            </li>
                        )}
                    </ul>
                </div>

                <div style={{ flex: 1.3 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-6)', color: 'var(--color-green-900)' }}>Stay Connected</h4>
                    <p style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--color-green-800)' }}>Subscribe for seasonal updates and exclusive mango offers.</p>
                    <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--color-green-200)',
                                    flex: 1,
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    width: '100%'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary"
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                            >
                                {submitting ? '...' : 'Join'}
                            </button>
                        </div>
                        {message.text && (
                            <p style={{
                                fontSize: '0.85rem',
                                color: message.type === 'success' ? '#15803d' : '#b91c1c',
                                fontWeight: '500'
                            }}>
                                {message.text}
                            </p>
                        )}
                    </form>
                </div>

            </div>
            <div
                style={{
                    textAlign: "center",
                    marginTop: "var(--space-12)",
                    paddingTop: "var(--space-8)",
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    fontSize: "0.8rem",
                }}
            >
                © {new Date().getFullYear()} Salem Farm Mango. All rights reserved.
                <br />
                <strong>
                    Developed by{" "}
                    <a
                        href="https://zouiscorp.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        Zouis Corp
                    </a>
                </strong>
            </div>

        </footer>
    );
};
