import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileModeProvider } from './contexts/ProfileModeContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';

function App() {
  return (
    <AuthProvider>
      <ProfileModeProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 font-sf-pro">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 lg:ml-0 p-6">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/watch/:videoId" element={<WatchPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/search" element={<HomePage />} />
                    <Route path="/subjects" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Subjects Page</h2>
                        <p className="text-neutral-600">Coming soon with enhanced filtering and categorization</p>
                      </div>
                    } />
                    <Route path="/classrooms" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Classrooms</h2>
                        <p className="text-neutral-600">Virtual classroom management coming soon</p>
                      </div>
                    } />
                    <Route path="/favorites" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Favorites</h2>
                        <p className="text-neutral-600">Your saved videos will appear here</p>
                      </div>
                    } />
                    <Route path="/watch-later" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Watch Later</h2>
                        <p className="text-neutral-600">Your watch later queue will be displayed here</p>
                      </div>
                    } />
                    <Route path="/subject/:subject" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Subject Filter</h2>
                        <p className="text-neutral-600">Subject-specific content coming soon</p>
                      </div>
                    } />
                    <Route path="/grade/:grade" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Grade Filter</h2>
                        <p className="text-neutral-600">Grade-level filtering coming soon</p>
                      </div>
                    } />
                    <Route path="/dashboard" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Dashboard</h2>
                        <p className="text-neutral-600">Analytics and insights coming soon</p>
                      </div>
                    } />
                    <Route path="/premium" element={
                      <div className="glass-card p-8 text-center">
                        <h2 className="text-2xl font-bold text-gradient mb-4">Premium Plans</h2>
                        <p className="text-neutral-600">Subscription plans coming soon</p>
                      </div>
                    } />
                  </Routes>
                </div>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </ProfileModeProvider>
    </AuthProvider>
  );
}

export default App;