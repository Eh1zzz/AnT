import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer panel */}
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-black border-l border-white/10 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} strokeWidth={1.5} />
                <span className="font-mono text-xs tracking-widest uppercase">
                  Cart ({totalItems})
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-60 transition-opacity">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/10">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                  <ShoppingBag size={32} strokeWidth={1} />
                  <p className="font-mono text-xs tracking-widest uppercase">Empty</p>
                  <button
                    onClick={() => { setIsOpen(false); navigate('/shop'); }}
                    className="btn-ghost text-[10px] mt-2"
                  >
                    Browse Shop
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.variant.id} className="flex gap-4 px-6 py-5">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 bg-zinc-900 shrink-0 overflow-hidden">
                      {item.product.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug mb-0.5 truncate">
                        {item.product.name}
                      </p>
                      <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider mb-3">
                        {item.variant.size} / {item.variant.color}
                      </p>
                      {/* Qty controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                          className="w-6 h-6 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                          className="w-6 h-6 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => removeItem(item.variant.id)}
                          className="ml-auto font-mono text-[10px] text-white/30 hover:text-white transition-colors tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {/* Price */}
                    <p className="font-mono text-xs font-bold shrink-0">
                      {fmt(item.product.base_price * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 px-6 py-5 shrink-0 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-white/50 tracking-widest uppercase">Total</span>
                  <span className="font-mono text-sm font-bold">{fmt(totalPrice)}</span>
                </div>
                <p className="font-mono text-[9px] text-white/25 tracking-wide leading-relaxed">
                  Shipping calculated at checkout. Pre-orders ship within 3–4 weeks.
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="btn-solid w-full block text-center"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center font-mono text-[10px] text-white/30 hover:text-white tracking-widest uppercase transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
