
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Wand2, Loader2, AlertCircle, Expand, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Uncrop = () => {
    const [imageFile, setImageFile] = useState(null);
    const [displayImage, setDisplayImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for Uncrop extension parameters (in pixels)
    const [extensions, setExtensions] = useState({
        left: 0,
        right: 0,
        up: 0,
        down: 0
    });

    const fileInputRef = useRef(null);

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (displayImage) URL.revokeObjectURL(displayImage);
            if (resultImage) URL.revokeObjectURL(resultImage);
        };
    }, [displayImage, resultImage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setDisplayImage(URL.createObjectURL(file));
            setResultImage(null);
            setError(null);
            // Reset extensions on new image load
            setExtensions({ left: 0, right: 0, up: 0, down: 0 });
        }
    };

    const handleExtensionChange = (e) => {
        const { name, value } = e.target;
        // Ensure value is positive and a number
        const numValue = Math.max(0, parseInt(value) || 0);
        setExtensions(prev => ({
            ...prev,
            [name]: numValue
        }));
    };

    const handleUncrop = async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }

        // Validate that at least one dimension is being extended
        if (extensions.left === 0 && extensions.right === 0 && extensions.up === 0 && extensions.down === 0) {
            setError('Please specify at least one side to extend (e.g., set "Right" to 100px).');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append('image_file', imageFile);
            
            // Append only non-zero extension values
            if (extensions.left > 0) form.append('extend_left', extensions.left.toString());
            if (extensions.right > 0) form.append('extend_right', extensions.right.toString());
            if (extensions.up > 0) form.append('extend_up', extensions.up.toString());
            if (extensions.down > 0) form.append('extend_down', extensions.down.toString());

            // IMPORTANT: Replace with your actual Clipdrop API Key
            const apiKey = 'c08b2eab32932e6e2274d5c016da1dd8acd38dd3071a4ea8c3e66be8fd42b2aea050406f5d970a50dcb6cca3e208fd14';
            const apiUrl = 'https://clipdrop-api.co/uncrop/v1';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                },
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const blob = new Blob([buffer], { type: 'image/png' });
            setResultImage(URL.createObjectURL(blob));

        } catch (err) {
            console.error("Uncrop failed:", err);
            setError(err.message || 'Failed to uncrop image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const navigate1 = useNavigate();

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-6  rounded-xl">

            <div className="flex justify-between w-full">
      <button  onClick={() => navigate1('/result')}
       
        className={`flex items-center  gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-1 `}
        aria-label="Go back">
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                // WIDER UI: Changed max-w-5xl to max-w-6xl
                // className="w-full max-w-7xl mx-auto p-8 bg-gradient-to-br from-violet-200 via-sky-200 to-emerald-200 rounded-3xl shadow-2xl"    >
                className="w-full max-w-7xl mx-auto p-8 bg-gradient-to-br bg-white rounded-3xl shadow-2xl"    >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-2 flex items-center justify-center gap-3">
                        <Expand className="text-blue-600" /> Image Uncrop
                    </h2>
                    <p className="text-gray-500 text-lg">Expand your images beyond their original borders.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT: Input Area & Controls */}
                    <div className="flex flex-col gap-6">
                        {/* Image Uploader / Display */}
                        <div className="relative bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 min-h-[350px] flex items-center justify-center">
                            {!displayImage ? (
                                <div className="text-center p-8">
                                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 flex items-center mx-auto shadow-md"
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        Upload Photo
                                    </button>
                                    <p className="text-gray-400 mt-4 text-sm">JPG, PNG, WEBP supported</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center p-4">
                                    <img 
                                        src={displayImage} 
                                        alt="Original" 
                                        className="max-h-[350px] max-w-full object-contain shadow-sm rounded-lg" 
                                    />
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>

                        {/* CHANGE IMAGE BUTTON - MOVED BELOW */}
                        {displayImage && (
                             <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold flex items-center justify-center transition-all"
                            >
                                <Upload className="w-5 h-5 mr-2" /> Change Source Image
                            </button>
                        )}

                        {/* Uncrop Controls */}
                        <div className={`bg-blue-50 p-6 rounded-2xl border border-blue-100 transition-opacity ${!displayImage ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                                <Expand className="w-4 h-4 mr-2" /> Extend Dimensions (pixels)
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Up</label>
                                    <input type="number" name="up" value={extensions.up} onChange={handleExtensionChange} min="0" max="2000" className="w-full p-2 rounded-lg border-gray-200 border focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0 px" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Down</label>
                                    <input type="number" name="down" value={extensions.down} onChange={handleExtensionChange} min="0" max="2000" className="w-full p-2 rounded-lg border-gray-200 border focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0 px" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Left</label>
                                    <input type="number" name="left" value={extensions.left} onChange={handleExtensionChange} min="0" max="2000" className="w-full p-2 rounded-lg border-gray-200 border focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0 px" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Right</label>
                                    <input type="number" name="right" value={extensions.right} onChange={handleExtensionChange} min="0" max="2000" className="w-full p-2 rounded-lg border-gray-200 border focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="0 px" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Result Area */}
                    <div className="flex flex-col h-full gap-6">
                        <div className="flex-1 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden min-h-[350px]">
                            {isLoading ? (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                    <Loader2 className="w-14 h-14 text-blue-600 animate-spin mb-4" />
                                    <p className="text-gray-700 font-semibold">Expanding Image...</p>
                                    <p className="text-gray-500 text-sm">Dreaming up new pixels</p>
                                </div>
                            ) : error ? (
                                <div className="text-center p-6 bg-red-50 rounded-2xl mx-4 max-w-xs">
                                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                                    <p className="text-red-700 font-semibold mb-1">Error</p>
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            ) : resultImage ? (
                                <img src={resultImage} alt="Uncropped Result" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400 p-6">
                                    <Expand className="w-20 h-20 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Expanded result will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={handleUncrop}
                            disabled={!displayImage || isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center transition-all shadow-lg
                                ${!displayImage || isLoading 
                                    ? 'bg-gray-300 cursor-not-allowed opacity-70' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02]'}`}
                        >
                            {isLoading ? 'Processing...' : <><Wand2 className="w-5 h-5 mr-2" /> Uncrop Image Now</>}
                        </button>

                        {resultImage && !isLoading && (
                            <a
                                href={resultImage}
                                download="uncropped-image.png"
                                className="w-full py-3 text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors border border-blue-200"
                            >
                                <Download className="w-5 h-5 mr-2" /> Download Result
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Uncrop;