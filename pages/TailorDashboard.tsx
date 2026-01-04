import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, updateBookingMeasurements } from '../services/bookingService';
import { Booking, BookingStatus, Measurements } from '../types';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Phone, MapPin, Ruler, Scissors, AlertCircle, CheckCircle } from 'lucide-react';
import MeasurementForm from '../components/MeasurementForm';

const TailorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);

    // Fetch only assigned bookings
    const fetchMyWork = async () => {
        if (!user) return;
        setLoading(true);
        const allBookings = await getBookings();
        const myWork = allBookings
            .filter(b => b.assignedTo === user.id)
            .sort((a, b) => b.createdAt - a.createdAt);
        setBookings(myWork);
        setLoading(false);
    };

    useEffect(() => {
        fetchMyWork();
    }, [user]);

    const handleStatusUpdate = async (id: string, status: BookingStatus) => {
        await updateBookingStatus(id, status);
        fetchMyWork();
    };

    const handleSaveMeasurements = async (measurements: Measurements) => {
        if (selectedBooking) {
            await updateBookingMeasurements(selectedBooking.id, measurements);
            fetchMyWork();
            setIsMeasurementModalOpen(false);
        }
    };

    const openMeasurementModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsMeasurementModalOpen(true);
    };

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.MEASUREMENT_TAKEN: return 'bg-indigo-100 text-indigo-800';
            case BookingStatus.CUTTING: return 'bg-purple-100 text-purple-800';
            case BookingStatus.STITCHING: return 'bg-pink-100 text-pink-800';
            case BookingStatus.TRIAL: return 'bg-orange-100 text-orange-800';
            case BookingStatus.READY: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center">
                            <Scissors className="mr-3 text-gold-500 h-8 w-8" />
                            Tailor Workspace
                        </h1>
                        <p className="text-gray-500 mt-1 ml-11">Hello, {user?.name}. Here is your assigned work.</p>
                    </div>
                    <button
                        onClick={fetchMyWork}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-white text-slate-900 rounded-lg shadow hover:bg-gray-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bookings.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl shadow border border-gray-100">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                            <p className="text-gray-500">You have no pending jobs right now.</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4 border-slate-900 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{booking.serviceType}</h3>
                                        <p className="text-sm text-gray-500">#{booking.id.slice(0, 8)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="block text-gray-400 text-xs uppercase">Customer</span>
                                        <span className="font-medium">{booking.customerName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 text-xs uppercase">Due Date</span>
                                        <span className="font-medium">{booking.date}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-gray-400 text-xs uppercase">Notes</span>
                                        <span className="italic text-gray-600">{booking.notes || "No notes"}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {/* Measurement Action */}
                                    <button
                                        onClick={() => openMeasurementModal(booking)}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-grat-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <Ruler className="h-4 w-4 mr-2 text-gold-500" />
                                        {booking.measurementsSnapshot && Object.keys(booking.measurementsSnapshot).length > 0 ? 'Update Measurements' : 'Take Measurements'}
                                    </button>

                                    {/* Status Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, BookingStatus.CUTTING)}
                                            className="flex items-center justify-center px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-bold"
                                        >
                                            Start Cutting
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, BookingStatus.STITCHING)}
                                            className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-bold"
                                        >
                                            Start Stitching
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, BookingStatus.TRIAL)}
                                            className="flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-bold"
                                        >
                                            Ready for Trial
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, BookingStatus.READY)}
                                            className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-bold"
                                        >
                                            Mark Ready
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Measurement Modal */}
            {isMeasurementModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsMeasurementModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg font-bold mb-4">Measurements for {selectedBooking.customerName}</h3>
                                <MeasurementForm
                                    initialMeasurements={selectedBooking.measurementsSnapshot || {}}
                                    onSave={handleSaveMeasurements}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TailorDashboard;
