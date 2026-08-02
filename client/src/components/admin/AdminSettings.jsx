import { useState } from "react";
import { api } from "../../api";
import FormField from "../FormField";

export default function AdminSettings({ t, settings, onSaved }) {
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaveErr("");
    try {
      await api.admin.updateSettings(form);
      onSaved(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveErr(e.message || "Could not save settings. Please try again.");
    }
  };

  const changePassword = async () => {
    setPwErr(""); setPwMsg("");
    try {
      await api.admin.changePassword(pw.currentPassword, pw.newPassword);
      setPwMsg(t.passwordChanged);
      setPw({ currentPassword: "", newPassword: "" });
    } catch (e) {
      setPwErr(e.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="bg-white border border-olive/10 rounded-2xl p-6 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label={t.shopNameEn} value={form.shopNameEn || ""} onChange={set("shopNameEn")} />
          <FormField label={t.shopNameAr} value={form.shopNameAr || ""} onChange={set("shopNameAr")} />
          <FormField label={t.taglineEnLbl} value={form.taglineEn || ""} onChange={set("taglineEn")} />
          <FormField label={t.taglineArLbl} value={form.taglineAr || ""} onChange={set("taglineAr")} />
          <FormField label={t.whatsappNumberLbl} value={form.whatsappNumber || ""} onChange={set("whatsappNumber")} />
          <FormField label={t.currencySymbolLbl} value={form.currencySymbol || ""} onChange={set("currencySymbol")} />
        </div>
        {saved && <p className="text-xs text-green-600">{t.settingsSaved}</p>}
        {saveErr && <p className="text-xs text-red-500">{saveErr}</p>}
        <button onClick={submit} className="bg-olive text-white hover:bg-olive-light rounded-full py-2 text-sm self-start px-6">{t.save}</button>
      </div>

      <div className="bg-white border border-olive/10 rounded-2xl p-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-600">{t.currentPassword}</span>
          <input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className="border border-olive/20 rounded-lg px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-600">{t.newPassword}</span>
          <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className="border border-olive/20 rounded-lg px-3 py-2" />
        </label>
        {pwErr && <p className="text-xs text-red-500">{pwErr}</p>}
        {pwMsg && <p className="text-xs text-green-600">{pwMsg}</p>}
        <button onClick={changePassword} className="bg-olive text-white hover:bg-olive-light rounded-full py-2 text-sm self-start px-6">{t.changePassword}</button>
      </div>
    </div>
  );
}