import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Menu } from 'lucide-react';
import { useCart }  from '../../context/CartContext';

const LINKS = [
  { to: '/shop',          label: 'Shop'     },
  { to: '/shop?category=boss',   label: 'Boss'   },
  { to: '/shop?category=baddie',   label: 'Baddie'   },
  { to: '/shop?category=ankara',   label: 'Ankara'   },
  { to: '/shop?category=refined',label: 'Refined'},
  { to: '/shop?category=raw',   label: 'Raw'   },
  { to: '/shop?category=accessories',   label: 'Accessories'   },
  { to: '/shop?category=custom',   label: 'Custom'   },
];

export function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-[60px] bg-black border-b border-white/10">
        <div className="flex items-center justify-between h-full px-5 md:px-10">
          {/* Logo */}
          <Link to="/" className="font-mono text-md tracking-[0.3em] font-bold">
            AnT
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `tag transition-colors ${isActive ? 'text-white' : 'hover:text-white/70'}`
                }>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-1 hover:opacity-70 transition-opacity"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {/* Mobile hamburger */}
            <button className="md:hidden p-1" onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-20 bg-black pt-[60px] flex flex-col px-6"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-0 mt-6 border-t border-white/10">
              {LINKS.map(l => (
                <button key={l.to}
                  onClick={() => { navigate(l.to); setMobileOpen(false); }}
                  className="text-left heading-lg py-5 border-b border-white/10 hover:text-white/60 transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
