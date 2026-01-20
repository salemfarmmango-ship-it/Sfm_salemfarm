'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '0',
        category_id: '',
        size: '',
        is_featured: false,
        season_over: false,
        original_price: '',
        image1: '',
        image2: '',
        image3: '',
        image4: '',
        image5: '',
        highlights: ''
    });

    useEffect(() => {
        fetchCategories();
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        setCategories(data || []);
    };

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    price: data.price.toString(),
                    stock: data.stock.toString(),
                    category_id: data.category_id.toString(),
                    size: data.size || '',
                    is_featured: data.is_featured || false,
                    season_over: data.season_over || false,
                    original_price: data.original_price?.toString() || '',
                    image1: data.images?.[0] || '',
                    image2: data.images?.[1] || '',
                    image3: data.images?.[2] || '',
                    image4: data.images?.[3] || '',
                    image5: data.images?.[4] || '',
                    highlights: data.highlights?.join('\n') || ''
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const images = [
                formData.image1,
                formData.image2,
                formData.image3,
                formData.image4,
                formData.image5
            ].map(url => url.trim()).filter(url => url !== '');

            const highlights = formData.highlights.split('\n').map(h => h.trim()).filter(h => h !== '');

            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    category_id: parseInt(formData.category_id),
                    size: formData.size,
                    is_featured: formData.is_featured,
                    season_over: formData.season_over,
                    original_price: formData.original_price ? parseFloat(formData.original_price) : null,
                    images: images,
                    highlights: highlights
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update product');
            }

            alert('Product updated successfully!');
            router.push('/admin/products');
        } catch (error: any) {
            alert(`Failed to update product: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="animate-spin" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--color-mango-600)',
                    borderRadius: '50%'
                }}></div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-8)' }}>
                <button
                    onClick={() => router.push('/admin/products')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-secondary)'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1>Edit Product</h1>
            </div>

            <div className="card" style={{ padding: '2rem', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Product Name */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Product Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Price and Stock Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    min="0"
                                    step="0.01"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                    min="0"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Regular Price (Original Price) */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Regular Price (Strikeout)
                            </label>
                            <input
                                type="number"
                                value={formData.original_price}
                                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                min="0"
                                step="0.01"
                                placeholder="Optional (e.g. 250)"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </div>

                        {/* Category and Size Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Category *
                                </label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Size/Weight
                                </label>
                                <input
                                    type="text"
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    placeholder="e.g., 1kg, 500g"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Image URLs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{ display: 'block', fontWeight: '500' }}>
                                Product Images (Max 5)
                            </label>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', minWidth: '60px' }}>Image {num}:</span>
                                    <input
                                        type="text"
                                        value={(formData as any)[`image${num}`]}
                                        onChange={(e) => setFormData({ ...formData, [`image${num}`]: e.target.value })}
                                        placeholder={`https://example.com/image${num}.jpg`}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Product Highlights */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Product Highlights (One per line)
                            </label>
                            <textarea
                                value={formData.highlights}
                                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                                placeholder="Premium Quality&#10;Direct from Farm&#10;Organic"
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Checkboxes */}
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>Featured Product (Best Seller)</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.season_over}
                                    onChange={(e) => setFormData({ ...formData, season_over: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ color: formData.season_over ? '#dc2626' : 'inherit' }}>
                                    Season Over (Unavailable)
                                </span>
                            </label>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/admin/products')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Update Product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
