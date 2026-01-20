'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Search, Trash2, Star, CalendarOff, CheckSquare, Square } from 'lucide-react';
import { MangoLoader } from '@/components/common/MangoLoader';

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    useEffect(() => {
        fetchProducts();
    }, []);

    // Reset page when search or data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories (
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(products.filter(p => p.id !== id));
            // alert('Product deleted successfully'); // Removed for cleaner UX
        } catch (error: any) {
            alert(`Failed to delete product: ${error.message}`);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            setProducts(products.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (error: any) {
            alert(`Failed to delete products: ${error.message}`);
        }
    };

    const handleBulkUpdate = async (field: string, value: any) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ [field]: value })
                .in('id', selectedIds);

            if (error) throw error;

            setProducts(products.map(p =>
                selectedIds.includes(p.id) ? { ...p, [field]: value } : p
            ));
            setSelectedIds([]);
        } catch (error: any) {
            alert(`Failed to update products: ${error.message}`);
        }
    };

    // Filter products first
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categories as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then paginate
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        // Only select/deselect visible items on current page
        const currentPageIds = paginatedProducts.map(p => p.id);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            // Deselect only current page items
            setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
        } else {
            // Select all current page items (keeping existing selections)
            const newSelected = [...selectedIds];
            currentPageIds.forEach(id => {
                if (!newSelected.includes(id)) newSelected.push(id);
            });
            setSelectedIds(newSelected);
        }
    };

    // Helper to check if all on current page are selected
    const isPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id));

    if (loading) {
        return <MangoLoader />;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <h1>Products ({products.length})</h1>
                <Link href="/admin/products/new"><Button>+ Add Product</Button></Link>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Search */}
                <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            paddingLeft: '2.5rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '0.5rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f3f4f6', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', marginRight: '0.5rem' }}>{selectedIds.length} Selected</span>

                        <button onClick={() => handleBulkUpdate('is_featured', true)} title="Mark as Featured" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', background: 'white', cursor: 'pointer' }}>
                            <Star size={16} color="#eab308" />
                        </button>
                        <button onClick={() => handleBulkUpdate('is_featured', false)} title="Remove Featured" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', background: 'white', cursor: 'pointer' }}>
                            <Star size={16} color="#9ca3af" />
                        </button>

                        <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 0.5rem' }}></div>

                        <button onClick={() => handleBulkUpdate('season_over', true)} title="Mark Season Over" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', background: 'white', cursor: 'pointer' }}>
                            <CalendarOff size={16} color="#ef4444" />
                        </button>
                        <button onClick={() => handleBulkUpdate('season_over', false)} title="Mark Available" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', background: 'white', cursor: 'pointer' }}>
                            <CheckSquare size={16} color="#16a34a" />
                        </button>

                        <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 0.5rem' }}></div>

                        <button onClick={handleBulkDelete} title="Delete Selected" style={{ padding: '0.5rem', border: '1px solid #fee2e2', borderRadius: '0.25rem', background: '#fef2f2', cursor: 'pointer', color: '#991b1b' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {products.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>No products yet. Click "Add Product" to create one.</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>No products found matching "{searchQuery}".</p>
                </div>
            ) : (
                <div className="card" style={{ padding: '0', overflowX: 'auto', marginBottom: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--color-gray-50)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={isPageSelected}
                                        onChange={toggleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Stock</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)', background: selectedIds.includes(p.id) ? '#f0fdf4' : 'transparent' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(p.id)}
                                            onChange={() => toggleSelect(p.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: '500' }}>{p.name}</div>
                                        {p.is_featured && (
                                            <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>Featured</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        {(p.categories as any)?.name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>₹{p.price}</td>
                                    <td style={{ padding: '1rem' }}>{p.stock || 0}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            background: p.season_over ? '#f3f4f6' : ((p.stock || 0) > 0 ? '#dcfce7' : '#fee2e2'),
                                            color: p.season_over ? '#4b5563' : ((p.stock || 0) > 0 ? '#166534' : '#991b1b'),
                                            border: p.season_over ? '1px solid #d1d5db' : 'none'
                                        }}>
                                            {p.season_over ? 'Season Over' : ((p.stock || 0) > 0 ? 'In Stock' : 'Out of Stock')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/admin/products/${p.id}`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(p.id, p.name)}
                                            style={{ color: '#991b1b', borderColor: '#fecaca' }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Logic to show sliding window of pages could go here, for now just show up to 5 or simple logic
                                // Let's simplify: just show Current of Total
                                return null;
                            })}
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', margin: '0 0.5rem' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
