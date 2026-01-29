'use client';

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error captured:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <h2>Something went wrong globally!</h2>
                    <div style={{
                        margin: '1rem 0',
                        padding: '1rem',
                        background: '#fef2f2',
                        color: '#991b1b',
                        borderRadius: '8px',
                        fontFamily: 'monospace'
                    }}>
                        {error.message}
                    </div>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#000',
                            color: '#fff',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
