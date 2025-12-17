import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';


dotenv.config();
connectDB(); 
const app=express();
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:'10mb'}));
app.use('/api/auth',authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


 

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{console.log(`server is running on ${PORT}`)});