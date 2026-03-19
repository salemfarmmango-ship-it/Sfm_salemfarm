'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

export default function AddBlogPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        image_url: '',
        product_id: '',
        status: 'draft'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            const data = await res.json();
            if (res.ok) {
                setProducts(data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData({ ...formData, title, slug });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/admin/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    product_id: formData.product_id ? parseInt(formData.product_id) : null
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create blog');
            }

            alert('Blog post created successfully!');
            router.push('/admin/blogs');
        } catch (error: any) {
            alert(`Failed to create blog: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-8)' }}>
                <button
                    onClick={() => router.push('/admin/blogs')}
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
                <h1>Create New Blog Post</h1>
            </div>

            <div className="card" style={{ padding: '2rem', maxWidth: '1000px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {/* Title */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Post Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                required
                                placeholder="Enter an engaging title"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem',
                                    fontSize: '1.1rem'
                                }}
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                URL Slug *
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>/blog/</span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    placeholder="post-url-slug"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Featured Image URL */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                <ImageIcon size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Featured Image URL
                            </label>
                            <input
                                type="text"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            {formData.image_url && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Preview:</p>
                                    <img 
                                        src={formData.image_url} 
                                        alt="Preview" 
                                        style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid var(--border-light)' }} 
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <RichTextEditor
                                label="Blog Content"
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                            />
                        </div>

                        {/* Linked Product */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                <LinkIcon size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Link a Product
                            </label>
                            <select
                                value={formData.product_id}
                                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '0.5rem'
                                }}
                            >
                                <option value="">No product linked</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Linking a product will display its details and a "Buy Now" button within the blog post.
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Post Status
                            </label>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="draft"
                                        checked={formData.status === 'draft'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Draft</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="published"
                                        checked={formData.status === 'published'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Published</span>
                                </label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/admin/blogs')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                <Save size={18} style={{ marginRight: '0.5rem' }} />
                                {saving ? 'Creating...' : 'Create Post'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
