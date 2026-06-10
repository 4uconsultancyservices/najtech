import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/models/User';
import Internship from '@/models/Internship';
import { Order, Enrollment, Certificate, Assignment } from '@/models';
import { auth } from '@/lib/auth/config';
import { successResponse, errorResponse } from '@/lib/api/helpers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role as string)) {
    return errorResponse('Unauthorized', 401);
  }

  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalInternships,
      publishedInternships,
      totalOrders,
      paidOrdersThisMonth,
      paidOrdersLastMonth,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalCertificates,
      pendingAssignments,
      recentOrders,
      revenueData,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ role: 'student', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Internship.countDocuments(),
      Internship.countDocuments({ status: 'published' }),
      Order.countDocuments(),
      Order.find({ status: 'paid', createdAt: { $gte: startOfMonth } }).select('finalAmount'),
      Order.find({ status: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }).select('finalAmount'),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Enrollment.countDocuments({ status: 'completed' }),
      Certificate.countDocuments(),
      Assignment.countDocuments({ status: 'submitted' }),
      Order.find({ status: 'paid' })
        .populate('studentId', 'name email')
        .populate('internshipId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$finalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const thisMonthRevenue = paidOrdersThisMonth.reduce((sum, o) => sum + o.finalAmount, 0);
    const lastMonthRevenue = paidOrdersLastMonth.reduce((sum, o) => sum + o.finalAmount, 0);

    const revenueGrowth =
      lastMonthRevenue === 0
        ? 100
        : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    const userGrowth =
      newUsersLastMonth === 0
        ? 100
        : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

    return successResponse({
      overview: {
        totalUsers,
        newUsersThisMonth,
        userGrowth: Math.round(userGrowth),
        totalInternships,
        publishedInternships,
        totalOrders,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth: Math.round(revenueGrowth),
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        totalCertificates,
        pendingAssignments,
      },
      revenueData: revenueData.map((d) => ({
        month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
        revenue: d.revenue,
        orders: d.orders,
      })),
      recentOrders,
    });
  } catch (error) {
    console.error('[ADMIN_ANALYTICS]', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
