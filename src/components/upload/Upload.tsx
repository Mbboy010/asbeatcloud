'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Loader2, Plus, Upload, Play, Pause, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for upload progress state
interface UploadProgress {
  percentage: number;
  remainingTime: number;
}

// Modal Component for Confirmation and Success
const CustomModal = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  type = 'confirm',
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  type?: 'confirm' | 'success';
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center mb-4">
              {type === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-8 w-8 text-orange-500 mr-2" />
              )}
              <h3 className="text-xl font-bold text-gray-200">
                {type === 'success' ? 'Upload Successful!' : 'Confirm Upload'}
              </h3>
            </div>
            <p className="text-gray-300 mb-6">{message}</p>
            {type === 'confirm' ? (
              <div className="flex justify-between gap-4">
                <motion.button
                  onClick={onCancel}
                  className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  OK
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={onCancel}
                className="w-full py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Got It
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Uploaded() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'success'>('confirm');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ percentage: 0, remainingTime: 0 });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const uploadControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('uploadEmail') || 'user@example.com';
    setUserEmail(savedEmail);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [previewUrl, imagePreviewUrl]);

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'audio/mpeg' || selectedFile.type === 'audio/wav')) {
      setIsAudioLoading(true);
      setAudioFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsAudioLoading(false);
    } else {
      setAudioFile(null);
      setPreviewUrl(null);
      setError('Please upload a valid MP3 or WAV file.');
      setIsAudioLoading(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      try {
        setIsImageLoading(true);
        const processedImage = await processImage(selectedFile);
        setImageFile(processedImage);
        setImagePreviewUrl(URL.createObjectURL(processedImage));
        setError('');
      } catch (err) {
        setError('Failed to process image.');
      } finally {
        setIsImageLoading(false);
      }
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
      setError('Please upload a valid image file.');
      setIsImageLoading(false);
    }
  };

  const processImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not supported'));
          return;
        }

        const isOneToOne = img.width === img.height;
        canvas.width = img.width;
        canvas.height = img.height;

        if (!isOneToOne) {
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(
            img,
            (img.width - size) / 2,
            (img.height - size) / 2,
            size,
            size,
            0,
            0,
            size,
            size
          );
        } else {
          ctx.drawImage(img, 0, 0);
        }

        let quality = 0.9;
        let blob: Blob | null = null;
        const targetSize = 95 * 1024;
        const originalSize = file.size;

        if (originalSize <= targetSize) {
          resolve(file);
          return;
        }

        const tryConvert = () => {
          canvas.toBlob(
            (result) => {
              if (result && result.size <= targetSize) {
                blob = result;
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else if (quality > 0.1) {
                quality -= 0.1;
                canvas.toBlob(tryConvert, 'image/jpeg', quality);
              } else {
                reject(new Error('Cannot compress image to target size'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryConvert();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const handleCancelUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      setIsPlaying(false);
      setUploadProgress({ percentage: 0, remainingTime: 0 });
      setError('Upload cancelled.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    // Show confirmation modal
    setModalType('confirm');
    setIsModalOpen(true);
  };

  const handleConfirmUpload = async () => {
    setIsModalOpen(false);

    // Step 2: Check file size and internet connection
    if (!audioFile) {
      setError('Please select an audio file to upload.');
      return;
    }
    const fileSizeMB = audioFile.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setError('Audio file size exceeds 50MB limit.');
      return;
    }
    if (!navigator.onLine) {
      setError('No internet connection. Please try again later.');
      return;
    }

    setIsLoading('upload');
    setError('');
    setUploadSuccess(false);
    setUploadProgress({ percentage: 0, remainingTime: Math.round(fileSizeMB * 2) });

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('audio', audioFile);
      if (imageFile) formData.append('cover', imageFile);
      formData.append('email', userEmail);

      uploadControllerRef.current = new AbortController();
      const signal = uploadControllerRef.current.signal;

      let progress = 0;
      const uploadInterval = setInterval(() => {
        if (signal.aborted) {
          clearInterval(uploadInterval);
          return;
        }
        progress += 10;
        const remainingTime = Math.round(fileSizeMB * 2 * (1 - progress / 100));
        setUploadProgress({ percentage: progress, remainingTime });
        if (progress >= 100) {
          clearInterval(uploadInterval);
        }
      }, fileSizeMB * 200);

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (signal.aborted) {
            reject(new Error('Upload cancelled'));
          } else {
            resolve(true);
          }
        }, fileSizeMB * 2000);
      });
      clearInterval(uploadInterval);
      setUploadProgress({ percentage: 100, remainingTime: 0 });

      console.log('Upload successful for email:', userEmail, 'Title:', title);
      localStorage.removeItem('uploadEmail');
      setTitle('');
      setDescription('');
      setAudioFile(null);
      setImageFile(null);
      setPreviewUrl(null);
      setImagePreviewUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setUploadSuccess(true);
      setModalType('success');
      setIsModalOpen(true);
    } catch (err: any) {
      if (err.message === 'Upload cancelled') {
        setError('Upload cancelled.');
      } else {
        setError('Failed to upload file. Please try again.');
      }
      setUploadProgress({ percentage: 0, remainingTime: 0 });
    } finally {
      setIsLoading(null);
      uploadControllerRef.current = null;
    }
  };

  const handleCancelConfirm = () => {
    setIsModalOpen(false);
    setError('Upload cancelled by user.');
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}m ${seconds}s`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (modalType === 'success') {
      setUploadSuccess(false);
    }
  };

  return (
    <motion.div className="flex justify-center items-center">
      <div className="w-full p-6 max-w-md">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Upload Your Beat</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {!isLoading && !uploadSuccess && (
          <motion.div
            className="w-full bg-gray-800 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Before You Upload</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>Ensure your beat title and description are accurate and engaging.</li>
              <li>Verify that your audio file is in MP3 or WAV format and under 50MB.</li>
            </ol>
          </motion.div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Beat Title - Enter a unique name for your beat</label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Beat title"
                className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Description - Add details about your beat (optional)</label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Cover Image - Upload an image to represent your beat (optional)</label>
            <motion.div
              className="relative mx-auto flex justify-center items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <label
                htmlFor="image-upload"
                className="w-full h-60 bg-[#2A2A2A] rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-500 hover:border-orange-500 transition-all duration-300"
                aria-label="Upload cover image"
              >
                {isImageLoading ? (
                  <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
                ) : !imagePreviewUrl ? (
                  <Plus className="text-gray-400 h-12 w-12 hover:text-orange-500 transition-all duration-200" />
                ) : (
                  <motion.img
                    key="preview"
                    src={imagePreviewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </motion.div>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Audio File - Upload your beat in MP3 or WAV format</label>
            <motion.div className="relative">
              <label
                htmlFor="audio-upload"
                className="w-full h-16 bg-[#2A2A2A] cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center text-gray-200 font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-300"
                aria-label="Upload audio file"
              >
                {isAudioLoading ? (
                  <Loader2 className="animate-spin h-6 w-6 mr-2 text-orange-500" />
                ) : (
                  <Upload className="mr-2 h-6 w-6" />
                )}
                {audioFile ? audioFile.name : 'Upload Audio'}
              </label>
              <input
                id="audio-upload"
                type="file"
                accept="audio/mpeg, audio/wav"
                onChange={handleAudioFileChange}
                className="hidden"
              />
            </motion.div>
          </div>

          {previewUrl && (
            <motion.div
              className="w-full bg-gray-900 rounded-xl shadow-lg p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{audioFile?.name || 'Preview'}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-orange-500 hover:text-yellow-500 transition-colors duration-200"
                  onClick={() => {
                    setPreviewUrl(null);
                    setAudioFile(null);
                    setIsPlaying(false);
                    setCurrentTime(0);
                    setDuration(0);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>
              <audio ref={audioRef} src={previewUrl} preload="metadata" />
              <div className="flex items-center space-x-4 mt-4">
                <span className="text-sm w-12">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSliderChange}
                  className="flex-1 appearance-none h-2 rounded-full bg-white outline-none accent-pink-500"
                />
                <span className="text-sm w-12 text-right">{formatTime(duration)}</span>
              </div>
              <div className="flex justify-center mt-4">
                <motion.button
                  type="button"
                  onClick={togglePlay}
                  className="bg-white text-gray-900 rounded-full p-3 hover:scale-105 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>
              </div>
            </motion.div>
          )}

          {isLoading === 'upload' && (
            <motion.div
              className="w-full bg-gray-800 rounded-lg p-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-200 text-sm">Uploading...</p>
                <motion.button
                  onClick={handleCancelUpload}
                  className="text-red-500 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <p className="text-red-500 text-sm mb-2">Do not close this page until upload is finished.</p>
              <div className="w-full bg-gray-600 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2.5 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadProgress.percentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-300 mt-2">
                <span>{uploadProgress.percentage}%</span>
                <span>Time remaining: {uploadProgress.remainingTime.toFixed(1)}s</span>
              </div>
            </motion.div>
          )}

          {uploadSuccess && (
            <motion.div
              className="w-full bg-gray-800 rounded-lg p-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Next Steps</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Share your beat on social media to reach a wider audience.</li>
                <li>Check your profile to manage and promote your uploaded beats.</li>
                <li>Add tags to your beat to improve discoverability.</li>
                <li>Collaborate with other artists to remix or feature your beat.</li>
              </ul>
            </motion.div>
          )}

          <CustomModal
            isOpen={isModalOpen}
            onConfirm={handleConfirmUpload}
            onCancel={handleCancelConfirm}
            message="Are you ready to upload your beat? Ensure all details are correct."
            type={modalType}
          />

          <motion.button
            type="submit"
            disabled={isLoading !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Upload Beat'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
