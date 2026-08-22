import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes mounting
app.use('/api/auth', authRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'GlobeTrotter API is running'
  });
});

export default app;
