import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle } from "lucide-react";
import { T } from "../i18n";
import { api } from "../api";

export default function AdminLogin() {
  const lang = (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
  const t = T[lang];
  const rtl = lang === "ar";
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      await api.admin.login(pw);
      navigate("/admin");
    } catch (e) {
      setErr(t.wrongPassword);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`min-h-screen bg-parchment flex items-center justify-center px-4 ${t.body}`} dir={rtl ? "rtl" : "ltr"}>
      <div className="max-w-sm w-full bg-white border border-olive/10 rounded-2xl p-8 flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-center text-olive">
          <Lock size={20} /><h2 className={`text-xl ${t.display}`}>{t.adminLogin}</h2>
        </div>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(""); }}
          placeholder={t.password}
          className="border border-olive/20 focus:outline-olive rounded-lg px-3 py-2 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        {err && <p className="text-xs text-red-500">{err}</p>}
        <button disabled={busy} onClick={submit} className="bg-olive text-white hover:bg-olive-light rounded-full py-2 text-sm disabled:opacity-50">
          {t.login}
        </button>
        <p className="text-[11px] text-neutral-400 flex gap-1 items-start"><AlertCircle size={28} className="shrink-0" />{t.securityNote}</p>
      </div>
    </div>
  );
}
