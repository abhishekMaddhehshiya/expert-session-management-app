import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.ts' 
dotenv.config()

const app = express()
connectDB()

app.use(cors())

app.get('/', (req, res) => {
  res.json({
    message: 'Hello, World!',
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})