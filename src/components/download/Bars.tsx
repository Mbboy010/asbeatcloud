'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Flag, MessageCircle, Facebook, Instagram, Link2 } from 'lucide-react';
import ReactDOM from 'react-dom';

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  return ReactDOM.createPortal(children, document.body);
};

interface BarsProps {
  isLiked: boolean;
  setIsLiked: (value: boolean) => void;
  showShareModal: boolean;
  setShowShareModal: (value: boolean) => void;
  showReportModal: boolean;
  setShowReportModal: (value: boolean) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (value: boolean) => void;
  reportReason: string;
  setReportReason: (value: string) => void;
  error: string | null; // Updated to allow null
  setError: (value: string | null) => void;
  cp: boolean;
  setCp: (value: boolean) => void;
  handleLikesToggle: (e: React.MouseEvent) => void; // Updated type
}

export default function Bars({
  isLiked,
  setIsLiked,
  showShareModal,
  setShowShareModal,
  showReportModal,
  setShowReportModal,
  showSuccessModal,
  setShowSuccessModal,
  reportReason,
  setReportReason,
  error,
  setError,
  cp,
  setCp,
  handleLikesToggle,
}: BarsProps) {
  const shareModalRef = useRef<HTMLDivElement>(null);
  const successModalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(false);
      }
      if (successModalRef.current && !successModalRef.current.contains(event.target as Node)) {
        setShowSuccessModal(false);
      }
    };

    if (showShareModal || showReportModal || showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showShareModal, showReportModal, showSuccessModal]);

  const shareProfile = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        handleCp();
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
    setShowShareModal(false);
  };

  const handleCp = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCp(true);
      setTimeout(() => setCp(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting.');
      return;
    }

    console.log('Report submitted:', reportReason);
    setShowReportModal(false);
    setShowSuccessModal(true);
    setReportReason('');
    setError(null);
  };

  return (
    <div className="w-full flex justify-center">
      {/* Action Buttons */}
      <div className="mb-8 flex flex-row md:flex-row justify-center items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault(); // Ensure no default behavior
            handleLikesToggle(e); // Pass the event
          }}
          className={`${
            isLiked ? 'bg-gray-800 text-gray-200' : 'bg-gray-800 text-gray-200'
          } px-4 md:px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-red-500'}`} />{' '}
          {isLiked ? 'Unlike' : 'Like'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShareModal(true)}
          className="bg-gray-800 text-gray-200 px-4 md:px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300"
        >
          <Share2 className="w-5 h-5" /> Share
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowReportModal(true)}
          className="bg-gray-800 text-gray-200 px-4 md:px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300"
        >
          <Flag className="w-5 h-5 text-pink-500" /> Report
        </motion.button>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <ModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 w-full h-full  bg-opacity-50 flex items-center justify-center backdrop-blur-sm z-[4]"
            >
              <motion.div
                ref={shareModalRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0000006f] border border-orange-500 backdrop-blur-md p-6 rounded-lg w-full max-w-md"
              >
                <h3 className="text-lg font-semibold mb-4">Share Profile</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => shareProfile('whatsapp')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => shareProfile('facebook')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5 mr-2 text-blue-500" />
                    Facebook
                  </button>
                  <button
                    onClick={() => shareProfile('instagram')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                    aria-label="Share on Instagram"
                  >
                    <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                    Instagram
                  </button>
                  <button
                    onClick={handleCp}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-200 rounded"
                    aria-label="Copy profile link"
                  >
                    <Link2 className="w-5 h-5 mr-2" />
                    {cp ? <span className="text-green-500">Copied</span> : <span>Copy Link</span>}
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 bg-orange-500 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportModal && (
          <ModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed backdrop-blur-sm top-0 left-0 w-full h-full  bg-opacity-50 flex items-center justify-center z-[4]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-modal-title"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0000006f] border border-orange-500 backdrop-blur-md p-6 rounded-lg w-full max-w-md"
              >
                <h3 id="report-modal-title" className="text-lg font-semibold mb-4">
                  Report Profile
                </h3>
                <form onSubmit={handleReportSubmit}>
                  <textarea
                    ref={textareaRef}
                    className="w-full p-2 mb-4 bg-gray-900 text-gray-200 rounded"
                    rows={4}
                    placeholder="Please provide the reason for reporting this profile"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    aria-label="Report reason"
                    maxLength={1000}
                  />
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReportModal(false);
                        setReportReason('');
                        setError(null);
                      }}
                      className="px-4 py-2 bg-orange-500 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
                      disabled={!reportReason.trim()}
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <ModalPortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed backdrop-blur-sm top-0 left-0 w-full h-full  bg-opacity-50 flex items-center justify-center z-[3]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="success-modal-title"
            >
              <motion.div
                ref={successModalRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0000006f] border border-orange-500 backdrop-blur-md p-6 rounded-lg w-full max-w-sm"
              >
                <h3 id="success-modal-title" className="text-lg font-semibold mb-4 text-green-400">
                  Report Submitted
                </h3>
                <p className="text-gray-200 mb-4">
                  Your report has been submitted successfully. Thank you for your feedback.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSuccessModal(false)}
                    className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-400"
                    aria-label="Close success modal"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
}
 