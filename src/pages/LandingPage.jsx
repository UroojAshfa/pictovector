import React, { useState, useEffect } from 'react';
import { Search, Upload, Image, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const demoImages = [
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', query: 'sunset at beach' },
    { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', query: 'cute cat playing' },
    { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', query: 'delicious food' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % demoImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Image className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Fotopico
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
              <button 
                onClick={() => navigate('/search')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105"
              >
                Go to Search
              </button>
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-indigo-900 to-pink-900 bg-clip-text text-transparent leading-tight">
              Search Your Visual Memory
              <br />
              With Intelligence
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Upload photos. Search naturally. Find anything instantly.
              <br />
            </p>

            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative group cursor-pointer" onClick={() => navigate('/search')}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Try: sunrise at the park..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg bg-white/80 backdrop-blur-sm shadow-lg transition-all cursor-pointer"
                  readOnly
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-16">
              <button 
                onClick={() => navigate('/upload')}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Upload Photos
              </button>
              <button 
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200"
              >
                Try Demo Images
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-20">
            {demoImages.map((img, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-700 cursor-pointer ${
                  idx === currentImageIndex ? 'scale-105 ring-4 ring-indigo-500' : 'scale-100 opacity-70'
                }`}
                onClick={() => navigate('/search')}
              >
                <img
                  src={img.url}
                  alt={img.query}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Search className="w-4 h-4" />
                    <span>"{img.query}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <p className="text-2xl font-semibold text-gray-800 mb-8">
            No more scrolling through endless camera rolls.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Tagging</h3>
              <p className="text-gray-600">
                Analyze visual objects, emotions and context automatically
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Natural Search</h3>
              <p className="text-gray-600">
                Seamless search experience with any language
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Confidence Scores</h3>
              <p className="text-gray-600">
                Each result matches your search with transparent scoring
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-pink-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to find your memories?</h2>
            <p className="text-xl mb-8 opacity-90">Start organizing your photos with Fotopico today</p>
            <button 
              onClick={() => navigate('/upload')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
          <p>© 2025 Fotopico. Built for AI Genesis Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;