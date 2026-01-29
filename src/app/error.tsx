'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Client-side error captured:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#fff',
            color: '#000'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Something went wrong!
            </h2>
            <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                maxWidth: '600px',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#b91c1c'
            }}>
                <p><strong>Error:</strong> {error.message}</p>
                {error.digest && <p><small>Digest: {error.digest}</small></p>}
            </div>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Try again
            </button>
        </div>
    );
}
