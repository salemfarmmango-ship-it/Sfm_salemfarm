'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchSubscribers();
    }, [page]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/subscribers?page=${page}&limit=10`);
            if (!res.ok) throw new Error('Failed to fetch subscribers');
            const data = await res.json();

            // Handle both legacy array response and new paginated response
            if (Array.isArray(data)) {
                setSubscribers(data);
            } else {
                setSubscribers(data.subscribers || []);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    // ... exportToCSV unchanged ...

    const exportToCSV = () => {
        // Export should ideally fetch ALL data, but for now we export current view or we need a new API endpoint for export
        // Re-using current subscribers for simplicity as per existing logic, or better:
        // Trigger a separate full download if needed. For now keeping existing logic on current loaded data.
        const headers = ['Email', 'Subscribed At'];
        const csvData = subscribers.map(sub => [
            sub.email,
            new Date(sub.subscribed_at).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <h1>Newsletter Subscribers</h1>
                <Button onClick={exportToCSV} variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} /> Export CSV
                </Button>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-gray-50)', textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                            <th style={{ padding: '1rem', fontWeight: '600' }}>Email Address</th>
                            <th style={{ padding: '1rem', fontWeight: '600' }}>Subscription Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No subscribers found yet.
                                </td>
                            </tr>
                        ) : (
                            subscribers.map((sub) => (
                                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: 'var(--color-mango-50)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--color-mango-600)'
                                            }}>
                                                <Mail size={16} />
                                            </div>
                                            <span style={{ fontWeight: '500' }}>{sub.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} />
                                            {new Date(sub.subscribed_at).toLocaleDateString()} at {new Date(sub.subscribed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                {subscribers.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-light)' }}>
                        <Button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            variant="outline"
                            size="sm"
                        >
                            Previous
                        </Button>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
                        <Button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            variant="outline"
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
