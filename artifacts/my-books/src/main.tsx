import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './lib/app-context';
import { AuthProvider } from './lib/auth';
import App from './App';
import './index.css';

// 1. أنشئ نسخة من QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. غلف كل شيء بـ QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  </React.StrictMode>
);