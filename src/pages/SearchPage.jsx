import React, { useState, useEffect } from 'react';
import { Search, Image, Upload, X, SlidersHorizontal, Grid, List, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useImages } from '../context/ImagesContext';
import { UserButton } from '@clerk/clerk-react';

const SearchPage = () => {
  const navigate = useNavigate();
  const { images, searchResults, popularTags, loading, fetchImages, searchImages, fetchTags } = useImages();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await fetchImages();
    await fetchTags();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await fetchImages();
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    await searchImages(searchQuery);
  };

  const displayResults = isSearching ? searchResults : images;

  const ImageDetailModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-8">
          <img
            src={`http://localhost:8000${image.url}`}
            alt="Selected"
            className="max-h-full max-w-full object-contain rounded-xl"
          />
        </div>
        
        <div className="w-96 bg-white p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Analysis</h3>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🏷️</span>
                <h4 className="font-semibold text-gray-800">Objects</h4>
              </div>
              <div className="space-y-2">
                {image.tags.map((tag, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{tag}</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {Math.floor(95 - idx * 5)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {image.scene && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌄</span>
                  <h4 className="font-semibold text-gray-800">Scene</h4>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{image.scene}</span>
                  <span className="text-sm font-semibold text-indigo-600">92%</span>
                </div>
              </div>
            )}

            {image.mood && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">😊</span>
                  <h4 className="font-semibold text-gray-800">Mood</h4>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{image.mood}</span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {Math.round(image.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}

            {image.description && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📝</span>
                  <h4 className="font-semibold text-gray-800">Description</h4>
                </div>
                <p className="text-gray-700 text-sm">{image.description}</p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📅</span>
                <h4 className="font-semibold text-gray-800">Uploaded</h4>
              </div>
              <span className="text-gray-700">
                {new Date(image.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Image className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                MemoryLens
              </span>
            </div>
            
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none bg-white/80"
              />
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            <button 
              onClick={() => navigate('/upload')}
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {popularTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => {
                    setSearchQuery(tag.label);
                    setIsSearching(true);
                    searchImages(tag.label);
                  }}
                  className="px-4 py-2 bg-white rounded-full border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm font-medium text-gray-700 hover:text-indigo-700"
                >
                  {tag.label} <span className="text-gray-500">({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isSearching ? `Search Results (${displayResults.length})` : `All Images (${displayResults.length})`}
            </h3>
            {isSearching && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearching(false);
                  fetchImages();
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : displayResults.length === 0 ? (
          <div className="text-center py-20">
            <Image className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isSearching ? 'No results found' : 'No images yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSearching ? 'Try a different search query' : 'Upload your first image to get started'}
            </p>
            {!isSearching && (
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
              >
                Upload Images
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {displayResults.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={`http://localhost:8000${image.url}`}
                  alt={image.filename}
                  className="w-full h-64 object-cover"
                />
                
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 ${getConfidenceColor(image.confidence * 100 || 90)} text-white rounded-full text-xs font-bold shadow-lg`}>
                    {Math.round(image.confidence * 100 || 90)}%
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;