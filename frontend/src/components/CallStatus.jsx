export default function CallStatus({ user, peerEmail, status, connectionState }) {
  return (
    <>
      <div className="meta">Current user: {user}</div>
      <div className="meta">Receiver user: {peerEmail || "Not found"}</div>
      <div className="meta">Call status: {status}</div>
      <div className="meta">Connection state: {connectionState}</div>
    </>
  );
}
