// IMPORTANT: this must stay a top-level component (not defined inside
// another component's render function). Defining it inline there would
// give React a new component type on every render, which would remount
// the underlying <input>/<textarea> and kick focus out after every
// keystroke — that's the bug this file exists to avoid.
export default function FormField({ label, value, onChange, textarea, type = "text" }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-600">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={onChange}
          className="border border-olive/20 focus:outline-olive rounded-lg px-3 py-2"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="border border-olive/20 focus:outline-olive rounded-lg px-3 py-2"
        />
      )}
    </label>
  );
}
