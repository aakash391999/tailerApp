import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, User, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path ? "text-gold-500 font-bold" : "text-gray-300 hover:text-white";

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-gold-500" />
            <span className="font-serif text-xl font-bold tracking-wider">MAJEED <span className="text-gold-500">ELITE</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <Link to="/" className={isActive('/')}>Home</Link>
              <Link to="/services" className={isActive('/services')}>Services</Link>
              <Link to="/gallery" className={isActive('/gallery')}>Gallery</Link>
              <Link to="/style-advisor" className={isActive('/style-advisor')}>AI Stylist</Link>

              {isAuthenticated ? (
                <>
                  {isAdmin && <Link to="/admin" className={isActive('/admin')}>Shop Manager</Link>}
                  {user?.role === 'tailor' && <Link to="/tailor" className={isActive('/tailor')}>Tailor Workspace</Link>}
                  <Link to="/orders" className={isActive('/orders')}>My Orders</Link>
                  <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-700">
                    <Link to="/profile" className="text-sm text-gold-500 font-medium hover:text-white transition flex items-center">
                      Hi, {user?.name.split(' ')[0]}
                      {user && !user.emailVerified && (
                        <span className="ml-2 flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-white transition"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4 ml-4">
                  <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
                  <Link to="/book" className="bg-gold-500 hover:bg-gold-600 text-slate-900 px-4 py-2 rounded-md font-bold transition-colors">
                    Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link onClick={() => setIsOpen(false)} to="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">Home</Link>
            <Link onClick={() => setIsOpen(false)} to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">Services</Link>
            <Link onClick={() => setIsOpen(false)} to="/gallery" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">Gallery</Link>
            <Link onClick={() => setIsOpen(false)} to="/style-advisor" className="block px-3 py-2 rounded-md text-base font-medium text-gold-400 hover:bg-gray-700">AI Stylist</Link>

            {isAuthenticated ? (
              <>
                {isAdmin && <Link onClick={() => setIsOpen(false)} to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">Shop Manager</Link>}
                {user?.role === 'tailor' && <Link onClick={() => setIsOpen(false)} to="/tailor" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">Tailor Workspace</Link>}
                <Link onClick={() => setIsOpen(false)} to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">My Orders</Link>
                <Link onClick={() => setIsOpen(false)} to="/profile" className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">
                  My Profile
                  {user && !user.emailVerified && <AlertCircle className="h-4 w-4 text-red-400" />}
                </Link>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700">Logout</button>
              </>
            ) : (
              <>
                <Link onClick={() => setIsOpen(false)} to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700">Login / Signup</Link>
                <Link onClick={() => setIsOpen(false)} to="/book" className="block w-full text-center mt-4 bg-gold-500 text-slate-900 px-3 py-3 rounded-md font-bold">Book Appointment</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;