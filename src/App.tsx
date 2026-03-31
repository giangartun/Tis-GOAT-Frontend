import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/login';
import { Register } from './components/register';
import { Dashboard } from './components/dashboard';
import './App.css';

function AuthFlow() {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return (
      <Login 
        onSwitchToRegister={() => setShowLogin(false)}
        onLoginSuccess={() => {}}
      />
    );
  }

  return (
    <Register 
      onSwitchToLogin={() => setShowLogin(true)}
      onRegisterSuccess={() => {}}
    />
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <AuthFlow />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;