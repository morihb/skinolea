import { fmt } from "../i18n";

export default function ProductCard({ p, lang, t, symbol, onOpen, onAdd }) {
  const name = lang === "ar" ? p.name_ar || p.name_en : p.name_en;
  const cat = lang === "ar" ? p.category_ar || p.category_en : p.category_en;
  const desc = lang === "ar" ? p.description_ar || p.description_en : p.description_en;
  const outOfStock = p.stock !== null && p.stock !== undefined && p.stock <= 0;

  return (
    <div className={`bg-white border border-olive/10 rounded-2xl overflow-hidden flex flex-col ${t.body}`}>
      <button onClick={() => onOpen(p)} className="block w-full aspect-square overflow-hidden bg-stone">
        <img src={p.imageUrl} alt={name} className="w-full h-full object-cover" />
      </button>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[11px] uppercase tracking-wider text-amber">{cat}</span>
        <button onClick={() => onOpen(p)} className={`text-left ${lang === "ar" ? "text-right" : ""} ${t.display}`}>
          <span className="text-lg leading-snug text-olive">{name}</span>
        </button>
        <p className={`text-sm text-neutral-500 line-clamp-2 ${lang === "ar" ? "text-right" : ""}`}>{desc}</p>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            {p.salePrice ? (
              <>
                <span className="font-semibold text-olive">{fmt(p.salePrice, symbol)}</span>
                <span className="text-sm line-through text-neutral-400">{fmt(p.price, symbol)}</span>
              </>
            ) : (
              <span className="font-semibold text-olive">{fmt(p.price, symbol)}</span>
            )}
          </div>
          <button
            disabled={outOfStock}
            onClick={() => onAdd(p)}
            className="text-xs px-3 py-2 rounded-full bg-olive text-white hover:bg-olive-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {outOfStock ? t.outOfStock : t.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
