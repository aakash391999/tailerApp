import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../services/bookingService';
import { Booking, BookingStatus } from '../types';
import { Clock, MapPin, Scissors, Calendar, Package, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        try {
          // Pass user.id to getBookings to fetch only relevant data from Firestore
          // This is more efficient and secure than fetching all and filtering
          const userBookings = await getBookings(user.id);
          setMyBookings(userBookings);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        }
      };

      fetchBookings();
    }
  }, [user]);

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case BookingStatus.MEASUREMENT_TAKEN: return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.READY: return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.DELIVERED: return 'bg-gray-100 text-gray-800 border-gray-200';
      case BookingStatus.CUTTING: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case BookingStatus.STITCHING: return 'bg-purple-100 text-purple-800 border-purple-200';
      case BookingStatus.TRIAL: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center">
              <Package className="mr-3 text-gold-500 h-8 w-8" /> My Orders
            </h1>
            <p className="text-gray-500 mt-1 ml-11">Track your stitching status and history.</p>
          </div>
          <Link to="/book" className="hidden sm:inline-flex items-center px-6 py-2 border border-transparent text-sm font-bold rounded-full text-white bg-slate-900 hover:bg-slate-800 shadow-lg transform hover:scale-105 transition-all">
            + New Order
          </Link>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6">
              <Scissors className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Your wardrobe is waiting for an upgrade. Book your first appointment for home pickup or a shop visit.
            </p>
            <Link to="/book" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-gold-500 hover:bg-gold-600 transition-colors shadow-md">
              Start Booking
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Service Details</div>
              <div className="col-span-3">Date & Time</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-gray-100">
              {myBookings.map((booking) => (
                <div key={booking.id} className="group hover:bg-gray-50 transition-colors duration-150">
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center">
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${booking.appointmentType === 'Home Pickup' ? 'bg-indigo-50 text-indigo-600' : 'bg-gold-50 text-gold-600'}`}>
                          {booking.appointmentType === 'Home Pickup' ? <MapPin className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{booking.serviceType}</p>
                          <p className="text-xs text-gray-500">ID: #{booking.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium">{booking.date}</span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <button className="text-gray-400 hover:text-slate-900">
                        <ChevronRight className="h-5 w-5 ml-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${booking.appointmentType === 'Home Pickup' ? 'bg-indigo-50 text-indigo-600' : 'bg-gold-50 text-gold-600'}`}>
                          {booking.appointmentType === 'Home Pickup' ? <MapPin className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{booking.serviceType}</h3>
                          <p className="text-xs text-gray-500">#{booking.id.toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 pl-12">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      {booking.appointmentType === 'Home Pickup' && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Pickup</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;