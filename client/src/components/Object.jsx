import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Wand2, Loader2, AlertCircle, Eraser, Brush, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Object = () => {
    const [imageFile, setImageFile] = useState(null);
    const [displayImage, setDisplayImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [brushSize, setBrushSize] = useState(30);
    const [isDrawing, setIsDrawing] = useState(false);

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    // Cleanup memory on unmount or new image
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
        }
    };

    // --- Canvas Drawing Logic for Mask ---
    const getMousePos = (canvas, evt) => {
        const rect = canvas.getBoundingClientRect();
        // Calculate scale in case canvas is displayed different from its intrinsic size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'white'; // Clipdrop expects white for the area to remove
        ctx.lineWidth = brushSize;
        
        const { x, y } = getMousePos(canvas, e.nativeEvent);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getMousePos(canvas, e.nativeEvent);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.closePath();
            setIsDrawing(false);
        }
    };

    // Ensure canvas matches image actual dimensions once image loads
    const handleImageLoad = () => {
        if (canvasRef.current && imageRef.current) {
            canvasRef.current.width = imageRef.current.naturalWidth;
            canvasRef.current.height = imageRef.current.naturalHeight;
            // Clear canvas initially (transparent black)
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const clearMask = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // --- API Call ---
    const handleCleanup = async () => {
        if (!imageFile) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1. Convert drawing canvas to a Blob (the mask_file)
            const maskBlob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));

            // 2. Prepare FormData with BOTH image and mask
            const form = new FormData();
            form.append('image_file', imageFile);
            form.append('mask_file', maskBlob);

            // IMPORTANT: Replace with your actual Clipdrop API Key
            const apiKey = 'c08b2eab32932e6e2274d5c016da1dd8acd38dd3071a4ea8c3e66be8fd42b2aea050406f5d970a50dcb6cca3e208fd14'; 

            // 3. Fetch Clipdrop Cleanup API
            const response = await fetch('https://clipdrop-api.co/cleanup/v1', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    // Do NOT set Content-Type here, let browser set multipart/form-data boundary
                },
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            const blob = new Blob([buffer], { type: 'image/png' });
            setResultImage(URL.createObjectURL(blob));

        } catch (err) {
            console.error("Cleanup failed:", err);
            setError(err.message || 'Failed to cleanup image');
        } finally {
            setIsLoading(false);
        }
    };

     const navigate2 = useNavigate();

    return (
        // <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-gradient-to-r from-purple-400 to-green-300 rounded-xl">
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-4  rounded-xl">

            <div className="flex justify-between w-full">
      <button  onClick={() => navigate2('/result')}
       
        className={`flex items-center  gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-9 `}
        aria-label="Go back">
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>
      </div>




            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-violet-200 via-sky-200 to-emerald-200 bg-white rounded-2xl shadow-xl"
            >
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Object Cleanup</h2>
                <p className="text-gray-500 text-center mb-8">Draw over the objects you want to remove</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-9 items-start">
                    {/* LEFT: Editor Area */}
                    <div className="flex flex-col gap-4">
                        <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 min-h-[400px] flex items-center justify-center">
                            {!displayImage ? (
                                <div className="text-center p-6">
                                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 flex items-center mx-auto"
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        Upload Image
                                    </button>
                                    <p className="text-gray-500 mt-2">JPG, PNG, WEBP</p>
                                </div>
                            ) : (
                                /* Drawing Area */
                                <div className="relative w-full h-full flex items-center justify-center bg-gray-900/5">
                                     {/* Display Image (bottom layer) */}
                                    <img 
                                        ref={imageRef}
                                        src={displayImage} 
                                        onLoad={handleImageLoad}
                                        alt="Original" 
                                        className="max-h-[500px] max-w-full object-contain pointer-events-none select-none" 
                                    />
                                    {/* Canvas Mask (top layer) - matches image size exactly due to absolute positioning over the container if needed, 
                                        but simpler to just let it stack naturally if they represent same space. 
                                        Best way: absolute position canvas OVER image, matching exact rendered dimensions.
                                        Simplified approach: CSS grid stack.
                                    */}
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[500px] max-w-full object-contain cursor-crosshair touch-none opacity-70"
                                        style={{ 
                                            // These styles ensure canvas visual size matches image visual size exactly
                                            aspectRatio: imageRef.current ? `${imageRef.current.naturalWidth} / ${imageRef.current.naturalHeight}` : 'auto'
                                         }}
                                    />
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>

                         {/* Editor Controls */}
                        {displayImage && (
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border">
                                <div className="flex items-center gap-3">
                                    <Brush className="text-gray-500 w-5 h-5" />
                                    <input 
                                        type="range" 
                                        min="5" max="100" 
                                        value={brushSize} 
                                        onChange={(e) => setBrushSize(Number(e.target.value))}
                                        className="w-32 accent-purple-600"
                                        title="Brush Size"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={clearMask} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center border border-red-200 transition-colors">
                                        <Eraser className="w-4 h-4 mr-2" /> Clear Mask
                                    </button>
                                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors">
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Result Area */}
                    <div className="flex flex-col h-full">
                        <div className="relative flex-1 bg-gray-100 rounded-xl border-2 border-gray-200 min-h-[400px] flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                                    <p className="text-gray-600 font-medium">Cleaning up image...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center p-6 max-w-xs">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <p className="text-red-600 font-semibold mb-1">Error</p>
                                    <p className="text-sm text-gray-500">{error}</p>
                                </div>
                            ) : resultImage ? (
                                <img src={resultImage} alt="Cleaned Result" className="max-h-[500px] max-w-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Cleaned result will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* Main Action Button */}
                        <button
                            onClick={handleCleanup}
                            disabled={!displayImage || isLoading}
                            className={`mt-6 w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center transition-all transform
                                ${!displayImage || isLoading 
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] hover:shadow-lg'}`}
                        >
                            {isLoading ? (
                                <>Processing...</>
                            ) : (
                                <><Wand2 className="w-6 h-6 mr-2" /> Clean Up Selected Area</>
                            )}
                        </button>

                        {resultImage && (
                            <a
                                href={resultImage}
                                download="cleanup-result.png"
                                className="mt-4 py-3 text-center text-purple-600 font-semibold bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center justify-center"
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

export default Object;





