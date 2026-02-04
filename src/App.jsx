import {  Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./services/firebase";
import ProtectedLayout from "./pages/AuthPages/ProtectedLayout";
import Login from "./pages/AuthPages/Login";
import Signup from "./pages/AuthPages/Signup";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import TeamMembers from "./pages/TeamMembers";
import Tasks from "./pages/Tasks";
import AI from "./pages/AI";
 import Calendar from "./pages/Calendar"; 
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import MainLayout from "./components/layout/MainLayout";

export default function App() { 
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <ToastContainer position="top-right" theme="dark" />

      <Routes>
        {/* Public pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected area */}
        <Route element={<ProtectedLayout user={user} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/team" element={<TeamMembers />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="/tologin" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

{/*export default function App()
 { 
   const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>; // optional loading screen

  return (
    
      <Routes>
             {/* Public pages *
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

  {/* Protected area *
  <Route element={<ProtectedLayout user={user} />}>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/team" element={<TeamMembers />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/ai" element={<AI />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
  </Route>




        <Route path="/tologin" element={<Navigate to="/login" />} />
      </Routes>
    
  
  );
 }*/}
