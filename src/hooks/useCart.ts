'use client';
import { createContext, useContext } from 'react';

export type CartItem = {
    cartItemId: string; // combination of id and weight
    id: number;
    name: string;
    price: number;
    quantity: number;
    weight: string;
    image?: string;
};

export type CartContextType = {
    items: CartItem[];
    addToCart: (product: any, qty?: number, openSidebar?: boolean) => void;
    decrementItem: (cartItemId: string) => void;
    removeFromCart: (cartItemId: string) => void;
    updateItemWeight: (cartItemId: string, newWeight: string, basePrice: number) => void;
    clearCart: () => void;
    cartCount: number;
    isAnimating: boolean;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
