export default function ActionButton({ children, onClick, disabled = false, variant = 'default' }) {
  return (
    <button className={`action-button ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}