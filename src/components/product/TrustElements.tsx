import React from 'react';
import Image from 'next/image';

export const TrustElements = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem',
            marginTop: '2rem',
            marginBottom: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
        }}>
            {/* Trusted */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '0.5rem' }}>
                    <Image
                        src="/icons/trusted.png"
                        alt="Trusted Since 1984"
                        fill
                        sizes="48px"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Trusted Since 1984</span>
            </div>

            {/* Farmers */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '0.5rem' }}>
                    <Image
                        src="/icons/farmer.png"
                        alt="Direct from Farmers"
                        fill
                        sizes="48px"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Direct from Farmers</span>
            </div>

            {/* Packing */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '0.5rem' }}>
                    <Image
                        src="/icons/safe-packing.png"
                        alt="Safe packing"
                        fill
                        sizes="48px"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Safe packing</span>
            </div>

            {/* Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '0.5rem' }}>
                    <Image
                        src="/icons/secure-payment.png"
                        alt="Secure Online payment"
                        fill
                        sizes="48px"
                        style={{ objectFit: 'contain' }}
                    />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Secure Online payment</span>
            </div>
        </div>
    );
};
