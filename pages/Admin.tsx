import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, updateBookingMeasurements, assignBooking } from '../services/bookingService';
import { getAllUsers, updateUserRole } from '../services/authService';
import { getServices, addService, deleteService } from '../services/serviceService';
import { Booking, BookingStatus, Measurements, User, Service } from '../types';
import { RefreshCw, Phone, MapPin, Ruler, Save, X, Edit3, Users, Briefcase, UserPlus, CheckCircle, UserMinus, Plus, Scissors } from 'lucide-react';
import MeasurementForm from '../components/MeasurementForm';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'staff' | 'services'>('orders');

  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tailors, setTailors] = useState<User[]>([]);

  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Bookings
    const bookingData = await getBookings();
    setBookings(bookingData.sort((a, b) => b.createdAt - a.createdAt));

    // Fetch Users for Staff Management
    const userData = await getAllUsers();
    setUsers(userData);
    setTailors(userData.filter(u => u.role === 'tailor'));

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Staff Management ---
  const handlePromoteStaff = async (userId: string) => {
    if (confirm("Promote this user to Tailor/Staff?")) {
      await updateUserRole(userId, 'tailor');
      fetchData(); // Refresh list
    }
  };

  const handleDemoteStaff = async (userId: string) => {
    if (confirm("Remove staff access for this user?")) {
      await updateUserRole(userId, 'customer');
      fetchData(); // Refresh list
    }
  };

  // --- Booking Management ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateBookingStatus(id, newStatus as BookingStatus);
    fetchData();
  };

  const handleSaveMeasurements = async (measurements: Measurements) => {
    if (selectedBooking) {
      await updateBookingMeasurements(selectedBooking.id, measurements);
      fetchData();
      setIsMeasurementModalOpen(false);
    }
  };

  const handleAssignTailor = async (tailorId: string, tailorName: string) => {
    if (selectedBooking) {
      await assignBooking(selectedBooking.id, tailorId, tailorName);
      fetchData();
      setIsAssignModalOpen(false);
    }
  };

  const openMeasurementModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsMeasurementModalOpen(true);
  };

  const openAssignModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsAssignModalOpen(true);
  };

  // --- Helpers ---
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.MEASUREMENT_TAKEN: return 'bg-indigo-100 text-indigo-800';
      case BookingStatus.CUTTING: return 'bg-purple-100 text-purple-800';
      case BookingStatus.STITCHING: return 'bg-pink-100 text-pink-800';
      case BookingStatus.TRIAL: return 'bg-orange-100 text-orange-800';
      case BookingStatus.READY: return 'bg-green-100 text-green-800';
      case BookingStatus.DELIVERED: return 'bg-gray-100 text-gray-800';
      case BookingStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActiveLoad = (tailorId: string) => {
    return bookings.filter(b => b.assignedTo === tailorId && b.status !== BookingStatus.DELIVERED && b.status !== BookingStatus.CANCELLED).length;
  };

  const filteredBookings = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  // --- Services Manager Component (Inline for Simplicity) ---
  const ServicesManager = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', desc: '', img: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchInternalServices = async () => {
      setIsLoading(true);
      const data = await getServices();
      setServices(data);
      setIsLoading(false);
    };

    useEffect(() => {
      fetchInternalServices();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setImageFile(e.target.files[0]);
      }
    };

    const handleAddService = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        let imageUrl = newService.img;

        if (imageFile) {
          setUploading(true);
          const { storage } = await import('../services/firebase');
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const storageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
          const snapshot = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(snapshot.ref);
          setUploading(false);
        }

        await addService({ ...newService, img: imageUrl });
        setNewService({ name: '', price: '', desc: '', img: '' });
        setImageFile(null);
        fetchInternalServices();
      } catch (error) {
        setUploading(false);
        alert('Failed to add service. Check console for details.');
        console.error(error);
      }
    };

    const handleDeleteService = async (id: string) => {
      if (confirm('Are you sure you want to delete this service?')) {
        await deleteService(id);
        fetchInternalServices();
      }
    };

    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Manage Services</h2>

        {/* Add Service Form */}
        <form onSubmit={handleAddService} className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
          <h3 className="text-sm font-bold uppercase text-gray-500 mb-4">Add New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Service Name (e.g. Suit)" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} className="p-2 border rounded" required />
            <input type="text" placeholder="Price (e.g. ₹2500+)" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} className="p-2 border rounded" required />
          </div>
          <div className="mb-4">
            <input type="text" placeholder="Description" value={newService.desc} onChange={e => setNewService({ ...newService, desc: e.target.value })} className="w-full p-2 border rounded" required />
          </div>
          <div className="mb-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Service Image</label>
            <input type="text" placeholder="Image URL (Unsplash link) or Upload File below" value={newService.img} onChange={e => setNewService({ ...newService, img: e.target.value })} className="w-full p-2 border rounded mb-2" />
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">OR</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100" />
            </div>
          </div>
          <button type="submit" disabled={uploading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center disabled:opacity-50">
            {uploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            {uploading ? 'Uploading...' : 'Add Service'}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? <p>Loading...</p> : services.map(service => (
            <div key={service.id} className="border p-4 rounded-lg flex justify-between items-center group hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <img src={service.img} alt={service.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h4 className="font-bold">{service.name}</h4>
                  <p className="text-sm text-gray-500">{service.price}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteService(service.id)} className="text-red-500 hover:text-red-700 p-2 opacity-0 group-hover:opacity-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        {activeTab === 'services' && services.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center py-8">No services found. Add one above.</p>
        )}
      </div>
    );
  };

  // --- Stats Calculation ---
  const stats = {
    totalOrders: bookings.length,
    pendingOrders: bookings.filter(b => b.status === BookingStatus.PENDING).length,
    activeOrders: bookings.filter(b => b.status !== BookingStatus.DELIVERED && b.status !== BookingStatus.CANCELLED).length,
    totalUsers: users.length,
    totalTailors: tailors.length
  };

  // --- Tailor Details Modal ---
  const [selectedTailor, setSelectedTailor] = useState<User | null>(null);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

  const openTailorModal = (tailor: User) => {
    setSelectedTailor(tailor);
    setIsTailorModalOpen(true);
  };

  const getTailorAssignments = (tailorId: string) => {
    return bookings.filter(b => b.assignedTo === tailorId).sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Shop Manager</h1>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg flex items-center transition ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Briefcase className="h-4 w-4 mr-2" /> Orders
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-lg flex items-center transition ${activeTab === 'staff' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Users className="h-4 w-4 mr-2" /> Staff & Users
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-lg flex items-center transition ${activeTab === 'services' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Scissors className="h-4 w-4 mr-2" /> Services
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3 py-2 bg-white text-slate-900 rounded-lg shadow hover:bg-gray-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* --- STATS DASHBOARD --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-slate-900">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-gold-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Active Staff</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalTailors}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Active Orders</p>
            <p className="text-2xl font-bold text-slate-900">{stats.activeOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
          </div>
        </div>

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <>
            {/* Filters */}
            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
              {['All', ...Object.values(BookingStatus)].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBookings.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-xl shadow">
                  <p className="text-gray-500 text-lg">No bookings found.</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gold-500 relative">
                    <button
                      onClick={() => openMeasurementModal(booking)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 transition"
                      title="Edit Measurements"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>

                    <div className="flex justify-between items-start mb-4 pr-10">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{booking.customerName}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Phone className="h-3 w-3 mr-1" /> {booking.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      {/* ASSIGNED PILL */}
                      {booking.assignedName ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800 flex items-center cursor-pointer hover:bg-blue-200" onClick={() => openAssignModal(booking)}>
                          <Users className="h-3 w-3 mr-1" /> {booking.assignedName}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-500 flex items-center cursor-pointer hover:bg-gray-200" onClick={() => openAssignModal(booking)}>
                          <UserPlus className="h-3 w-3 mr-1" /> Assign Tailor
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="block text-gray-400 text-xs">Service</span>
                        <span className="font-medium">{booking.serviceType}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-xs">Date</span>
                        <span className="font-medium">{booking.date}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-gray-400 text-xs">Address</span>
                        <div className="flex items-start">
                          <MapPin className="h-3 w-3 mt-1 mr-1 text-gray-400 flex-shrink-0" />
                          <span>{booking.address || 'Visit Shop'}</span>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 italic mb-4">
                        "{booking.notes}"
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Update Status</label>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="w-full p-2 border rounded-md text-sm bg-gray-50 focus:ring-gold-500 focus:border-gold-500"
                      >
                        {Object.values(BookingStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- STAFF & USERS TAB --- */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* TAILORS LIST */}
            <div className="bg-white rounded-xl shadow overflow-hidden h-fit">
              <div className="p-4 border-b border-gray-100 bg-gold-50">
                <h2 className="text-lg font-bold text-gold-900 flex items-center">
                  <Scissors className="h-5 w-5 mr-2" /> Active Tailors ({tailors.length})
                </h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {tailors.map(user => (
                  <li key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gold-100 text-gold-800 px-2 py-0.5 rounded uppercase font-bold">Tailor</span>
                          <span className="text-xs text-gray-500">{getActiveLoad(user.id)} Active Orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => openTailorModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="View Details">
                        <Briefcase className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDemoteStaff(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Remove Staff">
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {tailors.length === 0 && <li className="p-6 text-center text-gray-400 italic">No tailors active. Approve users below.</li>}
              </ul>
            </div>

            {/* CUSTOMERS LIST */}
            <div className="bg-white rounded-xl shadow overflow-hidden h-fit">
              <div className="p-4 border-b border-gray-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" /> Registered Users ({users.filter(u => u.role !== 'tailor' && u.role !== 'admin').length})
                </h2>
              </div>
              <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {users.filter(u => u.role !== 'tailor' && u.role !== 'admin').map(user => (
                  <li key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handlePromoteStaff(user.id)} className="text-xs font-medium text-white bg-slate-900 px-3 py-1.5 rounded hover:bg-gold-500 hover:text-slate-900 transition shadow-sm">
                      Approve as Tailor
                    </button>
                  </li>
                ))}
                {users.filter(u => u.role !== 'tailor' && u.role !== 'admin').length === 0 && <li className="p-6 text-center text-gray-400 italic">No customers found.</li>}
              </ul>
            </div>
          </div>
        )}

        {/* --- DEBUG SECTION (Temporary) --- */}
        {activeTab === 'staff' && (
          <div className="mt-8 p-4 bg-gray-200 rounded text-xs font-mono overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold">DEBUG INFO (Share this if list is empty):</p>
              <button
                onClick={async () => {
                  if (confirm("This will add 50+ items to your database. Continue?")) {
                    const { seedDatabase } = await import('../services/seedService');
                    await seedDatabase();
                    alert("Data Seeded! Refresh the page.");
                    fetchData();
                  }
                }}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 font-bold"
              >
                SEED DEMO DATA
              </button>
            </div>
            <p>Total Fetched Users: {users.length}</p>
            <p>Total Tailors Filtered: {tailors.length}</p>
            <pre>{JSON.stringify(users.slice(0, 3), null, 2)}</pre>
          </div>
        )}

        {/* --- SERVICES TAB --- */}
        {activeTab === 'services' && (
          <ServicesManager />
        )}

      </div>

      {/* Measurement Modal */}
      {isMeasurementModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setIsMeasurementModalOpen(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsMeasurementModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-lg font-bold mb-4">Measurements - {selectedBooking.customerName}</h3>
              <MeasurementForm
                initialMeasurements={selectedBooking.measurementsSnapshot || {}}
                onSave={handleSaveMeasurements}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assign Tailor Modal */}
      {isAssignModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setIsAssignModalOpen(false)}>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-lg font-bold mb-2">Assign Order</h3>
              <p className="text-sm text-gray-500 mb-6">Assign order #{selectedBooking.id.slice(0, 8)} to a staff member.</p>

              <div className="space-y-2">
                {tailors.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No staff members found. Go to 'Manage Staff' to promote users.</p>
                ) : (
                  tailors.map(tailor => (
                    <button
                      key={tailor.id}
                      onClick={() => handleAssignTailor(tailor.id, tailor.name)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border hover:border-gold-500 hover:bg-gold-50 transition"
                    >
                      <span className="font-medium text-slate-900">{tailor.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {getActiveLoad(tailor.id)} Active Tasks
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tailor Details Modal */}
      {isTailorModalOpen && selectedTailor && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setIsTailorModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full text-slate-900 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-serif font-bold">{selectedTailor.name}</h2>
                <p className="text-gray-300 text-sm">{selectedTailor.email}</p>
                <div className="mt-2 flex gap-2">
                  <span className="bg-gold-500 text-slate-900 px-2 py-0.5 rounded text-xs font-bold uppercase">Tailor</span>
                  <span className="bg-slate-700 font-mono text-white px-2 py-0.5 rounded text-xs">ID: {selectedTailor.id.slice(0, 6)}</span>
                </div>
              </div>
              <button onClick={() => setIsTailorModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 flex items-center border-b pb-2">
                <Briefcase className="h-5 w-5 mr-2 text-gold-600" />
                Assigned Workload
              </h3>

              {getTailorAssignments(selectedTailor.id).length === 0 ? (
                <p className="text-gray-500 italic py-4 text-center">No orders currently assigned.</p>
              ) : (
                <div className="space-y-4">
                  {getTailorAssignments(selectedTailor.id).map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-bold text-slate-800">{booking.serviceType}</p>
                        <p className="text-xs text-gray-500">Customer: {booking.customerName}</p>
                        <p className="text-xs text-gray-400">Order: #{booking.id.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{booking.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 text-right border-t">
              <button onClick={() => setIsTailorModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300 font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;