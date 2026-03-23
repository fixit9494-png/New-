import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, History, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, Booking } from '../services/bookingService';

export const BookingsList: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserBookings(user.uid, (data) => {
      // Sort by start time
      const sorted = [...data].sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis());
      setBookings(sorted);
    });

    return () => unsubscribe();
  }, [user]);

  const now = Date.now();
  const filteredBookings = bookings.filter(b => {
    const isPast = b.startTime.toMillis() < now;
    return filter === 'past' ? isPast : !isPast;
  });

  if (!user) return null;

  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#5a5a40]/10 rounded-xl text-[#5a5a40]">
            <Calendar size={24} />
          </div>
          <h2 className="serif text-3xl text-[#4a4a3a]">Your Appointments</h2>
        </div>

        <div className="flex bg-[#f0f0eb] p-1 rounded-xl">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'upcoming' 
                ? 'bg-white text-[#5a5a40] shadow-sm' 
                : 'text-[#8a8a7a] hover:text-[#5a5a40]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'past' 
                ? 'bg-white text-[#5a5a40] shadow-sm' 
                : 'text-[#8a8a7a] hover:text-[#5a5a40]'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredBookings.length > 0 ? (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4"
          >
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-[#e8e4d9] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#5a5a40]/30 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <div className={`p-3 rounded-xl ${
                    booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {booking.status === 'confirmed' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4a4a3a] text-lg">{booking.serviceName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-[#8a8a7a]">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{booking.startTime.toDate().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{booking.startTime.toDate().toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                  {filter === 'upcoming' && booking.status === 'confirmed' && (
                    <button className="text-sm text-[#8a8a7a] hover:text-red-500 transition-colors underline underline-offset-4">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#fdfcf8] border-2 border-dashed border-[#e8e4d9] rounded-[2rem]"
          >
            <div className="text-[#8a8a7a] mb-4">
              {filter === 'upcoming' ? <Sparkles size={48} className="mx-auto opacity-20" /> : <History size={48} className="mx-auto opacity-20" />}
            </div>
            <p className="serif text-xl text-[#8a8a7a]">
              {filter === 'upcoming' ? "No upcoming appointments scheduled." : "No past appointments found."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
