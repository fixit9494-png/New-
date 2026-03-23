import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Loader2, Info, Calendar, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchMassageServices, MassagePlace } from './services/massageService';
import { MassageCard } from './components/MassageCard';
import { BookingModal } from './components/BookingModal';
import { BookingsList } from './components/BookingsList';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { seedServices, testConnection } from './services/bookingService';
import ReactMarkdown from 'react-markdown';

function AppContent() {
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<MassagePlace[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [view, setView] = useState<'client' | 'admin'>('client');

  const isAdmin = user?.email === 'fixit9494@gmail.com';

  useEffect(() => {
    seedServices();
    testConnection();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          console.warn("Geolocation permission denied or failed.");
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchMassageServices(location || undefined);
      setPlaces(result.places);
      setSummary(result.text);
    } catch (err) {
      console.error(err);
      setError("Failed to find massage services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e4d9] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="serif text-2xl text-[#5a5a40] font-semibold tracking-tight">ZenTouch</div>
          <div className="flex items-center gap-6">
            {isAdmin && (
              <button 
                onClick={() => setView(view === 'client' ? 'admin' : 'client')}
                className="flex items-center gap-2 text-sm font-medium text-[#5a5a40] hover:opacity-70 transition-opacity"
              >
                {view === 'client' ? 'Admin Dashboard' : 'Client View'}
              </button>
            )}
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-[#5a5a40] hover:opacity-70 transition-opacity"
            >
              <Calendar size={18} />
              Book Now
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-[#e8e4d9]" />
                  <span className="hidden sm:block text-sm font-medium text-[#4a4a3a]">{user.displayName}</span>
                </div>
                <button onClick={logout} className="p-2 text-[#8a8a7a] hover:text-[#5a5a40] transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button onClick={login} className="flex items-center gap-2 text-sm font-medium text-[#5a5a40] border border-[#5a5a40] px-4 py-2 rounded-full hover:bg-[#5a5a40] hover:text-white transition-all">
                <User size={18} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[70vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544161515-4af6b1d462c2?q=80&w=2070&auto=format&fit=crop"
            alt="Relaxing spa environment"
            className="w-full h-full object-cover brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-[#fdfcf8]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/80 uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">
              Wellness & Serenity
            </span>
            <h1 className="serif text-5xl md:text-7xl text-white mb-8 leading-tight">
              ZenTouch
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-10 font-light max-w-xl mx-auto">
              Find the perfect full-service massage experience tailored to your relaxation needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="group relative flex items-center gap-3 bg-white text-[#5a5a40] px-8 py-4 rounded-full font-medium shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Search size={20} className="group-hover:rotate-12 transition-transform" />
                )}
                <span>{loading ? 'Searching...' : 'Find Near Me'}</span>
              </button>
              
              {!location && (
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Info size={14} />
                  <span>Enable location for better results</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Results Section */}
      <main className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <AnimatePresence mode="wait">
          {view === 'admin' && isAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <AdminDashboard />
            </motion.div>
          ) : (
            <>
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-16"
                >
                  <BookingsList />
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3"
                >
                  <Info size={18} />
                  <p>{error}</p>
                </motion.div>
              )}

              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8 rounded-[2rem] mb-12"
                >
                  <div className="flex items-center gap-3 mb-4 text-[#5a5a40]">
                    <Sparkles size={20} />
                    <h2 className="serif text-2xl">Expert Recommendations</h2>
                  </div>
                  <div className="prose prose-stone max-w-none text-[#4a4a3a] leading-relaxed">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place, idx) => (
                  <MassageCard key={idx} place={place} />
                ))}
              </div>

              {!loading && places.length === 0 && !error && !summary && (
                <div className="text-center py-20 opacity-40">
                  <MapPin size={48} className="mx-auto mb-4" />
                  <p className="serif text-xl">Start your journey to relaxation</p>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#e8e4d9] py-12 text-center text-[#8a8a7a]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="serif text-2xl mb-4 text-[#5a5a40]">ZenTouch</p>
          <p className="text-sm font-light">© 2026 ZenTouch Wellness. All rights reserved.</p>
        </div>
      </footer>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
