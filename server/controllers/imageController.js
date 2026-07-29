
import userModel from "../models/userModel.js"
import FormData from "form-data"
import axios from "axios"



export const generateImage = async (req, res) => {
    try {
        const {userId, prompt, mystyle} = req.body

        const user = await userModel.findById(userId)

        if (!user || !prompt || !mystyle ) {
            return res.json({ success: false, message: 'Missing Details'})
        }

        if (user.creditBalance === 0 || userModel.creditBalance <0){
            return res.json({success: false, message: 'No Credit Balance', creditBalance: user.creditBalance })
        } 

        const formData = new FormData()
        // formData.append('prompt', prompt)
        // formData.append( 'prompt', `${prompt} — the image style should be strictly based on : ${style}`);


        formData.append('prompt', `create a ${mystyle} image of, ${prompt}`);


        const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API,
              },
              responseType : 'arraybuffer'
        })

        const base64Image = Buffer.from(data, 'binary').toString('base64')
        const resultImage = `data:image/png;base64,${base64Image}`

        await userModel.findByIdAndUpdate(user._id, {creditBalance:user.creditBalance - 1})

        res.json({success:true, message:"Image Generated", 
        creditBalance: user.creditBalance -1 , resultImage})
    } catch (error) {
         console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ==========================================================================================

// ========================13-11-25=======================================================



// import userModel from "../models/userModel.js"
// import axios from "axios"

// export const generateImage = async (req, res) => {
//     try {
//         // --- FIX 1: Read 'style' from the request body ---
//         // const {userId, setmystyle, prompt} = req.body
//         const {userId, prompt, mystyle} = req.body;

//         const user = await userModel.findById(userId)

//         // Validation for user and prompt (style is optional)
//         if (!user || !prompt || !mystyle) {
//             return res.json({ success: false, message: 'Missing Details'})
//         }

//         if (user.creditBalance === 0 || user.creditBalance < 0){
//             return res.json({success: false, message: 'No Credit Balance', creditBalance: user.creditBalance })
//         } 
        
        
//         // if (style && style.trim() !== '' && style.trim().toLowerCase() !== 'none') {
//         let    combinedPrompt = ` create a ${mystyle} image of, ${prompt}`;
//         // }
//         // If 'style' is empty, undefined, or "none", the prompt remains unchanged.

        
//         const apiKey = process.env.GEMINI_API_KEY;
//         if (!apiKey) {
//             console.error("GEMINI_API_KEY is not set in environment variables.");
//             return res.json({ success: false, message: 'Image generation service is not configured.' });
//         }

//         const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
//         // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

        
//         // Construct the payload for the Gemini API
//         const payload = {
//             // This will now send *either* "prompt" or "prompt, style"
//             instances: { prompt: ` ${combinedPrompt} ` }, 
//             parameters: { "sampleCount": 1 ,
//                 // "aspectRatio": "16:9"
//                 // "outputImageHeight": 900, 
//                 //  "outputImageWidth": 900
//             }
//         };

//         // Make the API call to Gemini using axios
//         const { data } = await axios.post(apiUrl, payload, {
//             headers: {
//                 'Content-Type': 'application/json',
                
//             },
//         });

//         // Check the Gemini response structure
//         if (!data.predictions || data.predictions.length === 0 || !data.predictions[0].bytesBase64Encoded) {
//             console.error("Gemini API response missing predictions:", data);
//             return res.json({ success: false, message: 'Failed to generate image. The API response was not as expected.' });
//         }

//         const base64Image = data.predictions[0].bytesBase64Encoded;
//         const resultImage = `data:image/png;base64,${base64Image}`

//         // Update user's credit balance
//         await userModel.findByIdAndUpdate(user._id, {creditBalance:user.creditBalance - 1})

//         res.json({success:true, message:"Image Generated", 
//         creditBalance: user.creditBalance - 1 , resultImage})

//     } catch (error) {
//         console.log("Error during image generation:", error.response ? error.response.data : error.message);
        
//         let errorMessage = "An error occurred during image generation.";
//         if (error.response && error.response.data && error.response.data.error) {
//             errorMessage = error.response.data.error.message || "Error from Gemini API.";
//         } else if (error.message) {
//             errorMessage = error.message;
//         }

//         res.json({ success: false, message: errorMessage })
//     }
// }