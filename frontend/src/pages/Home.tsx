import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productApi }   from '../services/api';
import { ProductCard }  from '../components/shop/ProductCard';
import { DitherImage }  from '../components/canvas/DitherImage';
import { Footer }       from '../components/common/Footer';
import type { Product } from '../types';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    productApi.list().then(all => setFeatured(all.slice(0, 3)));
  }, []);

  return (
    <main className="pt-[60px]">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="min-h-[92vh] flex flex-col border-b border-white/10 relative overflow-hidden">
        {/* Background dither image */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <DitherImage
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400"
            alt=""
            className="w-full h-full"
            threshold={90}
            hoverEffect={false}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-10 pb-12 pt-24 flex-1">
          {/* Eyebrow */}
          <motion.p
            className="tag mb-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            Port Harcourt · Contemporary · Craft — SS25 Drop
          </motion.p>

          {/* Hero text */}
          <motion.h1
            className="heading-hero mb-8 max-w-5xl"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Arek<br />N Tochi
          </motion.h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Link to="/shop" className="btn-solid inline-flex items-center gap-2">
                Shop the Drop <ArrowRight size={13} />
              </Link>
            </motion.div>
            <motion.p
              className="font-mono text-[11px] text-white/30 max-w-xs leading-relaxed"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            >
              Per-piece production. Local tailors. High concept. No excess inventory.
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 right-8 font-mono text-[9px] tracking-widest uppercase text-white/20 flex items-center gap-2"
          animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        >
          Scroll ↓
        </motion.div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────── */}
      <div className="border-b border-white/10 overflow-hidden py-3 bg-white text-black">
        <motion.div
          className="flex gap-12 whitespace-nowrap font-mono text-[11px] tracking-widest uppercase"
          animate={{ x: [0, '-50%'] }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="flex gap-12">
              <span>Aura n Thread</span><span>·</span>
              <span>Bespoke Craft</span><span>·</span>
              <span>South Side Made</span><span>·</span>
              <span>Per-Piece Model</span><span>·</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURED DROP ────────────────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="flex items-end justify-between px-5 md:px-10 pt-14 pb-6 border-b border-white/10">
          <div>
            <p className="tag mb-2">001 — Current Drop</p>
            <h2 className="heading-lg">Selected Pieces</h2>
          </div>
          <Link to="/shop" className="btn-ghost hidden md:inline-flex items-center gap-2 text-[10px]">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/10">
          {featured.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-product bg-zinc-950 animate-pulse border-r border-white/10 last:border-r-0" />
              ))
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </section>

      {/* ── BRAND STATEMENT ──────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 border-b border-white/10">
        {/* Text half */}
        <div className="flex flex-col justify-between p-8 md:p-14 border-b md:border-b-0 md:border-r border-white/10">
          <p className="tag mb-12">002 — The System</p>
          <div>
            <h2 className="heading-xl mb-8">
              A Lean<br />Fashion<br />System
            </h2>
            <p className="text-white/40 text-sm font-mono leading-relaxed max-w-xs mb-8">
              No dead stock. No guessing. We work with local PH tailors,
              produce per confirmed order, and deliver directly. Every piece
              is cut and sewn for you.
            </p>
            <Link to="/shop" className="btn-ghost inline-flex items-center gap-2 text-[10px]">
              Explore the Method <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        {/* Image half */}
        <DitherImage
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900"
          alt="Aura n Thread craftsmanship"
          className="aspect-square md:aspect-auto"
          threshold={110}
          hoverEffect
        />
      </section>

      {/* ── PRE-ORDER BANNER ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-white text-black">
        <div className="px-8 md:px-14 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-widest uppercase opacity-50 mb-3">
              003 — Pre-Order
            </p>
            <h2 className="heading-xl text-black max-w-md">
              Secure Your Piece Before It's Cut
            </h2>
          </div>
          <Link
            to="/shop?preorder=true"
            className="border border-black text-black font-mono text-xs tracking-widest uppercase px-7 py-3 hover:bg-black hover:text-white transition-colors shrink-0"
          >
            Pre-Order Now →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
