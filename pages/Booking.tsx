import React, { useState, useEffect } from 'react';
import { ServiceType, AppointmentType } from '../types';
import { saveBooking, generateWhatsAppLink } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Calendar, MapPin, Scissors, MessageCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Booking: React.FC = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    serviceType: ServiceType.PANT,
    appointmentType: AppointmentType.PICKUP,
    date: '',
    notes: ''
  });

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name,
        // We could also pre-fill email if we stored it in the booking, but basic info is name/phone
      }));
    }
  }, [user]);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastBooking, setLastBooking] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pass user.id to ensure the booking is linked to the account
    const booking = await saveBooking(formData, user?.id);
    setLastBooking(booking);
    setSubmitted(true);
  };

  const handleWhatsAppRedirect = () => {
    if (lastBooking) {
      window.open(generateWhatsAppLink(lastBooking), '_blank');
    }
  };

  // Enforce email verification for logged-in users
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-yellow-500">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Verification Required</h2>
          <p className="text-gray-600 mb-8">
            To ensure the security of your orders, please verify your email address before booking an appointment.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-bold rounded-xl text-slate-900 bg-gold-500 hover:bg-gold-600 transition-colors shadow-lg"
          >
            Go to Profile to Verify <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            Thank you {formData.customerName}. We have received your request.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg animate-pulse"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Send to Majeed on WhatsApp
            </button>
            <p className="text-xs text-gray-500">
              Sending via WhatsApp ensures faster confirmation.
            </p>
            <button
              onClick={() => { setSubmitted(false); setFormData({ ...formData, customerName: user?.name || '', phone: '', address: '', notes: '' }); }}
              className="text-slate-600 hover:text-slate-900 font-medium underline"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 py-6 px-8">
          <h2 className="text-2xl font-serif font-bold text-white flex items-center">
            <Calendar className="mr-3 text-gold-500" /> Book Appointment
          </h2>
          <p className="text-gray-400 mt-1">Fill the form below to schedule a visit or pickup.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, appointmentType: AppointmentType.PICKUP })}
                className={`flex items-center justify-center p-4 border rounded-xl transition ${formData.appointmentType === AppointmentType.PICKUP
                    ? 'border-gold-500 bg-gold-50 text-slate-900 ring-1 ring-gold-500'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
              >
                <MapPin className="mr-2 h-5 w-5" /> Home Pickup
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, appointmentType: AppointmentType.VISIT })}
                className={`flex items-center justify-center p-4 border rounded-xl transition ${formData.appointmentType === AppointmentType.VISIT
                    ? 'border-gold-500 bg-gold-50 text-slate-900 ring-1 ring-gold-500'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
              >
                <Scissors className="mr-2 h-5 w-5" /> Visit Shop
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                required
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-3 border"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-3 border"
                placeholder="WhatsApp Number preferred"
              />
            </div>
          </div>

          {formData.appointmentType === AppointmentType.PICKUP && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-3 border"
                placeholder="Full address for pickup"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Required</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-3 border"
              >
                {Object.values(ServiceType).map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-3 border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-gold-500 focus:border-gold-500 p-3 border"
              placeholder="Urgent delivery, specific fabric, etc."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;