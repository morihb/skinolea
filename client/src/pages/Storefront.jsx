import { useEffect, useMemo, useState, useRef } from "react";
import { Check, Globe, Search, ShoppingBag } from "lucide-react";
import OliveMark from "../components/OliveMark";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import CartDrawer from "../components/CartDrawer";
import { T } from "../i18n";
import { api } from "../api";

const CART_KEY = "olives_cart";

export default function Storefront() {
  const [lang, setLang] = useState(() => ((navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en"));
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const rtl = lang === "ar";
  const t = T[lang];

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2200);
  };

  useEffect(() => {
    (async () => {
      const [s, p] = await Promise.all([api.getSettings(), api.getProducts()]);
      setSettings(s);
      setProducts(p);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const addToCart = (p, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id);
      if (existing) return prev.map((c) => (c.id === p.id ? { ...c, qty: c.qty + qty } : c));
      return [...prev, { id: p.id, qty }];
    });
    const name = lang === "ar" ? p.name_ar || p.name_en : p.name_en;
    showToast(lang === "ar" ? `تمت إضافة ${name} إلى السلة` : `${name} added to cart`);
  };
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  };
  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const key = (p.category_en || "Uncategorized").toLowerCase();
      if (!map.has(key)) map.set(key, { en: p.category_en, ar: p.category_ar });
    });
    return Array.from(map.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCategory === "all" || (p.category_en || "").toLowerCase() === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || (p.name_en || "").toLowerCase().includes(q) || (p.name_ar || "").includes(q);
      return matchesCat && matchesQuery;
    });
  }, [products, activeCategory, query]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const checkout = (items, total) => {
    if (!settings) return;
    const header = lang === "ar" ? `طلب جديد - ${settings.shopNameAr}` : `New order - ${settings.shopNameEn}`;
    const lines = items.map((i) => {
      const name = lang === "ar" ? i.product.name_ar || i.product.name_en : i.product.name_en;
      const price = i.product.salePrice || i.product.price;
      return `${name} ×${i.qty} — ${settings.currencySymbol}${(price * i.qty).toFixed(2)}`;
    });
    const totalLine = `${t.total || (lang === "ar" ? "الإجمالي" : "Total")}: ${settings.currencySymbol}${total.toFixed(2)}`;
    const message = [header, "------------------------", ...lines, "------------------------", totalLine].join("\n");
    const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Navigate to WhatsApp immediately, in the same tap that triggered this
    // handler. Mobile browsers (Safari especially) block window.open/navigation
    // that happens after any await — even a fast one — so this must come first,
    // before any network request, or the redirect can silently fail on phones.
    window.location.href = url;

    setCart([]);
    setCartOpen(false);

    // Best-effort order log; runs in the background and never blocks or
    // delays the redirect above.
    api.postOrder({
      items: items.map((i) => ({
        name: lang === "ar" ? i.product.name_ar || i.product.name_en : i.product.name_en,
        qty: i.qty,
        price: i.product.salePrice || i.product.price,
      })),
      total,
      lang,
    }).catch((e) => console.error(e));
  };

  if (!loaded || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <OliveMark className="w-10 h-10 text-olive animate-pulse" />
      </div>
    );
  }

  const shopName = lang === "ar" ? settings.shopNameAr : settings.shopNameEn;
  const tagline = lang === "ar" ? settings.taglineAr : settings.taglineEn;

  return (
    <div className={`min-h-screen bg-parchment text-ink ${t.body}`} dir={rtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-30 backdrop-blur bg-parchment/90 border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-olive">
            <OliveMark className="w-7 h-7" />
            <span className={`text-lg ${t.display}`}>{shopName}</span>
          </div>
          <div className="hidden sm:flex items-center flex-1 max-w-sm relative mx-4">
            <Search size={16} className={`absolute ${rtl ? "right-3" : "left-3"} text-neutral-400`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border border-olive/20 focus:outline-olive rounded-full py-2 text-sm ${rtl ? "pr-9 pl-3" : "pl-9 pr-3"}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(rtl ? "en" : "ar")} className="flex items-center gap-1 text-sm px-2 py-2 rounded-full hover:bg-black/5">
              <Globe size={18} />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-full hover:bg-black/5">
              <ShoppingBag size={20} className="text-olive" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-amber text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <Search size={16} className={`absolute ${rtl ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-neutral-400`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border border-olive/20 focus:outline-olive rounded-full py-2 text-sm ${rtl ? "pr-9 pl-3" : "pl-9 pr-3"}`}
            />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-olive">
        <OliveMark className="absolute opacity-10 w-72 h-72 -top-8 -right-8 text-white pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 relative">
          <h1 className={`text-3xl sm:text-5xl max-w-xl text-white leading-tight ${t.display}`}>{tagline}</h1>
          <button
            onClick={() => document.getElementById("cs-shop")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-8 bg-amber text-white hover:brightness-110 px-6 py-3 rounded-full text-sm font-medium"
          >
            {lang === "ar" ? "تسوقي الآن" : "Shop the collection"}
          </button>
        </div>
      </section>

      <div id="cs-shop" className="max-w-6xl mx-auto px-4 pt-8 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-sm border ${activeCategory === "all" ? "bg-olive text-white border-olive" : "border-olive/25"}`}
        >
          {t.all}
        </button>
        {categories.map((c) => (
          <button
            key={c.en}
            onClick={() => setActiveCategory((c.en || "").toLowerCase())}
            className={`px-4 py-2 rounded-full text-sm border ${activeCategory === (c.en || "").toLowerCase() ? "bg-olive text-white border-olive" : "border-olive/25"}`}
          >
            {lang === "ar" ? c.ar || c.en : c.en}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} p={p} lang={lang} t={t} symbol={settings.currencySymbol} onOpen={setSelected} onAdd={addToCart} />
          ))}
        </div>
        {filteredProducts.length === 0 && <p className="text-center text-neutral-400 py-16">—</p>}
      </main>

      <footer className="border-t border-black/5 mt-8 bg-olive">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center gap-2 text-white/70 text-sm">
          <OliveMark className="w-5 h-5" />
          <span>{shopName}</span>
        </div>
      </footer>

      <ProductModal p={selected} lang={lang} t={t} symbol={settings.currencySymbol} onClose={() => setSelected(null)} onAdd={addToCart} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        lang={lang}
        t={t}
        symbol={settings.currencySymbol}
        onQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={checkout}
        rtl={rtl}
      />
      <div
        className={`fixed bottom-6 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none transition-all duration-300 ${
          toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className={`bg-white border border-olive/10 rounded-full pl-4 pr-5 py-3 shadow-lg flex items-center gap-2 text-sm text-olive pointer-events-auto ${t.body}`}>
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      </div>
    </div>
  );
}