import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import tripRouter from './routes/trip.routes';
import tripStopRouter from './routes/tripStop.routes';
import expenseRouter from './routes/expense.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/trips', tripRouter);
app.use('/api/trips', tripStopRouter);
app.use('/api/trips', expenseRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'GlobeTrotter API is running'
  });
});

export default app;
