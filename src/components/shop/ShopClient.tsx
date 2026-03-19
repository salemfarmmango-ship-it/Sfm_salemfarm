'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ProductCardProps } from '@/components/common/ProductCard';
import { ProductCard } from '@/components/common/ProductCard';
import PriceRangeSlider from './PriceRangeSlider';
import { X, Filter, List, ChevronDown } from 'lucide-react';

interface ShopClientProps {
    products: ProductCardProps[];
    categories: string[];
    initialCategory?: string;
    initialSort?: string;
}

export default function ShopClient({ products: initialProducts, categories, initialCategory, initialSort }: ShopClientProps) {
    // Derived dynamic max price (rounded up to nearest 100)
    // Default to 1000 if empty or logic fails
    const maxProductPrice = Math.max(...(initialProducts.length ? initialProducts.map(p => p.price) : [1000]));
    const roundedMaxPrice = Math.ceil(maxProductPrice / 100) * 100 || 1000;

    // State
    const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>(initialProducts);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filters
    // Initialize with prop if available, otherwise 'All'
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

    // Sync state if prop changes (e.g. navigation)
    useEffect(() => {
        setSelectedCategory(initialCategory || 'All');
        if (initialSort) setSortOption(initialSort);
    }, [initialCategory, initialSort]);

    // Price Range State
    // activePriceRange drives the UI slider immediately (fast)
    const [activePriceRange, setActivePriceRange] = useState<[number, number]>([100, roundedMaxPrice]);
    // debouncedPriceRange drives the actual filtering (smooth)
    const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([100, roundedMaxPrice]);

    const [stockStatus, setStockStatus] = useState({
        onSale: false,
        inStock: false,
        onBackorder: false
    });
    const [sortOption, setSortOption] = useState(initialSort || 'popular');
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    const sortOptions = [
        { value: 'popular', label: 'Sort by popularity' },
        { value: 'rating', label: 'Average rating' },
        { value: 'featured', label: 'Featured' },
        { value: 'price-low-high', label: 'Price: Low → High' },
        { value: 'price-high-low', label: 'Price: High → Low' },
    ];
    const currentSort = sortOptions.find(o => o.value === sortOption) || sortOptions[0];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    // Manual Filter Handler
    const handleApplyFilter = () => {
        setDebouncedPriceRange(activePriceRange);
        setIsMobileFilterOpen(false); // Close mobile drawer on apply
    };

    // Filtering Logic
    useEffect(() => {
        let result = [...initialProducts];

        // 1. Filter by Category
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // 2. Filter by Price (Use APPLIED value - debouncedPriceRange)
        result = result.filter(p => p.price >= debouncedPriceRange[0] && p.price <= debouncedPriceRange[1]);

        // 3. Filter by Stock Status
        if (stockStatus.inStock) {
            result = result.filter(p => !p.outOfStock);
        }
        if (stockStatus.onSale) {
            result = result.filter(p => p.originalPrice && p.originalPrice > p.price);
        }

        // 4. Sort
        switch (sortOption) {
            case 'price-low-high':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-low':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'featured':
                result.sort((a, b) => {
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return b.id - a.id;
                });
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'popular':
            default:
                break;
        }

        setFilteredProducts(result);
    }, [debouncedPriceRange, stockStatus, sortOption, selectedCategory, initialProducts]);



    const handleCategoryClick = (category: string) => {
        if (selectedCategory === category) setSelectedCategory('All');
        else setSelectedCategory(category);
    };

    const SidebarContent = ({ hideButton = false }: { hideButton?: boolean }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: hideButton ? 'auto' : '100%', paddingBottom: hideButton ? '0' : '80px' }}>
            {/* Price Filter */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Filter By Price</h3>

                <PriceRangeSlider
                    min={0}
                    max={roundedMaxPrice}
                    value={activePriceRange}
                    onChange={setActivePriceRange}
                    gap={50}
                />

                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                    <span>₹{activePriceRange[0]}</span>
                    <span>₹{activePriceRange[1]}</span>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6' }} />

            {/* Stock Status */}
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Stock Status</h3>

                <label className="custom-checkbox" style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={stockStatus.onSale} onChange={e => setStockStatus({ ...stockStatus, onSale: e.target.checked })} />
                    On sale
                </label>
                <label className="custom-checkbox" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" checked={stockStatus.inStock} onChange={e => setStockStatus({ ...stockStatus, inStock: e.target.checked })} />
                    In stock
                </label>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6' }} />

            {/* Categories */}
            <div style={{ flex: hideButton ? 'none' : 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div
                        onClick={() => handleCategoryClick('All')}
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: selectedCategory === 'All' ? '#e69500' : '#666', cursor: 'pointer', fontWeight: selectedCategory === 'All' ? '600' : '400' }}
                    >
                        <span>All Products</span>
                        <span>({initialProducts.length})</span>
                    </div>
                    {categories.map(cat => (
                        <div
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: selectedCategory === cat ? '#e69500' : '#666', cursor: 'pointer', fontWeight: selectedCategory === cat ? '600' : '400' }}
                        >
                            <span>{cat}</span>
                            <span>({initialProducts.filter(p => p.category === cat).length})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Apply Filter Button - Prominent on Mobile */}
            {!hideButton && (
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button
                        onClick={handleApplyFilter}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--color-green-700)',
                            color: 'white',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        APPLY FILTERS
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '1.5rem' }}>

            <div className="shop-layout" style={{ gap: '1.5rem' }}>
                {/* Mobile Action Bar */}
                <div className="mobile-action-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#333', cursor: 'pointer' }} onClick={() => setIsMobileFilterOpen(true)}>
                        <List size={24} strokeWidth={1.5} />
                        <span style={{ fontSize: '0.9rem' }}>Filter</span>
                    </div>
                    {/* Custom Sort Dropdown - Mobile */}
                    <div ref={sortRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setSortOpen(!sortOpen)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', fontWeight: '600', fontSize: '0.85rem', color: '#333', cursor: 'pointer' }}
                        >
                            <span>{currentSort.label}</span>
                            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'none' }} />
                        </button>
                        {sortOpen && (
                            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '190px', overflow: 'hidden' }}>
                                {sortOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSortOption(opt.value); setSortOpen(false); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '0.65rem 1rem', background: opt.value === sortOption ? '#f0fdf4' : 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: opt.value === sortOption ? '600' : '400', color: opt.value === sortOption ? 'var(--color-green-700)' : '#374151', transition: 'background 0.15s' }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                <div className={`mobile-filter-overlay ${isMobileFilterOpen ? 'open' : ''}`} onClick={() => setIsMobileFilterOpen(false)} />
                <div className={`mobile-filter-drawer ${isMobileFilterOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Filter</h2>
                        <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none' }}><X size={24} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        <SidebarContent hideButton={true} />
                    </div>

                    <div style={{ padding: '1rem 1.5rem 110px', background: 'white', borderTop: '1px solid #f3f4f6', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)' }}>
                        <button
                            onClick={handleApplyFilter}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--color-green-700)',
                                color: 'white',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            APPLY FILTERS
                        </button>
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <aside className="shop-sidebar" style={{ width: '250px' }}>
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className="shop-main">
                    {/* Top Bar */}
                    <div className="shop-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Showing all {filteredProducts.length} results
                        </div>

                        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Same custom sort dropdown - Desktop */}
                            <div style={{ position: 'relative' }} ref={sortRef}>
                                <button
                                    onClick={() => setSortOpen(!sortOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '10px', background: 'white', fontWeight: '600', fontSize: '0.875rem', color: '#333', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                                >
                                    <span>{currentSort.label}</span>
                                    <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'none', color: '#6b7280' }} />
                                </button>
                                {sortOpen && (
                                    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: '210px', overflow: 'hidden' }}>
                                        {sortOptions.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => { setSortOption(opt.value); setSortOpen(false); }}
                                                style={{ width: '100%', textAlign: 'left', padding: '0.7rem 1.1rem', background: opt.value === sortOption ? '#f0fdf4' : 'white', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: opt.value === sortOption ? '600' : '400', color: opt.value === sortOption ? 'var(--color-green-700)' : '#374151', transition: 'background 0.15s' }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="shop-product-grid">
                        {filteredProducts.length > 0 ? filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#888' }}>
                                No products found matching your filters.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
