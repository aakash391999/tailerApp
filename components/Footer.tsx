import React from 'react';
import { Phone, MapPin, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-lg font-serif font-bold mb-4">Majeed Elite Tailor</h3>
          <p className="text-sm leading-relaxed">
            Crafting elegance since 1995. We bring modern style to traditional tailoring with our premium home pickup and delivery service.
          </p>
        </div>

        <div>
          <h3 className="text-white text-lg font-serif font-bold mb-4">Quick Contact</h3>
          <ul className="space-y-3">
            <li className="flex items-center"><Phone className="h-5 w-5 mr-2 text-gold-500" /> +91 84270 87565</li>
            <li className="flex items-center"><MessageCircle className="h-5 w-5 mr-2 text-gold-500" /> WhatsApp Support</li>
            <li className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-gold-500" /> Master ji market, Mohan Nagar, Dera Bassi, Punjab 140507
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-lg font-serif font-bold mb-4">Opening Hours</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Mon - Sat:</span> <span>9:00 AM - 9:00 PM</span></li>

          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-xs">
        &copy; {new Date().getFullYear()} Majeed Elite Tailor. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;