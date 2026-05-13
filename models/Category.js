import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: '🔧' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: '#4F46E5' },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
