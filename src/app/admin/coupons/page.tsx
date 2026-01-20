'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type Coupon = {
    id: number;
    code: string;
    discount_value: number;
    discount_type: 'percentage' | 'fixed';
    min_order_value: number;
    max_discount_value: number | null;
    is_active: boolean;
};

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState('');
    const [discountValue, setDiscountValue] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [maxDiscountValue, setMaxDiscountValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coupons:', error);
            alert('Failed to fetch coupons');
        } else {
            setCoupons(data || []);
        }
        setLoading(false);
    };

    const addCoupon = async () => {
        if (!newCode || !discountValue) {
            alert('Please fill in all fields');
            return;
        }

        setSubmitting(true);
        const { data, error } = await supabase
            .from('coupons')
            .insert([
                {
                    code: newCode.toUpperCase(),
                    discount_value: parseFloat(discountValue),
                    discount_type: discountType,
                    min_order_value: parseFloat(minOrderValue) || 0,
                    max_discount_value: discountType === 'percentage' && maxDiscountValue ? parseFloat(maxDiscountValue) : null,
                    is_active: true
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating coupon:', error);
            alert('Failed to create coupon: ' + error.message);
        } else {
            setCoupons([data, ...coupons]);
            setNewCode('');
            setDiscountValue('');
            setMinOrderValue('');
            setMaxDiscountValue('');
        }
        setSubmitting(false);
    };

    const deleteCoupon = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        const { error } = await supabase
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting coupon:', error);
            alert('Failed to delete coupon');
        } else {
            setCoupons(coupons.filter(c => c.id !== id));
        }
    };

    // Toggle Active Status (Optional but good to have)
    const toggleStatus = async (id: number, currentStatus: boolean) => {
        const { error } = await supabase
            .from('coupons')
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } else {
            setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: 'var(--space-8)' }}>Manage Coupons</h1>

            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Add New Coupon</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Code</label>
                        <input
                            type="text"
                            placeholder="e.g. SUMMER10"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Value</label>
                        <input
                            type="number"
                            placeholder="e.g. 10"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Type</label>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', height: '38px' }}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Min Order</label>
                        <input
                            type="number"
                            placeholder="Optional"
                            value={minOrderValue}
                            onChange={(e) => setMinOrderValue(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Max Discount</label>
                        <input
                            type="number"
                            placeholder="Optional (Req for %)"
                            value={maxDiscountValue}
                            onChange={(e) => setMaxDiscountValue(e.target.value)}
                            disabled={discountType === 'fixed'}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem', background: discountType === 'fixed' ? '#f3f4f6' : 'white' }}
                        />
                    </div>
                    <Button onClick={addCoupon} disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create'}
                    </Button>
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
                {loading ? (
                    <p>Loading coupons...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '0.5rem' }}>Code</th>
                                <th style={{ padding: '0.5rem' }}>Discount</th>
                                <th style={{ padding: '0.5rem' }}>Min Order</th>
                                <th style={{ padding: '0.5rem' }}>Max Disc.</th>
                                <th style={{ padding: '0.5rem' }}>Status</th>
                                <th style={{ padding: '0.5rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No coupons found. Create one above!</td>
                                </tr>
                            ) : (
                                coupons.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{c.code}</td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem', color: '#666' }}>
                                            {c.min_order_value > 0 ? `₹${c.min_order_value}` : '-'}
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem', color: '#666' }}>
                                            {c.max_discount_value ? `₹${c.max_discount_value}` : '-'}
                                        </td>


                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <button
                                                onClick={() => toggleStatus(c.id, c.is_active)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    background: c.is_active ? '#dcfce7' : '#fee2e2',
                                                    color: c.is_active ? '#166534' : '#991b1b'
                                                }}
                                            >
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '1rem 0.5rem' }}>
                                            <button
                                                onClick={() => deleteCoupon(c.id)}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
