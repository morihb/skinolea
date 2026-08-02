import { fmt } from "../../i18n";

export default function AdminOrders({ t, orders, toggleStatus }) {
  if (orders.length === 0) return <p className="text-sm text-neutral-500">{t.noOrders}</p>;
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <div key={o.id} className="bg-white border border-olive/10 rounded-xl p-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-xs text-neutral-400">{new Date(o.timestamp).toLocaleString()}</p>
              <p className="text-sm mt-1">{o.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}</p>
              <p className="text-sm font-medium mt-1 text-olive">{t.total}: {fmt(o.total, "")}</p>
            </div>
            <button
              onClick={() => toggleStatus(o.id)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${o.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
            >
              {o.status === "completed" ? t.completed : t.pending}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
