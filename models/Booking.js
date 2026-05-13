import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'onTheWay', 'arrived', 'inProgress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    location: {
      address: { type: String, default: '' },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    workerLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    paymentType: { type: String, enum: ['online', 'cash'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    scheduledAt: { type: Date },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    walletUsed: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
