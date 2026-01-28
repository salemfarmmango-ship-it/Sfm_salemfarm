'use client';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Specification {
    label: string;
    value: string;
}

interface ProductSpecificationsProps {
    productName: string;
    specifications: Specification[];
}

export function ProductSpecifications({ productName, specifications }: ProductSpecificationsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const VISIBLE_ROWS = 5;

    if (!specifications || specifications.length === 0) {
        return null;
    }

    const shouldCollapse = specifications.length > VISIBLE_ROWS;
    const visibleSpecs = isExpanded ? specifications : specifications.slice(0, VISIBLE_ROWS);

    return (
        <div style={{ marginTop: '3rem' }}>
            {/* Section Title */}
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: '#111827',
                textAlign: 'center',
                borderBottom: '3px solid #16a34a',
                paddingBottom: '0.5rem',
                display: 'inline-block'
            }}>
                About {productName}
            </h2>

            {/* Subtitle */}
            <p style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '1rem'
            }}>
                {productName} Specifications:
            </p>

            {/* Table Container */}
            <div style={{ position: 'relative' }}>
                {/* Table */}
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #e5e7eb'
                }}>
                    <tbody>
                        {visibleSpecs.map((spec, index) => (
                            <tr
                                key={index}
                                style={{
                                    borderBottom: '1px solid #e5e7eb',
                                    transition: 'opacity 0.3s ease'
                                }}
                            >
                                <td style={{
                                    padding: '0.875rem 1rem',
                                    fontWeight: '500',
                                    color: '#6b7280',
                                    fontSize: '0.95rem',
                                    width: '35%',
                                    borderRight: '1px solid #e5e7eb',
                                    verticalAlign: 'top',
                                    backgroundColor: '#fafafa'
                                }}>
                                    {spec.label}
                                </td>
                                <td style={{
                                    padding: '0.875rem 1rem',
                                    color: '#111827',
                                    fontSize: '0.95rem'
                                }}>
                                    {spec.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Gradient Overlay - only show when collapsed and there are more rows */}
                {shouldCollapse && !isExpanded && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '80px',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,1) 100%)',
                        pointerEvents: 'none'
                    }} />
                )}
            </div>

            {/* Read More / Show Less Button */}
            {shouldCollapse && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: isExpanded ? '1rem' : '-0.5rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            background: 'white',
                            color: '#374151',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#9ca3af';
                            e.currentTarget.style.background = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.background = 'white';
                        }}
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp size={16} />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown size={16} />
                                Read More
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
