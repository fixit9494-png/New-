import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getServices, createBooking, Service } from '../services/bookingService';
import { Timestamp } from 'firebase/firestore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchServices = async () => {
        const data = await getServices();
        setServices(data);
      };
      fetchServices();
    }
  }, [isOpen]);

  const handleBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const start = new Date(`${selectedDate}T${selectedTime}`);
      const end = new Date(start.getTime() + selectedService.duration * 60000);

      await createBooking({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Guest',
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        startTime: Timestamp.fromDate(start),
        endTime: Timestamp.fromDate(end),
        status: 'confirmed',
        createdAt: Timestamp.now(),
      });

      setBooked(true);
      setStep(4);
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setBooked(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="serif text-3xl text-[#5a5a40]">
              {step === 4 ? 'Confirmed' : 'Book Appointment'}
            </h2>
            <button onClick={reset} className="p-2 hover:bg-[#f5f5f0] rounded-full transition-colors">
              <X size={24} className="text-[#8a8a7a]" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-[#8a8a7a] mb-4">Select a service to begin</p>
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setStep(2); }}
                      className="flex justify-between items-center p-4 border border-[#e8e4d9] rounded-2xl hover:bg-[#fdfcf8] hover:border-[#5a5a40] transition-all text-left"
                    >
                      <div>
                        <p className="font-medium text-[#4a4a3a]">{service.name}</p>
                        <p className="text-xs text-[#8a8a7a]">{service.duration} mins</p>
                      </div>
                      <p className="font-semibold text-[#5a5a40]">${service.price}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-[#6a6a5a] mb-2">Select Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-4 border border-[#e8e4d9] rounded-2xl focus:outline-none focus:border-[#5a5a40]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6a6a5a] mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-xl border text-sm transition-all ${
                          selectedTime === time
                            ? 'bg-[#5a5a40] text-white border-[#5a5a40]'
                            : 'border-[#e8e4d9] text-[#6a6a5a] hover:border-[#5a5a40]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 text-[#8a8a7a] font-medium">Back</button>
                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(3)}
                    className="flex-[2] py-4 bg-[#5a5a40] text-white rounded-2xl font-medium disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-[#6a6a5a] mb-6">Please sign in to complete your booking</p>
                    <button
                      onClick={login}
                      className="w-full py-4 bg-[#5a5a40] text-white rounded-2xl font-medium"
                    >
                      Sign in with Google
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#fdfcf8] p-6 rounded-3xl border border-[#e8e4d9]">
                      <h4 className="font-medium text-[#4a4a3a] mb-4">Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#8a8a7a]">Service</span>
                          <span className="text-[#4a4a3a]">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8a8a7a]">Date</span>
                          <span className="text-[#4a4a3a]">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8a8a7a]">Time</span>
                          <span className="text-[#4a4a3a]">{selectedTime}</span>
                        </div>
                        <div className="pt-3 border-t border-[#e8e4d9] flex justify-between font-semibold">
                          <span className="text-[#4a4a3a]">Total</span>
                          <span className="text-[#5a5a40]">${selectedService?.price}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={loading}
                      onClick={handleBooking}
                      className="w-full py-4 bg-[#5a5a40] text-white rounded-2xl font-medium flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Booking'}
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="serif text-2xl text-[#4a4a3a] mb-2">Appointment Scheduled!</h3>
                <p className="text-[#8a8a7a] mb-8">
                  A confirmation email has been sent to <span className="text-[#5a5a40] font-medium">{user?.email}</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-[#8a8a7a] mb-8">
                  <Mail size={14} />
                  <span>Check your inbox for details</span>
                </div>
                <button
                  onClick={reset}
                  className="w-full py-4 bg-[#5a5a40] text-white rounded-2xl font-medium"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
