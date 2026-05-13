import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['new_booking', 'booking_accepted', 'booking_rejected', 'booking_completed', 'status_update', 'general'],
      default: 'general',
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
