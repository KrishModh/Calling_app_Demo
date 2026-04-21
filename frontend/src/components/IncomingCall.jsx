export default function IncomingCall({ incomingCall, onAccept, onReject }) {
  return (
    <div className="incoming-wrap">
      <div className="incoming">
        {incomingCall ? `Incoming Call from ${incomingCall.from}` : "No incoming call"}
      </div>
      <div className="actions">
        <button onClick={onAccept} disabled={!incomingCall}>
          Accept
        </button>
        <button onClick={onReject} disabled={!incomingCall}>
          Reject
        </button>
      </div>
    </div>
  );
}
