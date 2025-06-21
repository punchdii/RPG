import mongoose from 'mongoose';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

// Get the base MongoDB URI from environment variables
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Ensure the URI points to the UsersDB database
if (!MONGODB_URI.endsWith('UsersDB')) {
  // If URI ends with a different database name, replace it
  MONGODB_URI = MONGODB_URI.replace(/\/[^/]*$/, '/UsersDB');
  // If URI doesn't have a database name, add UsersDB
  if (!MONGODB_URI.endsWith('/UsersDB')) {
    MONGODB_URI += '/UsersDB';
  }
}

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB(): Promise<typeof mongoose> {
  if (global.mongoose!.conn) {
    console.log('Using cached MongoDB connection');
    return global.mongoose!.conn;
  }

  if (!global.mongoose!.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
    };

    console.log('Connecting to MongoDB...');
    global.mongoose!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      return mongoose;
    });
  }

  try {
    global.mongoose!.conn = await global.mongoose!.promise;
  } catch (e) {
    global.mongoose!.promise = null;
    console.error('MongoDB connection failed:', e);
    throw e;
  }

  return global.mongoose!.conn;
}

export default connectDB; 