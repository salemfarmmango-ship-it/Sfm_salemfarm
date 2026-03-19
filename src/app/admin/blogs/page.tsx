'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit2, Trash2, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogList() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/admin/blogs');
            const data = await res.json();
            if (res.ok) {
                setBlogs(data || []);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const res = await fetch(`/api/admin/blogs/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setBlogs(blogs.filter(blog => blog.id !== id));
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete blog');
            }
        } catch (error) {
            alert('Error deleting blog');
        }
    };

    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-green-900)' }}>Blog Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Create and manage your farm stories and news</p>
                </div>
                <Button onClick={() => router.push('/admin/blogs/new')}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add New Post
                </Button>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '1.5rem' }}>
                    <Search 
                        size={18} 
                        style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: 'var(--text-secondary)' 
                        }} 
                    />
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                            border: '1px solid var(--border-light)',
                            borderRadius: '0.5rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Title</th>
                                <th style={{ padding: '1rem' }}>Slug</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Product Link</th>
                                <th style={{ padding: '1rem' }}>Created At</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div className="animate-spin" style={{ 
                                            margin: '0 auto',
                                            width: '30px', 
                                            height: '30px', 
                                            border: '3px solid #f3f3f3', 
                                            borderTop: '3px solid var(--color-mango-600)', 
                                            borderRadius: '50%' 
                                        }}></div>
                                    </td>
                                </tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        No blog posts found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <tr key={blog.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {blog.image_url ? (
                                                    <img 
                                                        src={blog.image_url} 
                                                        alt={blog.title} 
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                                                    />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                                        <FileText size={20} color="#9ca3af" />
                                                    </div>
                                                )}
                                                <span style={{ fontWeight: '500' }}>{blog.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            /{blog.slug}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '50px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: blog.status === 'published' ? '#dcfce7' : '#f3f4f6',
                                                color: blog.status === 'published' ? '#166534' : '#4b5563'
                                            }}>
                                                {blog.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {blog.product_id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span>{blog.product_name || `Product #${blog.product_id}`}</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <Button 
                                                    variant="outline" 
                                                    style={{ padding: '0.5rem' }}
                                                    onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                                    title="View Post"
                                                >
                                                    <ExternalLink size={16} />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    style={{ padding: '0.5rem' }}
                                                    onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                                                    title="Edit Post"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }}
                                                    onClick={() => handleDelete(blog.id)}
                                                    title="Delete Post"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
