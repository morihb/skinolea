import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { fmt } from "../i18n";

export default function ProductModal({ p, lang, t, symbol, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  if (!p) return null;
  const name = lang === "ar" ? p.name_ar || p.name_en : p.name_en;
  const cat = lang === "ar" ? p.category_ar || p.category_en : p.category_en;
  const desc = lang === "ar" ? p.description_ar || p.description_en : p.description_en;
  const outOfStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[90vh] overflow-y-auto ${t.body}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid sm:grid-cols-2">
          <div className="aspect-square bg-stone">
            <img src={p.imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col gap-3">
            <button onClick={onClose} className="self-end p-1 rounded-full hover:bg-black/5"><X size={20} /></button>
            <span className="text-[11px] uppercase tracking-wider -mt-6 text-amber">{cat}</span>
            <h2 className={`text-2xl text-olive ${t.display}`}>{name}</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
            <div className="flex items-baseline gap-2 mt-2">
              {p.salePrice ? (
                <>
                  <span className="text-xl font-semibold text-olive">{fmt(p.salePrice, symbol)}</span>
                  <span className="text-sm line-through text-neutral-400">{fmt(p.price, symbol)}</span>
                </>
              ) : (
                <span className="text-xl font-semibold text-olive">{fmt(p.price, symbol)}</span>
              )}
            </div>
            {!outOfStock ? (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
                  <span className="px-3 min-w-[2rem] text-center">{qty}</span>
                  <button className="p-2" onClick={() => setQty((q) => q + 1)}><Plus size={16} /></button>
                </div>
                <button
                  onClick={() => { onAdd(p, qty); onClose(); }}
                  className="flex-1 py-3 rounded-full bg-olive text-white hover:bg-olive-light text-sm"
                >
                  {t.addToCart}
                </button>
              </div>
            ) : (
              <span className="mt-2 text-sm font-medium text-red-600">{t.outOfStock}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
