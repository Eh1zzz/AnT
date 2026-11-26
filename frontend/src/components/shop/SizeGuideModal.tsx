import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

const SIZES = [
  { size: 'S',      chest: '86–91',  waist: '71–76',  hip: '89–94'  },
  { size: 'M',      chest: '91–96',  waist: '76–81',  hip: '94–99'  },
  { size: 'L',      chest: '96–101', waist: '81–86',  hip: '99–104' },
  { size: 'XL',     chest: '101–107',waist: '86–91',  hip: '104–109'},
  { size: 'XXL',    chest: '107–114',waist: '91–97',  hip: '109–116'},
  { size: 'Custom', chest: '—',      waist: '—',      hip: '—'      },
];

export function SizeGuideModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 max-w-lg mx-auto bg-black border border-white/15 p-6 md:p-8"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-xs tracking-[0.3em] uppercase">Size Guide (cm)</h3>
              <button onClick={onClose}><X size={16} strokeWidth={1.5} /></button>
            </div>
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  {['Size','Chest','Waist','Hip'].map(h => (
                    <th key={h} className="text-left text-white/40 tracking-widest uppercase pb-3 pr-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {SIZES.map(row => (
                  <tr key={row.size} className={row.size === 'Custom' ? 'text-white/40' : ''}>
                    <td className="py-3 pr-4 font-bold">{row.size}</td>
                    <td className="py-3 pr-4">{row.chest}</td>
                    <td className="py-3 pr-4">{row.waist}</td>
                    <td className="py-3">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-white/30 font-mono text-[10px] mt-6 leading-relaxed">
              All measurements in centimetres. Select Custom for bespoke tailoring — WhatsApp consultation required.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
