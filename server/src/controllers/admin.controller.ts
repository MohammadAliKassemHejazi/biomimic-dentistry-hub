import { Request, Response } from 'express';
import prisma from '../utils/prisma';

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

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await prisma.ambassadorApplication.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await prisma.ambassadorApplication.update({
      where: { id },
      data: { status: status as string }
    });

    if (status === 'approved' && application.userId) {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'ambassador' }
      });

      const existingProfile = await prisma.ambassadorProfile.findUnique({
        where: { userId: application.userId }
      });

      if (!existingProfile) {
        await prisma.ambassadorProfile.create({
          data: {
            userId: application.userId,
            country: application.country,
            experience: application.experience,
            bio: application.bio
          }
        });
      }
    }

    res.json({ message: `Application ${status}` });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPendingContent = async (req: Request, res: Response) => {
  try {
    const [pendingPosts, pendingResources] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'pending' },
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.resource.findMany({
        where: { status: 'pending' },
        // include: { createdBy: true }, // 'createdBy' relationship exists in schema
        // Let's check schema again. `createdBy User?`. Yes.
        // But `prisma` client needs to be aware.
        orderBy: { createdAt: 'desc' },
      })
    ]);

    // We can fetch author details for resources if needed, but `include` works.
    // However, TypeScript might complain if include is not generic enough in this snippet.
    // But it should be fine.

    res.json({
      posts: pendingPosts,
      resources: pendingResources
    });
  } catch (error) {
    console.error('Error fetching pending content:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'vip', 'ambassador', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
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
