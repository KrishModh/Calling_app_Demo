import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import CallControls from "../components/CallControls";
import CallStatus from "../components/CallStatus";
import IncomingCall from "../components/IncomingCall";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useWebRTC } from "../hooks/useWebRTC";
import { fetchPeerUserApi } from "../services/api";

export default function Call() {
  const { token, user, logout } = useAuth();
  const { socket } = useSocket();
  const [peerEmail, setPeerEmail] = useState("");

  const {
    status,
    connectionState,
    incomingCall,
    muted,
    logs,
    addLog,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    resetCallState
  } = useWebRTC({ socket });

  useEffect(() => {
    if (!token) return;

    fetchPeerUserApi()
      .then((peer) => setPeerEmail(peer))
      .catch((err) => {
        addLog(`Peer load failed: ${err.response?.data?.message || err.message}`);
      });
  }, [token]);

  function handleLogout() {
    resetCallState();
    logout();
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Voice Call Test Page</h1>

        <CallStatus
          user={user}
          peerEmail={peerEmail}
          status={status}
          connectionState={connectionState}
        />

        <CallControls
          canCall={Boolean(peerEmail)}
          muted={muted}
          onCall={() => startCall(peerEmail)}
          onEnd={() => endCall(true)}
          onToggleMute={toggleMute}
          onLogout={handleLogout}
        />

        <IncomingCall incomingCall={incomingCall} onAccept={acceptCall} onReject={rejectCall} />

        <h2>Debug Logs</h2>
        <div className="logs">
          {logs.length === 0 ? (
            <div className="log">No logs yet.</div>
          ) : (
            logs.map((line, index) => (
              <div className="log" key={`${line}-${index}`}>
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
