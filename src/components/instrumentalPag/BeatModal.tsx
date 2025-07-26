"use client";

import { useEffect, useState, useRef } from "react";
import { Heart, Share2, Download, MessageCircle, Flag, X, Facebook, Instagram, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databases } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { reportSubmitted } from "@/utils/reportSubmitted";
import { ID, Query } from "appwrite";

interface Beat {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempo: number;
  key: string;
  scale: string;
  imageUrl: string;
  downloads: number;
  likes: number;
  likers: string[];
  comments: string[];
  userId: string;
  postId: string;
  beatId: string;
  dateTime: string;
  duration: string;
  fileUrl: string;
  downloadUrl: string;
}

interface BeatModalProps {
  beat: Beat;
  isOpen: boolean;
  closeModal: () => void;
  updateBeat: (newBeat: Partial<Beat>) => void;
}

export default function BeatModal({ beat, isOpen, closeModal, updateBeat }: BeatModalProps) {
  const [artistNames, setArtistNames] = useState<{ [key: string]: string }>({});
  const [isLoadingArtist, setIsLoadingArtist] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [error, setError] = useState("");
  const [cp, setCp] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<any[]>([]); // Updated to store comments array

  const router = useRouter();
  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);

  const menuRef = useRef<HTMLDivElement>(null);
  const shareModalRef = useRef<HTMLDivElement>(null);
  const successModalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE || "";
  const COLLECTION_ID = "686a7cd100087c08444a";
  const REPORTS_COLLECTION_ID = process.env.NEXT_PUBLIC_REPORTS_COLLECTION_ID || "68651f14000d0d69786e";
  const COMMENTS_COLLECTION_ID = "686a7cad002cd0b8f879";

  // Check like status on mount
  useEffect(() => {
    if (isAuth && authId && Array.isArray(beat.likers)) {
      setIsLiked(beat.likers.includes(authId));
    }
  }, [isAuth, authId, beat.likers]);

  // Click-outside detection for sub-modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareModalRef.current && !shareModalRef.current.contains(event.target as Node)) {
        setShowShareModal(true);
      }
      if (successModalRef.current && !successModalRef.current.contains(event.target as Node)) {
        setShowSuccessModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Focus management for sub-modals
  useEffect(() => {
    if (showReportModal && textareaRef.current) {
      textareaRef.current.focus();
    }
    if (showSuccessModal && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [showReportModal, showSuccessModal]);

  // Fetch artist name
  useEffect(() => {
    const fetchArtistName = async (userId: string) => {
      if (!userId || artistNames[userId]) {
        setIsLoadingArtist(false); // Skip if already fetched
        return;
      }

      try {
        setIsLoadingArtist(true);
        const response = await databases.getDocument(DATABASE_ID, "6849aa4f000c032527a9", userId);
        const fullName = `${response.firstName || ""} ${response.lastName || ""}`.trim() || "Unknown Artist";
        setArtistNames((prev) => ({ ...prev, [userId]: fullName }));
      } catch (error) {
        console.error(`Failed to fetch artist name for userId ${userId}:`, error);
        setArtistNames((prev) => ({ ...prev, [userId]: "Unknown Artist" }));
      } finally {
        setIsLoadingArtist(false);
      }
    };

    if (beat.userId) {
      fetchArtistName(beat.userId);
    } else {
      setArtistNames((prev) => ({ ...prev, [beat.userId]: "Unknown Artist" }));
      setIsLoadingArtist(false);
    }
  }, [beat.userId, DATABASE_ID]); // Removed artistNames from dependencies

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const queries = [Query.equal("instrumentalId", beat.postId)];
        const commentsResponse = await databases.listDocuments(
          DATABASE_ID,
          COMMENTS_COLLECTION_ID,
          queries
        );
        console.log(commentsResponse)
        setComments(commentsResponse.documents); // Store only the documents array
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setComments([]);
      }
    };

    if (isOpen && beat.postId) {
      fetchComments();
    }
  }, [isOpen, beat.postId, DATABASE_ID, COMMENTS_COLLECTION_ID]);

  // Like functionality
  const handleLikesToggle = async () => {
    if (!isAuth) {
      setError("Please log in to like this beat.");
      router.push("/login");
      return;
    }

    if (!authId) {
      setError("User authentication ID is missing.");
      return;
    }

    if (!beat.id) {
      setError("Beat ID is missing.");
      return;
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError("Database configuration is missing.");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const currentLikers = Array.isArray(beat.likers) ? beat.likers : [];
    const previousIsLiked = isLiked;
    const previousBeat = { ...beat, likers: currentLikers };

    try {
      const newIsLiked = !isLiked;
      const newLikers = newIsLiked
        ? [...currentLikers, authId]
        : currentLikers.filter((id) => id !== authId);
      const newLikes = newIsLiked ? beat.likes + 1 : Math.max(0, beat.likes - 1);

      setIsLiked(newIsLiked);
      updateBeat({ likers: newLikers, likes: newLikes });

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, beat.id, {
        likers: newLikers,
        likes: newLikes,
      });

      const updatedDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, beat.id);
      updateBeat({
        likers: Array.isArray(updatedDoc.likers) ? updatedDoc.likers : [],
        likes: updatedDoc.likes || 0,
      });
      setIsLiked(updatedDoc.likers.includes(authId));
    } catch (err: any) {
      setIsLiked(previousIsLiked);
      updateBeat(previousBeat);
      setError(`Failed to ${isLiked ? "unlike" : "like"} beat: ${err.message}`);
      console.error("Like toggle error:", err);
    } finally {
      setIsLiking(false);
    }
  };

  // Download functionality
  const handleDownload = async () => {
    if (!isAuth) {
      setError("Please log in to download this beat.");
      router.push("/login");
      return;
    }

    if (!beat.downloadUrl) {
      setError("No download URL available for this beat.");
      console.error("No download URL available for beat:", beat.id);
      return;
    }

    if (!DATABASE_ID || !COLLECTION_ID) {
      setError("Download functionality is unavailable due to configuration issues.");
      console.error("Missing database configuration: DATABASE_ID or COLLECTION_ID");
      return;
    }

    try {
      const anchor = document.createElement("a");
      anchor.href = beat.downloadUrl;
      anchor.download = `${beat.title || "beat"}.mp3`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      const newDownloads = beat.downloads + 1;
      updateBeat({ downloads: newDownloads });

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, beat.id, {
        downloads: newDownloads,
      });
    } catch (err: any) {
      updateBeat({ downloads: beat.downloads });
      setError(`Failed to download beat: ${err.message}`);
      console.error("Download error:", err);
    }
  };

  // Copy link functionality
  const handleCp = () => {
    if (!beat.id) {
      setError("Cannot copy: Beat ID is missing.");
      return;
    }
    const beatUrl = `${window.location.origin}/beat/${beat.id}`;
    if (!cp) {
      setCp(true);
      navigator.clipboard.writeText(beatUrl).then(() => {
        setTimeout(() => setCp(false), 2000);
      }).catch((err) => {
        setError("Failed to copy link.");
        console.error("Copy link error:", err);
        setCp(false);
      });
    }
  };

  // Share functionality
  const shareBeat = (platform: string) => {
    if (!beat.id) {
      setError("Cannot share: Beat ID is missing.");
      return;
    }
    const beatUrl = `${window.location.origin}/beat/${beat.id}`;
    const shareText = beat.title ? `Check out "${beat.title}" by ${artistNames[beat.userId] || "Unknown Artist"}!` : "Check out this beat!";

    try {
      switch (platform) {
        case "whatsapp":
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + beatUrl)}`, "_blank");
          break;
        case "facebook":
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(beatUrl)}`, "_blank");
          break;
        case "instagram":
          navigator.clipboard.writeText(`${shareText} ${beatUrl}`).then(() => {
            alert("Beat link copied to clipboard! You can paste it in Instagram.");
          }).catch((err) => {
            setError("Failed to copy link for Instagram.");
            console.error("Instagram share error:", err);
          });
          break;
        case "copy":
          handleCp();
          break;
        default:
          throw new Error("Unsupported platform");
      }
      setShowShareModal(false);
    } catch (err: any) {
      setError(`Failed to share beat: ${err.message}`);
      console.error("Share error:", err);
    }
  };

  // Report functionality
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuth || !authId) {
      setError("Please log in to submit a report.");
      router.push("/login");
      return;
    }

    if (!beat.id) {
      setError("Invalid beat ID.");
      return;
    }

    if (!reportReason.trim()) {
      setError("Please provide a reason for reporting.");
      return;
    }

    if (!DATABASE_ID || !REPORTS_COLLECTION_ID) {
      setError("Report functionality is unavailable due to configuration issues.");
      return;
    }

    try {
      const currentUser = await databases.getDocument(DATABASE_ID, "6849aa4f000c032527a9", authId);
      const sanitizedReason = reportReason.trim().slice(0, 1000);

      const response = await databases.createDocument(
        DATABASE_ID,
        REPORTS_COLLECTION_ID,
        ID.unique(),
        {
          beatId: beat.id,
          senderId: authId,
          beatTitle: beat.title || "Untitled",
          senderEmail: currentUser.email || "unknown",
          reason: sanitizedReason,
          time: new Date().toISOString(),
        }
      );

      await reportSubmitted({
        to: currentUser.email || "unknown",
        reportedEntity: beat.title || "Untitled",
        supportUrl: "string.com",
        reportId: response.$id,
      });

      setShowReportModal(false);
      setReportReason("");
      setError("");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(`Failed to submit report: ${err.message}`);
      console.error("Report submission failed:", err);
    }
  };

  // Comment functionality (stub)
  const handleComment = () => {
    if (!isAuth) {
      setError("Please log in to comment on this beat.");
      router.push("/login");
      return;
    }
    console.log(`Commented on beat: ${beat.title}`);
    // Implement comment logic here if needed
  };

  if (!isOpen) return null;

  const openProfile = () => {
    router.push(`/profile/${beat.userId}`);
  };

  const openSong = () => {
    router.push(`/instrumental/${beat.postId}`);
  };

  return (
    <>
      <motion.div
        ref={menuRef}
        className="fixed inset-x-0 bottom-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      >
        <motion.div
          className="bg-gray-900 w-full max-w-2xl rounded-t-2xl shadow-2xl p-4 border-t border-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Error Display */}
          {error && (
            <div className="p-3 mb-4 bg-red-500 text-white rounded-lg">
              {error}
              <button
                onClick={() => setError("")}
                className="ml-2 text-white underline"
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top section with image, title, and artist */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <div className="flex space-x-4 items-center">
              <img
                onClick={openProfile}
                src={beat.imageUrl || "/placeholder-image.jpg"}
                alt={beat.title || "Beat"}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <h3
                  onClick={openSong}
                  className="text-lg font-semibold text-gray-200 max-w-[12rem] md:max-w-none overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {beat.title || "Untitled Beat"}
                </h3>
                <p
                  onClick={openProfile}
                  className="text-sm text-gray-400"
                >
                  {isLoadingArtist ? "Loading..." : artistNames[beat.userId] || "Unknown Artist"}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closeModal}
              className="ml-auto text-gray-400 hover:text-gray-200"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu options */}
          <div className="space-y-2 p-4">
            <button
              onClick={handleLikesToggle}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg disabled:opacity-50"
              disabled={isLiking}
            >
              <Heart className={`w-5 h-5 mr-3 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              {isLiked ? "Unlike" : "Like"} ({beat.likes || 0})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg"
            >
              <Share2 className="w-5 h-5 mr-3" /> Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg disabled:opacity-50"
              disabled={!beat.downloadUrl}
            >
              <Download className="w-5 h-5 mr-3" /> Download ({beat.downloads || 0})
            </button>
            <button
              onClick={openSong}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg"
            >
              <MessageCircle className="w-5 h-5 mr-3" /> Comment ({comments.length || 0})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                isAuth ? setShowReportModal(true) : router.push("/login");
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg"
            >
              <Flag className="w-5 h-5 mr-3" /> Report
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          >
            <motion.div
              ref={shareModalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-200">Share Beat</h3>
              <div className="space-y-2">
                <button
                  onClick={() => shareBeat("whatsapp")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                  WhatsApp
                </button>
                <button
                  onClick={() => shareBeat("facebook")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-5 w-5 mr-2 text-blue-500" />
                  Facebook
                </button>
                <button
                  onClick={() => shareBeat("instagram")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded"
                  aria-label="Share on Instagram"
                >
                  <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                  Instagram
                </button>
                <button
                  onClick={() => shareBeat("copy")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded"
                  aria-label="Copy beat link"
                >
                  <Link2 className="w-5 h-5 mr-2" />
                  {cp ? <span className="text-green-500">Copied</span> : <span>Copy Link</span>}
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="report-modal-title" className="text-lg font-semibold mb-4 text-gray-200">
                Report Beat
              </h3>
              <form onSubmit={handleReportSubmit}>
                <textarea
                  ref={textareaRef}
                  className="w-full p-2 mb-4 bg-gray-900 text-gray-200 rounded border border-gray-600"
                  rows={4}
                  placeholder="Please provide the reason for reporting this beat"
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
                      setReportReason("");
                      setError("");
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400 disabled:opacity-50"
                    disabled={!reportReason.trim()}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]"
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
              className="bg-[#0000006f] backdrop-blur-md p-6 rounded-lg w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="success-modal-title" className="text-lg font-semibold mb-4 text-green-400">
                Report Submitted
              </h3>
              <p className="text-gray-200 mb-4">
                Your report has been submitted successfully. Thank you for your feedback.
              </p>
              <div className="flex justify-end">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400"
                  aria-label="Close success modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}