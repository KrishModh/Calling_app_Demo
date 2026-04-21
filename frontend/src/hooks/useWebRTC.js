import { useEffect, useRef, useState } from "react";
import { createPeerConnection, stopStream } from "../utils/webrtc";

export function useWebRTC({ socket }) {
  const [status, setStatus] = useState("Idle");
  const [connectionState, setConnectionState] = useState("new");
  const [incomingCall, setIncomingCall] = useState(null);
  const [activePeer, setActivePeer] = useState(null);
  const [muted, setMuted] = useState(false);
  const [logs, setLogs] = useState([]);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(new Audio());

  function addLog(message) {
    const now = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${now}] ${message}`, ...prev].slice(0, 50));
  }

  async function ensureLocalAudio() {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    setMuted(false);
    addLog("Microphone access granted");
    return stream;
  }

  function clearRemoteAudio() {
    remoteAudioRef.current.srcObject = null;
  }

  function closePeerConnection() {
    if (!peerRef.current) return;
    peerRef.current.onicecandidate = null;
    peerRef.current.ontrack = null;
    peerRef.current.onconnectionstatechange = null;
    peerRef.current.close();
    peerRef.current = null;
  }

  function resetLocalStream() {
    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    setMuted(false);
  }

  function createConnection(targetEmail) {
    closePeerConnection();
    const pc = createPeerConnection();
    peerRef.current = pc;
    setConnectionState("connecting");

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current);
      }
    }

    pc.ontrack = (event) => {
      addLog("Remote audio track received");
      remoteAudioRef.current.srcObject = event.streams[0];
      remoteAudioRef.current
        .play()
        .then(() => addLog("Remote audio playback started"))
        .catch((err) => addLog(`Remote audio play blocked: ${err.message}`));
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socket) return;
      socket.emit("ice:candidate", {
        to: targetEmail,
        candidate: event.candidate
      });
      addLog("ICE candidate exchanged");
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setConnectionState(state);
      addLog(`Connection state: ${state}`);
      if (state === "connected") setStatus("Connected");
      if (state === "disconnected" || state === "failed" || state === "closed") {
        setStatus("Call Ended");
      }
    };

    return pc;
  }

  function endCall(sendSignal = true) {
    if (sendSignal && socket && activePeer) {
      socket.emit("call:end", { to: activePeer });
      addLog("End call signal sent");
    }

    closePeerConnection();
    resetLocalStream();
    clearRemoteAudio();
    setIncomingCall(null);
    setActivePeer(null);
    setConnectionState("closed");
    setStatus("Call Ended");
  }

  async function startCall(peerEmail) {
    if (!peerEmail || !socket) return;

    try {
      setStatus("Calling...");
      setActivePeer(peerEmail);
      await ensureLocalAudio();
      const pc = createConnection(peerEmail);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", { to: peerEmail, offer });
      addLog("Offer created and sent");
    } catch (err) {
      addLog(`Call start failed: ${err.message}`);
      setStatus("Call Ended");
    }
  }

  async function acceptCall() {
    if (!incomingCall || !socket) return;
    const from = incomingCall.from;

    try {
      setStatus("Connecting...");
      setActivePeer(from);
      await ensureLocalAudio();
      const pc = createConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { to: from, answer });
      addLog("Answer created and sent");
      setIncomingCall(null);
    } catch (err) {
      addLog(`Accept failed: ${err.message}`);
      setStatus("Call Ended");
    }
  }

  function rejectCall() {
    if (!incomingCall || !socket) return;
    socket.emit("call:reject", { to: incomingCall.from });
    addLog("Incoming call rejected");
    setIncomingCall(null);
    setStatus("Call Ended");
  }

  function toggleMute() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    const isNowMuted = !track.enabled;
    setMuted(isNowMuted);
    addLog(isNowMuted ? "Microphone muted" : "Microphone unmuted");
  }

  function resetCallState() {
    closePeerConnection();
    resetLocalStream();
    clearRemoteAudio();
    setIncomingCall(null);
    setActivePeer(null);
    setStatus("Idle");
    setConnectionState("new");
    setLogs([]);
  }

  useEffect(() => {
    if (!socket) return undefined;

    socket.on("connect", () => {
      addLog(`Socket connected (${socket.id})`);
    });

    socket.on("connect_error", (err) => {
      addLog(`Socket error: ${err.message}`);
    });

    socket.on("call:offer", ({ from, offer }) => {
      setIncomingCall({ from, offer });
      setStatus("Incoming Call...");
      addLog(`Incoming call offer from ${from}`);
    });

    socket.on("call:answer", async ({ from, answer }) => {
      try {
        if (!peerRef.current) return;
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus("Connecting...");
        addLog(`Answer received from ${from}`);
      } catch (err) {
        addLog(`Failed to apply answer: ${err.message}`);
      }
    });

    socket.on("ice:candidate", async ({ candidate }) => {
      try {
        if (!peerRef.current || !candidate) return;
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        addLog("ICE candidate received");
      } catch (err) {
        addLog(`ICE add failed: ${err.message}`);
      }
    });

    socket.on("call:reject", ({ from }) => {
      addLog(`Call rejected by ${from}`);
      endCall(false);
    });

    socket.on("call:end", ({ from }) => {
      addLog(`Call ended by ${from}`);
      endCall(false);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("ice:candidate");
      socket.off("call:reject");
      socket.off("call:end");
      resetCallState();
    };
  }, [socket]);

  return {
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
  };
}
