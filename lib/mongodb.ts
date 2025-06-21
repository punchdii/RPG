import mongoose from 'mongoose';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

// Get the base MongoDB URI from environment variables
console.log('🔍 MongoDB Environment Check:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('  - MONGODB_URI value:', process.env.MONGODB_URI);

let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI not defined - using default fallback');
  MONGODB_URI = 'mongodb://localhost:27017/UsersDB'; // Default fallback
  console.log('📝 Using fallback URI:', MONGODB_URI);
}

// Ensure the URI points to the UsersDB database
console.log('📊 Checking database name in URI...');
if (!MONGODB_URI.endsWith('UsersDB')) {
  console.log('🔧 URI does not end with UsersDB, fixing...');
  // If URI ends with a different database name, replace it
  const originalURI = MONGODB_URI;
  MONGODB_URI = MONGODB_URI.replace(/\/[^/]*$/, '/UsersDB');
  // If URI doesn't have a database name, add UsersDB
  if (!MONGODB_URI.endsWith('/UsersDB')) {
    MONGODB_URI += '/UsersDB';
  }
  console.log('  - Original URI:', originalURI);
  console.log('  - Fixed URI:', MONGODB_URI);
} else {
  console.log('✅ URI already points to UsersDB');
}

console.log('🔗 Final MongoDB URI:', MONGODB_URI);

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB(): Promise<typeof mongoose> {
  console.log('🚀 connectDB() called');
  
  if (global.mongoose!.conn) {
    console.log('✅ Using cached MongoDB connection');
    console.log('  - Connection state:', global.mongoose!.conn.connection.readyState);
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

    console.log('🔄 Creating new MongoDB connection...');
    console.log('  - URI:', MONGODB_URI);
    console.log('  - Options:', JSON.stringify(opts, null, 2));
    
    global.mongoose!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      console.log('  - Database:', mongoose.connection.db?.databaseName);
      console.log('  - Host:', mongoose.connection.host);
      console.log('  - Port:', mongoose.connection.port);
      console.log('  - Ready state:', mongoose.connection.readyState);
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection promise failed:', error);
      throw error;
    });
  } else {
    console.log('🔄 Using existing connection promise...');
  }

  try {
    console.log('⏳ Awaiting MongoDB connection...');
    global.mongoose!.conn = await global.mongoose!.promise;
    console.log('✅ MongoDB connection established');
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e);
    console.log('🧹 Cleaning up failed promise...');
    global.mongoose!.promise = null;
    throw e;
  }

  return global.mongoose!.conn;
}

export default connectDB; 