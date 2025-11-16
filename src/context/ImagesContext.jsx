import React, { createContext, useState, useContext } from 'react';
import { imagesAPI, searchAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const ImagesContext = createContext(null);

export const useImages = () => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error('useImages must be used within an ImagesProvider');
  }
  return context;
};

export const ImagesProvider = ({ children }) => {
  const { getToken, isLoaded } = useAuth();
  const [images, setImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const fetchImages = async (filters = {}) => {
    setLoading(true);
    try {
      let token = null;
      if (isLoaded && getToken) {
        try {
          token = await getToken();
        } catch (err) {
          // User not authenticated, continue without token
        }
      }
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await imagesAPI.getAll(filters, config);
      setImages(data.images || []);
      return { success: true, data: data.images };
    } catch (error) {
      toast.error('Failed to fetch images');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const fileId = Date.now();
    setUploadProgress((prev) => ({
      ...prev,
      [fileId]: { progress: 0, status: 'uploading', filename: file.name },
    }));

    try {
      let token = null;
      if (isLoaded && getToken) {
        try {
          token = await getToken();
        } catch (err) {
          // User not authenticated, continue without token
        }
      }
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: { ...prev[fileId], progress: percentCompleted },
          }));
        },
      };
      const { data } = await imagesAPI.upload(formData, config);

      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'complete',
          progress: 100,
          data: data,
        },
      }));

      setImages((prev) => [data, ...prev]);
      toast.success('Image uploaded successfully!');
      return { success: true, data };
    } catch (error) {
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'error' },
      }));
      toast.error('Upload failed');
      return { success: false, error };
    }
  };

  const deleteImage = async (id) => {
    try {
      let token = null;
      if (isLoaded && getToken) {
        try {
          token = await getToken();
        } catch (err) {
          // User not authenticated, continue without token
        }
      }
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await imagesAPI.delete(id, config);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success('Image deleted');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete image');
      return { success: false, error };
    }
  };

  const searchImages = async (query, filters = {}) => {
    setLoading(true);
    try {
      let token = null;
      if (isLoaded && getToken) {
        try {
          token = await getToken();
        } catch (err) {
          // User not authenticated, continue without token
        }
      }
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await searchAPI.search(query, filters, config);
      setSearchResults(data.results || []);
      return { success: true, data: data.results };
    } catch (error) {
      toast.error('Search failed');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      let token = null;
      if (isLoaded && getToken) {
        try {
          token = await getToken();
        } catch (err) {
          // User not authenticated, continue without token
        }
      }
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await searchAPI.getTags(config);
      setPopularTags(data.tags || []);
      return { success: true, data: data.tags };
    } catch (error) {
      return { success: false, error };
    }
  };

  const value = {
    images,
    searchResults,
    popularTags,
    loading,
    uploadProgress,
    fetchImages,
    uploadImage,
    deleteImage,
    searchImages,
    fetchTags,
  };

  return <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>;
};