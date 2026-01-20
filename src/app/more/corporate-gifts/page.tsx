'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function CorporateGiftsPage() {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        requirements: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            const { error } = await supabase
                .from('corporate_enquiries')
                .insert([formData]);

            if (error) throw error;
            setStatus('success');
            setFormData({ company_name: '', contact_person: '', email: '', phone: '', requirements: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--color-mango-900)', fontSize: '2.5rem' }}>Corporate Gifts</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Surprise your employees and clients with the sweetest gift of the season.
                Premium Salem Mangoes, beautifully packed for corporate gifting.
            </p>

            <div className="card" style={{ padding: '2rem' }}>
                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
                        <h2 style={{ color: 'var(--color-green-700)', marginBottom: '0.5rem' }}>Enquiry Received!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>We will get back to you with our corporate gifting catalog and pricing.</p>
                        <Button onClick={() => setStatus('idle')} style={{ marginTop: '1.5rem' }} variant="outline">Submit Another</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company Name *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                    placeholder="Company Name"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contact Person *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.contact_person}
                                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                    placeholder="Name"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Official Email *</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                    placeholder="email@company.com"
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
                                    placeholder="Contact Number"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Requirements / Approx Quantity</label>
                            <textarea
                                rows={4}
                                value={formData.requirements}
                                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', fontFamily: 'inherit' }}
                                placeholder="Tell us about your gifting requirements..."
                            />
                        </div>

                        {status === 'error' && (
                            <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
                                Something went wrong. Please try again later.
                            </div>
                        )}

                        <Button type="submit" disabled={loading} size="lg" style={{ width: '100%' }}>
                            {loading ? 'Submitting...' : 'Request Quote'}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
