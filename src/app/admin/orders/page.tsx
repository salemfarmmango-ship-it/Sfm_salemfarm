'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

import { X, Download, ChevronLeft, ChevronRight, CheckSquare, Square, Filter, Printer } from 'lucide-react';
import { EmailService } from '@/lib/EmailService';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingOrder, setViewingOrder] = useState<any>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [trackingId, setTrackingId] = useState('');
    const [courierPartner, setCourierPartner] = useState('');
    const [savingTracking, setSavingTracking] = useState(false);

    // Delhivery Automation State
    const [bookingDelhivery, setBookingDelhivery] = useState(false);
    const [fetchingLabel, setFetchingLabel] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [exporting, setExporting] = useState(false);
    const pageSize = 15;

    // Filter and Selection state
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // Default to no filter (show all orders)
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Printing state
    const [printData, setPrintData] = useState<any[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        // Reset to page 1 when filter changes
        setCurrentPage(1);
        fetchOrders(1);
    }, [statusFilter, dateFilter]); // Added dateFilter dependency

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page: number) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                status: statusFilter,
                date: dateFilter
            });

            const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Failed to fetch orders');

            setOrders(result.data || []);
            setTotalOrders(result.count || 0);

            // Clear selection when data changes
            setSelectedOrderIds([]);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const queryParams = new URLSearchParams({
                limit: '1000', // Fetch a large batch for export
                status: statusFilter
            });

            const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Failed to fetch orders for export');
            
            const data = result.data || [];
            if (data.length === 0) {
                alert('No orders to export');
                return;
            }

            const headers = ['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Payment'];
            const rows = data.map((order: any) => [
                `#${order.id}`,
                order.customer_name || 'Guest',
                new Date(order.created_at).toLocaleDateString('en-IN'),
                order.total_amount,
                order.status,
                order.payment_status
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_${statusFilter || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            alert(`Failed to export: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to update status');

            // If status changed to shipped, send email
            if (newStatus === 'shipped') {
                const orderToNotify = orders.find(o => o.id === orderId);
                if (orderToNotify) {
                    EmailService.sendShippingNotification(orderToNotify).catch(err => {
                        console.error('Failed to send shipping email:', err);
                    });
                }
            }

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error: any) {
            alert(`Failed to update status: ${error.message}`);
        }
    };

    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (selectedOrderIds.length === 0) return;
        if (!confirm(`Are you sure you want to update ${selectedOrderIds.length} orders to "${newStatus}"?`)) return;

        setBulkUpdating(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedOrderIds, status: newStatus })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Bulk update failed');

            // If status changed to shipped, send bulk emails
            if (newStatus === 'shipped') {
                selectedOrderIds.forEach(id => {
                    const orderToNotify = orders.find(o => o.id === id);
                    if (orderToNotify) {
                        EmailService.sendShippingNotification(orderToNotify).catch(err => {
                            console.error(`Failed to send shipping email for order ${id}:`, err);
                        });
                    }
                });
            }

            // Optimistically update UI
            setOrders(orders.map(order =>
                selectedOrderIds.includes(order.id) ? { ...order, status: newStatus } : order
            ));
            setSelectedOrderIds([]);
            alert(`Successfully updated ${selectedOrderIds.length} orders.`);
        } catch (error: any) {
            alert(`Bulk update failed: ${error.message}`);
        } finally {
            setBulkUpdating(false);
        }
    };

    const handlePrintLabels = async () => {
        if (selectedOrderIds.length === 0) return;
        setIsPrinting(true);

        try {
            // Fetch detailed info for each selected order
            const promises = selectedOrderIds.map(id => 
                fetch(`/api/admin/orders/${id}`).then(res => res.json())
            );
            
            const results = await Promise.all(promises);
            const data = results.filter(r => !r.error);

            if (data.length > 0) {
                setPrintData(data);
                // Wait for state to update and then print
                setTimeout(() => {
                    window.print();
                    setIsPrinting(false);
                }, 1000);
            }
        } catch (error: any) {
            alert(`Failed to fetch print data: ${error.message}`);
            setIsPrinting(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === orders.length && orders.length > 0) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.map(o => o.id));
        }
    };

    const toggleOrderSelection = (id: number) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleViewOrder = async (order: any) => {
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to load order details');

            setOrderItems(data.order_items || []);
            setViewingOrder(data);
            setTrackingId(data.tracking_id || '');
            setCourierPartner(data.courier_partner || '');
        } catch (error: any) {
            alert(`Failed to load order details: ${error.message}`);
        }
    };

    const handleSaveTracking = async () => {
        if (!viewingOrder) return;
        setSavingTracking(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: viewingOrder.id,
                    tracking_id: trackingId,
                    courier_partner: courierPartner
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update tracking');

            setOrders(orders.map(o => o.id === viewingOrder.id ? { ...o, tracking_id: trackingId, courier_partner: courierPartner } : o));
            setViewingOrder({ ...viewingOrder, tracking_id: trackingId, courier_partner: courierPartner });
            alert('Tracking details saved successfully.');
        } catch (error: any) {
            alert(`Failed to save tracking info: ${error.message}`);
        } finally {
            setSavingTracking(false);
        }
    };

    const handleAutoBookDelhivery = async () => {
        if (!viewingOrder) return;
        setBookingDelhivery(true);
        try {
            const res = await fetch('/api/admin/orders/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: viewingOrder.id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to auto-book');

            // Update local state to reflect success
            const newTrackingId = data.tracking_id;
            setTrackingId(newTrackingId);
            setCourierPartner('Delhivery');
            setOrders(orders.map(o => o.id === viewingOrder.id ? { ...o, tracking_id: newTrackingId, courier_partner: 'Delhivery', is_delhivery_automated: true } : o));
            setViewingOrder({ ...viewingOrder, tracking_id: newTrackingId, courier_partner: 'Delhivery', is_delhivery_automated: true });

            alert('Successfully booked with Delhivery!');
        } catch (error: any) {
            alert(`Booking failed: ${error.message}`);
        } finally {
            setBookingDelhivery(false);
        }
    };

    const handleFetchLabel = async () => {
        if (!viewingOrder || !viewingOrder.tracking_id) return;
        setFetchingLabel(true);
        try {
            const res = await fetch('/api/admin/orders/label', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: viewingOrder.id, waybill: viewingOrder.tracking_id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch label');

            const labelUrl = data.label_url;
            setOrders(orders.map(o => o.id === viewingOrder.id ? { ...o, label_url: labelUrl } : o));
            setViewingOrder({ ...viewingOrder, label_url: labelUrl });

            window.open(labelUrl, '_blank');
        } catch (error: any) {
            alert(`Fetching label failed: ${error.message}`);
        } finally {
            setFetchingLabel(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' };
            case 'processing': return { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe' };
            case 'shipped': return { bg: '#f5f3ff', text: '#5b21b6', border: '#ede9fe' };
            case 'delivered': return { bg: '#f0fdf4', text: '#166534', border: '#dcfce7' };
            case 'cancelled': return { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' };
            default: return { bg: '#f9fafb', text: '#374151', border: '#f3f4f6' };
        }
    };

    const totalPages = Math.ceil(totalOrders / pageSize);

    return (
        <div>
            {/* Global Style for Printing */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 1cm;
                    }
                    body {
                        visibility: hidden;
                        background: white !important;
                    }
                    .printable-area {
                        visibility: visible !important;
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .printable-area * {
                        visibility: visible !important;
                    }
                    /* Specifically hide the main app content to avoid blank pages from parents */
                    header, nav, aside, footer, button {
                        display: none !important;
                    }
                }
                
                .printable-area {
                    display: none;
                }
                
                .label-card {
                    border: 2px solid #000;
                    background: #fff !important;
                    color: #000 !important;
                    margin-bottom: 20px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    page-break-inside: avoid;
                    font-family: Arial, sans-serif;
                }
                
                .label-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                
                .label-body {
                    display: flex;
                }
                
                .delivery-info {
                    flex: 1;
                    padding-right: 20px;
                }
                
                .payment-badge {
                    border: 3px solid #000;
                    padding: 10px 20px;
                    font-size: 24px;
                    font-weight: 900;
                    text-align: center;
                    display: inline-block;
                }
            `}</style>

            {/* Printable Labels Section */}
            <div className="printable-area">
                {printData.map((order, idx) => (
                    <div key={order.id} className="label-card">
                        <div className="label-header">
                            <div>
                                <img src="https://img.salemfarmmango.com/uploads/SFMLOGO.png" alt="Salem Farm Mango" style={{ height: '50px' }} />
                                <div style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '5px' }}>Salem Farm Mango</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px' }}>ORDER ID</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>#{order.id}</div>
                                <div style={{ fontSize: '14px', marginTop: '5px' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
                            </div>
                        </div>

                        <div className="label-body">
                            <div className="delivery-info">
                                <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>Delivery Address</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{order.shipping_address?.full_name}</div>
                                <div style={{ fontSize: '16px', lineHeight: '1.4', marginTop: '10px' }}>
                                    {order.shipping_address?.address_line1}<br />
                                    {order.shipping_address?.address_line2 ? <>{order.shipping_address.address_line2}<br /></> : null}
                                    {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                                    <strong>PIN: {order.shipping_address?.postal_code}</strong><br />
                                    Phone: <strong>{order.shipping_address?.phone}</strong>
                                </div>
                            </div>
                            <div style={{ width: '200px', textAlign: 'center', borderLeft: '1px dashed #000', paddingLeft: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <div className="payment-badge">
                                    {order.payment_status === 'paid' ? 'PREPAID' : 'COD'}
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '15px' }}>
                                    ₹{order.total_amount}
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
                                    {order.payment_status === 'paid' ? 'Payment Received' : 'Collect Cash'}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>PACKING ITEMS</div>
                            <div style={{ fontSize: '14px' }}>
                                {order.order_items?.map((item: any, i: number) => (
                                    <span key={i}>
                                        {item.products?.name} (x{item.quantity}){i < order.order_items.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', fontSize: '10px', textAlign: 'center', color: '#999' }}>
                            This is a system generated delivery label. From: Salem Farm Mango, Salem, TN.
                        </div>
                    </div>
                ))}
            </div>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: 'var(--space-8)',
                gap: isMobile ? '1rem' : '0'
            }}>
                <h1 style={{ margin: 0 }}>Manage Orders ({totalOrders})</h1>
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '0.5rem' : '1rem',
                    alignItems: isMobile ? 'stretch' : 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-light)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                paddingRight: '0.5rem',
                                flex: 1
                            }}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-light)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                fontSize: '0.9rem',
                                color: 'var(--text-main)',
                                fontFamily: 'inherit',
                                flex: 1
                            }}
                        />
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter('')}
                                title="Clear Date Filter"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={exporting || orders.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                    >
                        <Download size={18} />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedOrderIds.length > 0 && (
                <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: isMobile ? '1rem' : '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    gap: isMobile ? '1rem' : '0'
                }}>
                    <div style={{ fontWeight: '600', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckSquare size={20} />
                        {selectedOrderIds.length} orders selected
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '1rem',
                        alignItems: isMobile ? 'stretch' : 'center'
                    }}>
                        <Button
                            size="sm"
                            onClick={handlePrintLabels}
                            disabled={isPrinting}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#166534',
                                color: 'white',
                                border: 'none',
                                justifyContent: 'center'
                            }}
                        >
                            <Printer size={16} />
                            {isPrinting ? 'Preparing...' : 'Print Labels'}
                        </Button>

                        {!isMobile && <div style={{ width: '1px', height: '24px', background: '#bbf7d0' }}></div>}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: '500' }}>Update Status:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                    <Button
                                        key={status}
                                        size="sm"
                                        onClick={() => handleBulkStatusUpdate(status)}
                                        disabled={bulkUpdating}
                                        variant="outline"
                                        style={{
                                            textTransform: 'capitalize',
                                            fontSize: '0.85rem',
                                            padding: '0.4rem 0.6rem',
                                            background: 'white',
                                            borderColor: '#bbf7d0',
                                            color: '#15803d',
                                            flex: isMobile ? '1 1 calc(50% - 0.5rem)' : 'auto'
                                        }}
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {isMobile ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrderIds([])}
                                style={{ color: '#dc2626', borderColor: '#fee2e2' }}
                            >
                                Clear Selection
                            </Button>
                        ) : (
                            <button
                                onClick={() => setSelectedOrderIds([])}
                                style={{
                                    background: '#dcfce7',
                                    border: 'none',
                                    color: '#15803d',
                                    cursor: 'pointer',
                                    marginLeft: '1rem',
                                    padding: '0.25rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="animate-spin" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid var(--color-mango-600)',
                        borderRadius: '50%'
                    }}></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>No orders found{statusFilter ? ` for status "${statusFilter}"` : ''}</p>
                </div>
            ) : (
                <>
                    <div className="card" style={{ padding: '0', overflowX: 'auto', marginBottom: '1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '900px' : 'auto' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-gray-50)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', width: '50px' }}>
                                        <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                                            {selectedOrderIds.length === orders.length && orders.length > 0 ? (
                                                <CheckSquare size={20} style={{ color: 'var(--color-mango-600)' }} />
                                            ) : (
                                                <Square size={20} style={{ color: 'var(--text-secondary)' }} />
                                            )}
                                        </div>
                                    </th>
                                    <th style={{ padding: '1rem' }}>Order ID</th>
                                    <th style={{ padding: '1rem' }}>Customer</th>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Total</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr
                                        key={order.id}
                                        style={{
                                            borderTop: '1px solid var(--border-light)',
                                            background: selectedOrderIds.includes(order.id) ? '#f0fdf4' : (
                                                order.status === 'pending' ? 'rgba(251, 191, 36, 0.05)' :
                                                    order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.03)' :
                                                        'transparent'
                                            ),
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div onClick={() => toggleOrderSelection(order.id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                                                {selectedOrderIds.includes(order.id) ? (
                                                    <CheckSquare size={20} style={{ color: 'var(--color-mango-600)' }} />
                                                ) : (
                                                    <Square size={20} style={{ color: 'var(--text-secondary)' }} />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>#{order.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {(order.profiles as any)?.full_name || 'Guest'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {new Date(order.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    borderRadius: '2rem',
                                                    border: `1px solid ${getStatusStyles(order.status).border}`,
                                                    background: getStatusStyles(order.status).bg,
                                                    color: getStatusStyles(order.status).text,
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize',
                                                    cursor: 'pointer',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                            ₹{order.total_amount?.toLocaleString('en-IN') || 0}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginTop: '2rem'
                        }}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <ChevronLeft size={16} /> Previous
                            </Button>

                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Page <strong>{currentPage}</strong> of {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                Next <ChevronRight size={16} />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Order Details Modal */}
            {viewingOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ padding: '2rem', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Order #{viewingOrder.id}</h2>
                            <button
                                onClick={() => setViewingOrder(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p><strong>Customer:</strong> {(viewingOrder.profiles as any)?.full_name || 'Guest'}</p>
                            <p><strong>Date:</strong> {new Date(viewingOrder.created_at).toLocaleString('en-IN')}</p>
                            <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{viewingOrder.status}</span></p>
                            <p><strong>Payment:</strong> <span style={{ textTransform: 'capitalize' }}>{viewingOrder.payment_status}</span></p>
                        </div>

                        <h3 style={{ marginBottom: '1rem' }}>Order Items</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-gray-50)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem' }}>Product</th>
                                    <th style={{ padding: '0.75rem' }}>Quantity</th>
                                    <th style={{ padding: '0.75rem' }}>Price</th>
                                    <th style={{ padding: '0.75rem' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.map((item, idx) => (
                                    <tr key={idx} style={{ borderTop: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '0.75rem' }}>{(item.products as any)?.name || 'Unknown'}</td>
                                        <td style={{ padding: '0.75rem' }}>{item.quantity}</td>
                                        <td style={{ padding: '0.75rem' }}>₹{item.price.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '0.75rem' }}>₹{(item.quantity * item.price).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border-light)', fontWeight: 'bold' }}>
                                    <td colSpan={3} style={{ padding: '0.75rem', textAlign: 'right' }}>Total:</td>
                                    <td style={{ padding: '0.75rem' }}>₹{viewingOrder.total_amount?.toLocaleString('en-IN')}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Shipping & Tracking</h3>

                        {/* Auto-Book Delhivery Flow - available for all orders without tracking */}
                        {viewingOrder.shipping_address && !viewingOrder.is_delhivery_automated && !trackingId && (
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#1e40af' }}>Delhivery Automated Booking</h4>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#3b82f6' }}>Generate tracking and label instantly</p>
                                </div>
                                <Button size="sm" onClick={handleAutoBookDelhivery} disabled={bookingDelhivery} style={{ background: '#2563eb' }}>
                                    {bookingDelhivery ? 'Booking...' : 'Auto-Book via Delhivery'}
                                </Button>
                            </div>
                        )}

                        {viewingOrder.is_delhivery_automated && (
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#166534' }}>Delhivery Shipment Created</h4>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#15803d' }}>Tracking ID: <strong>{trackingId}</strong></p>
                                </div>
                                <div>
                                    {viewingOrder.label_url ? (
                                        <Button size="sm" variant="outline" onClick={() => window.open(viewingOrder.label_url, '_blank')} style={{ borderColor: '#166534', color: '#166534' }}>
                                            <Printer size={16} style={{ marginRight: '0.5rem' }} /> Print Label
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={handleFetchLabel} disabled={fetchingLabel} style={{ borderColor: '#166534', color: '#166534' }}>
                                            {fetchingLabel ? 'Fetching...' : 'Generate Label'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Courier Partner</label>
                                <select
                                    value={courierPartner}
                                    onChange={e => setCourierPartner(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)' }}
                                >
                                    <option value="">Select Courier</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="ST Courier">ST Courier</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Tracking ID</label>
                                <input
                                    type="text"
                                    value={trackingId}
                                    onChange={e => setTrackingId(e.target.value)}
                                    placeholder="Enter tracking ID"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-light)' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '0.5rem' }}>
                                <Button size="sm" onClick={handleSaveTracking} disabled={savingTracking}>
                                    {savingTracking ? 'Saving...' : 'Save Tracking Info'}
                                </Button>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                            <Button onClick={() => setViewingOrder(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
