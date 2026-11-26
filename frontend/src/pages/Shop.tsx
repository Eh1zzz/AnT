import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi }  from '../services/api';
import { ProductCard } from '../components/shop/ProductCard';
import { Footer }      from '../components/common/Footer';
import type { Product } from '../types';

const CATS = [
  { id: '',          label: 'All'       },
  { id: 'ankara',    label: 'Ankara'    },
  { id: 'corporate', label: 'Corporate' },
  { id: 'casual',    label: 'Casual'    },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    productApi.list(activeCategory || undefined)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const displayed = searchParams.get('preorder') === 'true'
    ? products.filter(p => p.is_preorder)
    : products;

  return (
    <main className="pt-[60px]">
      {/* Page header */}
      <div className="border-b border-white/10 px-5 md:px-10 pt-12 pb-6">
        <p className="tag mb-3">Catalogue</p>
        <h1 className="heading-xl">
          {activeCategory ? CATS.find(c => c.id === activeCategory)?.label : 'All Pieces'}
        </h1>
      </div>

      {/* Category filters */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
        {CATS.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              cat.id ? p.set('category', cat.id) : p.delete('category');
              p.delete('preorder');
              setSearchParams(p);
            }}
            className={`shrink-0 font-mono text-[11px] tracking-widest uppercase px-6 py-4 border-r border-white/10 transition-colors
              ${activeCategory === cat.id ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => { const p = new URLSearchParams(); p.set('preorder','true'); setSearchParams(p); }}
          className={`shrink-0 font-mono text-[11px] tracking-widest uppercase px-6 py-4 transition-colors
            ${searchParams.get('preorder') === 'true' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
        >
          Pre-Order
        </button>
        {/* Count */}
        <span className="ml-auto flex items-center px-6 font-mono text-[10px] text-white/25 shrink-0">
          {displayed.length} piece{displayed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-white/10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-product bg-zinc-950 animate-pulse border-r border-b border-white/10" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="font-mono text-xs tracking-widest uppercase text-white/25">No pieces found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-white/10">
          {displayed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}

      <Footer />
    </main>
  );
}
