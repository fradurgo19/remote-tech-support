import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorFallback } from './components/ErrorFallback';
import { IncomingCallHandler } from './components/IncomingCallHandler';
import { NavigationHelper } from './components/NavigationHelper';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { MainLayout } from './organisms/MainLayout';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicCreateTicketPage } from './pages/PublicCreateTicketPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ReportsPage from './pages/ReportsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { TicketsListPage } from './pages/TicketsListPage';
import { UsersPage } from './pages/UsersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

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
              <NavigationHelper />
              <IncomingCallHandler />
              <Toaster position='top-right' />
              <Routes>
                <Route path='/login' element={<LoginPage />} />
                <Route
                  path='/solicitar-soporte'
                  element={<PublicCreateTicketPage />}
                />
                <Route
                  path='/forgot-password'
                  element={<ForgotPasswordPage />}
                />
                <Route path='/reset-password' element={<ResetPasswordPage />} />
                <Route path='/verify-email' element={<VerifyEmailPage />} />

                <Route
                  path='/'
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path='tickets' element={<TicketsListPage />} />
                  <Route path='tickets/new' element={<CreateTicketPage />} />
                  <Route
                    path='tickets/:ticketId'
                    element={<TicketDetailPage />}
                  />
                  <Route path='support' element={<SupportPage />} />
                  <Route path='users' element={<UsersPage />} />
                  <Route path='settings' element={<SettingsPage />} />
                  <Route path='reports' element={<ReportsPage />} />
                  <Route
                    path='reports/:reportId'
                    element={<ReportDetailPage />}
                  />
                </Route>

                <Route path='*' element={<NotFoundPage />} />
              </Routes>
            </CallProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
