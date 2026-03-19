'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

type ShippingRate = {
    id: number;
    state_name: string;
    charge: number;
    is_active: boolean;
};

export default function AdminShippingPage() {
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/shipping');
            if (!res.ok) throw new Error('Failed to fetch rates');
            const data = await res.json();
            setRates(data || []);
        } catch (error) {
            console.error('Error fetching rates:', error);
            alert('Failed to fetch shipping rates');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (rate: ShippingRate) => {
        setEditingId(rate.id);
        setEditValue(rate.charge.toString());
    };

    const handleSave = async (id: number) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/shipping`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, charge: parseFloat(editValue) })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update rate');
            }
            
            setRates(rates.map(r => r.id === id ? { ...r, charge: parseFloat(editValue) } : r));
            setEditingId(null);
        } catch (error: any) {
            console.error('Error updating rate:', error);
            alert(`Failed to update rate: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const filteredRates = rates.filter(r =>
        r.state_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h1 style={{ marginBottom: 'var(--space-8)' }}>Shipping Rates</h1>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search State..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                    />
                </div>

                {loading ? (
                    <p>Loading rates...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '0.75rem', width: '50%' }}>State</th>
                                <th style={{ padding: '0.75rem', width: '30%' }}>Shipping Charge (₹)</th>
                                <th style={{ padding: '0.75rem', width: '20%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRates.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No states found.</td>
                                </tr>
                            ) : (
                                filteredRates.map(rate => (
                                    <tr key={rate.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{rate.state_name}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {editingId === rate.id ? (
                                                <input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    style={{ width: '100px', padding: '0.25rem', border: '1px solid #aaa', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                `₹${rate.charge}`
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {editingId === rate.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Button onClick={() => handleSave(rate.id)} disabled={saving} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save</Button>
                                                    <Button onClick={handleCancel} variant="outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <Button onClick={() => handleEdit(rate)} variant="outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</Button>
                                            )}
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
