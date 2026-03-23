import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Trash2, Plus, Edit2, X, Check, Loader2, Users, Briefcase, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllBookings, 
  getServices, 
  addService, 
  updateService, 
  deleteService, 
  Booking, 
  Service 
} from '../services/bookingService';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'fixit9494@gmail.com';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for adding/editing service
  const [formData, setFormData] = useState({ name: '', description: '', duration: 60, price: 0 });

  useEffect(() => {
    if (!user || !isAdmin) return;
    
    // Fetch bookings
    const unsubscribeBookings = getAllBookings((data) => {
      setBookings([...data].sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis()));
    });

    // Fetch services
    const fetchServices = async () => {
      const data = await getServices();
      setServices(data);
    };
    fetchServices();

    return () => unsubscribeBookings();
  }, [user]);

  const handleSaveService = async () => {
    setLoading(true);
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await addService(formData);
      }
      setIsAdding(false);
      setEditingService(null);
      setFormData({ name: '', description: '', duration: 60, price: 0 });
      // Refresh services
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#e8e4d9] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-[#e8e4d9] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="serif text-3xl text-[#5a5a40] mb-1">Admin Dashboard</h2>
          <p className="text-sm text-[#8a8a7a]">Manage your wellness center operations</p>
        </div>
        
        <div className="flex bg-[#f0f0eb] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bookings' 
                ? 'bg-white text-[#5a5a40] shadow-sm' 
                : 'text-[#8a8a7a] hover:text-[#5a5a40]'
            }`}
          >
            <Users size={16} />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'services' 
                ? 'bg-white text-[#5a5a40] shadow-sm' 
                : 'text-[#8a8a7a] hover:text-[#5a5a40]'
            }`}
          >
            <Briefcase size={16} />
            Services
          </button>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' ? (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[#8a8a7a] text-xs uppercase tracking-widest border-b border-[#e8e4d9]">
                      <th className="pb-4 font-semibold">Client</th>
                      <th className="pb-4 font-semibold">Service</th>
                      <th className="pb-4 font-semibold">Date & Time</th>
                      <th className="pb-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e4d9]">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="text-sm">
                        <td className="py-4">
                          <p className="font-medium text-[#4a4a3a]">{booking.userName}</p>
                          <p className="text-xs text-[#8a8a7a]">{booking.userEmail}</p>
                        </td>
                        <td className="py-4 text-[#4a4a3a]">{booking.serviceName}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-[#4a4a3a]">
                            <Calendar size={14} />
                            {booking.startTime.toDate().toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-[#8a8a7a] text-xs">
                            <Clock size={14} />
                            {booking.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="serif text-xl text-[#4a4a3a]">Available Services</h3>
                <div className="flex w-full sm:w-auto gap-3">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a7a]" size={16} />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#fdfcf8] border border-[#e8e4d9] rounded-xl text-sm focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>
                  <button
                    onClick={() => { setIsAdding(true); setEditingService(null); setFormData({ name: '', description: '', duration: 60, price: 0 }); }}
                    className="flex items-center gap-2 bg-[#5a5a40] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4a4a3a] transition-colors shrink-0"
                  >
                    <Plus size={16} />
                    Add Service
                  </button>
                </div>
              </div>

              {(isAdding || editingService) && (
                <div className="bg-[#fdfcf8] p-6 rounded-3xl border border-[#e8e4d9] space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[#4a4a3a]">{editingService ? 'Edit Service' : 'New Service'}</h4>
                    <button onClick={() => { setIsAdding(false); setEditingService(null); }} className="text-[#8a8a7a]"><X size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="p-3 bg-white border border-[#e8e4d9] rounded-xl text-sm focus:outline-none focus:border-[#5a5a40]"
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="p-3 bg-white border border-[#e8e4d9] rounded-xl text-sm focus:outline-none focus:border-[#5a5a40]"
                    />
                    <input
                      type="number"
                      placeholder="Duration (mins)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="p-3 bg-white border border-[#e8e4d9] rounded-xl text-sm focus:outline-none focus:border-[#5a5a40]"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="p-3 bg-white border border-[#e8e4d9] rounded-xl text-sm focus:outline-none focus:border-[#5a5a40]"
                    />
                  </div>
                  <button
                    disabled={loading}
                    onClick={handleSaveService}
                    className="w-full py-3 bg-[#5a5a40] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services
                  .filter(service => 
                    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    service.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((service) => (
                    <div key={service.id} className="p-4 border border-[#e8e4d9] rounded-2xl flex justify-between items-center group hover:border-[#5a5a40]/30 transition-colors">
                    <div>
                      <p className="font-medium text-[#4a4a3a]">{service.name}</p>
                      <p className="text-xs text-[#8a8a7a]">{service.duration} mins • ${service.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingService(service); setFormData({ name: service.name, description: service.description, duration: service.duration, price: service.price }); }}
                        className="p-2 text-[#8a8a7a] hover:text-[#5a5a40] transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-[#8a8a7a] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
