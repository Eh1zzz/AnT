import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';

interface CartCtx {
  items:         CartItem[];
  isOpen:        boolean;
  setIsOpen:     (v: boolean) => void;
  addItem:       (product: Product, variant: ProductVariant, qty?: number) => void;
  removeItem:    (variantId: number) => void;
  updateQty:     (variantId: number, qty: number) => void;
  clearCart:     () => void;
  totalItems:    number;
  totalPrice:    number;
}

const CartContext = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]   = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, variant: ProductVariant, qty = 1) => {
    setItems(prev => {
      const ex = prev.find(i => i.variant.id === variant.id);
      return ex
        ? prev.map(i => i.variant.id === variant.id ? { ...i, quantity: i.quantity + qty } : i)
        : [...prev, { product, variant, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((variantId: number) =>
    setItems(prev => prev.filter(i => i.variant.id !== variantId)), []);

  const updateQty = useCallback((variantId: number, qty: number) => {
    if (qty <= 0) { removeItem(variantId); return; }
    setItems(prev => prev.map(i => i.variant.id === variantId ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.base_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart outside CartProvider');
  return ctx;
}
