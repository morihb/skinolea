import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { api } from "../../api";

export default function AdminImport({ t, onImported }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(""); setSuccess(""); setBusy(true);
    try {
      const result = await api.admin.importProducts(file);
      setSuccess(`${result.imported} ${t.importSuccess}`);
      await onImported();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="bg-white border border-olive/10 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer text-neutral-500 hover:bg-black/[0.02]">
        <Upload size={22} />
        <span className="text-sm">{busy ? "…" : t.dropExcel}</span>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" disabled={busy} />
      </label>
      <p className="text-xs text-neutral-400">{t.excelHint}</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}
    </div>
  );
}
