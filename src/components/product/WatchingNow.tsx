'use client';
import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export const WatchingNow = () => {
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        // Generate a random number between 8 and 28
        const randomCount = Math.floor(Math.random() * (28 - 8 + 1)) + 8;
        setCount(randomCount);
    }, []);

    if (count === 0) return null;

    return (
        <div style={{
            background: '#f0f4ea', // Very light green background matching screenshot
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8da'
        }}>
            <Eye size={18} color="#4d7c0f" />
            <div style={{ fontSize: '0.95rem', color: '#4b5563', fontWeight: '500' }}>
                <span style={{ fontWeight: '700', color: '#111827' }}>{count}</span> People watching this product now!
            </div>
        </div>
    );
};
