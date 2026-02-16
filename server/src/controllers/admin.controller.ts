import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const formatted = users.map(u => ({
      id: u.id,
      user_id: u.id,
      email: u.email,
      first_name: u.firstName,
      last_name: u.lastName,
      role: u.role,
      created_at: u.createdAt,
    }));

    res.json({ users: formatted });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const { role } = req.body;

    // Validate role
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    res.json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalResources,
      totalCourses,
      totalDownloadsResult,
      usersByRole,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resource.count(),
      prisma.course.count(),
      prisma.resource.aggregate({ _sum: { downloadCount: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
      })
    ]);

    const usersByRoleMap: Record<string, number> = {};
    usersByRole.forEach(r => {
      usersByRoleMap[r.role] = r._count.role;
    });

    res.json({
      totalUsers,
      totalResources,
      totalCourses,
      totalDownloads: totalDownloadsResult._sum.downloadCount || 0,
      usersByRole: usersByRoleMap,
      recentActivity: recentActivity.map(a => ({
        type: a.type,
        description: a.description,
        timestamp: a.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
