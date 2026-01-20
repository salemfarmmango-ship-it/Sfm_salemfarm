'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, Users, Smartphone, RefreshCw, Trash2 } from 'lucide-react';

interface Subscription {
    id: string;
    token: string;
    user_id: string | null;
    device_info: {
        userAgent?: string;
        platform?: string;
        language?: string;
        timestamp?: string;
    };
    created_at: string;
    updated_at: string;
}

export default function AdminNotificationsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('/');
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch subscriptions
    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications/send');
            const data = await response.json();
            if (data.subscriptions) {
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Send broadcast notification
    const sendNotification = async () => {
        if (!title.trim() || !body.trim()) {
            setSendResult({ success: false, message: 'Title and body are required' });
            return;
        }

        setSending(true);
        setSendResult(null);

        try {
            const response = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    broadcast: true,
                    notification: {
                        title,
                        body,
                        url,
                        icon: '/logo.png',
                    },
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSendResult({ success: true, message: data.message });
                setTitle('');
                setBody('');
                setUrl('/');
            } else {
                setSendResult({ success: false, message: data.error });
            }
        } catch (error) {
            setSendResult({ success: false, message: 'Failed to send notification' });
        } finally {
            setSending(false);
        }
    };

    // Get device type from user agent
    const getDeviceType = (userAgent?: string): string => {
        if (!userAgent) return 'Unknown';
        if (/Mobile|Android|iPhone/.test(userAgent)) return 'Mobile';
        if (/Tablet|iPad/.test(userAgent)) return 'Tablet';
        return 'Desktop';
    };

    // Get browser from user agent
    const getBrowser = (userAgent?: string): string => {
        if (!userAgent) return 'Unknown';
        if (/Chrome/.test(userAgent)) return 'Chrome';
        if (/Firefox/.test(userAgent)) return 'Firefox';
        if (/Safari/.test(userAgent)) return 'Safari';
        if (/Edge/.test(userAgent)) return 'Edge';
        return 'Other';
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: 0,
                }}>
                    <Bell size={32} color="#FFC107" />
                    Push Notifications
                </h1>
                <p style={{ color: '#666', marginTop: '8px' }}>
                    Send push notifications to subscribed users
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#fff',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={24} />
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 700 }}>
                                {subscriptions.length}
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                Total Subscribers
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#fff',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Smartphone size={24} />
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 700 }}>
                                {subscriptions.filter(s =>
                                    /Mobile|Android|iPhone/.test(s.device_info?.userAgent || '')
                                ).length}
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                Mobile Users
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Notification Form */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Send size={20} />
                    Send Broadcast Notification
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            fontSize: '14px',
                        }}>
                            Notification Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Fresh Mangoes Arrived! 🥭"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            fontSize: '14px',
                        }}>
                            Notification Body *
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="e.g., Our new batch of premium Alphonso mangoes is now available. Order now for early delivery!"
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                outline: 'none',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: 500,
                            fontSize: '14px',
                        }}>
                            Click URL (where to go when clicked)
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="/"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '16px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {sendResult && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: sendResult.success ? '#d4edda' : '#f8d7da',
                            color: sendResult.success ? '#155724' : '#721c24',
                            fontSize: '14px',
                        }}>
                            {sendResult.message}
                        </div>
                    )}

                    <button
                        onClick={sendNotification}
                        disabled={sending || subscriptions.length === 0}
                        style={{
                            padding: '14px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: subscriptions.length === 0
                                ? '#ccc'
                                : 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                            color: subscriptions.length === 0 ? '#666' : '#1a1a2e',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: subscriptions.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: sending ? 0.7 : 1,
                        }}
                    >
                        {sending ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send to All ({subscriptions.length} subscribers)
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Subscribers List */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #eee',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: 0,
                    }}>
                        <Users size={20} />
                        Subscribed Devices
                    </h2>
                    <button
                        onClick={fetchSubscriptions}
                        disabled={loading}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Loading subscriptions...
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                    }}>
                        <Bell size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                        <p style={{ margin: 0 }}>No subscribers yet</p>
                        <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                            Users will appear here once they enable notifications
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Device</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Browser</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Subscribed</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Token</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions
                                        .slice((currentPage - 1) * 10, currentPage * 10)
                                        .map((sub) => (
                                            <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Smartphone size={16} color="#666" />
                                                        {getDeviceType(sub.device_info?.userAgent)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {getBrowser(sub.device_info?.userAgent)}
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                                                    {new Date(sub.created_at).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <code style={{
                                                        fontSize: '12px',
                                                        background: '#f5f5f5',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                    }}>
                                                        {sub.token.substring(0, 20)}...
                                                    </code>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {subscriptions.length > 10 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: '1px solid #eee',
                            }}>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, subscriptions.length)} of {subscriptions.length} entries
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            background: currentPage === 1 ? '#f5f5f5' : '#fff',
                                            color: currentPage === 1 ? '#ccc' : '#333',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(subscriptions.length / 10), p + 1))}
                                        disabled={currentPage >= Math.ceil(subscriptions.length / 10)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid #ddd',
                                            background: currentPage >= Math.ceil(subscriptions.length / 10) ? '#f5f5f5' : '#fff',
                                            color: currentPage >= Math.ceil(subscriptions.length / 10) ? '#ccc' : '#333',
                                            cursor: currentPage >= Math.ceil(subscriptions.length / 10) ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
