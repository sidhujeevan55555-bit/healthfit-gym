import React, { useState, useEffect } from 'react';
import { Dumbbell, Menu, X, LogIn, LogOut, User, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import PlansView, { MembershipPlan } from './components/PlansView';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { Workout, Subscription } from './types';

export default function App() {
  const [activeTab, setActiveTabTab] = useState<'home' | 'about' | 'plans' | 'contact' | 'dashboard' | 'admin'>('home');
  const [auth, setAuth] = useState<{ token: string | null; user: any | null; isAdmin: boolean }>(() => {
    // Initialise and restore from localStorage safely
    try {
      const storedToken = localStorage.getItem('healthfit_token');
      const storedUser = localStorage.getItem('healthfit_user');
      const storedIsAdmin = localStorage.getItem('healthfit_is_admin');
      if (storedToken && storedUser) {
        return {
          token: storedToken,
          user: JSON.parse(storedUser),
          isAdmin: storedIsAdmin === 'true'
        };
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    }
    return { token: null, user: null, isAdmin: false };
  });

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch Member Workouts & Subscriptions when token changes or when looking at active workspace
  const fetchMemberData = async () => {
    if (!auth.token || auth.isAdmin) return;
    try {
      // Pull workouts
      const workRes = await fetch('/api/workouts', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (workRes.ok) {
        const workData = await workRes.json();
        setWorkouts(workData);
      }

      // Pull subscriptions
      const subRes = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscriptions(subData);
      }

      // Sync user profile (updates membership details on reload)
      const profileRes = await fetch('/api/users/me', {
         headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (profileRes.ok) {
         const profileData = await profileRes.json();
         setAuth(prev => {
            const updated = { ...prev, user: profileData };
            localStorage.setItem('healthfit_user', JSON.stringify(profileData));
            return updated;
         });
      }

    } catch (error) {
      console.error('Error synchronising member databases:', error);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [auth.token]);

  // Handle successful logins/registrations
  const handleLoginSuccess = (token: string, user: any, isAdmin: boolean) => {
    setAuth({ token, user, isAdmin });
    localStorage.setItem('healthfit_token', token);
    localStorage.setItem('healthfit_user', JSON.stringify(user));
    localStorage.setItem('healthfit_is_admin', String(isAdmin));
    
    // Redirect to relevant workspace
    if (isAdmin) {
      setActiveTabTab('admin');
    } else {
      setActiveTabTab('dashboard');
    }
  };

  // Handle Logouts
  const handleLogout = () => {
    setAuth({ token: null, user: null, isAdmin: false });
    setWorkouts([]);
    setSubscriptions([]);
    localStorage.clear();
    setActiveTabTab('home');
  };

  // Handle instant custom plan subscription purchase
  const handleSelectPlan = async (plan: MembershipPlan) => {
    if (!auth.token) {
      openAuthModal('register');
      return;
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          price: plan.price,
          durationMonths: plan.durationMonths
        })
      });

      if (res.ok) {
        alert(`Success! You have subscribed to ${plan.name} for ₹${plan.price}.`);
        // Refresh workout & profile stats
        fetchMemberData();
        setActiveTabTab('dashboard');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to complete checkout');
      }
    } catch {
      alert('Network transmission failed. Please try again.');
    }
  };

  // Log new workout
  const handleAddWorkout = async (wData: Omit<Workout, 'id' | 'userId' | 'createdAt'>) => {
    if (!auth.token) return;

    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify(wData)
    });

    if (res.ok) {
      fetchMemberData();
    } else {
      const d = await res.json();
      throw new Error(d.error || 'Failed to add log');
    }
  };

  // Delete logged workout
  const handleDeleteWorkout = async (id: number) => {
    if (!auth.token) return;

    const res = await fetch(`/api/workouts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` }
    });

    if (res.ok) {
      fetchMemberData();
    } else {
      const d = await res.json();
      alert(d.error || 'Failed to delete');
    }
  };

  const openAuthModal = (mode: 'login' | 'register' | 'admin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans bg-transparent">
      
      {/* Top Floating Frosted Glass Navigation Bar */}
      <header className="sticky top-3 mx-auto max-w-7xl w-[calc(100%-2rem)] glass rounded-2xl z-40 my-3 transition duration-300 shadow-xl shadow-black/20">
        <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo element */}
          <div
            onClick={() => setActiveTabTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:rotate-6 transition duration-200">
              <Dumbbell size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-md font-bold text-white font-display uppercase tracking-tight">HealthFit <span className="text-indigo-400">Gym Tracker</span></p>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest font-medium">Sirsa • Haryana</p>
            </div>
          </div>

          {/* Desktop Navigation Link tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTabTab('home')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded-xl transition ${
                activeTab === 'home' ? 'text-indigo-400 bg-white/5 border border-white/10' : 'text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTabTab('about')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded-xl transition ${
                activeTab === 'about' ? 'text-indigo-400 bg-white/5 border border-white/10' : 'text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              About us
            </button>
            <button
              onClick={() => setActiveTabTab('plans')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded-xl transition ${
                activeTab === 'plans' ? 'text-indigo-400 bg-white/5 border border-white/10' : 'text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              Plans
            </button>
            <button
              onClick={() => setActiveTabTab('contact')}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded-xl transition ${
                activeTab === 'contact' ? 'text-indigo-400 bg-white/5 border border-white/10' : 'text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              Contact Us
            </button>

            {/* If Member state logged in */}
            {auth.token && !auth.isAdmin && (
              <button
                onClick={() => setActiveTabTab('dashboard')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'text-indigo-450 bg-white/5 border border-indigo-500/20' : 'text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <HeartPulse size={14} className="text-indigo-400" /> Health Workspace
              </button>
            )}

            {/* If Admin state validated */}
            {auth.token && auth.isAdmin && (
              <button
                onClick={() => setActiveTabTab('admin')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-display rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'admin' ? 'text-indigo-400 bg-white/5 border border-indigo-500/20' : 'text-slate-300 hover:text-white border border-transparent'
                }`}
              >
                <ShieldCheck size={14} className="text-indigo-400" /> Admin Console
              </button>
            )}
          </nav>

          {/* User Account / CTA controls */}
          <div className="hidden md:flex items-center gap-3">
            {auth.token ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{auth.user?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                    {auth.isAdmin ? 'system admin' : auth.user?.membershipType}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition duration-150 cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  Join Club <Sparkles size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown Panels */}
        {mobileMenuOpen && (
          <div className="md:hidden glass mx-4 mb-4 p-4 rounded-xl space-y-3">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => { setActiveTabTab('home'); setMobileMenuOpen(false); }}
                className="text-left text-xs font-medium uppercase tracking-wider py-2 text-slate-300 hover:text-white"
              >
                Home
              </button>
              <button
                onClick={() => { setActiveTabTab('about'); setMobileMenuOpen(false); }}
                className="text-left text-xs font-medium uppercase tracking-wider py-2 text-slate-300 hover:text-white"
              >
                About us
              </button>
              <button
                onClick={() => { setActiveTabTab('plans'); setMobileMenuOpen(false); }}
                className="text-left text-xs font-medium uppercase tracking-wider py-2 text-slate-300 hover:text-white"
              >
                Plans
              </button>
              <button
                onClick={() => { setActiveTabTab('contact'); setMobileMenuOpen(false); }}
                className="text-left text-xs font-medium uppercase tracking-wider py-2 text-slate-300 hover:text-white"
              >
                Contact us
              </button>

              {auth.token && !auth.isAdmin && (
                <button
                  onClick={() => { setActiveTabTab('dashboard'); setMobileMenuOpen(false); }}
                  className="text-left text-xs font-medium uppercase tracking-wider py-2 text-indigo-400"
                >
                  Health Workspace
                </button>
              )}

              {auth.token && auth.isAdmin && (
                <button
                  onClick={() => { setActiveTabTab('admin'); setMobileMenuOpen(false); }}
                  className="text-left text-xs font-medium uppercase tracking-wider py-2 text-indigo-400"
                >
                  Admin Console
                </button>
              )}
            </div>

            <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
              {auth.token ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 font-medium">
                    Logged in as <span className="font-bold text-white">{auth.user?.name || 'Admin'}</span>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs p-2.5 rounded-xl text-center"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="border border-white/10 hover:bg-white/5 text-white font-semibold text-xs p-2.5 rounded-xl text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs p-2.5 rounded-xl text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content body stage */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'home' && (
          <HomeView
            onOpenAuth={openAuthModal}
            onNavigateToPlans={() => setActiveTabTab('plans')}
            isLoggedIn={!!auth.token}
            userName={auth.user?.name}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'plans' && (
          <PlansView
            onSelectPlan={handleSelectPlan}
            isLoggedIn={!!auth.token}
            currentMembership={auth.user?.membershipType || 'None'}
            onOpenAuth={openAuthModal}
          />
        )}

        {activeTab === 'contact' && <ContactView />}

        {activeTab === 'dashboard' && auth.token && (
          <MemberDashboard
            workouts={workouts}
            subscriptions={subscriptions}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            userProfile={auth.user}
          />
        )}

        {activeTab === 'admin' && auth.token && auth.isAdmin && (
          <AdminDashboard token={auth.token} />
        )}
      </main>

      {/* Structured Site Footer block */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs text-slate-500 font-sans tracking-tight">
            © 2026 HealthFit Club inc. Sector 12, Sirsa, Haryana 125001. All rights reserved. Registered with local Indian fitness body.
          </p>
          <div className="flex justify-center gap-1 text-[10px] text-slate-600 font-mono tracking-wider uppercase">
            <span>Power cage limits enabled</span>
            <span>•</span>
            <span>Local SSL Payments Active</span>
          </div>
        </div>
      </footer>

      {/* Login / SignUp Registration Popup Modalert */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
