

import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import imageRouter from "./routes/imageRoutes.js"
import userRouter from "./routes/userRoutes.js"

import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const port = process.env.PORT || 4000
// const port = https://image-art.vercel.app/
const app= express()


app.use(express.json())
app.use(cors())
console.log(process.env.MONGODB_URI);
await connectDB()


app.use('/api/user', userRouter)
app.use('/api/image', imageRouter)
app.get('/', (req, res) => {
    res.send('API Working')
  });

  app.get('/',(req, res)=>{
    res.send({
      activeStatus:true,
      error:false
    })
  })

// Export the app for Vercel serverless function
export default app;

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => console.log(`Server started on PORT:${port}`))
}