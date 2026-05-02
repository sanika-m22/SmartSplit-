import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import userRoutes from './routes/users.js';
import groupRoutes from './routes/groups.js';

import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// Database Connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI as string;
    
    // Fallback to memory server for demo/development if needed
    if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      console.log('Attempting to connect to local MongoDB...');
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to local MongoDB');
      } catch (err) {
        console.log('Local MongoDB not found, starting Persistent MongoDB Memory Server...');
        const dbDir = path.resolve(process.cwd(), 'db');
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
        const mongod = await MongoMemoryServer.create({
          instance: {
            dbPath: dbDir,
            storageEngine: 'wiredTiger',
          },
        });
        mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
        console.log(`Connected to Persistent MongoDB Memory Server at ${dbDir}`);
      }
    } else {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectDB();

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('SmartSplit API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
