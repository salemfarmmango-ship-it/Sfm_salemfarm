'use client';

import React, { useState, useEffect } from 'react';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { Plus, Trash2, Save, GripVertical, Image as ImageIcon, RotateCcw, ChevronUp, ChevronDown, Monitor, Tablet, Smartphone, Upload, Loader2 } from 'lucide-react';

export default function AdminHeroPage() {
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});

    // Notification state
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/hero-slides');
            const data = await res.json();
            if (res.ok) {
                setSlides(data);
            } else {
                showNotification('Failed to load slides', 'error');
            }
        } catch (error) {
            showNotification('Error loading slides', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSlideChange = (index: number, field: string, value: any) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };



    const moveSlide = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === slides.length - 1) return;

        const newSlides = [...slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

        // Re-calculate order indices
        const reordered = newSlides.map((s, i) => ({ ...s, order_index: i + 1 }));
        setSlides(reordered);
    };

    const addSlide = () => {
        const newSlide = {
            id: `temp-${Date.now()}`,
            image: '/hero-model.png',
            bg_image: '/Green_hero_1.png',
            title: 'New Title',
            subtitle: 'New Subtitle',
            price: 'Starts from ₹99',
            cta_link: '/shop',
            bg_color: '#f3f4f6',
            badge: 'New',
            badge_color: '#3b82f6',
            bg_position_desktop: 'center top',
            text_width: 55,
            order_index: slides.length + 1,
            isNew: true
        };
        setSlides([...slides, newSlide]);
    };

    const deleteSlide = async (index: number) => {
        const slide = slides[index];

        if (!slide.isNew && !window.confirm('Delete this slide permanently?')) return;

        if (!slide.isNew) {
            try {
                const res = await fetch(`/api/hero-slides?id=${slide.id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error();
                showNotification('Slide deleted', 'success');
            } catch (error) {
                showNotification('Delete failed', 'error');
                return;
            }
        }

        const newSlides = slides.filter((_, i) => i !== index);
        setSlides(newSlides.map((s, i) => ({ ...s, order_index: i + 1 })));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            for (const slide of slides) {
                const payload = { ...slide };
                const isNew = payload.isNew;
                delete payload.isNew;

                const method = isNew ? 'POST' : 'PUT';
                if (isNew) delete payload.id;

                const res = await fetch('/api/hero-slides', {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.details || errorData.error || 'Failed to save');
                }
            }
            showNotification('Saved successfully!', 'success');
            fetchSlides();
        } catch (error: any) {
            console.error('Save error:', error);
            showNotification(`Save failed: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const previewSlides = slides.map(s => ({
        id: s.id,
        image: s.image,
        bgImage: s.bg_image,
        title: s.title,
        subtitle: s.subtitle,
        price: s.price,
        ctaLink: s.cta_link,
        bgColor: s.bg_color,
        badge: s.badge,
        badgeColor: s.badge_color,
        bgPositionDesktop: s.bg_position_desktop,
        textWidth: s.text_width
    }));

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Hero Settings...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', overflow: 'hidden' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                marginBottom: '0.5rem'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-mango-900)' }}>Hero Carousel Manager</h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.75rem' }}>Configure homepage slides and preview live.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={fetchSlides}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#f3f4f6',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                        }}
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={saving}
                        style={{
                            padding: '0.5rem 1.25rem',
                            background: 'var(--color-green-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}
                    >
                        <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '0.75rem 1.25rem',
                    background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: notification.type === 'success' ? '#065f46' : '#991b1b',
                    border: `1px solid ${notification.type === 'success' ? '#10b981' : '#f87171'}`,
                    borderRadius: '8px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '0.875rem'
                }}>
                    {notification.message}
                </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0, flexDirection: 'row', flexWrap: 'nowrap' }}>
                {/* Editor Side */}
                <div style={{
                    width: '450px',
                    minWidth: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f9fafb'
                    }}>
                        <h2 style={{ fontSize: '1rem', margin: 0, fontWeight: '600' }}>Slide Editor</h2>
                        <button
                            onClick={addSlide}
                            style={{
                                padding: '0.4rem 0.75rem',
                                background: '#edf7ed',
                                color: 'var(--color-green-700)',
                                border: '1px solid var(--color-green-200)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}
                        >
                            <Plus size={14} /> Add Slide
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>
                        {slides.map((slide, index) => (
                            <div key={slide.id} style={{
                                background: '#fff',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    padding: '0.6rem 1rem',
                                    background: '#f9fafb',
                                    borderBottom: '1px solid #e5e7eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', flex: 1 }}>
                                        <GripVertical size={14} color="#9ca3af" /> Slide {index + 1}
                                        {slide.isNew && <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>New</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button
                                            onClick={() => moveSlide(index, 'up')}
                                            disabled={index === 0}
                                            style={{ background: 'none', border: 'none', color: index === 0 ? '#d1d5db' : '#6b7280', cursor: index === 0 ? 'default' : 'pointer', padding: '4px' }}
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveSlide(index, 'down')}
                                            disabled={index === slides.length - 1}
                                            style={{ background: 'none', border: 'none', color: index === slides.length - 1 ? '#d1d5db' : '#6b7280', cursor: index === slides.length - 1 ? 'default' : 'pointer', padding: '4px' }}
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                        <div style={{ width: '1px', background: '#e5e7eb', margin: '0 0.5rem' }} />
                                        <button onClick={() => deleteSlide(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280' }}>Title (breaks support)</label>
                                                <span style={{ fontSize: '0.65rem', color: (slide.title.length > 70) ? '#ef4444' : '#9ca3af' }}>{slide.title.length}/80</span>
                                            </div>
                                            <textarea maxLength={80} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', resize: 'vertical' }} rows={2} value={slide.title} onChange={e => handleSlideChange(index, 'title', e.target.value)} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280' }}>Price Label</label>
                                                <span style={{ fontSize: '0.65rem', color: (slide.price.length > 25) ? '#ef4444' : '#9ca3af' }}>{slide.price.length}/30</span>
                                            </div>
                                            <input maxLength={30} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.price} onChange={e => handleSlideChange(index, 'price', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280' }}>Subtitle</label>
                                            <span style={{ fontSize: '0.65rem', color: (slide.subtitle.length > 130) ? '#ef4444' : '#9ca3af' }}>{slide.subtitle.length}/150</span>
                                        </div>
                                        <textarea maxLength={150} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', resize: 'vertical' }} rows={2} value={slide.subtitle} onChange={e => handleSlideChange(index, 'subtitle', e.target.value)} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280' }}>Badge Text</label>
                                                <span style={{ fontSize: '0.65rem', color: (slide.badge.length > 20) ? '#ef4444' : '#9ca3af' }}>{slide.badge.length}/25</span>
                                            </div>
                                            <input maxLength={25} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.badge} onChange={e => handleSlideChange(index, 'badge', e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#6b7280' }}>Badge Color</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }} type="color" value={slide.badge_color} onChange={e => handleSlideChange(index, 'badge_color', e.target.value)} />
                                                <input style={{ flex: 1, padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.badge_color} onChange={e => handleSlideChange(index, 'badge_color', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#6b7280' }}>Foreground Image</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {slide.image && (
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                                                        <img src={slide.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <input maxLength={500} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.image} onChange={e => handleSlideChange(index, 'image', e.target.value)} placeholder="/image.png" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#6b7280' }}>Background Image</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {slide.bg_image && (
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0, background: '#f3f4f6' }}>
                                                        <img src={slide.bg_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, position: 'relative' }}>
                                                    <input maxLength={500} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.bg_image} onChange={e => handleSlideChange(index, 'bg_image', e.target.value)} placeholder="/bg.png" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#6b7280' }}>Section BG Color</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }} type="color" value={slide.bg_color} onChange={e => handleSlideChange(index, 'bg_color', e.target.value)} />
                                                <input style={{ flex: 1, padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.bg_color} onChange={e => handleSlideChange(index, 'bg_color', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#6b7280' }}>Text Max-Width (%): {slide.text_width || 55}%</label>
                                            <input
                                                type="range"
                                                min="30"
                                                max="100"
                                                step="5"
                                                value={slide.text_width || 55}
                                                onChange={e => handleSlideChange(index, 'text_width', parseInt(e.target.value))}
                                                style={{ width: '100%', height: '34px' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280' }}>Shop Link (CTA)</label>
                                            <span style={{ fontSize: '0.65rem', color: (slide.cta_link.length > 180) ? '#ef4444' : '#9ca3af' }}>{slide.cta_link.length}/200</span>
                                        </div>
                                        <input maxLength={200} style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem' }} type="text" value={slide.cta_link} onChange={e => handleSlideChange(index, 'cta_link', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#6b7280' }}>Desktop Position</label>
                                        <select
                                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.85rem', height: '34px' }}
                                            value={slide.bg_position_desktop}
                                            onChange={e => handleSlideChange(index, 'bg_position_desktop', e.target.value)}
                                        >
                                            <option value="right top">Right Top</option>
                                            <option value="center top">Center Top</option>
                                            <option value="left top">Left Top</option>
                                            <option value="right center">Right Center</option>
                                            <option value="center center">Center Center</option>
                                            <option value="left center">Left Center</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview Side */}
                <div style={{
                    flex: '1',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.25rem',
                    gap: '1rem',
                    position: 'relative',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                            <ImageIcon size={18} color="var(--color-green-600)" /> Preview
                        </div>
                        <div style={{ display: 'flex', gap: '2px', background: '#e5e7eb', padding: '2px', borderRadius: '6px' }}>
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                style={{
                                    padding: '0.4rem 0.6rem',
                                    background: previewMode === 'desktop' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: '4px',
                                    alignItems: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: previewMode === 'desktop' ? '600' : '400',
                                    boxShadow: previewMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <Monitor size={14} /> Desktop
                            </button>
                            <button
                                onClick={() => setPreviewMode('tablet')}
                                style={{
                                    padding: '0.4rem 0.6rem',
                                    background: previewMode === 'tablet' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: '4px',
                                    alignItems: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: previewMode === 'tablet' ? '600' : '400',
                                    boxShadow: previewMode === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <Tablet size={14} /> Tablet
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                style={{
                                    padding: '0.4rem 0.6rem',
                                    background: previewMode === 'mobile' ? 'white' : 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    gap: '4px',
                                    alignItems: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: previewMode === 'mobile' ? '600' : '400',
                                    boxShadow: previewMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <Smartphone size={14} /> Mobile
                            </button>
                        </div>
                    </div>

                    <div style={{
                        width: '100%',
                        background: '#374151',
                        padding: '2rem 1rem',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        position: 'sticky',
                        top: 0,
                        zIndex: 5,
                        display: 'flex',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{
                            width: previewMode === 'desktop' ? '100.00%' : previewMode === 'tablet' ? '768px' : '375px',
                            maxWidth: '100%',
                            background: 'white',
                            height: 'auto',
                            transition: 'width 0.3s ease',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <HeroCarousel livePreviewSlides={previewSlides} isCompact={true} forceMode={previewMode} />
                        </div>
                    </div>

                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '0.8rem',
                        color: '#6b7280'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#374151' }}>💡 Layout Control:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                            <li><b>Text Max-Width:</b> Use the slider to prevent text from overlapping foreground images.</li>
                            <li><b>Manual Breaks:</b> Use "Enter" in the title box for surgical control.</li>
                            <li><b>Device Toggles:</b> Switch above to see how it looks on Phons & Tablets.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
