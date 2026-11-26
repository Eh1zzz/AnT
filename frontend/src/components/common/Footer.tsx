import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 mt-32">
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10">
        {[
          { heading: 'Shop', links: [['All Pieces','/shop'],['Boss','/shop?category=boss'],['Baddie','/shop?category=baddie'],['Ankara','/shop?category=ankara'],['Refined','/shop?category=refined'],['Raw','/shop?category=raw'],['Custom','/shop?category=custom'],['Accessories','/shop?category=accessories']] },
          { heading: 'Brand', links: [['Our Model','/'],['Pre-Orders','/shop?preorder=true'],['Size Guide','/'],['Care Guide','/']] },
          { heading: 'Orders', links: [['Track Order','/orders'],['Returns','/'],['Contact','/']] },
          { heading: 'Connect', links: [['Instagram','https://instagram.com'],['WhatsApp','https://wa.me/'],['Newsletter','/']] },
        ].map(col => (
          <div key={col.heading} className="p-6 md:p-8 border-r border-white/10 last:border-r-0">
            <p className="tag mb-5">{col.heading}</p>
            <ul className="space-y-3">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-white/40 text-xs font-mono tracking-wide hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-8 py-5 gap-3">
        <span className="font-mono text-[10px] tracking-widest uppercase text-white/25">
          © {year} Aura n Thread. Port Harcourt, Nigeria.
        </span>
        <span className="font-mono text-[10px] tracking-widest uppercase text-white/20">
          Per-piece. On demand. No waste.
        </span>
      </div>
    </footer>
  );
}
