export default function CallControls({
  canCall,
  muted,
  onCall,
  onEnd,
  onToggleMute,
  onLogout
}) {
  return (
    <div className="actions">
      <button onClick={onCall} disabled={!canCall}>
        Call
      </button>
      <button onClick={onEnd}>End</button>
      <button onClick={onToggleMute}>{muted ? "Unmute" : "Mute"}</button>
      <button className="logout" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}
