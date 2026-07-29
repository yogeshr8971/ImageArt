
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [credit, setCredit] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const loadCreditsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/credits", {
                headers: { token },
            });

            if (data.success) {
                setCredit(data.credits);
                setUser(data.user);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // const generateImage = async ( prompt) => {
    const generateImage = async ( mystyle, prompt) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/image/generate-image",
                { mystyle, prompt},
                { headers: { token } }
            );

            if (data.success) {
                loadCreditsData();
                return data.resultImage;
            } else {
                toast.error(data.message);
                loadCreditsData();
                if (data.creditBalance === 0) {
                    navigate("/buy");
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // const fetchImageDescription = async (imageUrl) => {
    //     try {
    //         const response = await fetch("https://api.openai.com/v1/chat/completions", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,  
    //             },
    //             body: JSON.stringify({
    //                 model: "gpt-4o",
    //                 messages: [
    //                     { role: "system", content: "Describe the given image in detail, including objects, colors, and context." },
    //                     { 
    //                         role: "user", 
    //                         content: [
    //                             { type: "text", text: "What do you see in this image?" },
    //                             { type: "image_url", image_url: { "url": imageUrl } }
    //                         ]
    //                     }
    //                 ],
    //                 max_tokens: 300
    //             }),
    //         });
    
    //         if (!response.ok) {
    //             throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    //         }
    
    //         const data = await response.json();
    
    //         if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
    //             console.error("No valid description received:", data);
    //             return "No description available.";
    //         }
    
    //         return data.choices[0].message.content;
    //     } catch (error) {
    //         console.error("Error fetching image description:", error);
    //         return "Failed to retrieve image description.";
    //     }
    // };

    // const playTextToSpeech = async (text) => {
    //     try {
    //         const response = await fetch("https://api.openai.com/v1/audio/speech", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    //             },
    //             body: JSON.stringify({
    //                 model: "tts-1",
    //                 input: text,
    //                 voice: "nova",
    //             }),
    //         });

    //         if (!response.ok) {
    //             throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    //         }

    //         const audioBlob = await response.blob();
    //         const audioUrl = URL.createObjectURL(audioBlob);
    //         return audioUrl;
    //     } catch (error) {
    //         console.error("Error playing text-to-speech:", error);
    //         return null;
    //     }
    // };


    // Convert image URL -> base64 for Gemini vision input
async function imageUrlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
    });
}

const fetchImageDescription = async (imageUrl) => {
    try {
        const base64Image = await imageUrlToBase64(imageUrl);

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: "What you can see in this image, describe within 20 words" },
                                { inline_data: { mime_type: "image/png", data: base64Image } }
                            ]
                        }
                    ]
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No description available.";
    } catch (error) {
        console.error("Error fetching image description:", error);
        return "Failed to retrieve image description.";
    }
};

// Gemini doesn’t support TTS yet, so use Google Cloud TTS or fallback
const playTextToSpeech = async (text) => {
    try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        synth.speak(utterance);
        return null; // No audio URL, just speaks directly
    } catch (error) {
        console.error("Error playing text-to-speech:", error);
        return null;
    }
};


    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
    };

    useEffect(() => {
        if (token) {
            loadCreditsData();
        }
    }, [token]);

    const value = {
        user,
        setUser,
        showLogin,
        setShowLogin,
        backendUrl,
        token,
        setToken,
        credit,
        setCredit,
        loadCreditsData,
        logout,
        generateImage,
        
      
        fetchImageDescription,
        playTextToSpeech, // ✅ Fixed function reference
    };

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};

export default AppContextProvider;


