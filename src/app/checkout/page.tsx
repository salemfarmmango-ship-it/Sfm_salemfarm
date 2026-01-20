'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart, CartItem } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Script from 'next/script';
import { EmailService } from '@/lib/EmailService';
import { MangoLoader } from '@/components/common/MangoLoader';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const { items, clearCart } = useCart();
    const router = useRouter();
    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
    const [shippingRates, setShippingRates] = useState<any[]>([]);
    const [currentShippingCost, setCurrentShippingCost] = useState(0);

    const subtotal = items.reduce((acc: number, i: CartItem) => acc + i.price * i.quantity, 0);
    // Shipping calculated dynamically now
    const total = Math.max(0, subtotal + currentShippingCost - discount);

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // New Address Form State
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        is_default: false
    });
    const [saveAddress, setSaveAddress] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth?redirect=/checkout');
                return;
            }
            setUser(session.user);
            fetchAddresses(session.user.id);
            fetchShippingRates();
        };
        checkUser();
    }, [router]);

    const fetchShippingRates = async () => {
        const { data } = await supabase.from('shipping_rates').select('*').eq('is_active', true);
        if (data) setShippingRates(data);
    };

    const [isCodEnabled, setIsCodEnabled] = useState(false);
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('value').eq('key', 'payment_cod_enabled').single();
            if (data) setIsCodEnabled(data.value);
        };
        fetchSettings();
    }, []);

    // Calculate Shipping Cost on Address Change
    useEffect(() => {
        if (items.length === 0) {
            setCurrentShippingCost(0);
            return;
        }

        let state = '';
        if (selectedAddressId === 'new') {
            state = newAddress.state;
        } else {
            const addr = addresses.find(a => a.id === selectedAddressId);
            if (addr) state = addr.state;
        }

        if (state) {
            const rate = shippingRates.find(r => r.state_name === state);
            setCurrentShippingCost(rate ? rate.charge : 150); // Default 150 if not found
        } else {
            setCurrentShippingCost(150); // Default
        }
    }, [selectedAddressId, newAddress.state, addresses, shippingRates, items.length]);

    const fetchAddresses = async (userId: string) => {
        const { data } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });

        if (data && data.length > 0) {
            setAddresses(data);
            setSelectedAddressId(data.find(a => a.is_default)?.id || data[0].id);
        } else {
            setSelectedAddressId('new');
        }
        setLoading(false);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponMessage({ type: '', text: '' });

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !data) {
            setCouponMessage({ type: 'error', text: 'Invalid or expired coupon code' });
            setDiscount(0);
            setAppliedCoupon(null);
            return;
        }

        // 1. Min Order Value Check
        if (data.min_order_value && subtotal < data.min_order_value) {
            setCouponMessage({ type: 'error', text: `Minimum order value of ₹${data.min_order_value} required` });
            setDiscount(0);
            setAppliedCoupon(null);
            return;
        }

        // 2. One-time Use Check
        if (user) {
            const { count, error: usageError } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('coupon_id', data.id);

            if (count && count > 0) {
                setCouponMessage({ type: 'error', text: 'You have already used this coupon' });
                setDiscount(0);
                setAppliedCoupon(null);
                return;
            }
        }

        let calculatedDiscount = 0;
        if (data.discount_type === 'percentage') {
            calculatedDiscount = (subtotal * data.discount_value) / 100;
        } else {
            calculatedDiscount = data.discount_value;
        }

        if (calculatedDiscount > subtotal) calculatedDiscount = subtotal;

        // 3. Max Discount Cap (for percentage coupons mostly)
        if (data.max_discount_value && calculatedDiscount > data.max_discount_value) {
            calculatedDiscount = data.max_discount_value;
        }

        setDiscount(calculatedDiscount);
        setAppliedCoupon(data);
        setCouponMessage({ type: 'success', text: `Coupon applied: ${data.discount_type === 'percentage' ? data.discount_value + '%' : '₹' + data.discount_value} Off` });
    };

    const removeCoupon = () => {
        setCouponCode('');
        setDiscount(0);
        setAppliedCoupon(null);
        setCouponMessage({ type: '', text: '' });
    };

    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const [isSuccess, setIsSuccess] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            let shippingAddress;

            if (selectedAddressId === 'new') {
                // Validate new address
                if (!newAddress.full_name || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code || !newAddress.phone) {
                    alert('Please fill in all required shipping details.');
                    setProcessing(false);
                    return;
                }

                shippingAddress = newAddress;

                // Save address if checked
                if (saveAddress && user) {
                    // Check limit
                    if (addresses.length < 4) {
                        try {
                            // Ensure/create profile first (similar to recent fix)
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .upsert(
                                    { id: user.id, full_name: newAddress.full_name || user.email },
                                    { onConflict: 'id' }
                                );

                            if (!profileError) {
                                await supabase.from('addresses').insert([{ ...newAddress, user_id: user.id }]);
                            }
                        } catch (err) {
                            console.error("Failed to save address silently", err);
                        }
                    }
                }
            } else {
                shippingAddress = addresses.find(a => a.id === selectedAddressId);
            }

            // Create Order on Server
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total, currency: 'INR' }),
            });

            const orderData = await response.json();

            if (orderData.error) {
                throw new Error(orderData.error);
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure this is set in .env
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Salem Farm Mango',
                description: 'Fresh Mango Purchase',
                order_id: orderData.id,
                handler: async function (response: any) {
                    // Payment Success - Create Order in DB
                    const { data, error } = await supabase.from('orders').insert([{
                        user_id: user.id,
                        total_amount: total,
                        status: 'processing',
                        payment_status: 'paid',
                        shipping_address: shippingAddress,
                        coupon_id: appliedCoupon?.id,
                        created_at: new Date().toISOString()
                    }]).select().single();

                    if (error) {
                        console.error('Error saving order:', JSON.stringify(error, null, 2));
                        alert(`Payment successful but failed to save order: ${error.message || error.code || JSON.stringify(error)}. Please contact support.`);
                        return;
                    }

                    // Insert order items
                    const orderItems = items.map(item => ({
                        order_id: data.id,
                        product_id: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }));

                    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
                    if (itemsError) {
                        console.error('Error saving order items:', JSON.stringify(itemsError, null, 2));
                        // Order was created, just items failed - don't block success
                    }

                    // Success!
                    // Send confirmation based on user's signup method
                    // Send confirmation based on user's signup method
                    const isPhoneUser = user.user_metadata?.auth_method === 'phone' || user.email?.endsWith('@phone.salemfarmmango.local');

                    if (isPhoneUser) {
                        // Send SMS for phone users
                        // Using Fast2SMS DLT Template ID 207591
                        fetch('/api/send-sms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                phone: user.user_metadata?.phone || user.phone,
                                templateId: '207591',
                                variables: data.id.toString()
                            })
                        }).catch(err => console.error('Failed to send SMS:', err));
                    } else {
                        // Send email for email users
                        const orderForEmail = { ...data, user_email: user.email, shipping_address: shippingAddress };
                        EmailService.sendOrderConfirmation(orderForEmail, items).catch(err => {
                            console.error('Failed to send confirmation email:', err);
                        });
                    }

                    // Send SMS to Admin
                    // Template ID 207590 for Admin Notification
                    fetch('/api/send-sms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: '9994050456',
                            templateId: '207590',
                            variables: data.id.toString()
                        })
                    }).catch(err => console.error('Failed to send Admin SMS:', err));

                    // Send Push Notification
                    fetch('/api/notifications/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userIds: [user.id],
                            notification: {
                                title: 'Order Placed! 🥭',
                                body: `Your order #${data.id} has been received and is being processed.`,
                                url: `/account?tab=orders`,
                                tag: `order-${data.id}`
                            }
                        })
                    }).catch(err => console.error('Failed to send Push Notification:', err));

                    clearCart();
                    setIsSuccess(true);
                    setTimeout(() => {
                        router.push('/account?tab=orders');
                    }, 3000);
                },
                prefill: {
                    name: shippingAddress.full_name,
                    email: user.email,
                    contact: shippingAddress.phone,
                },
                theme: {
                    color: '#16a34a',
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            console.error('Payment Error:', error);
            alert(`Payment initialization failed: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#16a34a',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'fadeInUp 0.6s ease-out' }}>Order Placed Successfully!</h1>
                <p style={{ animation: 'fadeInUp 0.8s ease-out', opacity: 0.9 }}>Redirecting to your orders...</p>

                <style jsx>{`
                    @keyframes popIn {
                        0% { transform: scale(0); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes fadeInUp {
                        0% { transform: translateY(20px); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    if (loading) return <MangoLoader />;

    return (
        <div className="container" style={{ padding: 'var(--space-8) var(--space-4)', maxWidth: '900px' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <h1 style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>Checkout</h1>

            {/* Steps Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-12)', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 1 ? 1 : 0.5 }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= 1 ? 'var(--color-mango-500)' : '#ccc', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                    <span>Shipping</span>
                </div>
                <div style={{ width: '50px', height: '1px', background: '#ccc', alignSelf: 'center' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 2 ? 1 : 0.5 }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= 2 ? 'var(--color-mango-500)' : '#ccc', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                    <span>Payment</span>
                </div>
            </div>

            <style jsx>{`
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 2rem;
                    align-items: start;
                }
                .summary-card {
                    padding: var(--space-6);
                    position: sticky;
                    top: 100px;
                }
                @media (max-width: 900px) {
                    .checkout-grid {
                        grid-template-columns: 1fr;
                    }
                    .summary-card {
                        position: static;
                        order: 2; /* Ensure summary is at the bottom on mobile */
                        margin-top: 1rem;
                    }
                    .form-container {
                        order: 1;
                    }
                }
            `}</style>
            <div className="checkout-grid">
                <div className="card form-container" style={{ padding: 'var(--space-8)' }}>
                    {step === 1 ? (
                        <form onSubmit={handleContinueToPayment}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Select Shipping Address</h2>

                            {addresses.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {addresses.map(addr => (
                                        <label key={addr.id} style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            padding: '1rem',
                                            border: selectedAddressId === addr.id ? '2px solid var(--color-mango-500)' : '1px solid var(--border-light)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            background: selectedAddressId === addr.id ? 'var(--color-mango-50)' : 'white'
                                        }}>
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddressId === addr.id}
                                                onChange={() => setSelectedAddressId(addr.id)}
                                                style={{ marginTop: '0.25rem' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{addr.full_name} {addr.is_default && <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>DEFAULT</span>}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '4px' }}>
                                                    {addr.address_line1}, {addr.address_line2 ? addr.address_line2 + ', ' : ''}
                                                    {addr.city}, {addr.state} - {addr.postal_code}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Phone: {addr.phone}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <label style={{
                                display: 'flex',
                                gap: '1rem',
                                padding: '1rem',
                                border: selectedAddressId === 'new' ? '2px solid var(--color-mango-500)' : '1px solid var(--border-light)',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                background: selectedAddressId === 'new' ? 'var(--color-mango-50)' : 'white',
                                marginBottom: '1.5rem'
                            }}>
                                <input
                                    type="radio"
                                    name="address"
                                    checked={selectedAddressId === 'new'}
                                    onChange={() => setSelectedAddressId('new')}
                                    style={{ marginTop: '0.25rem' }}
                                />
                                <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16} /> Add New Address</span>
                            </label>

                            {selectedAddressId === 'new' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '0.5rem', border: '1px solid #eee' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Full Name *</label>
                                        <input
                                            type="text" required
                                            value={newAddress.full_name}
                                            onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Address Line 1 *</label>
                                        <input
                                            type="text" required
                                            value={newAddress.address_line1}
                                            onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Address Line 2</label>
                                        <input
                                            type="text"
                                            value={newAddress.address_line2}
                                            onChange={e => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>City *</label>
                                        <input
                                            type="text" required
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>State *</label>
                                        <select
                                            required
                                            value={newAddress.state}
                                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', backgroundColor: 'white' }}
                                        >
                                            <option value="">Select State</option>
                                            {shippingRates.map(rate => (
                                                <option key={rate.id} value={rate.state_name}>{rate.state_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Pincode *</label>
                                        <input
                                            type="text" required pattern="[0-9]{6}"
                                            value={newAddress.postal_code}
                                            onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Phone *</label>
                                        <input
                                            type="tel" required pattern="[0-9]{10}"
                                            value={newAddress.phone}
                                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)' }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={saveAddress}
                                                onChange={e => setSaveAddress(e.target.checked)}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>Save this address for future orders</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit">Continue to Payment</Button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <h2 style={{ marginBottom: '1.5rem' }}>Payment Method</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px solid var(--color-mango-500)', borderRadius: '0.5rem', background: 'var(--color-mango-50)' }}>
                                    <input type="radio" name="payment" defaultChecked />
                                    <span style={{ fontWeight: 'bold' }}>Credit/Debit Card / UPI (Razorpay)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '0.5rem', opacity: isCodEnabled ? 1 : 0.6 }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        disabled={!isCodEnabled}
                                        onChange={() => { /* Handle COD selection if needed, currently only Razorpay is default */ }}
                                    />
                                    <span style={{ color: isCodEnabled ? 'inherit' : 'gray' }}>
                                        Cash on Delivery {isCodEnabled ? '' : '(Currently Unavailable)'}
                                    </span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handlePayment} disabled={processing}>
                                    {processing ? 'Processing...' : `Pay ₹${total}`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div className="card summary-card">
                    <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                                <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Qty: {item.quantity} × ₹{item.price}</div>
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ margin: '1rem 0', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>Subtotal</span>
                            <span>₹{subtotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>Shipping</span>
                            <span>{items.length ? `₹${currentShippingCost}` : '₹0'}</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#166534', fontSize: '0.9rem' }}>
                                <span>Discount ({appliedCoupon?.code})</span>
                                <span>-₹{discount.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Coupon Input */}
                        <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={!!appliedCoupon}
                                    style={{ flex: 1, padding: '8px', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.9rem' }}
                                />
                                {appliedCoupon ? (
                                    <Button onClick={removeCoupon} variant="outline" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Remove</Button>
                                ) : (
                                    <Button onClick={handleApplyCoupon} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Apply</Button>
                                )}
                            </div>
                            {couponMessage.text && (
                                <p style={{ fontSize: '0.8rem', marginTop: '4px', color: couponMessage.type === 'success' ? '#166534' : '#ef4444' }}>
                                    {couponMessage.text}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #ccc', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
