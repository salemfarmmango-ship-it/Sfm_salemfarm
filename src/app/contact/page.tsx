'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                setSettings(data.settings || {});
            } catch (err) {
                console.error('Failed to fetch contact settings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    // Helper to extract embed URL or CID from a Google Maps link (simplified for demonstration)
    // In a real app, you might want a more robust parser or ask user for the embed code.
    const getMapEmbedUrl = (link: string) => {
        if (!link) return null;
        // For shared links like https://maps.app.goo.gl/..., they need to be resolved.
        // However, as a quick fix, we can try to use the provided link in an iframe 
        // IF it's an embed link. Since the user provided a short link, we'll use a placeholder
        // or try to suggest getting the embed link. 
        // For now, I'll use the provided link in a way that at least links to it if embed fails.
        return link;
    };

    return (
        <div className="container" style={{ padding: 'var(--space-16) var(--space-4)' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>Contact Us</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-16)' }}>

                {/* Contact Info */}
                <div>
                    <h2 style={{ marginBottom: 'var(--space-6)' }}>Get in Touch</h2>
                    <p style={{ marginBottom: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                        Have questions about your order or want to visit our farm? We&apos;d love to hear from you.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'var(--color-mango-100)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-mango-700)' }}><Phone size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Phone</div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    {loading ? (
                                        <div style={{ width: '120px', height: '1.2rem', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                                    ) : (
                                        settings?.store_phone || 'Price on request'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'var(--color-mango-100)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-mango-700)' }}><Mail size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Email</div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    {loading ? (
                                        <div style={{ width: '180px', height: '1.2rem', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                                    ) : (
                                        settings?.store_email || 'Not specified'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'var(--color-mango-100)', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-mango-700)' }}><MapPin size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Address</div>
                                <div style={{ color: 'var(--text-secondary)' }}>
                                    {loading ? (
                                        <div style={{ width: '220px', height: '1.2rem', background: '#f3f4f6', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
                                    ) : (
                                        settings?.store_address || 'Not specified'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div style={{ marginTop: '2rem', height: '300px', width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        {settings?.store_location ? (
                            <iframe
                                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15647.798155556!2d77.925!3d11.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDMwJzAwLjAiTiA3N8KwNTUnMzAuMCJF!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        ) : (
                            <div style={{ height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                Map location not set
                            </div>
                        )}
                        {settings?.store_location && (
                            <a
                                href={settings.store_location}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', textAlign: 'center', padding: '0.5rem', fontSize: '0.85rem', color: 'var(--color-mango-700)', textDecoration: 'none', background: 'var(--color-mango-50)' }}
                            >
                                View on Google Maps
                            </a>
                        )}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="card" style={{ padding: 'var(--space-8)' }}>
                    {submitted ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <h3 style={{ color: 'green', marginBottom: '1rem' }}>Thank You!</h3>
                            <p>We have received your message and will get back to you shortly.</p>
                            <Button onClick={() => setSubmitted(false)} variant="outline" style={{ marginTop: '1rem' }}>Send Another</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                                <input required type="text" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
                                <input required type="email" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Message</label>
                                <textarea required rows={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}></textarea>
                            </div>
                            <Button type="submit">Send Message</Button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
