import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Globe, LogOut, Package, Plus, Upload,
  ClipboardList, Settings as SettingsIcon,
} from "lucide-react";
import { T } from "../i18n";
import { api } from "../api";
import ProductForm from "../components/admin/ProductForm";
import AdminProducts from "../components/admin/AdminProducts";
import AdminImport from "../components/admin/AdminImport";
import AdminOrders from "../components/admin/AdminOrders";
import AdminSettings from "../components/admin/AdminSettings";

export default function AdminDashboard() {
  const [lang, setLang] = useState(() => ((navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en"));
  const rtl = lang === "ar";
  const t = T[lang];
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await api.admin.session();
      } catch (e) {
        navigate("/admin/login");
        return;
      }
      const [p, o, s] = await Promise.all([api.admin.getProducts(), api.admin.getOrders(), api.admin.getSettings()]);
      setProducts(p); setOrders(o); setSettings(s);
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashMsg = (m) => { setFlash(m); setTimeout(() => setFlash(""), 2000); };

  const reloadProducts = async () => setProducts(await api.admin.getProducts());

  const saveProduct = async (form) => {
    if (form.id) {
      await api.admin.updateProduct(form.id, form);
      flashMsg(t.productSaved);
    } else {
      await api.admin.addProduct(form);
      flashMsg(t.productAdded);
    }
    await reloadProducts();
    setEditingProduct(null);
    setTab("products");
  };

  const deleteProduct = async (id) => {
    await api.admin.deleteProduct(id);
    await reloadProducts();
  };

  const toggleOrderStatus = async (id) => {
    await api.admin.toggleOrder(id);
    setOrders(await api.admin.getOrders());
  };

  const logout = async () => {
    await api.admin.logout();
    navigate("/admin/login");
  };

  if (checking || !settings) {
    return <div className="min-h-screen bg-parchment" />;
  }

  const tabs = [
    ["products", t.products, <Package size={14} key="i" />],
    ["add", t.addProduct, <Plus size={14} key="i" />],
    ["import", t.importExcel, <Upload size={14} key="i" />],
    ["orders", t.orders, <ClipboardList size={14} key="i" />],
    ["settings", t.settings, <SettingsIcon size={14} key="i" />],
  ];

  return (
    <div className={`min-h-screen bg-parchment ${t.body}`} dir={rtl ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <a href="/" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
            {rtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t.backToStore}
          </a>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(rtl ? "en" : "ar")} className="flex items-center gap-1 text-sm text-neutral-500">
              <Globe size={16} /> {rtl ? "EN" : "AR"}
            </button>
            <button onClick={logout} className="flex items-center gap-1 text-sm text-neutral-500">
              <LogOut size={14} /> {t.logout}
            </button>
          </div>
        </div>

        <h1 className={`text-2xl text-olive mb-6 ${t.display}`}>{t.dashboard}</h1>

        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setEditingProduct(null); }}
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm border ${tab === key ? "bg-olive text-white border-olive" : "border-olive/25"}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {flash && <p className="text-sm text-green-600 mb-4">{flash}</p>}

        {tab === "products" && !editingProduct && (
          <AdminProducts t={t} lang={lang} symbol={settings.currencySymbol} products={products} onEdit={setEditingProduct} onDelete={deleteProduct} />
        )}
        {(tab === "add" || editingProduct) && (
          <ProductForm
            t={t}
            initial={editingProduct && editingProduct.id ? editingProduct : null}
            onSave={saveProduct}
            onCancel={() => { setEditingProduct(null); setTab("products"); }}
          />
        )}
        {tab === "import" && !editingProduct && <AdminImport t={t} onImported={reloadProducts} />}
        {tab === "orders" && !editingProduct && <AdminOrders t={t} orders={orders} toggleStatus={toggleOrderStatus} />}
        {tab === "settings" && !editingProduct && (
          <AdminSettings t={t} settings={settings} onSaved={(s) => setSettings({ ...settings, ...s })} />
        )}
      </div>
    </div>
  );
}
