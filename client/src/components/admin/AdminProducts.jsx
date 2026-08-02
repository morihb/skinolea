import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { fmt } from "../../i18n";

export default function AdminProducts({ t, lang, symbol, products, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);
  return (
    <div className="flex flex-col gap-3">
      {products.length === 0 && <p className="text-sm text-neutral-500">—</p>}
      {products.map((p) => {
        const name = lang === "ar" ? p.name_ar || p.name_en : p.name_en;
        return (
          <div key={p.id} className="bg-white border border-olive/10 rounded-xl p-3 flex items-center gap-3">
            <img src={p.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-stone" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-olive">{name}</p>
              <p className="text-xs text-neutral-500">
                {fmt(p.salePrice || p.price, symbol)} · {p.sku || "—"}
                {p.stock !== null && p.stock !== undefined ? ` · stock ${p.stock}` : ""}
              </p>
            </div>
            <button onClick={() => onEdit(p)} className="p-2 rounded-full hover:bg-black/5"><Pencil size={16} /></button>
            {confirmId === p.id ? (
              <div className="flex items-center gap-1">
                <button onClick={() => { onDelete(p.id); setConfirmId(null); }} className="text-xs px-2 py-1 rounded bg-red-500 text-white">{t.yes}</button>
                <button onClick={() => setConfirmId(null)} className="text-xs px-2 py-1 rounded border">{t.no}</button>
              </div>
            ) : (
              <button onClick={() => setConfirmId(p.id)} className="p-2 rounded-full hover:bg-black/5 text-red-500"><Trash2 size={16} /></button>
            )}
          </div>
        );
      })}
    </div>
  );
}
