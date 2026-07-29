
// ========================== 9-11-25 =======================================

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { Upload, Download, Wand2, Loader2, AlertCircle, ArrowLeft } from "lucide-react"; // Import icons
import { useNavigate } from 'react-router-dom';

const Bg = () => {
  // State for Background Removal feature
  const [bgRemoverImageFile, setBgRemoverImageFile] = useState(null);
  const [originalBgRemoverImage, setOriginalBgRemoverImage] = useState(null);
  const [resultBgRemoverImage, setResultBgRemoverImage] = useState(null);
  const [isBgRemoverLoading, setIsBgRemoverLoading] = useState(false);
  const [bgRemoverError, setBgRemoverError] = useState(null);
  const bgRemoverFileInputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleBgRemoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke the previous object URL to avoid memory leaks
      if (originalBgRemoverImage) {
        URL.revokeObjectURL(originalBgRemoverImage);
      }
      if (resultBgRemoverImage) {
        URL.revokeObjectURL(resultBgRemoverImage);
      }

      setBgRemoverImageFile(file);
      setOriginalBgRemoverImage(URL.createObjectURL(file));
      setResultBgRemoverImage(null); // Reset result on new image upload
      setBgRemoverError(null);
    }
  };

  const handleBgRemoverUploadClick = () => {
    bgRemoverFileInputRef.current.click();
  };

  // The handleRemoveBackground function is updated for Clipdrop
  const handleRemoveBackground = async () => {
    if (!bgRemoverImageFile) {
      setBgRemoverError("Please upload an image first.");
      return;
    }

    setIsBgRemoverLoading(true);
    setBgRemoverError(null);
    setResultBgRemoverImage(null);

    // Clipdrop API requires FormData
    const form = new FormData();
    form.append("image_file", bgRemoverImageFile);

    // IMPORTANT: Replace with your actual Clipdrop API Key
    const apiKey = 'c08b2eab32932e6e2274d5c016da1dd8acd38dd3071a4ea8c3e66be8fd42b2aea050406f5d970a50dcb6cca3e208fd14';
    const apiUrl = "https://clipdrop-api.co/remove-background/v1";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
        body: form,
      });

      if (!response.ok) {
        // Try to get a more detailed error message from the API response
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error: ${response.status} ${response.statusText}`
        );
      }

      // The successful response is the image data itself, not JSON.
      // We read it as a Blob.
      const imageBlob = await response.blob();

      // Create an object URL from the Blob to display it in an <img> tag
      const imageUrl = URL.createObjectURL(imageBlob);
      setResultBgRemoverImage(imageUrl);
    } catch (err) {
      console.error(err);
      setBgRemoverError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsBgRemoverLoading(false);
    }
  };

  const navigate1 = useNavigate();

  return (
  <div className="">
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4  rounded-xl">
      <div className="flex justify-between w-full">
      <button  onClick={() => navigate1('/result')}
       
        className={`flex items-center  gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-9 `}
        aria-label="Go back">
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        // className="w-full max-w-7xl  bg-gradient-to-br from-violet-200 via-sky-200 to-emerald-200 mx-auto p-6 rounded-2xl shadow-xl" >
        className="w-full max-w-7xl  bg-gradient-to-br from-violet-200 via-sky-200 to-emerald-200 mx-auto p-6 rounded-2xl shadow-xl" >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Background Remover
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          {/* Left Side - Upload & Actions */}
          <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-300 rounded-xl h-96 bg-gray-50">
            {!originalBgRemoverImage ? (
              <>
                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  Upload Your Image
                </h3>
                <p className="text-gray-500 mb-4">
                  Click below to select a file
                </p>
                <button
                  onClick={handleBgRemoverUploadClick}
                  className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Image
                </button>
                <input
                  type="file"
                  ref={bgRemoverFileInputRef}
                  onChange={handleBgRemoverFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Original Image
                </h3>
                <img
                  src={originalBgRemoverImage}
                  alt="Original for BG removal"
                  className="max-h-60 w-auto rounded-lg shadow-lg mb-4"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isBgRemoverLoading}
                    className="flex items-center justify-center bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                  >
                    {isBgRemoverLoading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5 mr-2" />
                    )}
                    {isBgRemoverLoading ? "Processing..." : "Remove Background"}
                  </button>
                  <button
                    onClick={handleBgRemoverUploadClick}
                    className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Change Image
                  </button>
                  <input
                    type="file"
                    ref={bgRemoverFileInputRef}
                    onChange={handleBgRemoverFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Result Display */}
          <div className="flex flex-col items-center justify-center bg-gray-200 p-6 rounded-xl h-96 relative overflow-hidden">
            {isBgRemoverLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-10">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
                <p className="text-lg mt-4 text-gray-700">
                  Removing background...
                </p>
              </div>
            )}
            {bgRemoverError && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10 text-center p-4">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-red-600 font-semibold">An Error Occurred</p>
                <p className="text-red-500 text-sm">{bgRemoverError}</p>
              </div>
            )}
            {!resultBgRemoverImage &&
              !isBgRemoverLoading &&
              !bgRemoverError && (
                <div className="text-center text-gray-500">
                  <Wand2 className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">
                    Result will appear here
                  </h3>
                  <p>The background of your image will be transparent.</p>
                </div>
              )}
            {resultBgRemoverImage && (
              <>
                <img
                  src={resultBgRemoverImage}
                  alt="Background removed"
                  className="max-h-full max-w-full object-contain rounded-lg z-0"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' x='0' y='0' fill='%23d1d5db'/%3E%3Crect width='10' height='10' x='10' y='10' fill='%23d1d5db'/%3E%3C/svg%3E\")",
                  }}
                />
                <a
                  href={resultBgRemoverImage}
                  download="background-removed.png"
                  className="absolute bottom-4 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg transition-transform transform hover:scale-105 z-20"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </a>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
    </div>
  );
};

export default Bg;


