'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart, CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Script from 'next/script';
import { EmailService } from '@/lib/EmailService';
import { MangoLoader } from '@/components/common/MangoLoader';
import Image from 'next/image';

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
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
    const [isShippingReady, setIsShippingReady] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const subtotal = items.reduce((acc: number, i: CartItem) => acc + i.price * i.quantity, 0);
    // Shipping calculated dynamically now
    const total = Math.max(0, subtotal + currentShippingCost - discount);

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('');
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);

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
        if (!authLoading) {
            if (!user) {
                router.push('/auth?redirect=/checkout');
                return;
            }
            fetchAddresses(user.id);
            fetchShippingRates();
            fetchSettings();
        }
    }, [user, authLoading, router]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const { settings } = await res.json();
                if (settings && settings.payment_cod_enabled !== undefined) {
                    setIsCodEnabled(settings.payment_cod_enabled === true || settings.payment_cod_enabled === 'true');
                }
            }
        } catch (e) {
            console.error('Failed to fetch settings', e);
        }
    };

    const fetchShippingRates = async () => {
        try {
            const res = await fetch('/api/shipping/rates');
            if (res.ok) {
                const data = await res.json();
                setShippingRates(data || []);
            }
        } catch (e) {
            console.error('Failed to fetch shipping rates', e);
        }
    };

    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
    const [isCodEnabled, setIsCodEnabled] = useState(false);

    // Calculate Shipping Cost on Address Change
    useEffect(() => {
        if (items.length === 0) {
            setCurrentShippingCost(0);
            return;
        }

        let state = '';
        let pincode = '';
        let isFieldsValid = false;

        if (selectedAddressId === 'new') {
            state = newAddress.state;
            pincode = newAddress.postal_code;
            isFieldsValid = !!(newAddress.full_name && newAddress.address_line1 && newAddress.city && newAddress.state && newAddress.postal_code.length >= 6 && newAddress.phone);
        } else {
            const addr = addresses.find(a => a.id === selectedAddressId);
            if (addr) {
                state = addr.state;
                pincode = addr.postal_code;
                isFieldsValid = true;
            }
        }

        if (state && pincode && pincode.length >= 6) {
            const fetchDynamicShipping = async () => {
                setIsCalculatingShipping(true);
                try {
                    const res = await fetch('/api/shipping/calculate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ state, pincode, items })
                    });
                    const data = await res.json();
                    if (data.fee !== undefined) {
                        setCurrentShippingCost(data.fee);
                    } else {
                        // fallback local matching logic
                        const rate = shippingRates.find(r => r.state_name === state);
                        setCurrentShippingCost(rate ? rate.charge : 150);
                    }
                } catch (e) {
                    console.error('Failed to calculate shipping', e);
                    const rate = shippingRates.find(r => r.state_name === state);
                    setCurrentShippingCost(rate ? rate.charge : 150);
                } finally {
                    setIsCalculatingShipping(false);
                    setIsShippingReady(isFieldsValid);
                }
            };

            const debounceTimer = setTimeout(() => {
                fetchDynamicShipping();
            }, 300);
            return () => clearTimeout(debounceTimer);

        } else {
            setIsShippingReady(false);
            setCurrentShippingCost(0); // Require full pincode input
        }
    }, [selectedAddressId, newAddress, addresses, shippingRates, items]);


    const fetchAddresses = async (userId: string) => {
        try {
            const res = await fetch('/api/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data || []);
                if (data && data.length > 0) {
                    const defaultAddr = data.find((a: any) => a.is_default);
                    setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id);
                } else {
                    setSelectedAddressId('new');
                }
            }
        } catch (e) {
            console.error('Failed to fetch addresses', e);
        }
        setLoading(false);
    };

    const applyCoupon = async () => {
        if (!couponCode) return;
        setCouponMessage({ type: '', text: '' });
        setIsApplyingCoupon(true);
        
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, subtotal })
            });
            const data = await res.json();
            
            if (res.ok && data.valid) {
                setDiscount(data.discount);
                setAppliedCoupon(data);
                setCouponMessage({ type: 'success', text: `Coupon applied! You saved ₹${data.discount}` });
            } else {
                setDiscount(0);
                setAppliedCoupon(null);
                setCouponMessage({ type: 'error', text: data.message || 'Invalid coupon code' });
            }
        } catch (e) {
            setCouponMessage({ type: 'error', text: 'Failed to validate coupon' });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const [isSuccess, setIsSuccess] = useState(false);

    const processOrderSuccess = async (orderId: number, totalAmount: number, shippingAddress: any) => {
        // Send Email using the unified EmailService
        EmailService.sendOrderConfirmation({
            id: orderId,
            total_amount: totalAmount,
            shipping_address: shippingAddress,
            user_email: user?.email || ''
        }, items.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            image: i.image
        })));

        // Send SMS notifications
        fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: shippingAddress.phone,
                message: `Hi ${shippingAddress.full_name}, your order #${orderId} for ₹${totalAmount} has been placed successfully at Salem Farm Mango! 🥭`
            })
        }).catch(err => console.error('Failed to send Customer SMS:', err));

        fetch('/api/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '9585141042', // Admin Phone
                message: `New Order Received! Order #${orderId} for ₹${totalAmount} from ${shippingAddress.full_name}. check dashboard: https://salemfarmmango.com/admin`
            })
        }).catch(err => console.error('Failed to send Admin SMS:', err));

        // Send Push Notification
        if (user?.id) {
            fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userIds: [user.id],
                    notification: {
                        title: 'Order Placed! 🥭',
                        body: `Your order #${orderId} has been received and is being processed.`,
                        url: `/account?tab=orders`,
                        tag: `order-${orderId}`
                    }
                })
            }).catch(err => console.error('Failed to send Push Notification:', err));
        }

        clearCart();
        setIsSuccess(true);
        setTimeout(() => {
            router.push('/account?tab=orders');
        }, 3000);
    };

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
                            // Update profile full name if changed
                            if (newAddress.full_name) {
                                await fetch('/api/profile', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ full_name: newAddress.full_name })
                                });
                            }

                            // Save new address via proxy
                            await fetch('/api/addresses', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newAddress)
                            });
                        } catch (err) {
                            console.error("Failed to save address silently", err);
                        }
                    }
                }
            } else {
                shippingAddress = addresses.find(a => a.id === selectedAddressId);
            }

            if (paymentMethod === 'cod') {
                // COD Flow: Skip Razorpay, create order directly
                const orderPayload = {
                    total_amount: total,
                    payment_status: 'cod',
                    shipping_address: shippingAddress,
                    items: items.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                const orderResponse = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                
                const responseData = await orderResponse.json();

                if (!orderResponse.ok || responseData.error) {
                    throw new Error(responseData.error || 'Failed to save COD order');
                }
                
                const orderId = responseData.id;
                await processOrderSuccess(orderId, total, shippingAddress);
                return;
            }

            // Online Flow (Razorpay)
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
                    // Payment Success - Create Order in DB via PHP backend (Proxy)
                    const orderPayload = {
                        total_amount: total,
                        payment_status: 'paid',
                        payment_id: response.razorpay_payment_id,
                        shipping_address: shippingAddress,
                        items: items.map(item => ({
                            product_id: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    };

                    const orderResponse = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderPayload)
                    });
                    
                    const responseData = await orderResponse.json();

                    if (!orderResponse.ok || responseData.error) {
                        console.error('Error saving order:', responseData.error || responseData);
                        alert(`Payment successful but failed to save order: ${responseData.error || 'Unknown error'}. Please contact support.`);
                        return;
                    }
                    
                    // ID returned from PHP is standard order ID e.g., 55. Use it directly for referencing.
                    const orderId = responseData.id;
                    await processOrderSuccess(orderId, total, shippingAddress);
                },
                prefill: {
                    name: shippingAddress.full_name,
                    email: user?.email || '',
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
                <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>Redirecting to your orders...</p>
                <div className="animate-pulse" style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                    <div className="animate-progress" style={{ height: '100%', background: 'white', borderRadius: '2px' }}></div>
                </div>
            </div>
        );
    }

    if (authLoading || loading) return <MangoLoader />;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '5rem', paddingBottom: '5rem', position: 'relative' }}>
            {processing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)',
                    zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <MangoLoader />
                    <p style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--color-mango-700)' }}>
                        Processing your order...
                    </p>
                </div>
            )}
            <div className="container" style={{ maxWidth: '1200px', padding: isMobile ? '0 1.25rem' : '0' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', 
                    gap: isMobile ? '1.5rem' : '3.5rem' 
                }}>
                    
                    {/* Left Column: Flow Steps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2.5rem', order: isMobile ? 2 : 1 }}>
                        
                        {/* Step 1: Shipping Address */}
                        <div style={{ background: 'white', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '1.5rem', boxShadow: '0 4px 25px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '50%', 
                                    background: step >= 1 ? 'var(--color-mango-600)' : '#e2e8f0',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1rem', boxShadow: step >= 1 ? '0 4px 10px rgba(230, 149, 0, 0.3)' : 'none'
                                }}>1</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#1a1a1a' }}>Shipping Details</h2>
                            </div>

                            {/* Saved Addresses List */}
                            {addresses.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    {addresses.map(addr => (
                                        <div 
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '1.25rem',
                                                border: `2px solid ${selectedAddressId === addr.id ? 'var(--color-mango-500)' : '#f1f5f9'}`,
                                                background: selectedAddressId === addr.id ? 'var(--color-mango-50)' : 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                        >
                                            {selectedAddressId === addr.id && (
                                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-mango-600)' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                            )}
                                            <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{addr.full_name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                                                {addr.address_line1}, {addr.city}<br />
                                                {addr.state} - {addr.postal_code}<br />
                                                Phone: {addr.phone}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Add New Option */}
                                    <div 
                                        onClick={() => setSelectedAddressId('new')}
                                        style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            border: `2px dashed ${selectedAddressId === 'new' ? 'var(--color-mango-500)' : '#cbd5e1'}`,
                                            background: selectedAddressId === 'new' ? 'var(--color-mango-100)' : 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            color: selectedAddressId === 'new' ? 'var(--color-mango-700)' : '#64748b',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Plus size={24} />
                                        Add New Address
                                    </div>
                                </div>
                            )}

                            {/* New Address Form */}
                            {(selectedAddressId === 'new' || addresses.length === 0) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.6rem' }}>Full Name</label>
                                        <input 
                                            className="input" 
                                            value={newAddress.full_name}
                                            onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                                            placeholder="Enter your full name" 
                                            required
                                            style={{ backgroundColor: '#fff', border: '1.5px solid #cbd5e1' }} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.6rem' }}>Address Line 1</label>
                                        <input 
                                            className="input" 
                                            value={newAddress.address_line1}
                                            onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                                            placeholder="House No, Street name" 
                                            required
                                            style={{ backgroundColor: '#fff', border: '1.5px solid #cbd5e1' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.6rem' }}>City</label>
                                        <input 
                                            className="input" 
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                            placeholder="City" 
                                            required
                                            style={{ backgroundColor: '#fff', border: '1.5px solid #cbd5e1' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.6rem' }}>State</label>
                                        <select 
                                            className="input" 
                                            value={newAddress.state}
                                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                            required
                                            style={{ backgroundColor: '#fff', border: '1.5px solid #cbd5e1' }}
                                        >
                                            <option value="">Select State</option>
                                            {shippingRates.map((rate: any) => (
                                                <option key={rate.id} value={rate.state_name}>
                                                    {rate.state_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.6rem' }}>Pincode</label>
                                        <input 
                                            className="input" 
                                            value={newAddress.postal_code}
                                            onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                                            placeholder="6-digit Pincode" 
                                            maxLength={6}
                                            required
                                            style={{ backgroundColor: '#fff', border: '1.5px solid #cbd5e1' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.6rem' }}>Phone</label>
                                        <input 
                                            className="input" 
                                            value={newAddress.phone}
                                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                            placeholder="Mobile Number" 
                                            required
                                            style={{ backgroundColor: '#fff', border: '1.5px solid #cbd5e1' }} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input 
                                            type="checkbox" 
                                            id="save-addr" 
                                            checked={saveAddress} 
                                            onChange={(e) => setSaveAddress(e.target.checked)} 
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="save-addr" style={{ fontSize: '0.95rem', cursor: 'pointer', color: '#475569' }}>Save this address for future</label>
                                    </div>
                                </div>
                            )}

                            <Button 
                                onClick={() => setStep(2)} 
                                style={{ marginTop: '2.5rem', padding: '1rem 3rem', borderRadius: '1rem' }} 
                                disabled={!isShippingReady || isCalculatingShipping}
                                isLoading={isCalculatingShipping}
                            >
                                Next: Payment Method
                            </Button>
                        </div>

                        {/* Step 2: Payment Method */}
                        <div style={{ 
                            background: 'white', 
                            padding: isMobile ? '1.5rem' : '2.5rem', 
                            borderRadius: '1.5rem', 
                            boxShadow: '0 4px 25px rgba(0,0,0,0.04)',
                            opacity: step < 2 ? 0.8 : 1,
                            pointerEvents: step < 2 ? 'none' : 'auto',
                            transition: 'opacity 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '50%', 
                                    background: step >= 2 ? 'var(--color-mango-600)' : '#e2e8f0',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '1rem', boxShadow: step >= 2 ? '0 4px 10px rgba(230, 149, 0, 0.3)' : 'none'
                                }}>2</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: step < 2 ? '#94a3b8' : '#1a1a1a' }}>Payment Method</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div 
                                    onClick={() => setPaymentMethod('online')}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '1.25rem',
                                        border: `2px solid ${paymentMethod === 'online' ? 'var(--color-mango-500)' : '#e2e8f0'}`,
                                        background: paymentMethod === 'online' ? 'var(--color-mango-50)' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ 
                                        width: '24px', height: '24px', borderRadius: '50%', 
                                        border: `2px solid ${paymentMethod === 'online' ? 'var(--color-mango-600)' : '#94a3b8'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: paymentMethod === 'online' ? 'white' : 'transparent'
                                    }}>
                                        {paymentMethod === 'online' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-mango-600)' }} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', color: paymentMethod === 'online' ? '#1a1a1a' : '#64748b' }}>Pay Online (UPI, Card, NetBanking)</div>
                                        <div style={{ fontSize: '0.85rem', color: paymentMethod === 'online' ? '#475569' : '#94a3b8' }}>Safe & Secure payments via Razorpay</div>
                                    </div>
                                </div>
 
                                {isCodEnabled && (
                                    <div 
                                        onClick={() => setPaymentMethod('cod')}
                                        style={{
                                            padding: '1.5rem',
                                            borderRadius: '1.25rem',
                                            border: `2px solid ${paymentMethod === 'cod' ? 'var(--color-mango-500)' : '#e2e8f0'}`,
                                            background: paymentMethod === 'cod' ? 'var(--color-mango-50)' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ 
                                            width: '24px', height: '24px', borderRadius: '50%', 
                                            border: `2px solid ${paymentMethod === 'cod' ? 'var(--color-mango-600)' : '#94a3b8'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: paymentMethod === 'cod' ? 'white' : 'transparent'
                                        }}>
                                            {paymentMethod === 'cod' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-mango-600)' }} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: paymentMethod === 'cod' ? '#1a1a1a' : '#64748b' }}>Cash on Delivery (COD)</div>
                                            <div style={{ fontSize: '0.85rem', color: paymentMethod === 'cod' ? '#475569' : '#94a3b8' }}>Pay when you receive your order</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div style={{ position: isMobile ? 'static' : 'sticky', top: '7rem', height: 'fit-content', order: isMobile ? 1 : 2 }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Order Summary</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                {items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '0.75rem', overflow: 'hidden', background: '#f8fafc', flexShrink: 0 }}>
                                            {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.4' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.quantity} × ₹{item.price}</div>
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>₹{item.price * item.quantity}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Section */}
                            <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        placeholder="Coupon code" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        style={{ 
                                            flex: 1, padding: '0.8rem 1rem', borderRadius: '0.75rem', 
                                            border: '1.5px solid #e2e8f0', fontSize: '0.95rem',
                                            backgroundColor: 'white'
                                        }} 
                                    />
                                    <Button 
                                        onClick={applyCoupon} 
                                        variant="outline" 
                                        style={{ padding: '0 1rem', minWidth: '80px' }}
                                        disabled={isApplyingCoupon || !couponCode}
                                        isLoading={isApplyingCoupon}
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {couponMessage.text && (
                                    <div style={{ 
                                        marginTop: '0.5rem', fontSize: '0.8rem', 
                                        color: couponMessage.type === 'success' ? '#16a34a' : '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        {couponMessage.text}
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                {discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '600' }}>
                                        <span>Discount</span>
                                        <span>- ₹{discount}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span>Shipping</span>
                                        {isCalculatingShipping && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <div className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid #ddd', borderTopColor: 'var(--color-mango-500)', borderRadius: '50%' }} />
                                                <span style={{ fontSize: '0.7rem', color: 'var(--color-mango-600)' }}>Calculating...</span>
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: isCalculatingShipping ? '400' : '700' }}>
                                        {isCalculatingShipping ? '...' : (currentShippingCost > 0 ? `₹${currentShippingCost}` : (isShippingReady ? 'FREE' : '--'))}
                                    </span>
                                </div>
                                {!isShippingReady && (
                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontStyle: 'italic' }}>
                                        * Please provide address & pincode to see shipping cost
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginTop: '0.5rem' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--color-mango-600)' }}>₹{total}</span>
                                </div>
                            </div>

                            {step >= 2 && (
                                <Button 
                                    onClick={handlePayment} 
                                    style={{ width: '100%', marginTop: '2rem', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '1rem' }}
                                    disabled={processing || step < 2 || !isShippingReady || isCalculatingShipping}
                                    isLoading={processing}
                                >
                                    {processing ? 'Processing...' : (paymentMethod === 'cod' ? 'Confirm COD Order' : `Pay ₹${total} Now`)}
                                </Button>
                            )}
                            
                            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Secure 256-bit SSL encrypted payment
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </div>
    );
}
