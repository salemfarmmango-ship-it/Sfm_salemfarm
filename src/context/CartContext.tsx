'use client';
import { useEffect, useState } from 'react';
import { CartContext, CartItem } from '@/hooks/useCart';

export { useCart } from '@/hooks/useCart';
export type { CartItem };

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cart');
            if (saved) {
                try {
                    setItems(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            }
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
        setIsInitialized(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem('cart', JSON.stringify(items));
            } catch (e) {
                console.warn('Failed to save cart to LocalStorage', e);
            }
        }
    }, [items, isInitialized]);

    const addToCart = (product: any, qty: number = 1, openSidebar: boolean = true) => {
        setItems(prev => {
            const finalWeight = product.weight || product.size || '';
            const cartItemId = finalWeight ? `${product.id}_${finalWeight}` : String(product.id);
            const existing = prev.find(i => i.cartItemId === cartItemId);
            
            if (existing) {
                return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + qty } : i);
            }
            return [...prev, { ...product, cartItemId, weight: finalWeight, quantity: qty }];
        });

        // Trigger animation
        setIsAnimating(true);
        if (openSidebar) {
            setIsCartOpen(true); // Open sidebar on add only if requested
        }
        setTimeout(() => setIsAnimating(false), 500); // Reset after 500ms
    };

    const decrementItem = (cartItemId: string) => {
        setItems(prev => {
            const existing = prev.find(i => i.cartItemId === cartItemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            // If quantity is 1, regular behavior is usually to keep it at 1 or remove.
            // Let's keep it at 1. User should use 'remove' button to delete.
            return prev;
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setItems(prev => {
            // Primary match: exact cartItemId
            const directMatch = prev.some(i => i.cartItemId === cartItemId);
            if (directMatch) {
                return prev.filter(i => i.cartItemId !== cartItemId);
            }
            // Fallback: match by the numeric id part (handles legacy numeric IDs)
            const numericId = cartItemId.split('_')[0];
            return prev.filter(i => String(i.id) !== numericId && i.cartItemId !== cartItemId);
        });
    };

    // Update weight (and price) for a specific cart item.
    // basePrice should be the original 1kg price for the product.
    const updateItemWeight = (cartItemId: string, newWeight: string, basePrice: number) => {
        const multiplier = newWeight === '5kg' ? 5 : newWeight === '3kg' ? 3 : 1;
        const newPrice = basePrice * multiplier;
        setItems(prev => {
            const existing = prev.find(i => i.cartItemId === cartItemId);
            if (!existing) return prev;
            // Build the new cartItemId with the new weight
            const newCartItemId = `${existing.id}_${newWeight}`;
            // Remove the old, re-add with new weight/price/id
            return prev.map(i =>
                i.cartItemId === cartItemId
                    ? { ...i, cartItemId: newCartItemId, weight: newWeight, price: newPrice }
                    : i
            );
        });
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            decrementItem,
            removeFromCart,
            updateItemWeight,
            clearCart,
            cartCount,
            isAnimating,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};
