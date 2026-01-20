'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function BulkEnquiryPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        quantity: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const { error } = await supabase
                .from('bulk_enquiries')
                .insert([formData]);

            if (error) throw error;
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', quantity: '', message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--color-mango-900)', fontSize: '2.5rem' }}>Bulk Enquiry</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Planning a large event or need mangoes in bulk? Fill out the form below and we will get back to you with our best rates.
            </p>

            <div className="card" style={{ padding: '2rem' }}>
                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h2 style={{ color: 'var(--color-green-700)', marginBottom: '0.5rem' }}>Thank You!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>We have received your enquiry and will contact you shortly.</p>
                        <Button onClick={() => setStatus('idle')} style={{ marginTop: '1.5rem' }} variant="outline">Submit Another</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                placeholder="Your Name"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone Number *</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Estimated Quantity (kg) *</label>
                            <input
                                required
                                type="text"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                placeholder="e.g. 50kg, 100kg"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Message / Requirements</label>
                            <textarea
                                rows={4}
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
                                placeholder="Any specific requirements or questions?"
                            />
                        </div>

                        {status === 'error' && (
                            <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
                                Something went wrong. Please try again later.
                            </div>
                        )}

                        <Button type="submit" disabled={loading} size="lg" style={{ width: '100%' }}>
                            {loading ? 'Submitting...' : 'Submit Enquiry'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
