'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (product: any, qty?: number, openSidebar?: boolean) => void;
    decrementItem: (id: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    cartCount: number;
    isAnimating: boolean;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToCart = (product: any, qty: number = 1, openSidebar: boolean = true) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
            }
            return [...prev, { ...product, quantity: qty }];
        });

        // Trigger animation
        setIsAnimating(true);
        if (openSidebar) {
            setIsCartOpen(true); // Open sidebar on add only if requested
        }
        setTimeout(() => setIsAnimating(false), 500); // Reset after 500ms
    };

    const decrementItem = (id: number) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
            }
            // If quantity is 1, regular behavior is usually to keep it at 1 or remove.
            // Let's keep it at 1. User should use 'remove' button to delete.
            return prev;
        });
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
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

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
