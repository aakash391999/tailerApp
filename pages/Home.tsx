import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Scissors, Clock, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-slate-900 h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://media.istockphoto.com/id/543079836/photo/measuring-front-of-jacket.webp?s=1024x1024&w=is&k=20&c=eI2liJ7nQCfr_FItEzQqg1X-px_4CXO4GXXMLee-jcE="
            alt="Tailor working"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Experience the <span className="text-gold-500">Perfect Fit</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 font-light">
            Premium stitching at your doorstep. We pick up, stitch, and deliver.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book" className="bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold py-3 px-8 rounded-full transition transform hover:scale-105 shadow-lg">
              Book Home Pickup
            </Link>
            <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold py-3 px-8 rounded-full transition">
              View Prices
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-gray-600">Get your clothes stitched without leaving your home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Clock className="h-10 w-10 text-gold-500" />, title: "1. Book Online", desc: "Select service and schedule a pickup time." },
              { icon: <Truck className="h-10 w-10 text-gold-500" />, title: "2. We Pickup", desc: "Our expert visits to take measurements & cloth." },
              { icon: <Scissors className="h-10 w-10 text-gold-500" />, title: "3. We Stitch", desc: "Premium stitching with quality checks." },
              { icon: <CheckCircle className="h-10 w-10 text-gold-500" />, title: "4. Delivery", desc: "Get your perfectly fitted clothes delivered." },
            ].map((step, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-xl text-center shadow-sm hover:shadow-md transition">
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1925&auto=format&fit=crop" alt="Suits" className="rounded-lg shadow-2xl" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Why Majeed Elite?</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-gold-500 p-1 rounded-full mr-3 mt-1"><CheckCircle className="h-4 w-4 text-white" /></div>
                <div>
                  <h4 className="font-bold text-lg">Expert Craftsmanship</h4>
                  <p className="text-gray-600">Over 25 years of experience in bespoke tailoring.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-gold-500 p-1 rounded-full mr-3 mt-1"><CheckCircle className="h-4 w-4 text-white" /></div>
                <div>
                  <h4 className="font-bold text-lg">Express Delivery</h4>
                  <p className="text-gray-600">Need it urgent? Get stitching done in 48 hours.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-gold-500 p-1 rounded-full mr-3 mt-1"><CheckCircle className="h-4 w-4 text-white" /></div>
                <div>
                  <h4 className="font-bold text-lg">Convenience First</h4>
                  <p className="text-gray-600">Save time with our home pickup service.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;