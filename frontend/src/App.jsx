import { Navigate, Route, Routes } from "react-router-dom";
import Call from "./pages/Call";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/call" element={<Call />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
