import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { orderApi } from '../services/api';
import type { Order } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

export default function OrderConfirmation() {
  const [params]  = useSearchParams();
  const reference = params.get('ref') ?? params.get('reference') ?? '';

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!reference) { setError('No order reference found.'); setLoading(false); return; }
    // Poll a couple times for webhook to process
    let attempts = 0;
    const poll = async () => {
      try {
        const o = await orderApi.verify(reference);
        setOrder(o);
      } catch (err) {
        if (++attempts < 3) setTimeout(poll, 2000);
        else setError(typeof err === 'string' ? err : 'Could not verify order.');
      } finally { setLoading(false); }
    };
    poll();
  }, [reference]);

  if (loading) return (
    <div className="min-h-screen pt-[60px] flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-white/30" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen pt-[60px] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <XCircle size={40} strokeWidth={1} className="text-red-400" />
      <p className="font-mono text-xs text-white/40 tracking-widest uppercase">{error || 'Order not found'}</p>
      <Link to="/shop" className="btn-ghost">Return to Shop</Link>
    </div>
  );

  const isPaid = order.payment_status === 'paid';

  return (
    <main className="min-h-screen pt-[60px]">
      <motion.div
        className="max-w-lg mx-auto px-5 py-16"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Status icon */}
        <div className="mb-10 flex flex-col items-start gap-4">
          {isPaid
            ? <CheckCircle size={36} strokeWidth={1.2} className="text-white" />
            : <Loader2 size={36} strokeWidth={1.2} className="text-white/40 animate-spin" />
          }
          <div>
            <p className="tag mb-2">{isPaid ? 'Payment Confirmed' : 'Payment Processing'}</p>
            <h1 className="heading-xl">
              {isPaid ? 'Order\nConfirmed.' : 'Hold\nTight.'}
            </h1>
          </div>
        </div>

        {/* Order summary */}
        <div className="border border-white/10 divide-y divide-white/10 mb-8">
          <div className="p-5 flex justify-between">
            <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Order Ref</span>
            <span className="font-mono text-xs">{order.payment_reference}</span>
          </div>
          <div className="p-5 flex justify-between">
            <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Status</span>
            <span className={`font-mono text-xs uppercase tracking-wider ${isPaid ? 'text-white' : 'text-white/40'}`}>
              {order.order_status}
            </span>
          </div>
          <div className="p-5 flex justify-between">
            <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Total Paid</span>
            <span className="font-mono text-sm font-bold">{fmt(order.total_amount)}</span>
          </div>
          {order.items?.map(item => (
            <div key={item.id} className="p-5 flex justify-between text-white/60">
              <span className="font-mono text-xs">{item.product_name} — {item.size} / {item.color}</span>
              <span className="font-mono text-xs">×{item.quantity}</span>
            </div>
          ))}
        </div>

        <p className="font-mono text-[11px] text-white/30 leading-relaxed mb-8 border-l-2 border-white/20 pl-4">
          {isPaid
            ? 'Your order is now in the production queue. In-stock items ship within 5–7 days. Pre-order items within 3–4 weeks. You\'ll receive an email confirmation shortly.'
            : 'We\'re awaiting payment confirmation from your bank. This usually takes a few minutes. Do not close this page.'
          }
        </p>

        <div className="flex gap-3">
          <Link to="/shop" className="btn-ghost flex-1 text-center">Continue Shopping</Link>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP ?? '2348000000000'}?text=${encodeURIComponent('Hi, I\'d like to track my order: ' + order.payment_reference)}`}
            target="_blank" rel="noreferrer"
            className="btn-solid flex-1 text-center"
          >
            Track via WhatsApp
          </a>
        </div>
      </motion.div>
    </main>
  );
}
