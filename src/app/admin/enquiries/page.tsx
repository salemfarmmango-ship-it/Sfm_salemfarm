'use client';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { CheckCircle, Loader2, Trash2 } from 'lucide-react';

type Tab = 'bulk' | 'corporate';

export default function AdminEnquiriesPage() {
    const [activeTab, setActiveTab] = useState<Tab>('bulk');
    const [bulkEnquiries, setBulkEnquiries] = useState<any[]>([]);
    const [corporateEnquiries, setCorporateEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('new');
    const [dateFilter, setDateFilter] = useState('');

    // Selection
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Separate pagination states
    const [bulkPage, setBulkPage] = useState(1);
    const [corporatePage, setCorporatePage] = useState(1);
    const [bulkTotalPages, setBulkTotalPages] = useState(1);
    const [corporateTotalPages, setCorporateTotalPages] = useState(1);

    const limit = 10;

    useEffect(() => {
        // Reset pages and selection when filters change
        setBulkPage(1);
        setCorporatePage(1);
        setSelectedIds([]);
    }, [statusFilter, dateFilter, activeTab]);

    useEffect(() => {
        fetchData();
    }, [activeTab, bulkPage, corporatePage, statusFilter, dateFilter]);

    const fetchData = async () => {
        setLoading(true);
        setFetchError(null);
        const currentPage = activeTab === 'bulk' ? bulkPage : corporatePage;

        try {
            const queryParams = new URLSearchParams({
                type: activeTab,
                page: String(currentPage),
                limit: String(limit),
                status: statusFilter,
                date: dateFilter
            });

            const response = await fetch(`/api/admin/enquiries?${queryParams.toString()}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            if (activeTab === 'bulk') {
                setBulkEnquiries(result.data || []);
                setBulkTotalPages(result.totalPages || 1);
            } else {
                setCorporateEnquiries(result.data || []);
                setCorporateTotalPages(result.totalPages || 1);
            }
        } catch (error: any) {
            console.error('Error fetching enquiries:', error);
            setFetchError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const currentData = activeTab === 'bulk' ? bulkEnquiries : corporateEnquiries;
        const allIds = currentData.map(item => item.id);

        if (selectedIds.length === currentData.length && currentData.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allIds);
        }
    };

    const handleBulkStatus = async (status: string) => {
        if (selectedIds.length === 0) return;
        setUpdating('bulk');
        try {
            const response = await fetch('/api/admin/enquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, status, type: activeTab })
            });
            if (!response.ok) throw new Error('Failed to update');

            // Refresh
            fetchData();
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0 || !confirm('Are you sure you want to delete selected items?')) return;
        setUpdating('bulk');
        try {
            const response = await fetch('/api/admin/enquiries', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, type: activeTab })
            });
            if (!response.ok) throw new Error('Failed to delete');

            fetchData();
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            alert('Failed to delete');
        } finally {
            setUpdating(null);
        }
    };

    const handleSingleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this enquiry?')) return;
        setUpdating(String(id));
        try {
            const response = await fetch('/api/admin/enquiries', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id], type: activeTab })
            });
            if (!response.ok) throw new Error('Failed to delete');
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to delete');
        } finally {
            setUpdating(null);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        setUpdating(`${id}-${newStatus}`);

        try {
            const response = await fetch('/api/admin/enquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    status: newStatus,
                    type: activeTab
                })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to update status');
            }

            // Refresh local state
            if (activeTab === 'bulk') {
                setBulkEnquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            } else {
                setCorporateEnquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            }

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            new: { bg: '#fff7ed', text: '#9a3412' }, // Orange
            read: { bg: '#dbeafe', text: '#1e40af' }, // Blue
            accepted: { bg: '#dcfce7', text: '#166534' }, // Green
            rejected: { bg: '#fee2e2', text: '#991b1b' }, // Red
            // Legacy mapping
            contacted: { bg: '#dbeafe', text: '#1e40af' },
            'in-progress': { bg: '#dbeafe', text: '#1e40af' },
        };
        const style = styles[status] || styles.new;
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: style.bg,
                color: style.text,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    const ActionButtons = ({ id }: { id: number }) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(id, 'read')}
                disabled={!!updating}
                style={{ fontSize: '0.7rem', height: '28px', padding: '0 8px', borderColor: '#blue-200' }}
                title="Mark as Read"
            >
                {updating === `${id}-read` ? <Loader2 size={12} className="animate-spin" /> : "Read"}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(id, 'accepted')}
                disabled={!!updating}
                style={{ fontSize: '0.7rem', height: '28px', padding: '0 8px', borderColor: '#green-200', color: '#166534' }}
                title="Accept"
            >
                {updating === `${id}-accepted` ? <Loader2 size={12} className="animate-spin" /> : "Accept"}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(id, 'rejected')}
                disabled={!!updating}
                style={{ fontSize: '0.7rem', height: '28px', padding: '0 8px', borderColor: '#red-200', color: '#991b1b' }}
                title="Reject"
            >
                {updating === `${id}-rejected` ? <Loader2 size={12} className="animate-spin" /> : "Reject"}
            </Button>
        </div>
    );

    const currentPage = activeTab === 'bulk' ? bulkPage : corporatePage;
    const totalPages = activeTab === 'bulk' ? bulkTotalPages : corporateTotalPages;
    const setPage = activeTab === 'bulk' ? setBulkPage : setCorporatePage;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-green-800)' }}>Enquiries Management</h1>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', minWidth: '150px' }}
                >
                    <option value="new">Unread (New)</option>
                    <option value="read">Read</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All Statuses</option>
                </select>

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                />

                {(statusFilter !== 'new' || dateFilter !== '') && (
                    <button
                        onClick={() => { setStatusFilter('new'); setDateFilter(''); }}
                        style={{ padding: '0.5rem 1rem', background: '#f3f4f6', borderRadius: '0.375rem', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                        Reset Defaults
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                <button
                    onClick={() => setActiveTab('bulk')}
                    style={{
                        padding: '1rem',
                        borderBottom: activeTab === 'bulk' ? '2px solid var(--color-mango-600)' : 'none',
                        color: activeTab === 'bulk' ? 'var(--color-mango-700)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'bulk' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none'
                    }}
                >
                    Bulk Orders
                </button>
                <button
                    onClick={() => setActiveTab('corporate')}
                    style={{
                        padding: '1rem',
                        borderBottom: activeTab === 'corporate' ? '2px solid var(--color-mango-600)' : 'none',
                        color: activeTab === 'corporate' ? 'var(--color-mango-700)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'corporate' ? 'bold' : 'normal',
                        cursor: 'pointer',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none'
                    }}
                >
                    Corporate Gifts
                </button>
            </div>

            {fetchError && (
                <div style={{ padding: '1rem', marginBottom: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
                    Error loading data: {fetchError}
                </div>
            )}



            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && (
                <div style={{ padding: '0.75rem', background: '#e0f2fe', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#0369a1' }}>{selectedIds.length} Selected</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatus('read')} disabled={!!updating} style={{ background: 'white' }}>Mark Read</Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatus('accepted')} disabled={!!updating} style={{ background: 'white' }}>Mark Accepted</Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatus('rejected')} disabled={!!updating} style={{ background: 'white' }}>Mark Rejected</Button>
                        <Button size="sm" onClick={handleBulkDelete} disabled={!!updating} style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}>
                            <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /> Loading...</div>
            ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border-light)' }}>
                                    <th style={{ padding: '1rem', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={activeTab === 'bulk' ? (bulkEnquiries.length > 0 && selectedIds.length === bulkEnquiries.length) : (corporateEnquiries.length > 0 && selectedIds.length === corporateEnquiries.length)}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Name / Company</th>
                                    <th style={{ padding: '1rem' }}>Contact</th>
                                    <th style={{ padding: '1rem' }}>Details</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', minWidth: '220px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'bulk' ? (
                                    bulkEnquiries.length === 0 ? (
                                        <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No enquiries found.</td></tr>
                                    ) : (
                                        bulkEnquiries.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', background: selectedIds.includes(item.id) ? '#f0f9ff' : 'transparent' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                    />
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatDate(item.created_at)}</td>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <div>{item.email}</div>
                                                    <div>{item.phone}</div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <div><strong>Qty:</strong> {item.quantity}</div>
                                                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.message}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <ActionButtons id={item.id} />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSingleDelete(item.id)}
                                                            style={{ padding: '0 8px', height: '28px', color: '#ef4444', borderColor: '#fee2e2' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    corporateEnquiries.length === 0 ? (
                                        <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No enquiries found.</td></tr>
                                    ) : (
                                        corporateEnquiries.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', background: selectedIds.includes(item.id) ? '#f0f9ff' : 'transparent' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                    />
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{formatDate(item.created_at)}</td>
                                                <td style={{ padding: '1rem', fontWeight: '500' }}>
                                                    <div>{item.company_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CP: {item.contact_person}</div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <div>{item.email}</div>
                                                    <div>{item.phone}</div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.requirements}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <ActionButtons id={item.id} />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleSingleDelete(item.id)}
                                                            style={{ padding: '0 8px', height: '28px', color: '#ef4444', borderColor: '#fee2e2' }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-light)' }}>
                        <Button
                            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                        >
                            Previous
                        </Button>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Page {currentPage} of {totalPages || 1}</span>
                        <Button
                            onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
