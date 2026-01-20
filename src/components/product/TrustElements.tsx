import React from 'react';
import { ShieldCheck, Tractor, Package, CreditCard } from 'lucide-react';

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
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#eff6ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    marginBottom: '0.5rem'
                }}>
                    <ShieldCheck size={24} strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Trusted Since 1984</span>
            </div>

            {/* Farmers */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#fff7ed',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c',
                    marginBottom: '0.5rem'
                }}>
                    <Tractor size={24} strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Direct from Farmers</span>
            </div>

            {/* Packing */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#fef3c7',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d97706',
                    marginBottom: '0.5rem'
                }}>
                    <Package size={24} strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Safe packing</span>
            </div>

            {/* Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#fce7f3',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#db2777',
                    marginBottom: '0.5rem'
                }}>
                    <CreditCard size={24} strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.2' }}>Secure Online payment</span>
            </div>
        </div>
    );
};
