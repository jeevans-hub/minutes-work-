import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'worker', 'admin'], default: 'customer' },
    address: { type: String, default: '' },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    avatar: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    // Worker-specific fields
    skills: [{ type: String }],
    category: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    subscription: {
      type: String,
      enum: ['free', 'pro', 'elite'],
      default: 'free',
    },
    subExpires: { type: Date, default: null },
    commissionRate: { type: Number, default: 0.2 }, // Default 20%
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCount: { type: Number, default: 0 },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
