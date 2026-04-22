import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import CallPage from './pages/CallPage';
import { loadAuth } from './auth';

function App() {
  const [auth, setAuth] = useState(() => loadAuth());

  useEffect(() => {
    const onStorage = () => setAuth(loadAuth());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to="/call" replace /> : <LoginPage onLogin={setAuth} />}
      />
      <Route
        path="/call"
        element={auth ? <CallPage auth={auth} onAuthChange={setAuth} /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={auth ? '/call' : '/login'} replace />} />
    </Routes>
  );
}

export default App;