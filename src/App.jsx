import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./services/firebase";
import ProtectedLayout from "./pages/AuthPages/ProtectedLayout";
import MainLayout from "./components/layout/MainLayout";

// Lazy-loaded page components
const Login = lazy(() => import("./pages/AuthPages/Login"));
const Signup = lazy(() => import("./pages/AuthPages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./pages/Chat"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const Tasks = lazy(() => import("./pages/Tasks"));
const AI = lazy(() => import("./pages/AI"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));


export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>; // Global app loading state for auth

  return (
    <>
      <ToastContainer position="top-right" theme="dark" />
      <Suspense fallback={<div>Loading app sections...</div>}> {/* Loading fallback for lazy-loaded routes */}
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
      </Suspense>
    </>
  );
}

