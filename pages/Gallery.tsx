import React from 'react';

const Gallery: React.FC = () => {
  const images = [
    'https://images.unsplash.com/photo-1593030761757-71bd90dbe3e4?q=80&w=600',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600',
    'https://images.unsplash.com/photo-1594938298603-c8148c47e356?q=80&w=600',
    'https://images.unsplash.com/photo-1617137968427-85924c809a29?q=80&w=600',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600',
    'https://images.unsplash.com/photo-1589810635657-232948472d98?q=80&w=600',
  ];

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-serif font-bold text-center text-slate-900 mb-12">Our Masterpieces</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer h-80">
              <img src={img} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                 <p className="text-white font-serif font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Detail</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;