import React, { useState, useEffect } from 'react';
import { Upload, X, Check, Loader, Image, ArrowLeft, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useImages } from '../context/ImagesContext';
import { UserButton } from '@clerk/clerk-react';

const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadImage, uploadProgress, fetchImages } = useImages();
  const [dragActive, setDragActive] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);

  useEffect(() => {
    loadRecentImages();
  }, []);

  const loadRecentImages = async () => {
    const result = await fetchImages();
    if (result.success) {
      setRecentUploads(result.data.slice(0, 6));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const result = await uploadImage(file);
        if (result.success) {
          setRecentUploads(prev => [result.data, ...prev].slice(0, 6));
        }
      }
    }
  };

  const getUploadStatus = (fileId) => {
    const progress = uploadProgress[fileId];
    if (!progress) return null;
    
    if (progress.status === 'complete') return 'complete';
    if (progress.status === 'error') return 'error';
    if (progress.status === 'uploading') return 'uploading';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'complete': return 'bg-green-100 text-green-700';
      case 'uploading': return 'bg-yellow-100 text-yellow-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'complete': return <Check className="w-4 h-4" />;
      case 'uploading': return <Loader className="w-4 h-4 animate-spin" />;
      case 'error': return <X className="w-4 h-4" />;
      default: return <Loader className="w-4 h-4" />;
    }
  };

  const processingCount = Object.values(uploadProgress).filter(
    p => p.status === 'uploading'
  ).length;

  const totalCount = Object.keys(uploadProgress).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Image className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold">Upload Photos</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div
          className={`relative mb-12 border-4 border-dashed rounded-3xl p-16 transition-all ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50 scale-105' 
              : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          
          <label htmlFor="file-input" className="cursor-pointer block text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Upload className="w-10 h-10 text-indigo-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Drop images here
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              or click to browse from your device
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                JPG, PNG, HEIC
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Max 50MB per file
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                Batch upload supported
              </span>
            </div>
          </label>
        </div>

        {totalCount > 0 && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Upload Progress</h3>
                <div className="text-sm text-gray-600">
                  Processing: <span className="font-semibold text-indigo-600">{processingCount}/{totalCount}</span> images
                </div>
              </div>
              
              <div className="bg-gray-200 rounded-full h-2 mb-8">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? ((totalCount - processingCount) / totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </>
        )}

        {recentUploads.length > 0 && (
          <>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Recent Uploads</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {recentUploads.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="relative">
                    <img
                      src={`http://localhost:8000${img.url}`}
                      alt={img.filename}
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor('complete')}`}>
                        <Check className="w-4 h-4" />
                        {Math.round(img.confidence * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-3 truncate">
                      {img.filename}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Tag className="w-3 h-3" />
                        <span>Detected tags:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {img.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <button 
            onClick={() => document.getElementById('file-input').click()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 font-semibold shadow-lg"
          >
            Upload More Photos
          </button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;