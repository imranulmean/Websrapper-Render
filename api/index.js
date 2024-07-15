import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from './routes/product.route.js';
import searchProductRoutes from './routes/search.route.js';
import cartRoutes from './routes/cart.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import WebSocket,{ WebSocketServer }  from 'ws';
import http from 'http';
import axios from 'axios';


dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('MongoDb is connected');
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();
const server= http.createServer(app);
const wss = new WebSocketServer({ server });
const clients= new Map();

app.use(express.json());
app.use(cookieParser());

server.listen(3000, () => {
  console.log('Server is running on port 3000!');
});

app.use('/api/products', productRoutes);
app.use('/api/search', searchProductRoutes);
app.use('/api/cart', cartRoutes);
app.get('/ping',(req,res)=>{
  res.send("pong");
})

setInterval(async () => {
  try {
    const ping = await axios.get('https://websrapper-render.onrender.com/ping');
    const pythonFlaskPing = await axios.get('https://python-flask-image-processing.onrender.com/api/ping');
    //  console.log(pythonFlaskPing.data);
  } catch (error) {
    // console.error('Error fetching ping:', error);
  }
}, 45*1000); 


app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

