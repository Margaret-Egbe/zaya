import React from 'react';
import { createRoot } from 'react-dom/client'
import './App.css'
import AppRoutes from './AppRoutes.tsx'
import { Toaster } from 'sonner';
import { AuthProvider } from './userAuth/AuthContex.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
      <Toaster visibleToasts={1} position='top-right' richColors/>
  </React.StrictMode>
)
