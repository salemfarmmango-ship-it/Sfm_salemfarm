'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface Option {
    id: number;
    name: string;
}

interface MultiSelectProps {
    options: Option[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    placeholder?: string;
    label?: string;
}

export const MultiSelect = ({
    options,
    selectedIds,
    onChange,
    placeholder = 'Select options...',
    label
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleOption = (id: number) => {
        const newSelected = selectedIds.includes(id)
            ? selectedIds.filter(itemId => itemId !== id)
            : [...selectedIds, id];
        onChange(newSelected);
    };

    const removeOption = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedIds.filter(itemId => itemId !== id));
    };

    const selectedOptions = options.filter(option => selectedIds.includes(option.id));

    return (
        <div ref={containerRef} style={{ width: '100%', marginBottom: '1rem' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {label}
                </label>
            )}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    minHeight: '42px',
                    padding: '4px 8px',
                    paddingRight: '32px',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.5rem',
                    background: 'white',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    borderColor: isOpen ? 'var(--color-primary)' : 'var(--border-light)',
                    boxShadow: isOpen ? '0 0 0 2px rgba(var(--color-primary-rgb), 0.1)' : 'none'
                }}
            >
                {selectedOptions.length > 0 ? (
                    selectedOptions.map(option => (
                        <span 
                            key={option.id}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#f0f9ff',
                                color: '#0369a1',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                border: '1px solid #bae6fd'
                            }}
                        >
                            {option.name}
                            <X 
                                size={14} 
                                onClick={(e) => removeOption(option.id, e)}
                                style={{ marginLeft: '4px', cursor: 'pointer' }}
                            />
                        </span>
                    ))
                ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{placeholder}</span>
                )}
                
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    zIndex: 50,
                    width: containerRef.current?.offsetWidth || '100%',
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border-light)', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                padding: '6px 12px',
                                paddingLeft: '32px',
                                border: '1px solid var(--border-light)',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(option.id);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        background: selectedIds.includes(option.id) ? '#f8fafc' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedIds.includes(option.id) ? '#f8fafc' : 'transparent'}
                                >
                                    <span style={{ 
                                        fontSize: '0.875rem', 
                                        color: selectedIds.includes(option.id) ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: selectedIds.includes(option.id) ? 500 : 400
                                    }}>
                                        {option.name}
                                    </span>
                                    {selectedIds.includes(option.id) && <Check size={16} color="var(--color-primary)" />}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                                No products found
                            </div>
                        )}
                    </div>
                    
                    {selectedIds.length > 0 && (
                        <div style={{ padding: '8px', borderTop: '1px solid var(--border-light)', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                                style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Clear Selection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
