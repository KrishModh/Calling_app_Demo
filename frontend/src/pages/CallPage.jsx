import { useEffect, useMemo, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { apiRequest } from '../api';
import { clearAuth } from '../auth';
import ActionButton from '../components/ActionButton';

function CallPage({ auth, onAuthChange }) {
  const [deviceState, setDeviceState] = useState('Connecting to Twilio...');
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [muted, setMuted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [peerUser, setPeerUser] = useState('');

  const deviceRef = useRef(null);

  const otherUser = useMemo(() => peerUser || 'the other user', [peerUser]);

  useEffect(() => {
    let mounted = true;

    async function initializeDevice() {
      try {
        const { token, identity, peers } = await apiRequest('/api/voice/token', { method: 'GET' }, auth.token);

        if (!mounted) return;

        const device = new Device(token, {
          edge: 'ashburn',
          logLevel: 1,
          codecPreferences: ['opus', 'pcmu'],
        });

        deviceRef.current = device;
        setPeerUser(Array.isArray(peers) && peers.length > 0 ? peers[0] : '');

        device.on('registered', () => setDeviceState(`Ready as ${identity}`));
        device.on('unregistered', () => setDeviceState('Device unregistered'));
        device.on('error', (twilioError) => setError(twilioError.message || 'Twilio error'));
        device.on('incoming', (call) => {
          setIncomingCall(call);
          setError('');

          call.on('cancel', () => setIncomingCall(null));
          call.on('disconnect', () => {
            setIncomingCall(null);
            setActiveCall(null);
            setMuted(false);
          });
          call.on('reject', () => setIncomingCall(null));
        });

        await device.register();
      } catch (err) {
        setError(err.message || 'Failed to initialize Twilio Device');
        if (String(err.message || '').toLowerCase().includes('token')) {
          handleLogout();
        }
      }
    }

    initializeDevice();

    return () => {
      mounted = false;
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, [auth.token]);

  async function safeLog(status, caller, receiver) {
    try {
      await apiRequest(
        '/api/voice/calls/log',
        {
          method: 'POST',
          body: JSON.stringify({ status, caller, receiver }),
        },
        auth.token
      );
    } catch {
      // Logging is optional for this app.
    }
  }

  function attachCallListeners(call, direction) {
    call.on('accept', () => {
      setIncomingCall(null);
      setActiveCall(call);
      setMuted(false);
      setBusy(false);
      const caller = direction === 'outgoing' ? auth.email : otherUser;
      const receiver = direction === 'outgoing' ? otherUser : auth.email;
      safeLog('accepted', caller, receiver);
    });

    call.on('disconnect', () => {
      const caller = direction === 'outgoing' ? auth.email : otherUser;
      const receiver = direction === 'outgoing' ? otherUser : auth.email;
      safeLog('ended', caller, receiver);

      setActiveCall(null);
      setIncomingCall(null);
      setMuted(false);
      setBusy(false);
    });

    call.on('cancel', () => {
      setIncomingCall(null);
      setBusy(false);
    });

    call.on('reject', () => {
      const caller = direction === 'outgoing' ? auth.email : otherUser;
      const receiver = direction === 'outgoing' ? otherUser : auth.email;
      safeLog('rejected', caller, receiver);
      setIncomingCall(null);
      setBusy(false);
    });

    call.on('error', (twilioError) => {
      setError(twilioError.message || 'Call error');
      setBusy(false);
    });
  }

  async function handleCall() {
    setError('');
    setBusy(true);

    try {
      const device = deviceRef.current;
      if (!device) throw new Error('Twilio Device not ready');
      if (!peerUser) throw new Error('No peer user configured in backend env');

      const call = await device.connect({ params: { receiver: otherUser } });
      attachCallListeners(call, 'outgoing');
      safeLog('initiated', auth.email, otherUser);
      setActiveCall(call);
      setBusy(false);
    } catch (err) {
      setError(err.message || 'Failed to start call');
      setBusy(false);
    }
  }

  function handleAccept() {
    if (!incomingCall) return;
    attachCallListeners(incomingCall, 'incoming');
    incomingCall.accept();
  }

  function handleReject() {
    if (!incomingCall) return;
    safeLog('rejected', otherUser, auth.email);
    incomingCall.reject();
    setIncomingCall(null);
  }

  function handleMuteToggle() {
    if (!activeCall) return;
    const next = !muted;
    activeCall.mute(next);
    setMuted(next);
  }

  function handleEndCall() {
    if (!activeCall) return;
    activeCall.disconnect();
  }

  function handleLogout() {
    clearAuth();
    onAuthChange(null);
  }

  return (
    <main className="page-wrap">
      <section className="card call-card">
        <h1>Voice Calling Test App</h1>
        <p>{deviceState}</p>

        <div className="meta-grid">
          <div>
            <span className="meta-label">Logged In User</span>
            <strong>{auth.email}</strong>
          </div>
          <div>
            <span className="meta-label">Other User</span>
            <strong>{otherUser}</strong>
          </div>
        </div>

        {error ? <div className="error-text">{error}</div> : null}

        <div className="button-row">
          <ActionButton onClick={handleCall} disabled={busy || !!activeCall || !!incomingCall} variant="primary">
            Call
          </ActionButton>

          <ActionButton onClick={handleAccept} disabled={!incomingCall || !!activeCall} variant="success">
            Accept
          </ActionButton>

          <ActionButton onClick={handleReject} disabled={!incomingCall || !!activeCall} variant="danger">
            Reject
          </ActionButton>
        </div>

        <div className="button-row">
          <ActionButton onClick={handleMuteToggle} disabled={!activeCall}>
            {muted ? 'Unmute' : 'Mute'}
          </ActionButton>

          <ActionButton onClick={handleEndCall} disabled={!activeCall} variant="danger">
            End Call
          </ActionButton>

          <ActionButton onClick={handleLogout}>Logout</ActionButton>
        </div>
      </section>
    </main>
  );
}

export default CallPage;
