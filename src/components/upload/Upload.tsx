'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Loader2, Plus, Upload, Play, Pause, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { databases, account, storage } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';
import { ID, Permission, Role } from 'appwrite';
import { useRouter } from 'next/navigation';
import MusicAttributes from './MusicAttributes';

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
}) => (
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
          role="dialog"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="flex items-center mb-4">
            {type === 'success' ? (
              <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-8 w-8 text-orange-500 mr-2" />
            )}
            <h3 id="modal-title" className="text-xl font-bold text-gray-200">
              {type === 'success' ? 'Upload Successful!' : 'Confirm Upload'}
            </h3>
          </div>
          <p id="modal-description" className="text-gray-300 mb-6">{message}</p>
          {type === 'confirm' ? (
            <div className="flex justify-between gap-4">
              <motion.button
                onClick={onCancel}
                className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Cancel upload confirmation"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={onConfirm}
                className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Confirm upload"
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
              aria-label="Acknowledge success"
            >
              Got It
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [userEmail, setUserEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'success'>('confirm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ percentage: 0, remainingTime: 0 });
  const [genre, setGenre] = useState('');
  const [tempo, setTempo] = useState(120);
  const [scale, setScale] = useState('');
  const [musicKey, setMusicKey] = useState(''); // Renamed from 'key' to 'musicKey'

  const audioRef = useRef<HTMLAudioElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = '686a7cd100087c08444a';
  const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const router = useRouter();

useEffect(() =>{
  const checkAuth = async () => {
              try {
                await account.get(); // Verify sessio
              } catch (err) {
                router.push('/login');
              }
            };
    checkAuth()
},[isAuth])


  // Initialize session and email
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const user = await account.get();
        if (!user || !user.$id) {
          setErrors((prev) => ({ ...prev, general: 'Session expired. Please log in again.' }));
          router.push('/login');
        }
      } catch {
        setErrors((prev) => ({ ...prev, general: 'Authentication failed. Please log in again.' }));
        router.push('/login');
      }
    };
    if (isAuth && authId) {
      initializeSession();
    }
    setUserEmail(localStorage.getItem('uploadEmail') || 'user@example.com');
  }, [authId, isAuth, router]);

  // Audio player cleanup and event listeners
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
      setErrors((prev) => ({ ...prev, audioFile: '' }));
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsAudioLoading(false);
      if (isModalOpen) setIsModalOpen(false);
    } else {
      setAudioFile(null);
      setPreviewUrl(null);
      setErrors((prev) => ({ ...prev, audioFile: 'Please upload a valid MP3 or WAV file.' }));
      setIsAudioLoading(false);
      if (isModalOpen) setIsModalOpen(false);
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
        setErrors((prev) => ({ ...prev, imageFile: '' }));
        if (isModalOpen) setIsModalOpen(false);
      } catch {
        setErrors((prev) => ({ ...prev, imageFile: 'Failed to process image.' }));
        if (isModalOpen) setIsModalOpen(false);
      } finally {
        setIsImageLoading(false);
      }
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
      setErrors((prev) => ({ ...prev, imageFile: 'Please upload a valid image file.' }));
      setIsImageLoading(false);
      if (isModalOpen) setIsModalOpen(false);
    }
  };

  const processImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not supported'));

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

        let quality = 0.9;
        const targetSize = 95 * 1024; // 95KB
        if (file.size <= targetSize) return resolve(file);

        const tryConvert = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size <= targetSize) {
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
      setUploadProgress({ percentage: 0, remainingTime: 0 });
      setIsLoading(null);
      setErrors((prev) => ({ ...prev, general: 'Upload cancelled.' }));
      startTimeRef.current = null;
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Please enter a beat title.';
    if (!description.trim()) newErrors.description = 'Please enter a description for your beat.';
    if (!audioFile) newErrors.audioFile = 'Please select an audio file to upload.';
    if (!imageFile) newErrors.imageFile = 'Please select a cover image for your beat.';
    if (!genre) newErrors.genre = 'Please select a music genre.';
    if (tempo < 40 || tempo > 200) newErrors.tempo = 'Tempo must be between 40 and 200 BPM.';
    if (!scale) newErrors.scale = 'Please select a scale.';
    if (!musicKey) newErrors.musicKey = 'Please select a key.'; // Renamed from 'key' to 'musicKey'

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setModalType('confirm');
    setIsModalOpen(true);
  };

  const handleConfirmUpload = async () => {
    setIsModalOpen(false);

    if (!audioFile) {
      setErrors((prev) => ({ ...prev, audioFile: 'No audio file selected. Please select an audio file.' }));
      return;
    }

    const fileSizeMB = audioFile.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setErrors((prev) => ({ ...prev, audioFile: 'Audio file size exceeds 50MB limit.' }));
      return;
    }
    if (!navigator.onLine) {
      setErrors((prev) => ({ ...prev, general: 'No internet connection. Please try again later.' }));
      return;
    }

    setIsLoading('upload');
    setErrors({});
    setUploadProgress({ percentage: 0, remainingTime: Math.round(fileSizeMB * 10) });
    startTimeRef.current = performance.now();

    try {
      const user = await account.get();
      const userId = user.$id;
      if (!userId) throw new Error('No authenticated user found.');

      uploadControllerRef.current = new AbortController();
      const signal = uploadControllerRef.current.signal;

      const simulateProgress = () => {
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev.percentage >= 100 || !isLoading) {
              clearInterval(interval);
              return prev;
            }
            const elapsedTime = (performance.now() - (startTimeRef.current || 0)) / 1000;
            const newPercentage = Math.min(prev.percentage + 1, 99);
            const estimatedTotalTime = fileSizeMB * 10;
            const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime);
            return { percentage: newPercentage, remainingTime };
          });
        }, 200);
        return () => clearInterval(interval);
      };

      const cleanup = imageFile ? simulateProgress() : () => {};

      const audioUpload = await storage.createFile(
        STORAGE_BUCKET_ID!,
        ID.unique(),
        audioFile,
        [Permission.read(Role.user(userId)), Permission.write(Role.user(userId)), Permission.delete(Role.user(userId))],
        (progress) => {
          if (signal.aborted) return;
          const percentage = Math.round((progress.chunksUploaded / progress.chunksTotal) * 100);
          const elapsedTime = (performance.now() - (startTimeRef.current || 0)) / 1000;
          const estimatedTotalTime = elapsedTime / (percentage / 100) || fileSizeMB * 10;
          const remainingTime = Math.max(0, estimatedTotalTime * (1 - percentage / 100));
          setUploadProgress({ percentage, remainingTime });
        }
      );
      const audioFileId = storage.getFileView(STORAGE_BUCKET_ID!, audioUpload.$id).toString();
      let musicId =  audioUpload.$id;

      let imageFileId: string | null = null;
      let imageId: string | null = null;
      
      if (imageFile) {
        const imageUpload = await storage.createFile(
          STORAGE_BUCKET_ID!,
          ID.unique(),
          imageFile,
          [Permission.read(Role.user(userId)), Permission.write(Role.user(userId)), Permission.delete(Role.user(userId))],
          (progress) => {
            if (signal.aborted) return;
            const percentage = Math.round((progress.chunksUploaded / progress.chunksTotal) * 100);
            setUploadProgress((prev) => ({
              percentage: Math.min((prev.percentage + percentage) / 2, 100),
              remainingTime: prev.remainingTime,
            }));
          }
        );
        imageFileId = storage.getFileView(STORAGE_BUCKET_ID!, imageUpload.$id).toString();
        
        imageId = imageUpload.$id
      }

      cleanup();

      const currentDate = new Date().toISOString();
      await databases.createDocument(
        DATABASE_ID!,
        COLLECTION_ID!,
        ID.unique(),
        {
          title,
          description,
          email: userEmail,
          audioFileId,
          musicId,
          imageFileId: imageFileId || null,
          imageId,
          userId,
          uploadDate: currentDate,
          genre,
          tempo,
          duration: formatTime(duration),
          scale,
          docId: ID.unique(),
          key: musicKey, // Renamed to 'key' for database to maintain consistency
        },
        [Permission.read(Role.user(userId)), Permission.write(Role.user(userId)), Permission.delete(Role.user(userId))]
      );

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
      setUploadProgress({ percentage: 100, remainingTime: 0 });
      setGenre('');
      setTempo(120);
      setScale('');
      setMusicKey('');
      setModalType('success');
      setIsModalOpen(true);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrors((prev) => ({ ...prev, general: 'Upload cancelled by user.' }));
      } else if (err.code === 401) {
        setErrors((prev) => ({ ...prev, general: 'Unauthorized. Please log in again.' }));
        router.push('/login');
      } else if (err.code === 413) {
        setErrors((prev) => ({ ...prev, audioFile: 'File size exceeds the 50MB limit.' }));
      } else if (err.code === 429) {
        setErrors((prev) => ({ ...prev, general: 'Too many requests. Please try again later.' }));
      } else {
        setErrors((prev) => ({ ...prev, general: `Upload failed: ${err.message || 'An unexpected error occurred'}` }));
      }
      setUploadProgress({ percentage: 0, remainingTime: 0 });
    } finally {
      setIsLoading(null);
      uploadControllerRef.current = null;
      startTimeRef.current = null;
    }
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
      setModalType('confirm');
    }
  };

  return (
    <motion.div className="flex justify-center items-center">
      <div className="w-full p-6 max-w-md">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">Upload Your Beat</h2>
        {Object.keys(errors).length > 0 && (
          <motion.div
            className="bg-red-900 bg-opacity-50 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >

          </motion.div>
        )}

        {!isLoading && (
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
              <li>Provide a cover image to represent your beat.</li>
              <li>Select appropriate genre, tempo, scale, and key for your beat.</li>
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: '' }));
                  if (isModalOpen) setIsModalOpen(false);
                }}
                placeholder="Beat title"
                className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                required
                aria-label="Beat title input"
              />
            </div>
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Description - Add details about your beat</label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: '' }));
                  if (isModalOpen) setIsModalOpen(false);
                }}
                placeholder="Enter a description"
                className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none transition-all duration-200"
                required
                aria-label="Beat description input"
              />
            </div>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <MusicAttributes
            genre={genre}
            setGenre={(value) => {
              setGenre(value);
              setErrors((prev) => ({ ...prev, genre: '' }));
            }}
            tempo={tempo}
            setTempo={(value) => {
              setTempo(value);
              setErrors((prev) => ({ ...prev, tempo: '' }));
            }}
            scale={scale}
            setScale={(value) => {
              setScale(value);
              setErrors((prev) => ({ ...prev, scale: '' }));
            }}
            musicKey={musicKey}
            setMusicKey={(value) => {
              setMusicKey(value);
              setErrors((prev) => ({ ...prev, musicKey: '' }));
            }}
            errors={errors}
          />

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Cover Image - Upload an image to represent your beat</label>
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
                required
              />
            </motion.div>
            {errors.imageFile && <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>}
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Audio File - Upload your beat in MP3 or WAV format</label>
            <motion.div className="relative">
              <label
                htmlFor="audio-upload"
                className="w-full h-16 bg-[#2A2A2A] cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center text-gray-200 font-semibold hover:border-orange-500 transition-all duration-300"
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
                required
              />
            </motion.div>
            {errors.audioFile && <p className="text-red-500 text-sm mt-1">{errors.audioFile}</p>}
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
                    setErrors((prev) => ({ ...prev, audioFile: 'Please select an audio file to upload.' }));
                  }}
                  aria-label="Remove audio preview"
                >
                  <X className="h-6 w-6" />
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
                  aria-label="Audio progress slider"
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
                  aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isPlaying ? <Pause className="w-6 w-6" /> : <Play className="w-6 w-6" />}
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
                  aria-label="Cancel upload"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <p className="text-red-500 text-sm mb-2">Do not close this page until upload is finished.</p>
              <div className="w-full bg-gray-600 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2.5 rounded-full"
                  animate={{ width: `${uploadProgress.percentage}%` }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-300 mt-2">
                <span>{Math.round(uploadProgress.percentage)}%</span>
                <span>Time remaining: {Math.round(uploadProgress.remainingTime)}s</span>
              </div>
            </motion.div>
          )}

          {modalType === 'success' && (
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

          <motion.button
            type="submit"
            disabled={isLoading !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center"
            aria-label="Submit beat upload"
          >
            {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Upload Beat'}
          </motion.button>
        </form>

        <CustomModal
          isOpen={isModalOpen}
          onConfirm={handleConfirmUpload}
          onCancel={handleCloseModal}
          message={
            modalType === 'success'
              ? 'Your beat has been successfully uploaded!'
              : 'Are you ready to upload your beat? Ensure all details are correct.'
          }
          type={modalType}
        />
      </div>
    </motion.div>
  );
}

