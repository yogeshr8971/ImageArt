
import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import Bg from "../components/Bg";
import Object from "../components/Object";
import Uncrop from "../components/Uncrop";
import { assets } from "../assets/assets";
import { Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Sidebar from "../components/Sidebar";


const Result = () => {
  const [image, setImage] = useState();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [input, setInput] = useState("");
  const [removingBg, setRemovingBg] = useState(false);
  const [mystyle, setmystyle] = useState("realistic");
  const [mylang, setmylang] = useState("English")

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { generateImage, fetchImageDescription, playTextToSpeech, token } =
    useContext(AppContext);

  const style = ["realistic", "3D image", "pencil sketch", "Ghibli", "Anime"];

  const lang = [ "English", "kannada", "Hindi", "Telugu" ]

  useEffect(() => {
    if (image) playImageDescription();
    // eslint-disable-next-line
  }, [image]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (input) {
      const generatedImage = await generateImage(input, mystyle);
      if (generatedImage) {
        setIsImageLoaded(true);
        setImage(generatedImage);
      }
    }
    setLoading(false);
  };

  const playImageDescription = async () => {
    if (!image) return;
    setAudioLoading(true);
    try {
      const description = await fetchImageDescription(image);
      if (description) {
        const audio = await playTextToSpeech(description);
        if (audio) {
          new Audio(audio).play();
        }
      }
    } catch (error) {
      console.error("Error playing image description:", error);
    }
    setAudioLoading(false);
  };

  const handleRemoveBackground = async () => {
    if (!image) return;
    setRemovingBg(true);
    try {
      let base64Image = image;
      if (base64Image.startsWith("data:image")) {
        base64Image = base64Image.split(",")[1];
      }
      const res = await fetch("/api/image/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      });
      const data = await res.json();
      if (data.image) {
        setImage(`data:image/png;base64,${data.image}`);
      } else {
        alert("Background removal failed.");
      }
    } catch (err) {
      alert("Error removing background.");
    }
    setRemovingBg(false);
  };

  const handleGenerateAnother = () => {
    setIsImageLoaded(false);
    setImage(null);
    setInput("");
  };

  const navigate = useNavigate()
  const ObjectNavigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* ================= INNER LEFT SIDEBAR ================= */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 relative">
        <motion.button
          animate={{
            opacity: isSidebarOpen ? 0 : 1,
            scale: isSidebarOpen ? 0.9 : 1,
            pointerEvents: isSidebarOpen ? "none" : "auto",
          }}
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-6 left-6 z-10 p-2.5 bg-white/80 hover:bg-white backdrop-blur-md border border-zinc-200/50 rounded-lg text-zinc-700 shadow-sm transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </motion.button>

        <motion.form
          initial={{ opacity: 0.2, y: 100 }}
          transition={{ duration: 1 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={onSubmitHandler}
          className="flex flex-col min-h-[90vh] justify-center items-center"
        >
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center w-64 h-64 bg-gray-200 rounded-lg">
                <div className="animate-spin h-12 w-12 border-t-4 border-blue-500 rounded-full"></div>
              </div>
            ) : image ? (
              <img
                src={image}
                alt="Generated AI"
                className="max-w-sm rounded shadow-lg"
              />
            ) : (
              <div className="flex flex-col justify-center items-center w-72 h-72 bg-neutral-200/50 border-2 border-dashed border-neutral-400 rounded-lg">
                <img src={assets.demo_img} />
              </div>
            )}
          </div>

          {/* {isImageLoaded && image && (
            <button
              onClick={handleRemoveBackground}
              disabled={removingBg}
              className={`mt-4 px-6 py-2 rounded text-white font-semibold transition ${
                removingBg
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              type="button"
            >
              {removingBg ? "Removing..." : "Remove Background"}
            </button>
          )} */}

          {isImageLoaded && audioLoading && (
            <div className="flex flex-col items-center mt-4">
              <div className="animate-spin h-10 w-10 border-t-4 border-green-500 rounded-full"></div>
              <p className="text-green-500 mt-2">Generating Voice...</p>
            </div>
          )}

          {!isImageLoaded && (
            <div className="flex w-full max-w-xl bg-neutral-500 text-white text-sm p-0.5 mt-10 rounded-full">
                <input
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    type="text"
                    placeholder="Describe your imagination"
                    className="flex-1 bg-transparent outline-none ml-8 placeholder:text-white"
                />
               <button type="submit" className="bg-gradient-to-r from-blue-600 to-green-300 text-white px-10 sm:px-16 py-3 rounded-full shadow-lg">
    Generate

                </button>
            </div>

           
          )}

          <div className="mt-6 flex-gap-3 flex-wrap sm:max-w-9/11 p-4 gap-4 m-4">
            {style.map((item, index) => (
              <span
                onClick={() => setmystyle(item)}
                className={`inline-flex items-center px-4 py-2 m-2 text-sm font-medium transition-all duration-300 border rounded-full cursor-pointer shadow-sm
    ${
      mystyle === item
        ? "bg-gradient-to-r from-green-400 to-teal-500 text-white border-transparent shadow-md scale-105"
        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
    }`}
                key={index}
              >
                {item}
              </span>
            ))}
          </div>

          

          {isImageLoaded && (
            <div className="flex gap-2 flex-wrap justify-center text-white text-sm p-0.5 mt-10 rounded-full">
              <p
                onClick={handleGenerateAnother}
                className="bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer"
              >
                Generate Another
              </p>
              <a
                href={image}
                download
                className="bg-yellow-900 px-10 py-3 rounded-full cursor-pointer"
              >
                Download
              </a>
            </div>
          )}
        </motion.form>
        
      </div>
    </div>
  );
};

export default Result;

// ======================== 9-11-25 =============================================
// ======================== 9-11-25 =============================================

