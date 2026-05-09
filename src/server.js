import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scheduleRoutes from './routes/schedule.routes.js';

dotenv.config();

const app = express();

// CHỈ GIỮ LẠI CÁC DÒNG NÀY
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Đọc dữ liệu JSON từ request

// ROUTES
app.use('/api/schedule', scheduleRoutes);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Optimization Backend is running on http://localhost:${PORT}`);
});