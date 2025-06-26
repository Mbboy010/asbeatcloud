"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Instagram, Facebook, Youtube, MessageSquare, LucideIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { databases } from '../../lib/appwrite';
import { useAppSelector } from '@/store/hooks';

export default function Social() {
  const platformIcons: Record<string, LucideIcon> = {
    Twitter,
    Instagram,
    Facebook,
    Youtube,
    MessageSquare
  };

  const platformColors: Record<string, string> = {
    Twitter: 'text-blue-400',
    Instagram: 'text-pink-400',
    Facebook: 'text-blue-600',
    Youtube: 'text-red-600',
    MessageSquare: 'text-green-400'
  };

  const platformDisplayNames: Record<string, string> = {
    Twitter: 'Twitter',
    Instagram: 'Instagram',
    Facebook: 'Facebook',
    Youtube: 'Youtube',
    MessageSquare: 'WhatsApp'
  };

  const userId = useAppSelector((state) => state.authId.value);
  const router = useRouter();
  const params = useParams();
  const useridparams = typeof params.userid === 'string' ? params.userid : null;

  const [shown, setShown] = useState<boolean>(false);
  const [socials, setSocials] = useState<
    { platform: string; url: string; color: string }[]
  >([]);
  const [formData, setFormData] = useState([
    { platform: '', url: '' },
    { platform: '', url: '' },
    { platform: '', url: '' }
  ]);
  const [errors, setErrors] = useState<
    { platform: string; url: string }[]
  >([
    { platform: '', url: '' },
    { platform: '', url: '' },
    { platform: '', url: '' }
  ]);

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const doc = await databases.getDocument(
          process.env.NEXT_PUBLIC_USERSDATABASE!,
          '6849aa4f000c032527a9',
          params.userid as string
        );

        const social1 = JSON.parse(doc.socialone || '{}');
        const social2 = JSON.parse(doc.socialtwo || '{}');
        const social3 = JSON.parse(doc.socialthree || '{}');

        const all = [social1, social2, social3].filter((s) => s.platform);
        setSocials(all);

        setFormData([
          social1 || { platform: '', url: '' },
          social2 || { platform: '', url: '' },
          social3 || { platform: '', url: '' }
        ]);
      } catch (err) {
        console.error('Failed to load social links:', err);
      }
    };

    if (params.userid) {
      fetchSocials();
    }
  }, [userId, params.userid]);

  const handleInputChange = (index: number, field: 'platform' | 'url', value: string) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], [field]: value };
    setFormData(newFormData);

    // Clear errors for the field being edited
    const newErrors = [...errors];
    newErrors[index] = { ...newErrors[index], [field]: '' };
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = [
      { platform: '', url: '' },
      { platform: '', url: '' },
      { platform: '', url: '' }
    ];
    let isValid = true;

    // Check for duplicate platforms
    const selectedPlatforms = formData
      .map((data, index) => ({ platform: data.platform, index }))
      .filter((data) => data.platform);
    const platformCounts = selectedPlatforms.reduce((acc, { platform }) => {
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    selectedPlatforms.forEach(({ platform, index }) => {
      if (platformCounts[platform] > 1) {
        newErrors[index].platform = 'This platform is already selected.';
        isValid = false;
      }
    });

    // Check for required URL when platform is selected
    formData.forEach((data, index) => {
      if (data.platform && !data.url.trim()) {
        newErrors[index].url = 'URL is required when a platform is selected.';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_USERSDATABASE!,
        '6849aa4f000c032527a9',
        params.userid as string,
        {
          socialone: JSON.stringify(formData[0]),
          socialtwo: JSON.stringify(formData[1]),
          socialthree: JSON.stringify(formData[2])
        }
      );

      // Map formData to include color property
      const updatedSocials = formData
        .filter((s) => s.platform && s.url)
        .map((s) => ({
          platform: s.platform,
          url: s.url,
          color: platformColors[s.platform] || 'text-gray-400' // Default color if not found
        }));

      setSocials(updatedSocials);
      setShown(false);
      setErrors([
        { platform: '', url: '' },
        { platform: '', url: '' },
        { platform: '', url: '' }
      ]);
    } catch (err) {
      console.error('Failed to update social links:', err);
    }
  };

  const canc = () => {
    setShown(false);
    setErrors([
      { platform: '', url: '' },
      { platform: '', url: '' },
      { platform: '', url: '' }
    ]);
  };

  const added = () => {
    setShown(true);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Social</h3>

      {socials.length <= 0 ? (
        <p className="text-gray-400 text-[1rem] font-mono">Social media not available!</p>
      ) : (
        <div className="flex flex-row items-center gap-4 space-y-2">
          {socials.map((link, index) => {
            const IconComponent = platformIcons[link.platform];
            return (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={platformDisplayNames[link.platform] || link.platform}
                className="flex items-center justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center justify-center ${
                    platformColors[link.platform] || 'text-gray-400'
                  } transition duration-200`}
                >
                  <IconComponent className="w-6 h-6 mr-1" />
                  <span className="text-sm">
                    {platformDisplayNames[link.platform] || link.platform}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}

      {useridparams === userId && (
        <div className="mt-2">
          <button
            className="text-[1rem] mt-3 font-semibold text-blue-500 hover:text-blue-400"
            onClick={added}
          >
            Edit social
          </button>
        </div>
      )}

      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 min-h-screen"
            role="dialog"
            aria-labelledby="social-modal-title"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-[90%] sm:max-w-lg md:max-w-xl bg-gray-900/95 rounded-2xl shadow-xl border border-orange-500/20 mx-auto flex flex-col max-h-[75vh]"
            >
              {/* Header with Close Button */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700/50">
                <h2 id="social-modal-title" className="text-xl sm:text-2xl font-bold text-white">
                  Edit Social Links
                </h2>
                <button
                  onClick={canc}
                  className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 hover:text-orange-400" />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <form
                id="social-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800 max-h-[60vh]"
              >
                {formData.map((social, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700/50"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                      Link {index + 1}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor={`platform-${index}`}
                          className="flex items-center text-sm font-medium text-gray-200 mb-2"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-orange-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                          Platform
                        </label>
                        <motion.select
                          whileFocus={{ scale: 1.02 }}
                          id={`platform-${index}`}
                          name={`platform-${index}`}
                          value={social.platform}
                          onChange={(e) => handleInputChange(index, 'platform', e.target.value)}
                          className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200"
                          aria-describedby={`platform-error-${index}`}
                        >
                          <option value="">Select platform</option>
                          {Object.keys(platformIcons).map((platform) => (
                            <option key={platform} value={platform}>
                              {platformDisplayNames[platform] || platform}
                            </option>
                          ))}
                        </motion.select>
                        {errors[index].platform && (
                          <p
                            id={`platform-error-${index}`}
                            className="text-red-400 text-xs mt-1"
                          >
                            {errors[index].platform}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`url-${index}`}
                          className="flex items-center text-sm font-medium text-gray-200 mb-2"
                        >
                          <svg
                            className="w-4 h-4 mr-2 text-orange-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          URL
                        </label>
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          id={`url-${index}`}
                          type="url"
                          name={`url-${index}`}
                          value={social.url}
                          onChange={(e) => handleInputChange(index, 'url', e.target.value)}
                          className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200"
                          placeholder="https://example.com"
                          aria-describedby={`url-error-${index}`}
                        />
                        {errors[index].url && (
                          <p
                            id={`url-error-${index}`}
                            className="text-red-400 text-xs mt-1"
                          >
                            {errors[index].url}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </form>

              {/* Footer with Buttons */}
              <div className="p-4 sm:p-6 border-t border-gray-700/50 flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={canc}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  form="social-form"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}