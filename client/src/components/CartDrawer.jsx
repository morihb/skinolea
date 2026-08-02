import { Minus, Plus, X } from "lucide-react";
import OliveMark from "./OliveMark";
import { fmt } from "../i18n";

export default function CartDrawer({ open, onClose, cart, products, lang, t, symbol, onQty, onRemove, onCheckout, rtl }) {
  const items = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.id) })).filter((c) => c.product);
  const total = items.reduce((sum, i) => sum + (i.product.salePrice || i.product.price) * i.qty, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 ${rtl ? "left-0" : "right-0"} h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${t.body}
          ${open ? "translate-x-0" : rtl ? "-translate-x-full" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className={`text-xl text-olive ${t.display}`}>{t.yourCart}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {items.length === 0 && (
            <div className="text-center mt-16 flex flex-col items-center gap-3 text-neutral-400">
              <OliveMark className="w-10 h-10 opacity-30" />
              <p className="font-medium">{t.emptyCart}</p>
              <p className="text-sm">{t.keepShopping}</p>
            </div>
          )}
          {items.map((i) => {
            const name = lang === "ar" ? i.product.name_ar || i.product.name_en : i.product.name_en;
            const price = i.product.salePrice || i.product.price;
            return (
              <div key={i.id} className="flex gap-3">
                <img src={i.product.imageUrl} className="w-16 h-16 rounded-xl object-cover bg-stone" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-olive">{name}</p>
                  <p className="text-xs text-neutral-500">{fmt(price, symbol)} {t.each}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center border rounded-full">
                      <button className="p-1 px-2" onClick={() => onQty(i.id, i.qty - 1)}><Minus size={12} /></button>
                      <span className="px-2 text-xs">{i.qty}</span>
                      <button className="p-1 px-2" onClick={() => onQty(i.id, i.qty + 1)}><Plus size={12} /></button>
                    </div>
                    <button onClick={() => onRemove(i.id)} className="text-xs text-red-500 underline">{t.remove}</button>
                  </div>
                </div>
                <span className="text-sm font-medium whitespace-nowrap text-olive">{fmt(price * i.qty, symbol)}</span>
              </div>
            );
          })}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t flex flex-col gap-3">
            <div className="flex justify-between text-sm font-medium">
              <span>{t.subtotal}</span>
              <span>{fmt(total, symbol)}</span>
            </div>
            <button
              onClick={() => onCheckout(items, total)}
              className="w-full py-3 rounded-full bg-amber text-white hover:brightness-110 text-sm font-medium"
            >
              {t.checkoutWhatsApp}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
