import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { productApi }       from '../services/api';
import { DitherImage }      from '../components/canvas/DitherImage';
import { SizeGuideModal }   from '../components/shop/SizeGuideModal';
import { useCart }          from '../context/CartContext';
import { Footer }           from '../components/common/Footer';
import type { Product, ProductVariant } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const { addItem } = useCart();

  const [product,       setProduct]       = useState<Product | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedVar,   setSelectedVar]   = useState<ProductVariant | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added,         setAdded]         = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productApi.getBySlug(slug)
      .then(p => { setProduct(p); if (p.variants.length) setSelectedVar(p.variants[0]); })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen pt-[60px] grid grid-cols-1 md:grid-cols-2 border-b border-white/10">
      <div className="aspect-product md:aspect-auto bg-zinc-950 animate-pulse" />
      <div className="p-10 space-y-6">
        {[1,2,3].map(i => <div key={i} className="h-4 bg-zinc-900 animate-pulse rounded" />)}
      </div>
    </div>
  );
  if (!product) return null;

  const inStock  = selectedVar ? selectedVar.stock_quantity > 0 : false;
  const canOrder = product.is_preorder || inStock;

  function handleAdd() {
    if (!selectedVar) return;
    addItem(product!, selectedVar);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in: ${product.name} (${selectedVar?.size ?? ''} / ${selectedVar?.color ?? ''}) — ${fmt(product.base_price)}`
  );

  return (
    <main className="pt-[60px]">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 md:px-10 py-4 font-mono text-[10px] tracking-widest uppercase text-white/40 hover:text-white transition-colors border-b border-white/10"
      >
        <ArrowLeft size={12} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/10">
        {/* Left — dither image */}
        <div className="border-b md:border-b-0 md:border-r border-white/10">
          <DitherImage
            src={product.image_url ?? ''}
            alt={product.name}
            className="aspect-product md:aspect-auto md:h-[calc(100vh-110px)] md:sticky md:top-[60px]"
            threshold={115}
            hoverEffect
          />
        </div>

        {/* Right — info */}
        <motion.div
          className="px-6 md:px-12 py-10 flex flex-col gap-8"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Name + badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag">{product.category}</span>
              {product.is_preorder && (
                <span className="bg-white text-black font-mono text-[9px] tracking-widest uppercase px-2 py-0.5">
                  Pre-Order
                </span>
              )}
            </div>
            <h1 className="heading-lg mb-3">{product.name}</h1>
            <p className="font-mono text-xl font-bold">{fmt(product.base_price)}</p>
          </div>

          {/* Description */}
          <p className="text-sm text-white/50 font-mono leading-relaxed border-t border-white/10 pt-6">
            {product.description}
          </p>

          {/* Size selector */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="tag">Select Size</span>
              <button
                onClick={() => setSizeGuideOpen(true)}
                className="font-mono text-[10px] tracking-widest uppercase text-white/30 hover:text-white transition-colors underline"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVar(v)}
                  disabled={v.stock_quantity === 0 && !product.is_preorder}
                  className={`border font-mono text-xs tracking-wider uppercase px-4 py-2.5 transition-all
                    ${selectedVar?.id === v.id
                      ? 'bg-white text-black border-white'
                      : v.stock_quantity === 0 && !product.is_preorder
                      ? 'border-white/10 text-white/20 cursor-not-allowed line-through'
                      : 'border-white/20 text-white hover:border-white'
                    }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {selectedVar && (
              <p className="font-mono text-[10px] text-white/30 mt-3 tracking-wider">
                {selectedVar.color} — {selectedVar.stock_quantity > 0 ? `${selectedVar.stock_quantity} in stock` : product.is_preorder ? 'Pre-order' : 'Out of stock'}
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
            <button
              onClick={handleAdd}
              disabled={!canOrder || !selectedVar}
              className={`btn-solid w-full transition-all ${added ? '!bg-white/80' : ''} disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {added ? '✓ Added to Cart' : product.is_preorder ? 'Reserve — Pre-Order' : 'Add to Cart'}
            </button>
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP ?? '2348000000000'}?text=${whatsappMsg}`}
              target="_blank" rel="noreferrer"
              className="btn-ghost w-full flex items-center justify-center gap-2"
            >
              <MessageCircle size={13} /> Enquire via WhatsApp
            </a>
          </div>

          {/* SKU */}
          <p className="font-mono text-[10px] text-white/20 border-t border-white/10 pt-5">
            SKU: {selectedVar?.sku ?? '—'}
          </p>
        </motion.div>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <Footer />
    </main>
  );
}
