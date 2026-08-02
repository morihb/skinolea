export default function OliveMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 54 Q30 34 54 10" stroke="currentColor" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="42" rx="10" ry="4.2" transform="rotate(-42 24 42)" fill="currentColor" />
      <ellipse cx="36" cy="29" rx="9.5" ry="4" transform="rotate(-42 36 29)" fill="currentColor" />
      <ellipse cx="47" cy="17" rx="8.5" ry="3.6" transform="rotate(-42 47 17)" fill="currentColor" />
      <circle cx="16" cy="50" r="4.4" fill="currentColor" />
      <circle cx="11" cy="57" r="3.6" fill="currentColor" />
    </svg>
  );
}
