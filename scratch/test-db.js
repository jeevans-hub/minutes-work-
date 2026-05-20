import mongoose from 'mongoose';

const uri = 'mongodb+srv://pheonixking2525_db_user:cdiYZQWb02m4Cpfy@cluster0.6arioc6.mongodb.net/minitwork';
console.log('Testing connection to:', uri);

try {
  await mongoose.connect(uri);
  console.log('Successfully connected to MongoDB');
  
  // Try to list collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  process.exit(0);
} catch (error) {
  console.error('Connection failed:', error);
  process.exit(1);
}
