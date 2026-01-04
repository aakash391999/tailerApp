import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../services/bookingService';
import { Booking, BookingStatus, User, Measurements } from '../types';
import { Clock, MapPin, Scissors, AlertTriangle, RefreshCw, User as UserIcon, Mail, Phone, Calendar, LogOut, CheckCircle } from 'lucide-react';
import MeasurementForm from '../components/MeasurementForm';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Profile: React.FC = () => {
  const { user, logout, resendVerification, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'measurements'>('details');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!user) return null;

  const handleSaveMeasurements = async (measurements: Measurements) => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { measurements });
      // Refresh local user context to reflect changes
      await refreshUser();
      alert("Measurements saved successfully!");
    } catch (error) {
      console.error("Error saving measurements: ", error);
      alert("Failed to save measurements.");
    }
  };

  useEffect(() => {
    if (user) {
      // Get bookings
      const fetchMyBookings = async () => {
        const allBookings = await getBookings(user.id);
        setMyBookings(allBookings);
      };

      fetchMyBookings();

      // Auto check verification status if not verified
      if (!user.emailVerified) {
        refreshUser().catch(console.error);
      }
    }
  }, [user?.id]); // Depend on ID so we don't loop endlessly if user object changes references

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000); // Hide success msg after 5s
    } catch (error) {
      console.error("Failed to resend verification email", error);
    }
  };

  const handleRefreshUser = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (e) {
      console.error("Failed to refresh user", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING: return 'text-yellow-600 bg-yellow-50';
      case BookingStatus.MEASUREMENT_TAKEN: return 'text-indigo-600 bg-indigo-50';
      case BookingStatus.CUTTING: return 'text-purple-600 bg-purple-50';
      case BookingStatus.STITCHING: return 'text-pink-600 bg-pink-50';
      case BookingStatus.TRIAL: return 'text-orange-600 bg-orange-50';
      case BookingStatus.READY: return 'text-green-600 bg-green-50';
      case BookingStatus.DELIVERED: return 'text-gray-600 bg-gray-50';
      case BookingStatus.CANCELLED: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Email Verification Warning */}
        {user && !user.emailVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 shadow-sm rounded-r-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 font-medium">
                    Your email address is not verified.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Please verify to secure your account and receive order updates.
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center space-x-4 pl-8 sm:pl-0">
                <button
                  onClick={handleRefreshUser}
                  disabled={isRefreshing}
                  className="text-sm text-slate-600 hover:text-slate-900 flex items-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Check Status
                </button>

                {verificationSent ? (
                  <span className="text-sm font-medium text-green-600">Email sent!</span>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    className="text-sm font-medium text-yellow-700 underline hover:text-yellow-600"
                  >
                    Resend Email
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-4 text-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'details' ? 'border-gold-500 text-slate-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('measurements')}
              className={`flex-1 py-4 text-center font-medium text-sm transition-colors border-b-2 ${activeTab === 'measurements' ? 'border-gold-500 text-slate-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              My Measurements
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="p-8 pt-0">
              {/* Profile Header */}
              <div className="flex items-center mb-8">
                <div className="h-20 w-20 rounded-full bg-slate-900 text-gold-500 flex items-center justify-center text-3xl font-serif font-bold mr-6">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">{user.name}</h1>
                  <p className="text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center border-b pb-4">
                  <Mail className="h-5 w-5 text-gold-500 mr-4" />
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Email</span>
                    <span className="text-gray-900">{user.email}</span>
                    {user.emailVerified ? (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </span>
                    ) : (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Unverified
                        </span>
                        <button
                          onClick={resendVerification}
                          className="ml-2 text-xs text-blue-600 hover:underline"
                        >
                          Resend Verification
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Phone if available */}
                {user.phone && (
                  <div className="flex items-center border-b pb-4">
                    <Phone className="h-5 w-5 text-gold-500 mr-4" />
                    <div>
                      <span className="block text-xs font-bold text-gray-500 uppercase">Phone</span>
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center border-b pb-4">
                  <Calendar className="h-5 w-5 text-gold-500 mr-4" />
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Member Since</span>
                    <span className="text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="mr-2 h-5 w-5" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 pt-0">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Digital Measurement Card</h2>
                <p className="text-gray-500 text-sm">Update your measurements here. These will be used as a reference for your orders.</p>
              </div>
              <MeasurementForm
                initialMeasurements={user.measurements}
                onSave={handleSaveMeasurements}
              />
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-gold-500" /> Order History
        </h2>

        {myBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <a href="#/book" className="inline-block bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition">
              Book your first appointment
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center mb-2 md:mb-0">
                    <div className="bg-slate-100 p-2 rounded-lg mr-4">
                      <Scissors className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{booking.serviceType}</h3>
                      <p className="text-sm text-gray-500">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Appointment: <span className="font-medium">{booking.date}</span></span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{booking.address || 'Shop Visit'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;