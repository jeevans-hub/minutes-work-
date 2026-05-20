import mongoose from 'mongoose';

const uri = 'mongodb://127.0.0.1:27017/mintwork';
console.log('Testing connection to local:', uri);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
  console.log('Successfully connected to LOCAL MongoDB');
  process.exit(0);
} catch (error) {
  console.error('Local Connection failed:', error.message);
  process.exit(1);
}
