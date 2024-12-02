import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import qrRoutes from './routes/qrRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Add test route before other routes
app.get('/test', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'Database connected' });
  } catch (error) {
    res.status(500).json({ status: 'Database error', error });
  }
});

app.use('/api/qr', qrRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;