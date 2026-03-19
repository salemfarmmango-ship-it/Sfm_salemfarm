'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';


interface Specification {
    label: string;
    value: string;
}

interface ProductVariation {
    variation_label: string;   // e.g. "3kg", "5 Litres"
    size: string;              // size/weight label shown on card  
    name: string;              // optional override name
    description: string;       // optional override description
    price: string;
    original_price: string;
    stock: string;
    stock_status: string;
    image1: string;
    image2: string;
    image3: string;
    highlights: string;        // newline-separated
    specifications: Specification[];
    expanded: boolean;         // UI state — not sent to API
}

const emptyVariation = (): ProductVariation => ({
    variation_label: '',
    size: '',
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock: '0',
    stock_status: 'In Stock',
    image1: '', image2: '', image3: '',
    highlights: '',
    specifications: [],
    expanded: true
});

export default function AddProductPage() {
    const router = useRouter();
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
        image1: '',
        image2: '',
        image3: '',
        image4: '',
        image5: '',
        original_price: '',
        highlights: ''
    });
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [variations, setVariations] = useState<ProductVariation[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (res.ok) {
                setCategories(data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            const validSpecs = specifications.filter(s => s.label.trim() && s.value.trim());

            // Build variation objects for the API
            const validVariations = variations
                .filter(v => v.variation_label.trim() && v.price.trim())
                .map(v => ({
                    variation_label: v.variation_label.trim(),
                    size: v.size.trim() || null,
                    name: v.name.trim() || null,
                    description: v.description.trim() || null,
                    price: parseFloat(v.price),
                    original_price: v.original_price.trim() ? parseFloat(v.original_price) : null,
                    stock: parseInt(v.stock) || 0,
                    stock_status: v.stock_status || 'In Stock',
                    images: [v.image1, v.image2, v.image3].map(u => u.trim()).filter(u => u !== ''),
                    highlights: v.highlights.split('\n').map(h => h.trim()).filter(h => h !== ''),
                    specifications: v.specifications.filter(s => s.label.trim() && s.value.trim())
                }));

            const response = await fetch('/api/admin/products', {
                method: 'POST',
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
                    highlights: highlights,
                    specifications: validSpecs,
                    variations: validVariations
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create product');
            }

            alert('Product created successfully!');
            router.push('/admin/products');
        } catch (error: any) {
            alert(`Failed to create product: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

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
                <h1>Add New Product</h1>
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
                                placeholder="Enter product name"
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
                            <RichTextEditor
                                label="Description"
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
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
                                    Initial Stock *
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

                        {/* Product Specifications */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Product Specifications
                            </label>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                                Add specification rows (e.g., &quot;Shelf Life&quot; → &quot;1-3 days after ripening&quot;)
                            </p>

                            {specifications.map((spec, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={spec.label}
                                        onChange={(e) => {
                                            const newSpecs = [...specifications];
                                            newSpecs[index].label = e.target.value;
                                            setSpecifications(newSpecs);
                                        }}
                                        placeholder="Label (e.g., Shelf Life)"
                                        style={{
                                            flex: 1,
                                            padding: '0.625rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => {
                                            const newSpecs = [...specifications];
                                            newSpecs[index].value = e.target.value;
                                            setSpecifications(newSpecs);
                                        }}
                                        placeholder="Value (e.g., 1-3 days)"
                                        style={{
                                            flex: 2,
                                            padding: '0.625rem',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSpecifications(specifications.filter((_, i) => i !== index));
                                        }}
                                        style={{
                                            padding: '0.5rem',
                                            background: '#fee2e2',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            cursor: 'pointer',
                                            color: '#dc2626'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => setSpecifications([...specifications, { label: '', value: '' }])}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.625rem 1rem',
                                    border: '1px dashed #d1d5db',
                                    borderRadius: '0.375rem',
                                    background: '#f9fafb',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    color: '#374151',
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                            >
                                <Plus size={16} />
                                Add Row
                            </button>
                        </div>

                        {/* ── Product Variations ── */}
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Product Variations</h3>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
                                    Variation 1 = the base product above. Add more variations below (e.g., 3kg, 5kg, 1 Litre).
                                </p>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {variations.map((variation, vi) => (
                                    <div key={vi} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                        {/* Variation Header */}
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f0fdf4', cursor: 'pointer', gap: '1rem' }}
                                            onClick={() => {
                                                const updated = [...variations];
                                                updated[vi].expanded = !updated[vi].expanded;
                                                setVariations(updated);
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontWeight: '600', color: '#15803d' }}>
                                                    Variation {vi + 2}: {variation.variation_label || '(unlabelled)'}
                                                </span>
                                                {variation.price && <span style={{ fontSize: '0.85rem', color: '#374151' }}>₹{variation.price}</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setVariations(variations.filter((_, i) => i !== vi)); }}
                                                    style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', color: '#dc2626', fontSize: '0.75rem' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{variation.expanded ? '▲ Collapse' : '▼ Expand'}</span>
                                            </div>
                                        </div>

                                        {/* Variation Fields */}
                                        {variation.expanded && (
                                            <div style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>

                                                {/* Row 1: Variation Label + Size/Weight */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Variation Label (button text) *</label>
                                                        <input
                                                            type="text"
                                                            value={variation.variation_label}
                                                            onChange={e => { const u=[...variations]; u[vi].variation_label=e.target.value; setVariations(u); }}
                                                            placeholder="e.g. 3kg, 1 Litre"
                                                            required
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Size / Weight (shown on card)</label>
                                                        <input
                                                            type="text"
                                                            value={variation.size}
                                                            onChange={e => { const u=[...variations]; u[vi].size=e.target.value; setVariations(u); }}
                                                            placeholder="e.g. 3 Kg, 1 Litre"
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Row 2: Price + Original Price */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Price (₹) *</label>
                                                        <input
                                                            type="number" min="0" step="0.01"
                                                            value={variation.price}
                                                            onChange={e => { const u=[...variations]; u[vi].price=e.target.value; setVariations(u); }}
                                                            placeholder="e.g. 1200"
                                                            required
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Strikeout Price (₹)</label>
                                                        <input
                                                            type="number" min="0" step="0.01"
                                                            value={variation.original_price}
                                                            onChange={e => { const u=[...variations]; u[vi].original_price=e.target.value; setVariations(u); }}
                                                            placeholder="Optional"
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Row 2: Stock + Stock Status */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Stock</label>
                                                        <input
                                                            type="number" min="0"
                                                            value={variation.stock}
                                                            onChange={e => { const u=[...variations]; u[vi].stock=e.target.value; setVariations(u); }}
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Stock Status</label>
                                                        <select
                                                            value={variation.stock_status}
                                                            onChange={e => { const u=[...variations]; u[vi].stock_status=e.target.value; setVariations(u); }}
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                        >
                                                            <option>In Stock</option>
                                                            <option>Out of Stock</option>
                                                            <option>Pre-Order</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Name Override */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Name Override (leave blank to use base product name)</label>
                                                    <input
                                                        type="text"
                                                        value={variation.name}
                                                        onChange={e => { const u=[...variations]; u[vi].name=e.target.value; setVariations(u); }}
                                                        placeholder="e.g. Alphonso Mango 3kg Box"
                                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                                                    />
                                                </div>

                                                {/* Description Override */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Description Override (leave blank to use base)</label>
                                                    <textarea
                                                        value={variation.description}
                                                        onChange={e => { const u=[...variations]; u[vi].description=e.target.value; setVariations(u); }}
                                                        rows={2}
                                                        placeholder="Optional override description"
                                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem', fontFamily: 'inherit' }}
                                                    />
                                                </div>

                                                {/* Images */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Images (Max 3)</label>
                                                    {(['image1','image2','image3'] as const).map((imgKey, ii) => (
                                                        <div key={imgKey} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                            <span style={{ fontSize: '0.75rem', color: '#6b7280', minWidth: '55px' }}>Image {ii+1}:</span>
                                                            <input
                                                                type="text"
                                                                value={variation[imgKey]}
                                                                onChange={e => { const u=[...variations]; u[vi][imgKey]=e.target.value; setVariations(u); }}
                                                                placeholder="https://..."
                                                                style={{ flex: 1, padding: '0.4rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Highlights */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Highlights (one per line)</label>
                                                    <textarea
                                                        value={variation.highlights}
                                                        onChange={e => { const u=[...variations]; u[vi].highlights=e.target.value; setVariations(u); }}
                                                        rows={3}
                                                        placeholder="Premium Quality\nDirect from Farm"
                                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.9rem', fontFamily: 'inherit' }}
                                                    />
                                                </div>

                                                {/* Specifications */}
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500', fontSize: '0.85rem' }}>Specifications</label>
                                                    {variation.specifications.map((spec, si) => (
                                                        <div key={si} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                                                            <input
                                                                type="text" value={spec.label}
                                                                onChange={e => { const u=[...variations]; u[vi].specifications[si].label=e.target.value; setVariations(u); }}
                                                                placeholder="Label"
                                                                style={{ flex: 1, padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                                                            />
                                                            <input
                                                                type="text" value={spec.value}
                                                                onChange={e => { const u=[...variations]; u[vi].specifications[si].value=e.target.value; setVariations(u); }}
                                                                placeholder="Value"
                                                                style={{ flex: 2, padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                                                            />
                                                            <button type="button" onClick={() => { const u=[...variations]; u[vi].specifications=u[vi].specifications.filter((_,i)=>i!==si); setVariations(u); }}
                                                                style={{ padding: '0.3rem', background: '#fee2e2', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', color: '#dc2626' }}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button type="button"
                                                        onClick={() => { const u=[...variations]; u[vi].specifications=[...u[vi].specifications,{label:'',value:''}]; setVariations(u); }}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', border: '1px dashed #d1d5db', borderRadius: '0.375rem', background: '#f9fafb', cursor: 'pointer', fontSize: '0.82rem', color: '#374151' }}
                                                    >
                                                        <Plus size={13} /> Add Spec Row
                                                    </button>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Variation Button */}
                                <button
                                    type="button"
                                    onClick={() => setVariations([...variations, emptyVariation()])}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '2px dashed #86efac', borderRadius: '0.5rem', background: '#f0fdf4', cursor: 'pointer', fontSize: '0.9rem', color: '#15803d', width: '100%', justifyContent: 'center', fontWeight: '600' }}
                                >
                                    <Plus size={18} /> Add Another Variation
                                </button>
                            </div>
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
                                <span>Featured Product</span>
                            </label>


                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.season_over}
                                    onChange={(e) => setFormData({ ...formData, season_over: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>Season Over (Unavailable)</span>
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
                                {saving ? 'Creating...' : 'Save Product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
