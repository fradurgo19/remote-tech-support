import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { MainLayout } from './organisms/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TicketsListPage } from './pages/TicketsListPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { SupportPage } from './pages/SupportPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorFallback } from './components/ErrorFallback';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CallProvider>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardPage />} />
                  <Route path="tickets" element={<TicketsListPage />} />
                  <Route path="tickets/new" element={<CreateTicketPage />} />
                  <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </CallProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;