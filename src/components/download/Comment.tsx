"use client"; // Mark as Client Component for Next.js App Router

import React, { useState, useEffect, useRef } from 'react';
import { FaCommentSlash } from 'react-icons/fa'; // Import icon for no comments placeholder
import { useAppSelector } from '@/store/hooks';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { useParams, useRouter } from 'next/navigation';

// Define TypeScript interfaces
interface User {
  $id: string;
  username: string;
  image: string;
}

interface Props {
  currentUserId: string;
}

interface Comment {
  $id: string;
  userId: string;
  text: string;
  timestamp: string;
  instrumentalId: string;
  user?: User;
}

export default function Comment({ currentUserId }: Props) {
  // State and hooks
  const [newComment, setNewComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const authId = useAppSelector((state) => state.authId.value) as string | undefined;
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const params = useParams();
  const router = useRouter();
  const instrumentalId = params.beatId as string;

  const menuRef = useRef<HTMLDivElement>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COMMENTS_COLLECTION_ID = '686a7cad002cd0b8f879';
  const USERS_COLLECTION_ID = '6849aa4f000c032527a9';

  // useEffect for click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // useEffect for fetching data
  useEffect(() => {
    async function fetchData() {
      if (!DATABASE_ID) {
        console.error('DATABASE_ID is not defined');
        return;
      }

      try {
        if (isAuth && authId) {
          const userResponse = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            authId
          );
          setCurrentUser({
            $id: userResponse.$id,
            username: `${userResponse.firstName} ${userResponse.lastName}`,
            image: userResponse.profileImageUrl,
          });
        }

        const commentsResponse = await databases.listDocuments(
          DATABASE_ID,
          COMMENTS_COLLECTION_ID,
          [Query.equal('instrumentalId', instrumentalId)]
        );

        const commentsWithUserData: Comment[] = await Promise.all(
          commentsResponse.documents.map(async (comment) => {
            const userResponse = await databases.getDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              comment.userId
            );
            return {
              $id: comment.$id,
              userId: comment.userId,
              text: comment.text,
              timestamp: comment.timestamp || comment.$createdAt, // Fallback to $createdAt
              instrumentalId: comment.instrumentalId,
              user: {
                $id: userResponse.$id,
                username: `${userResponse.firstName} ${userResponse.lastName}`,
                image: userResponse.profileImageUrl,
              },
            };
          })
        );

        setComments(commentsWithUserData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [authId, isAuth, instrumentalId, DATABASE_ID]);

  // Handlers
  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuth || !authId || !currentUser || !DATABASE_ID) {
      console.error('Cannot submit comment: missing data or not authenticated');
      return;
    }

    setLoading(true);
    try {
      const newCommentData = {
        userId: authId,
        text: newComment,
        timestamp: new Date().toISOString(),
        instrumentalId,
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        'unique()',
        newCommentData
      );

      // Explicitly construct the Comment object to match the interface
      const newCommentObj: Comment = {
        $id: response.$id,
        userId: authId,
        text: newComment,
        timestamp: response.timestamp || response.$createdAt,
        instrumentalId,
        user: currentUser,
      };

      setComments((prev) => [...prev, newCommentObj]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!DATABASE_ID) {
      console.error('DATABASE_ID is not defined');
      return;
    }

    setLoading(true);
    try {
      await databases.deleteDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId);
      setComments((prev) => prev.filter((comment) => comment.$id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.$id);
    setEditedCommentText(comment.text);
    setMenuOpen(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editedCommentText.trim() || !DATABASE_ID) {
      console.error('Cannot save comment: missing data');
      return;
    }

    setLoading(true);
    try {
      await databases.updateDocument(DATABASE_ID, COMMENTS_COLLECTION_ID, commentId, {
        text: editedCommentText,
        timestamp: new Date().toISOString(),
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment.$id === commentId
            ? { ...comment, text: editedCommentText, timestamp: new Date().toISOString() }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditedCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };

  const toggleMenu = (commentId: string) => {
    setMenuOpen((prev) => (prev === commentId ? null : commentId));
  };
  
  const openProfil = () =>{
    router.push(`/profile/${currentUser.$id}`)
  }

  return (
    <div className="max-w-3xl mt-6 mx-auto">
      <div className="mb-8">
        <h2 className="text-[1.5rem] font-bold text-white mb-6 tracking-tight">Comments</h2>

        {comments.length > 0 ? (
          <ul className="space-y-6">
            {comments.map((comment) => (
              <li
                key={comment.$id}
                className="bg-gray-900 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 relative"
              >
                <div className="flex items-start space-x-4">
                  <img
                  onClick={openProfil}
                    src={comment.user?.image || 'https://example.com/avatars/default.png'}
                    alt={`${comment.user?.username || 'User'}'s avatar`}
                    className="w-12 h-12 rounded-full border-2 border-gray-800 object-cover transform hover:scale-105 transition-transform duration-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p 
                      onClick={openProfil}
                      className="text-white font-semibold text-lg max-w-[6rem] md:w-auto overflow-hidden text-ellipsis whitespace-nowrap">
                        {comment.user?.username || 'Unknown User'}
                      </p>
                      <div className="flex items-center space-x-4">
                        <p className="text-gray-400 text-sm">
                          {new Date(comment.timestamp).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                            timeZone: 'Africa/Lagos',
                          })}
                        </p>
                        {authId && (authId === comment.userId || currentUserId === authId) && (
                          <div className="relative" ref={menuRef}>
                            <button
                              onClick={() => toggleMenu(comment.$id)}
                              className="text-gray-400 hover:text-white focus:outline-none"
                            >
                              ⋮
                            </button>
                            {menuOpen === comment.$id && (
                              <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-md shadow-lg z-10">
                                {authId === comment.userId && (
                                  <button
                                    onClick={() => handleEditComment(comment)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                  >
                                    Edit
                                  </button>
                                )}
                                {(authId === comment.userId || currentUserId === authId) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.$id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {editingCommentId === comment.$id ? (
                      <div className="mt-2">
                        <textarea
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                          className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                          rows={3}
                        />
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleSaveEdit(comment.$id)}
                            className="bg-orange-500 text-white px-4 py-1 rounded-md hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !editedCommentText.trim()}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 text-white px-4 py-1 rounded-md hover:bg-gray-700 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-200 mt-1 leading-relaxed">{comment.text}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 bg-gray-900 rounded-lg shadow-md">
            <FaCommentSlash className="mx-auto text-gray-400 text-4xl mb-2" />
            <p className="text-gray-400 text-lg">No comments yet.</p>
            <p className="text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
          </div>
        )}

        {isAuth ? (
          <form onSubmit={handleCommentSubmit} className="mt-6">
            <textarea
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewComment(e.target.value)
              }
              placeholder="Add a comment..."
              className="w-full p-3 rounded-md bg-gray-900 text-white border border-gray-600 focus:outline-none focus:border-orange-500 transition-colors duration-200"
              rows={3}
            />
            <button
              type="submit"
              className="mt-3 bg-orange-500 text-white px-5 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !newComment.trim() || !currentUser}
            >
              {loading ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        ) : (
          <div className="text-center mt-6 py-4 bg-gray-900 rounded-lg shadow-md">
            <p className="text-gray-400 text-lg">Please log in to add a comment.</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-3 bg-orange-500 text-white px-5 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

