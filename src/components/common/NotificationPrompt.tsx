'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationPrompt() {
    const { showPrompt, subscribe, dismissPrompt, isLoading, status, isSupported } = useNotifications();

    // Don't render if not supported, already granted/denied, or prompt dismissed
    if (!isSupported || status !== 'default' || !showPrompt) {
        return null;
    }

    const handleEnable = async () => {
        await subscribe();
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <>
                    <style jsx>{`
                        .notification-overlay {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.2); /* Very light subtle overlay */
                            backdrop-filter: none; /* Removed blur as requested */
                            z-index: 20000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 16px;
                        }
                        
                        .notification-prompt-container {
                            position: relative;
                            width: calc(100% - 32px);
                            max-width: 320px;
                            background-color: #ffffff !important;
                            background: #ffffff !important;
                            border-radius: 20px;
                            padding: 24px;
                            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                            border: 1px solid #e5e7eb;
                            color: #111827;
                            z-index: 20001;
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                        }

                        /* Mobile View Adjustments */
                        @media (max-width: 480px) {
                            .notification-prompt-container {
                                padding: 20px;
                                max-width: 290px;
                                border-radius: 16px;
                            }
                            
                            .notif-title {
                                font-size: 17px !important;
                            }

                            .notif-msg {
                                font-size: 13px !important;
                            }
                        }
                    `}</style>

                    <div className="notification-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            className="notification-prompt-container"
                            style={{
                                position: 'relative',
                                width: 'calc(100% - 32px)',
                                maxWidth: '320px',
                                backgroundColor: '#ffffff',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                                border: '1px solid #e5e7eb',
                                color: '#111827',
                                zIndex: 20001,
                                visibility: 'visible',
                            }}
                        >
                            {/* Close button - Inside the rounded rectangle */}
                            <button
                                onClick={dismissPrompt}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s',
                                    zIndex: 10,
                                }}
                                aria-label="Close"
                            >
                                <X size={16} color="#6b7280" />
                            </button>

                            {/* Icon & Title */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    marginBottom: '18px',
                                }}
                            >
                                <div
                                    className="notif-icon-wrapper"
                                    style={{
                                        background: '#f0fdf4',
                                        borderRadius: '12px',
                                        padding: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #dcfce7',
                                    }}
                                >
                                    <Bell size={24} color="#16a34a" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3
                                        className="notif-title"
                                        style={{
                                            margin: 0,
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            color: '#064e3b',
                                            fontFamily: 'Inter, var(--font-serif)',
                                        }}
                                    >
                                        Fresh Alerts! 🥭
                                    </h3>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '12px',
                                            color: '#059669',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Don't miss the harvest
                                    </p>
                                </div>
                            </div>

                            {/* Message */}
                            <div style={{ marginBottom: '20px' }}>
                                <p
                                    className="notif-msg"
                                    style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        color: '#4b5563',
                                        lineHeight: 1.5,
                                        fontWeight: 500,
                                    }}
                                >
                                    Get real-time updates on your orders and be the first to know when your <span style={{ color: '#16a34a', fontWeight: 600 }}>favorite mangoes</span> are back in stock!
                                </p>
                            </div>

                            {/* Buttons */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                }}
                            >
                                <button
                                    onClick={dismissPrompt}
                                    className="notif-btn"
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        background: '#ffffff',
                                        color: '#6b7280',
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Not Now
                                </button>
                                <button
                                    onClick={handleEnable}
                                    disabled={isLoading}
                                    className="notif-btn"
                                    style={{
                                        flex: 1.2,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#16a34a',
                                        color: '#ffffff',
                                        fontSize: '13.5px',
                                        fontWeight: 600,
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)',
                                        opacity: isLoading ? 0.8 : 1,
                                    }}
                                >
                                    {isLoading ? 'Wait...' : 'Enable Notifications'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
