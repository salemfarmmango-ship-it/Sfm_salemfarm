'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, Search, LogOut, ChevronDown, Package, MapPin, UserCircle, Home, Store, Sprout, Phone, Truck, Gift, Tag, Share2, HelpCircle, BookOpen } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';


export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { items, cartCount, isAnimating, setIsCartOpen } = useCart();
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const [topBarText, setTopBarText] = useState('');
    const [isTopBarEnabled, setIsTopBarEnabled] = useState(false);
    const [mysqlCategories, setMysqlCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const { settings } = await res.json();
                    if (settings.top_bar_content) setTopBarText(settings.top_bar_content);
                    setIsTopBarEnabled(!!settings.top_bar_enabled);
                }
            } catch (e) {
                console.error("Failed to fetch top bar settings", e);
            }
        };
        fetchSettings();

        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    setMysqlCategories(await res.json());
                }
            } catch (e) {
                console.error("Failed to fetch PHP categories", e);
            }
        };
        fetchCategories();
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/auth');
    };

    // Real-time search functionality
    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const q = searchQuery.trim().toLowerCase();
                const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    // Relevance scoring:
                    // 3 = name starts with query (best match)
                    // 2 = name contains query anywhere
                    // 1 = only description contains query
                    const scored = data.map((product: any) => {
                        const name = (product.name || '').toLowerCase();
                        let score = 0;
                        if (name.startsWith(q)) score = 3;
                        else if (name.includes(q)) score = 2;
                        else score = 1;
                        return { ...product, _score: score };
                    });
                    scored.sort((a: any, b: any) => b._score - a._score);
                    setSearchResults(scored.slice(0, 6));
                }
            } catch (e) {
                console.error("Search failed", e);
            }
            setIsSearching(false);
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/shop', label: 'Shop', icon: Store },
        { href: '/about', label: 'About Us', icon: UserCircle },
        { href: '/contact', label: 'Contact', icon: Phone }
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav style={{ borderBottom: '1px solid var(--border-light)', background: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
            {/* Top Bar */}
            {isTopBarEnabled && topBarText && (
                <div style={{
                    background: 'var(--color-green-700)',
                    color: 'white',
                    padding: '0.5rem 0',
                    fontSize: '0.875rem',
                    position: 'relative',
                    zIndex: 60,
                    overflow: 'hidden',
                    display: 'flex'
                }}>
                <div className="marquee-track">
                        {/* Each block has 4 copies — doubled block creates the seamless 50% loop */}
                        {[0, 1].map(block => (
                            <div key={block} className="marquee-content">
                                {[0, 1, 2, 3].map(i => (
                                    <span key={i}>
                                        {topBarText}&nbsp;&nbsp;<span aria-hidden="true">•</span>&nbsp;&nbsp;
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '90px',
                position: 'relative',
                zIndex: 60,
                background: 'white'
            }}>
                {/* Logo - Desktop (Hidden on mobile as it's part of top bar) */}
                <Link href="/" className="hidden-mobile">
                    <Image src="https://img.salemfarmmango.com/uploads/SFMLOGO.png" alt="Salem Farm Mango" width={140} height={70} style={{ objectFit: 'contain' }} />
                </Link>

                {/* Desktop Links */}
                <div className="hidden-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={{
                                position: 'relative',
                                paddingBottom: '0.25rem',
                                color: isActive(link.href) ? 'var(--color-mango-600)' : 'inherit',
                                fontWeight: isActive(link.href) ? '600' : '400',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'color 0.2s'
                            }}
                        >
                            <link.icon size={18} />
                            {link.label}
                            {isActive(link.href) && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '-2px',
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: 'var(--color-mango-600)',
                                    borderRadius: '2px'
                                }} />
                            )}
                        </Link>
                    ))}

                    <div
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onMouseEnter={() => setShowMoreDropdown(true)}
                        onMouseLeave={() => setShowMoreDropdown(false)}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            More <ChevronDown size={14} />
                        </span>

                        {showMoreDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                paddingTop: '15px',
                                width: '200px',
                                zIndex: 60
                            }}>
                                <div className="card" style={{
                                    padding: '0.5rem 0',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--border-light)',
                                    background: 'white'
                                }}>
                                    <Link href="/more/bulk-enquiry" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <Truck size={16} /> Bulk Enquiry
                                    </Link>
                                    <Link href="/more/corporate-gifts" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <Gift size={16} /> Corporate Gifts
                                    </Link>
                                    <Link href="/offers" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <Tag size={16} /> Offers <span className="blinking-dot" title="New Offers Available"></span>
                                    </Link>
                                    <Link href="/more/share" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <Share2 size={16} /> Share with Friends
                                    </Link>
                                    <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <BookOpen size={16} /> Blog
                                    </Link>
                                    <Link href="/faq" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <HelpCircle size={16} /> FAQ
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Icons */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* Desktop Icons */}
                    <div
                        className="hidden-mobile"
                        style={{ position: 'relative' }}
                        onBlur={(e) => {
                            // Only hide if clicking outside the search area
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setTimeout(() => setShowSearchDropdown(false), 200);
                            }
                        }}
                    >
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #e5e7eb',
                            borderRadius: '9999px',
                            padding: '0.6rem 1.25rem',
                            background: '#f8fafc',
                            transition: 'all 0.3s ease',
                            width: showSearchDropdown || searchQuery ? '280px' : '240px',
                            boxShadow: showSearchDropdown ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            borderColor: showSearchDropdown ? 'var(--color-mango-300)' : '#e5e7eb'
                        }}
                            onMouseEnter={(e) => {
                                if (!showSearchDropdown) {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = 'var(--color-mango-200)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showSearchDropdown && !searchQuery) {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                }
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchDropdown(true);
                                }}
                                onFocus={(e) => {
                                    setShowSearchDropdown(true);
                                    e.currentTarget.parentElement!.style.background = 'white';
                                    e.currentTarget.parentElement!.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                    e.currentTarget.parentElement!.style.borderColor = 'var(--color-mango-300)';
                                    e.currentTarget.parentElement!.style.width = '280px';
                                }}
                                onBlur={(e) => {
                                    // Styles are handled by the container's logic, but we can reset width if empty
                                    if (!searchQuery) {
                                        // relying on container state update mainly
                                    }
                                }}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '0.95rem',
                                    background: 'transparent',
                                    color: '#374151',
                                    fontWeight: 500
                                }}
                            />
                            <Search size={18} style={{
                                color: showSearchDropdown ? 'var(--color-mango-600)' : '#9ca3af',
                                marginLeft: '0.5rem',
                                transition: 'color 0.2s',
                                flexShrink: 0
                            }} />
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearchDropdown && searchQuery.length >= 2 && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 10px)',
                                right: 0,
                                width: '400px',
                                maxWidth: '90vw',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                zIndex: 1000
                            }}>
                                {isSearching ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div style={{ padding: '1rem' }}>
                                        <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                                Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {searchResults.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={() => {
                                                    setShowSearchDropdown(false);
                                                    setSearchQuery('');
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    transition: 'background 0.2s',
                                                    marginBottom: '0.5rem'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                            flexShrink: 0
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: '#f3f4f6',
                                                        borderRadius: '8px',
                                                        flexShrink: 0
                                                    }} />
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                                        {product.categories?.name || mysqlCategories.find(c => c.id === product.category_id)?.name || 'General'}
                                                    </div>
                                                    <div style={{ fontWeight: '700', color: '#4d9f4f', fontSize: '0.9rem' }}>
                                                        ₹{product.price}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        <Link
                                            href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                                            onClick={() => {
                                                setShowSearchDropdown(false);
                                                setSearchQuery('');
                                            }}
                                            style={{
                                                display: 'block',
                                                textAlign: 'center',
                                                padding: '0.75rem',
                                                marginTop: '0.5rem',
                                                borderTop: '1px solid #e5e7eb',
                                                color: '#4d9f4f',
                                                fontWeight: '600',
                                                fontSize: '0.9rem',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            View all results →
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    No products found for &quot;{searchQuery}&quot;
                                </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div
                        onClick={() => setIsCartOpen(true)}
                        className="hidden-mobile"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'var(--color-green-100)',
                            borderRadius: '9999px',
                            padding: '4px 12px 4px 6px',
                            cursor: 'pointer',
                            gap: '8px',
                            position: 'relative',
                            transition: 'transform 0.2s',
                            border: '1px solid transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div className={isAnimating ? 'animate-bounce' : ''} style={{
                            width: '32px',
                            height: '32px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <ShoppingCart size={18} strokeWidth={2.5} color="var(--color-green-800)" />
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--color-green-800)', fontSize: '0.9rem' }}>
                            ₹{items.reduce((sum, i) => sum + (i.price * i.quantity), 0)}
                        </span>

                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: '#FFD700',
                                color: 'var(--color-green-800)',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </div>

                    {/* User Profile / Dropdown */}
                    <div
                        className="hidden-mobile"
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setShowUserDropdown(true)}
                        onMouseLeave={() => setShowUserDropdown(false)}
                    >
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <User size={20} />
                                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showUserDropdown ? 'rotate(180deg)' : 'rotate(0)' }} />
                            </div>
                        ) : (
                            <Link href="/auth" style={{ display: 'flex', alignItems: 'center' }}>
                                <User size={20} />
                            </Link>
                        )}

                        {/* Dropdown Menu */}
                        {user && showUserDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                paddingTop: '10px',
                                width: '200px',
                                animation: 'fadeIn 0.2s ease-out'
                            }}>
                                <div className="card" style={{
                                    padding: '0.5rem 0',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid var(--border-light)'
                                }}>
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Signed in as</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.user_metadata?.auth_method === 'phone'
                                                ? `+91 ${user.user_metadata?.phone}`
                                                : user.email}
                                        </p>
                                    </div>
                                    <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <UserCircle size={18} /> Profile
                                    </Link>
                                    <Link href="/account?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <Package size={18} /> Orders
                                    </Link>
                                    <Link href="/account?tab=addresses" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', fontSize: '0.9rem' }}>
                                        <MapPin size={18} /> Addresses
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '0.75rem 1rem',
                                            width: '100%',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            color: '#dc2626',
                                            fontSize: '0.9rem',
                                            borderTop: '1px solid var(--border-light)',
                                            marginTop: '0.5rem'
                                        }}
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Top Bar Layout */}
                <div className="hidden-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    {/* Left: Menu & Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Menu size={24} />
                        </button>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                            <Image src="https://img.salemfarmmango.com/uploads/SFMLOGO.png" alt="Salem Farm Mango" width={100} height={50} style={{ objectFit: 'contain' }} />
                        </Link>
                    </div>

                    {/* Right: Search & Cart */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            onClick={() => setShowMobileSearch(true)}
                            style={{
                                background: '#f3f4f6',
                                borderRadius: '50%',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                width: '36px',
                                height: '36px'
                            }}
                        >
                            <Search size={18} className="text-gray-600" />
                        </div>

                        {/* Mobile Cart Pill */}
                        <div
                            onClick={() => setIsCartOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--color-green-100)',
                                borderRadius: '9999px',
                                padding: '4px 10px 4px 6px',
                                cursor: 'pointer',
                                gap: '6px',
                                position: 'relative'
                            }}
                        >
                            <div className={isAnimating ? 'animate-bounce' : ''} style={{
                                width: '30px',
                                height: '30px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <ShoppingCart size={16} strokeWidth={2.5} color="var(--color-green-800)" />
                            </div>
                            <span style={{ fontWeight: '700', color: 'var(--color-green-800)', fontSize: '0.85rem' }}>
                                ₹{items.reduce((sum, i) => sum + (i.price * i.quantity), 0)}
                            </span>

                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: '#FFD700',
                                    color: 'var(--color-green-800)',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.4)',
                            zIndex: 45
                        }}
                    />
                    <div style={{
                        padding: '1rem',
                        borderTop: '1px solid var(--border-light)',
                        background: 'white',
                        position: 'relative',
                        zIndex: 50,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        color: isActive(link.href) ? 'var(--color-mango-600)' : 'inherit',
                                        fontWeight: isActive(link.href) ? '600' : '400',
                                        textDecoration: 'none',
                                        borderLeft: isActive(link.href) ? '3px solid var(--color-mango-600)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <link.icon size={20} />
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile More Menu */}
                            <div style={{ padding: '0.5rem 0' }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-mango-700)' }}>More</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-light)' }}>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/offers" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Tag size={18} /> Offers <span className="blinking-dot"></span>
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/more/bulk-enquiry" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Truck size={18} /> Bulk Enquiry
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/more/corporate-gifts" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Gift size={18} /> Corporate Gifts
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/more/share" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Share2 size={18} /> Share with Friends
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/blog" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BookOpen size={18} /> Blog
                                    </Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/faq" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <HelpCircle size={18} /> FAQ
                                    </Link>
                                </div>
                            </div>

                            {/* Mobile User Info & Sign Out */}
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                                {user ? (
                                    <>
                                        <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Signed in as</p>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {user.user_metadata?.auth_method === 'phone'
                                                    ? `+91 ${user.user_metadata?.phone}`
                                                    : user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                handleSignOut();
                                                setIsMenuOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '0.75rem 1rem',
                                                width: '100%',
                                                border: 'none',
                                                background: '#fef2f2',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                color: '#dc2626',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/auth"
                                        onClick={() => setIsMenuOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '0.75rem 1rem',
                                            width: '100%',
                                            textDecoration: 'none',
                                            background: 'var(--color-mango-50)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--color-mango-700)',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <User size={18} /> Sign In / Sign Up
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                        <button onClick={() => { setShowMobileSearch(false); setSearchQuery(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '0.5rem', lineHeight: 1 }}>×</button>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.75rem', background: '#f9fafb' }}>
                            <Search size={20} style={{ color: '#9ca3af', marginRight: '0.75rem' }} />
                            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '1rem' }} />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        {searchQuery.length < 2 ? (<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Type at least 2 characters to search</div>) : isSearching ? (<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Searching...</div>) : searchResults.length > 0 ? (<> <div style={{ marginBottom: '1rem', fontWeight: '600', color: '#1f2937' }}>Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}</div> {searchResults.map((product) => (<Link key={product.id} href={`/product/${product.id}`} onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '8px', textDecoration: 'none', color: 'inherit', marginBottom: '0.75rem', border: '1px solid #e5e7eb' }}> {product.images && product.images.length > 0 ? (<img src={product.images[0]} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />) : (<div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '8px', flexShrink: 0 }} />)} <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{product.categories?.name || mysqlCategories.find(c => c.id === product.category_id)?.name || 'General'}</div><div style={{ fontWeight: '700', color: '#4d9f4f', fontSize: '1.1rem' }}>₹{product.price}</div></div> </Link>))} <Link href={`/shop?search=${encodeURIComponent(searchQuery)}`} onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }} style={{ display: 'block', textAlign: 'center', padding: '1rem', marginTop: '1rem', background: '#4d9f4f', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>View all results →</Link> </>) : (<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No products found for &quot;{searchQuery}&quot;</div>)}
                    </div>
                </div>
            )}

        </nav >
    );
};
