import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DitherImage } from '../canvas/DitherImage';
import type { Product } from '../../types';

interface Props { product: Product; index?: number; }

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

export function ProductCard({ product, index = 0 }: Props) {
  const inStock = product.variants.some(v => v.stock_quantity > 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group border-r border-b border-white/10 last:border-r-0"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="aspect-product relative overflow-hidden">
          <DitherImage
            src={product.image_url ?? ''}
            alt={product.name}
            className="w-full h-full"
            threshold={120}
            hoverEffect
          />
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_preorder && (
              <span className="bg-white text-black font-mono text-[9px] tracking-widest uppercase px-2 py-0.5">
                Pre-Order
              </span>
            )}
            {!inStock && !product.is_preorder && (
              <span className="bg-black/80 border border-white/20 text-white font-mono text-[9px] tracking-widest uppercase px-2 py-0.5">
                Sold Out
              </span>
            )}
          </div>
          {/* Hover quick-view line */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white text-black text-center font-mono text-[10px] tracking-widest uppercase py-2"
            initial={{ y: '100%' }}
            whileHover={{ y: 0 }}
            transition={{ duration: 0.2 }}
          >
            View Piece →
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-mono tracking-widest uppercase text-white/40 mb-1">
              {product.category}
            </p>
            <h3 className="text-sm font-semibold leading-tight truncate">{product.name}</h3>
            <p className="text-[11px] text-white/40 font-mono mt-1">
              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <p className="font-mono text-sm font-bold whitespace-nowrap">{fmt(product.base_price)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
