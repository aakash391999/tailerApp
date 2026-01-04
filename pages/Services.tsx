import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../services/serviceService';
import { Service } from '../types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to load services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900">Our Services & Pricing</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Transparent pricing for premium quality. Final price depends on design customization and lining requirements.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-lg">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                <div className="h-48 overflow-hidden">
                  <img src={service.img} alt={service.name} className="w-full h-full object-cover transform hover:scale-110 transition duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{service.name}</h3>
                    <span className="text-gold-600 font-bold text-lg">{service.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{service.desc}</p>
                  <Link to="/book" className="block w-full text-center bg-slate-900 text-white py-2 rounded-md hover:bg-gold-500 hover:text-slate-900 transition-colors font-medium">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;