/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import PengusulDashboard from './pages/PengusulDashboard';
import VerifikatorDashboard from './pages/VerifikatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { getCurrentUser } from './services/storage';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          
          <Route path="pengusul" element={
            <ProtectedRoute allowedRoles={['pengusul']}>
              <PengusulDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="verifikator" element={
            <ProtectedRoute allowedRoles={['verifikator']}>
              <VerifikatorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
