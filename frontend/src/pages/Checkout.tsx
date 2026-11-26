import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion }    from 'framer-motion';
import { Loader2 }   from 'lucide-react';
import { useCart }   from '../context/CartContext';
import { orderApi }  from '../services/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

interface Field { label: string; id: string; type?: string; placeholder?: string; }
const FIELDS: Field[] = [
  { label: 'Full Name',      id: 'full_name',   placeholder: 'Ada Obi'                 },
  { label: 'Phone Number',   id: 'phone',       type: 'tel', placeholder: '08012345678' },
  { label: 'Street Address', id: 'address',     placeholder: '14 Bode Thomas Street'   },
  { label: 'City',           id: 'city',        placeholder: 'Lagos'                   },
  { label: 'State',          id: 'state',       placeholder: 'Lagos'                   },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form,     setForm]     = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  if (!items.length) {
    navigate('/shop');
    return null;
  }

  function handleChange(id: string, val: string) {
    setForm(prev => ({ ...prev, [id]: val }));
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    for (const f of FIELDS) {
      if (!form[f.id]?.trim()) { setError(`${f.label} is required`); return; }
    }
    const token = localStorage.getItem('ant_token');
    if (!token) { navigate('/login?redirect=/checkout'); return; }

    setLoading(true);
    try {
      const shipping_address = `${form.full_name}, ${form.phone} — ${form.address}, ${form.city}, ${form.state}`;
      const result = await orderApi.initiate({
        shipping_address,
        items: items.map(i => ({ variant_id: i.variant.id, quantity: i.quantity })),
      });
      clearCart();
      // Redirect to Paystack hosted page
      window.location.href = result.authorization_url;
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-[60px] min-h-screen">
      <div className="border-b border-white/10 px-5 md:px-10 py-8">
        <p className="tag mb-2">Checkout</p>
        <h1 className="heading-lg">Complete Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] border-b border-white/10">
        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="px-5 md:px-10 py-10 border-b lg:border-b-0 lg:border-r border-white/10 space-y-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <div>
            <p className="tag mb-6">01 — Shipping Details</p>
            <div className="space-y-6">
              {FIELDS.map(f => (
                <div key={f.id}>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-2">
                    {f.label}
                  </label>
                  <input
                    type={f.type ?? 'text'}
                    placeholder={f.placeholder}
                    value={form[f.id] ?? ''}
                    onChange={e => handleChange(f.id, e.target.value)}
                    className="input-ant"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="font-mono text-[11px] text-red-400 border border-red-400/20 px-4 py-2">
              {error}
            </p>
          )}

          <div>
            <p className="tag mb-4">02 — Payment</p>
            <div className="border border-white/10 p-4 font-mono text-xs text-white/40 space-y-1">
              <p>Secure payment via Paystack</p>
              <p>Accepts cards, bank transfer, USSD</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-solid w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : `Pay ${fmt(totalPrice)}`}
          </button>
        </motion.form>

        {/* Order summary */}
        <aside className="px-6 md:px-10 py-10">
          <p className="tag mb-6">Order Summary</p>
          <div className="space-y-0 divide-y divide-white/10 border-t border-white/10">
            {items.map(item => (
              <div key={item.variant.id} className="flex gap-4 py-4">
                <div className="w-12 h-16 bg-zinc-900 shrink-0 overflow-hidden">
                  {item.product.image_url && (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover grayscale" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.product.name}</p>
                  <p className="font-mono text-[10px] text-white/40 mt-0.5">{item.variant.size} / {item.variant.color}</p>
                  <p className="font-mono text-[10px] text-white/40">Qty: {item.quantity}</p>
                </div>
                <p className="font-mono text-xs font-bold shrink-0">{fmt(item.product.base_price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-4 mt-2 flex justify-between">
            <span className="font-mono text-xs text-white/50 tracking-widest uppercase">Total</span>
            <span className="font-mono text-sm font-bold">{fmt(totalPrice)}</span>
          </div>
          <p className="font-mono text-[10px] text-white/25 mt-4 leading-relaxed">
            Pre-order items ship within 3–4 weeks of production completion. In-stock items ship in 5–7 business days within Nigeria.
          </p>
        </aside>
      </div>
    </main>
  );
}
