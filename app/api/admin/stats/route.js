import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Dispute from '@/models/Dispute';
import { getUserFromRequest } from '@/lib/auth';

import { getCache, setCache } from '@/lib/cache';

export async function GET(request) {
  try {
    await connectDB();
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const CACHE_KEY = 'admin_stats';
    const cachedStats = getCache(CACHE_KEY);
    if (cachedStats) {
      return NextResponse.json(cachedStats);
    }

    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const totalDisputes = await Dispute.countDocuments({ status: 'pending' });

    const recentBookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('workerId', 'name email category')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate Total Revenue (only from completed bookings)
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Calculate Popular Services
    const popularServicesAgg = await Booking.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const popularServices = popularServicesAgg.map(item => ({ category: item._id, count: item.count }));

    // Monthly Bookings & Revenue Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrendAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          bookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = monthlyTrendAgg.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      bookings: item.bookings,
      revenue: item.revenue,
    }));

    // Booking Status Breakdown
    const statusBreakdownAgg = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = statusBreakdownAgg.map((item) => ({
      status: item._id,
      count: item.count,
    }));

    const responseData = {
      stats: { totalUsers, totalWorkers, totalBookings, pendingBookings, completedBookings, blockedUsers, totalRevenue, totalDisputes },
      recentBookings,
      popularServices,
      monthlyTrend,
      statusBreakdown,
    };

    setCache(CACHE_KEY, responseData, 300); // Cache for 5 mins

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
