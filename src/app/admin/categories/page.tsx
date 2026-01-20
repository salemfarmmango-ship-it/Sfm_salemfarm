'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', image_url: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : '/api/admin/categories';

            const method = editingCategory ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    image_url: formData.image_url
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Failed to ${editingCategory ? 'update' : 'add'} category`);
            }

            alert(`Category ${editingCategory ? 'updated' : 'added'} successfully`);
            setFormData({ name: '', slug: '', image_url: '' });
            setShowAddModal(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            alert(`Failed to save category: ${error.message}`);
        }
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            image_url: category.image_url || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete category');
            }

            setCategories(categories.filter(c => c.id !== id));
            alert('Category deleted successfully');
        } catch (error: any) {
            console.error('Error deleting category:', error);
            alert(`Failed to delete category: ${error.message}`);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <h1>Categories ({categories.length})</h1>
                <Button onClick={() => { setShowAddModal(true); setEditingCategory(null); setFormData({ name: '', slug: '', image_url: '' }); }}>
                    + Add Category
                </Button>
            </div>

            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ padding: '2rem', maxWidth: '500px', width: '90%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => {
                                        const name = e.target.value;
                                        setFormData({
                                            ...formData,
                                            name,
                                            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                        });
                                    }}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingCategory(null);
                                        setFormData({ name: '', slug: '', image_url: '' });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCategory ? 'Update' : 'Add'} Category
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--color-gray-50)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Image</th>
                            <th style={{ padding: '1rem' }}>Category Name</th>
                            <th style={{ padding: '1rem' }}>Slug</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '1rem' }}>
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', background: 'var(--color-gray-100)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                                    )}
                                </td>
                                <td style={{ padding: '1rem' }}>{cat.name}</td>
                                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>/{cat.slug}</td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>Edit</Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(cat.id, cat.name)}
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
        </div>
    );
}
