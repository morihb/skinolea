import { useState } from "react";
import FormField from "../FormField";

function empty() {
  return { id: null, sku: "", name_en: "", name_ar: "", category_en: "", category_ar: "",
    description_en: "", description_ar: "", price: "", salePrice: "", stock: "", imageUrl: "" };
}

export default function ProductForm({ t, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || empty());
  const [err, setErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name_en.trim() || !form.price || !form.imageUrl.trim()) { setErr(true); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-olive/10 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label={t.nameEn} value={form.name_en} onChange={set("name_en")} />
        <FormField label={t.nameAr} value={form.name_ar} onChange={set("name_ar")} />
        <FormField label={t.categoryEn} value={form.category_en} onChange={set("category_en")} />
        <FormField label={t.categoryAr} value={form.category_ar} onChange={set("category_ar")} />
        <FormField label={t.descEn} value={form.description_en} onChange={set("description_en")} textarea />
        <FormField label={t.descAr} value={form.description_ar} onChange={set("description_ar")} textarea />
        <FormField label={t.price} value={form.price} onChange={set("price")} type="number" />
        <FormField label={t.salePrice} value={form.salePrice} onChange={set("salePrice")} type="number" />
        <FormField label={t.stock} value={form.stock} onChange={set("stock")} type="number" />
        <FormField label={t.sku} value={form.sku} onChange={set("sku")} />
        <div className="sm:col-span-2"><FormField label={t.imageUrl} value={form.imageUrl} onChange={set("imageUrl")} /></div>
      </div>
      {form.imageUrl && (
        <img src={form.imageUrl} alt="" className="w-24 h-24 rounded-lg object-cover bg-stone" onError={(e) => (e.target.style.opacity = 0.2)} />
      )}
      {err && <p className="text-xs text-red-500">{t.required}</p>}
      <div className="flex gap-3">
        <button disabled={saving} onClick={submit} className="bg-olive text-white hover:bg-olive-light rounded-full px-5 py-2 text-sm disabled:opacity-50">{t.save}</button>
        <button onClick={onCancel} className="rounded-full px-5 py-2 text-sm border">{t.cancel}</button>
      </div>
    </div>
  );
}
