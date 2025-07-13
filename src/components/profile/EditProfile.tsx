
"use client";

import Loading from '../loading/Loading';
import SkeletonEditProfile from "./SkeletonEditProfile";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { databases, storage, ID, account } from "../../lib/appwrite";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setNav } from "@/store/slices/navpic";

const EditProfile = () => {
  const router = useRouter();
  const userid = useAppSelector((state) => state.authId.value);
  const dispatch = useAppDispatch();

  // State for profile data, image previews, and upload indicators
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    gender: "",
    bio: "",
    address: "",
    email: "",
    profileImageUrl: "",
    headerImageUrl: "",
    profileImageId: "",
    bannerImageId: "",
    hometown: "",
    dob: "",
    genre: "",
  });
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYearError, setDobYearError] = useState("");
  const [dobAgeError, setDobAgeError] = useState("");
  const [dobMonthError, setDobMonthError] = useState("");
  const [dobDayError, setDobDayError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [bioError, setBioError] = useState("");
  const [bioLengthError, setBioLengthError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [hometownError, setHometownError] = useState("");
  const [genreError, setGenreError] = useState("");
  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(null);
  const [previewBannerImage, setPreviewBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [isCroppingProfile, setIsCroppingProfile] = useState(false);
  const [isCroppingBanner, setIsCroppingBanner] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const bannerImageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasInvalidInputs, setHasInvalidInputs] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE;
  const COLLECTION_ID = "6849aa4f000c032527a9";
  const _ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewProfileImage) URL.revokeObjectURL(previewProfileImage);
      if (previewBannerImage) URL.revokeObjectURL(previewBannerImage);
    };
  }, [previewProfileImage, previewBannerImage]);

  // Check for empty or invalid inputs in real-time
  useEffect(() => {
    const checkInputs = () => {
      const isEmptyOrInvalid =
        !profile.firstName.trim() ||
        !profile.lastName.trim() ||
        !profile.gender ||
        !profile.bio.trim() ||
        !profile.address.trim() ||
        !profile.hometown.trim() ||
        !profile.genre.trim() ||
        !dobYear ||
        !dobMonth ||
        !dobDay ||
        !!firstNameError ||
        !!lastNameError ||
        !!genderError ||
        !!bioError ||
        !!bioLengthError ||
        !!addressError ||
        !!hometownError ||
        !!genreError ||
        !!dobYearError ||
        !!dobAgeError ||
        !!dobMonthError ||
        !!dobDayError;
      setHasInvalidInputs(isEmptyOrInvalid);
    };
    checkInputs();
  }, [
    profile.firstName,
    profile.lastName,
    profile.gender,
    profile.bio,
    profile.address,
    profile.hometown,
    profile.genre,
    dobYear,
    dobMonth,
    dobDay,
    firstNameError,
    lastNameError,
    genderError,
    bioError,
    bioLengthError,
    addressError,
    hometownError,
    genreError,
    dobYearError,
    dobAgeError,
    dobMonthError,
    dobDayError,
  ]);

  // Fetch profile data and verify authorization
  useEffect(() => {
    // cheek current user ID
    const currentUser = account.get();
    
    if (!currentUser) {
      setError("User ID not provided");
      setLoading(false);
      return;
    }
    
    if (!DATABASE_ID) {
      setError("Database ID is not configured");
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Verify logged-in user
        
        if (!currentUser) {
          setError("Unauthorized to edit this profile");
          setLoading(false);
          return;
        }

        // Fetch profile data
        const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userid);
        const dob = response.dob || "";
        let year = "",
          month = "",
          day = "";
        if (dob) {
          [year, month, day] = dob.split("-");
        }
        const fetchedBio = response.bio || "";
        setProfile({
          firstName: response.firstName || "",
          lastName: response.lastName || "",
          username: response.username || "",
          gender: response.gender || "",
          bio: fetchedBio.slice(0, 100), // Ensure bio is ≤ 100 on fetch
          address: response.address || "",
          email: response.email || "",
          profileImageUrl: response.profileImageUrl || "",
          headerImageUrl: response.headerImageUrl || "",
          profileImageId: response.profileImageId || "",
          bannerImageId: response.bannerImageId || "",
          hometown: response.hometown || "",
          dob: dob,
          genre: response.genre || "",
        });
        
        setPreviewProfileImage(response.profileImageUrl || null);
        setPreviewBannerImage(response.headerImageUrl || null);
        setDobYear(year);
        setDobMonth(month);
        setDobDay(day);
        validateDob(year, month, day); // Validate DOB on load
      } catch (err) {
        
        setError("Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userid, DATABASE_ID]);

  // Compression function for banner image (~51KB)
  const compressTo51KB = useCallback(
    (canvas: HTMLCanvasElement): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const targetSize = 51000; // ~51KB in bytes
        let quality = 0.95;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }
              const size = blob.size;
              if (size <= targetSize || quality <= 0.01) {
                if (size <= targetSize) {
                  resolve(blob);
                } else {
                  reject(new Error("Could not compress to 51KB"));
                }
                return;
              }
              quality -= 0.02;
              tryCompress();
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      });
    },
    []
  );

  // Validate Date of Birth
  const validateDob = (year: string, month: string, day: string) => {
    setDobYearError("");
    setDobAgeError("");
    setDobMonthError("");
    setDobDayError("");

    // Year validation
    if (!year) {
      setDobYearError("Year is required");
      return;
    }
    const yearNum = parseInt(year);
    if (!year.match(/^\d{4}$/) || yearNum < 1900 || yearNum > 2007) {
      setDobYearError("Enter a valid year (1900–2007)");
      return;
    }
    const age = new Date("2025-06-23").getFullYear() - yearNum;
    if (age < 18) {
      setDobAgeError("You must be at least 18 years old.");
      return;
    }

    // Month validation
    if (!month) {
      setDobMonthError("Month is required");
      return;
    }
    if (month === "0" || month === "00") {
      setDobMonthError("Month cannot be zero");
      return;
    }
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      setDobMonthError("Enter a valid month (01–12)");
      return;
    }

    // Day validation
    if (!day) {
      setDobDayError("Day is required");
      return;
    }
    if (day === "0" || day === "00") {
      setDobDayError("Day cannot be zero");
      return;
    }
    const dayNum = parseInt(day);
    const maxDays = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum < 1 || dayNum > maxDays) {
      setDobDayError(`Enter a valid day (01–${maxDays.toString().padStart(2, "0")})`);
      return;
    }
  };

  // Validate all inputs for empty fields
  const validateInputs = () => {
    setFirstNameError(profile.firstName.trim() ? "" : "First name is required");
    setLastNameError(profile.lastName.trim() ? "" : "Last name is required");
    setGenderError(profile.gender ? "" : "Gender is required");
    setBioError(profile.bio.trim() ? "" : "Bio is required");
    setAddressError(profile.address.trim() ? "" : "Address is required");
    setHometownError(profile.hometown.trim() ? "" : "Hometown is required");
    setGenreError(profile.genre.trim() ? "" : "Genre is required");
    validateDob(dobYear, dobMonth, dobDay);
  };

  // Handle form submission to update profile data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!DATABASE_ID) {
      setError("Database ID is not configured");
      return;
    }

    validateInputs(); // Highlight empty/invalid fields on save attempt
    if (hasInvalidInputs) {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    setIsSaving(true);
    const dob = `${dobYear}-${dobMonth.padStart(2, "0")}-${dobDay.padStart(2, "0")}`;
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, userid, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        bio: profile.bio,
        address: profile.address,
        email: profile.email,
        profileImageUrl: profile.profileImageUrl,
        headerImageUrl: profile.headerImageUrl,
        profileImageId: profile.profileImageId,
        bannerImageId: profile.bannerImageId,
        hometown: profile.hometown,
        dob: dob,
        genre: profile.genre,
      });
      dispatch(setNav(profile.profileImageUrl));
      await account.updateName(profile.firstName + " " + profile.lastName);
      
      window.location.href = `${window.location.origin}/profile/${userid}`;
      
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Error updating profile data");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile image upload with square cropping and compression
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (!_ID) {
      setError("Storage  ID is not configured");
      return;
    }
    if (!canvasRef.current) {
      setError("Canvas not available");
      return;
    }

    setIsCroppingProfile(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Canvas context not available");
      setIsCroppingProfile(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Crop to square
          let sx = 0,
            sy = 0,
            sWidth = img.width,
            sHeight = img.height;
          if (img.width !== img.height) {
            const size = Math.min(img.width, img.height);
            sx = (img.width - size) / 2;
            sy = (img.height - size) / 2;
            sWidth = sHeight = size;
          }

          // Resize to 512x512
          const targetSize = 512;
          canvas.width = targetSize;
          canvas.height = targetSize;
          ctx.clearRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

          // Compress with 70% quality
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                setError("Failed to create blob");
                setIsCroppingProfile(false);
                return;
              }
              console.log("Profile blob size:", blob.size);
              const oldPreview = previewProfileImage;
              setPreviewProfileImage(null);
              if (oldPreview) {
                URL.revokeObjectURL(oldPreview);
              }
              const previewUrl = URL.createObjectURL(blob);
              console.log("New profile preview URL:", previewUrl);
              setPreviewProfileImage(previewUrl);
              setUploadingProfileImage(true);

              try {
                const uploadFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
                
                const response = await storage.createFile(_ID, ID.unique(), uploadFile);
                
                const newProfileImageUrl = storage.getFileView(_ID, response.$id).toString();
                
                console.log("Appwrite profile URL:", newProfileImageUrl);
                setProfile((prev) => ({
                  ...prev,
                  profileImageUrl: newProfileImageUrl,
                  profileImageId: response.$id,
                }));
              } catch (err: any) {
                setError(`Error uploading profile image: ${err.message || "Unknown error"}`);
                console.error("Appwrite upload error:", err);
              } finally {
                setUploadingProfileImage(false);
                setIsCroppingProfile(false);
              }
            },
            "image/jpeg",
            0.7
          );
        } catch (err: any) {
          setError(`Error processing profile image: ${err.message || "Unknown error"}`);
          console.error("Processing error:", err);
          setIsCroppingProfile(false);
        }
      };
      img.onerror = () => {
        setError("Failed to load image");
        console.error("Image load error");
        setIsCroppingProfile(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setError("Failed to read file");
      console.error("FileReader error");
      setIsCroppingProfile(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle banner image upload with aspect ratio check
  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (!_ID) {
      setError("Storage  ID is not configured");
      return;
    }
    if (!canvasRef.current) {
      setError("Canvas not available");
      return;
    }

    setIsCroppingBanner(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Canvas context not available");
      setIsCroppingBanner(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        try {
          const aspectRatio = 2 / 1;
          const currentAspectRatio = img.width / img.height;
          const outputWidth = 800;
          const outputHeight = 400;

          canvas.width = outputWidth;
          canvas.height = outputHeight;
          ctx.clearRect(0, 0, outputWidth, outputHeight);

          if (Math.abs(currentAspectRatio - aspectRatio) < 0.01) {
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, outputWidth, outputHeight);
          } else {
            let cropWidth = img.width;
            let cropHeight = cropWidth / aspectRatio;

            if (cropHeight > img.height) {
              cropHeight = img.height;
              cropWidth = cropHeight * aspectRatio;
            }

            const cropX = (img.width - cropWidth) / 2;
            const cropY = (img.height - cropHeight) / 2;

            ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
          }

          const compressedBlob = await compressTo51KB(canvas);
          const oldPreview = previewBannerImage;
          setPreviewBannerImage(null);
          if (oldPreview) {
            URL.revokeObjectURL(oldPreview);
          }
          const previewUrl = URL.createObjectURL(compressedBlob);
          console.log("New banner preview URL:", previewUrl);
          setPreviewBannerImage(previewUrl);
          setUploadingBannerImage(true);

          try {
            const uploadFile = new File([compressedBlob], "banner.jpg", { type: "image/jpeg" });
            const response = await storage.createFile(_ID, ID.unique(), uploadFile);
            const newBannerUrl = storage.getFileView(_ID, response.$id).toString();
            console.log("Appwrite banner URL:", newBannerUrl);
            setProfile((prev) => ({
              ...prev,
              headerImageUrl: newBannerUrl,
              bannerImageId: response.$id,
            }));
          } catch (err: any) {
            setError(`Error uploading banner image: ${err.message || "Unknown error"}`);
            console.error("Appwrite upload error:", err);
          } finally {
            setUploadingBannerImage(false);
            setIsCroppingBanner(false);
          }
        } catch (err: any) {
          setError(`Error processing banner image: ${err.message || "Unknown error"}`);
          console.error("Processing error:", err);
          setIsCroppingBanner(false);
        }
      };
      img.onerror = () => {
        setError("Failed to load image");
        console.error("Image load error");
        setIsCroppingBanner(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setError("Failed to read file");
      console.error("FileReader error");
      setIsCroppingBanner(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle DOB input changes
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value.replace(/[^0-9]/g, "");

    if (name === "dobYear") {
      setDobYear(formattedValue.slice(0, 4));
      setDobYearError("");
      setDobAgeError("");
      validateDob(formattedValue.slice(0, 4), dobMonth, dobDay);
    } else if (name === "dobMonth") {
      if (formattedValue.length <= 2) {
        setDobMonth(formattedValue);
        setDobMonthError("");
        validateDob(dobYear, formattedValue, dobDay);
      }
    } else if (name === "dobDay") {
      if (formattedValue.length <= 2) {
        setDobDay(formattedValue);
        setDobDayError("");
        validateDob(dobYear, dobMonth, formattedValue);
      }
    }
  };

  // Handle other input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name !== "email" && name !== "username" && !["dobYear", "dobMonth", "dobDay"].includes(name)) {
      if (name === "bio" && value.length > 100) {
        setBioLengthError("Bio must be 100 characters or less.");
        return; // Prevent adding text beyond 100
      }
      setProfile((prev) => ({ ...prev, [name]: value }));
      // Clear error for the changed field
      switch (name) {
        case "firstName":
          setFirstNameError("");
          break;
        case "lastName":
          setLastNameError("");
          break;
        case "gender":
          setGenderError("");
          break;
        case "bio":
          setBioError("");
          setBioLengthError("");
          break;
        case "address":
          setAddressError("");
          break;
        case "hometown":
          setHometownError("");
          break;
        case "genre":
          setGenreError("");
          break;
      }
    }
  };

  // Handle navigation to change password page
  const handleChangePassword = () => {
    router.push(`/profile/change-password`);
  };

  // Handle navigation to home page
  const handleGoHome = () => {
    router.push("/");
  };
  
  const [loadi,setLoadi] = useState<boolean>(false)
  
useEffect(() => {
  setTimeout(() =>{
    setLoadi(true)
  },2000)
},[])

  if (loading) return (
        <div className="min-h-screen p-6">
           {
             
           loadi ?  <SkeletonEditProfile /> : <Loading />
           }
        </div>
    )
  ;
  if (error) {
    return (
      <div className="text-red-500 w-screen justify-center items-center flex flex-col py-10">
        {error}
        {error === "User ID not provided" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoHome}
            className="mt-4 py-2 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          >
            Go Home
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-200 p-6">
      <motion.div
        ref={formRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto backdrop-blur-md rounded-xl shadow-2xl p-8 border border-gray-800"
      >
        <h1 className="text-2xl font-bold mb-6 text-orange-500 text-center">Edit Your Profile</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          {/* Banner Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
            <div className="relative">
              <div className="w-full h-32 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                {uploadingBannerImage || isCroppingBanner ? (
                  <div className="w-12 h-12 border-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                ) : previewBannerImage ? (
                  <img
                    src={previewBannerImage}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    key={previewBannerImage}
                    onError={() => setPreviewBannerImage(null)}
                  />
                ) : (
                       <span></span>
                )}
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="file"
                accept="image/*"
                onChange={handleBannerImageChange}
                ref={bannerImageRef}
                className="absolute inset-0 w-full h-32 opacity-0 cursor-pointer"
              />
              <div
                  className="absolute  inset-0 flex items-center justify-center text-white   pointer-events-none">
              <p className="text-[1rem] bg-[#0000006f] p-1 rounded-lg backdrop-blur-md font-semibold">
                Click to upload or drag and drop
              </p>
              </div>
            </div>
          </div>

          {/* Profile Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Profile Image</label>
            <div className="relative">
              <div className="w-full h-48 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                {uploadingProfileImage || isCroppingProfile ? (
                  <div className="w-16 h-16 border-4 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                ) : previewProfileImage ? (
                  <img
                    src={previewProfileImage}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    key={previewProfileImage}
                    onError={() => setPreviewProfileImage(null)}
                  />
                ) : (
                  <span className="text-gray-500"></span>
                )}
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                ref={profileImageRef}
                className="absolute inset-0 w-full h-48 opacity-0 cursor-pointer z-10"
              />
              <div
                  className="absolute  inset-0 flex items-center justify-center text-white   pointer-events-none">
              <p className="text-[1rem] bg-[#0000006f] p-1 rounded-lg backdrop-blur-md font-semibold">
                Click to upload or drag and drop
              </p>
              </div>
            </div>
          </div>

          {/* First Name */}
          <div>
            {profile.firstName =="" && <p className="text-red-500 text-sm mb-2">fill first name is empty</p>}
            <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter first name"
            />
          </div>

          {/* Last Name */}
          <div>
            {profile.lastName =="" && <p className="text-red-500 text-sm mb-2">fill last name is empty</p>}
            <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter last name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
            <motion.input
              whileFocus={{ opacity: 0.8 }}
              type="text"
              name="username"
              value={profile.username}
              disabled
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-not-allowed text-gray-400"
              placeholder="Username (not editable)"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <motion.input
              whileFocus={{ opacity: 0.8 }}
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 cursor-not-allowed text-gray-400"
              placeholder="Email (not editable)"
            />
          </div>

          {/* Gender */}
          <div>
            {profile.gender =="" && <p className="text-red-500 text-sm mb-2">fill gender is empty</p>}
            <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </motion.select>
          </div>

          {/* Bio */}
          <div>
         {profile.bio =="" && <p className="text-red-500 text-sm mb-2">fill bio is empty</p>}
            {(bioError || bioLengthError) && (
              <div className="text-red-500 text-sm mb-2">
                {bioError && <p>{bioError}</p>}
                {bioLengthError && <p>{bioLengthError}</p>}
              </div>
            )}
            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 h-24 resize-none placeholder-gray-500"
              placeholder="Enter a brief bio"
            />
          </div>

          {/* Address */}
          <div>
            {profile.address =="" && <p className="text-red-500 text-sm mb-2">fill address is empty</p>}
            <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter address"
            />
          </div>

          {/* Hometown */}
          <div>
            {profile.hometown =="" && <p className="text-red-500 text-sm mb-2">fill home town is empty</p>}
            <label className="block text-sm font-medium text-gray-400 mb-2">Hometown</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="hometown"
              value={profile.hometown}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter hometown"
            />
          </div>

          {/* Date of Birth */}
          <div>
            {(dobYearError || dobAgeError || dobMonthError || dobDayError) && (
              <div className="text-red-500 text-sm mb-2">
                {dobYearError && <p>{dobYearError}</p>}
                {dobAgeError && <p>{dobAgeError}</p>}
                {dobMonthError && <p>{dobMonthError}</p>}
                {dobDayError && <p>{dobDayError}</p>}
              </div>
            )}
            <label className="block text-sm font-medium text-gray-400 mb-2">Date of Birth</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="dobYear"
                  value={dobYear}
                  onChange={handleDobChange}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
                  placeholder="YYYY"
                  maxLength={4}
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="dobMonth"
                  value={dobMonth}
                  onChange={handleDobChange}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
                  placeholder="MM"
                  maxLength={2}
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  name="dobDay"
                  value={dobDay}
                  onChange={handleDobChange}
                  className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
                  placeholder="DD"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Genre */}
            {profile.genre =="" && <p className="text-red-500 text-sm mb-2">fill genre is empty</p>}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="genre"
              value={profile.genre}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all duration-200 placeholder-gray-500"
              placeholder="Enter genre"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSaving || hasInvalidInputs}
            className={`w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center ${
              isSaving || hasInvalidInputs
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-orange-600 hover:to-orange-700"
            }`}
          >
            {isSaving ? (
              <div className="w-6 h-6 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
            ) : (
              "Save Changes"
            )}
          </motion.button>
          <div className="text-center mt-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChangePassword}
              className="text-orange-500 hover:text-orange-600 cursor-pointer underline"
            >
              Change Password
            </motion.a>
          </div>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </motion.div>
    </div>
  );
};

export default EditProfile;