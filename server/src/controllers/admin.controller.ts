import { Request, Response } from 'express';
import { User, AmbassadorApplication, AmbassadorProfile, BlogPost, Resource, Course, ActivityLog } from '../models';
import { UserRole, AmbassadorApplicationStatus, ContentStatus } from '../types/enums';
import { Sequelize } from 'sequelize-typescript';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
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
    const applications = await AmbassadorApplication.findAll({
      where: { status: AmbassadorApplicationStatus.PENDING },
      order: [['createdAt', 'DESC']],
      include: [User]
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [affectedCount, affectedRows] = await AmbassadorApplication.update({ status: status as AmbassadorApplicationStatus }, {
      where: { id },
      returning: true
    });

    if (affectedCount === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = affectedRows[0];

    if (status === 'approved' && application.userId) {
      await User.update({ role: UserRole.AMBASSADOR }, {
        where: { id: application.userId }
      });

      const existingProfile = await AmbassadorProfile.findOne({
        where: { userId: application.userId }
      });

      if (!existingProfile) {
        await AmbassadorProfile.create({
            userId: application.userId,
            country: application.country,
            experience: application.experience,
            bio: application.bio
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
      BlogPost.findAll({
        where: { status: ContentStatus.PENDING },
        include: [User], // author
        order: [['createdAt', 'DESC']],
      }),
      Resource.findAll({
        where: { status: ContentStatus.PENDING },
        include: [User], // createdBy
        order: [['createdAt', 'DESC']],
      })
    ]);

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

    await User.update({ role }, {
      where: { id: userId },
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
      totalDownloads,
      usersByRoleResult,
      recentActivity
    ] = await Promise.all([
      User.count(),
      Resource.count(),
      Course.count(),
      Resource.sum('downloadCount'),
      User.findAll({
        attributes: ['role', [Sequelize.fn('COUNT', Sequelize.col('role')), 'count']],
        group: ['role'],
      }),
      ActivityLog.findAll({
        limit: 10,
        order: [['timestamp', 'DESC']],
      })
    ]);

    const usersByRoleMap: Record<string, number> = {};
    usersByRoleResult.forEach((r: any) => {
      // Sequelize returns instances, dataValues has the attributes
      const role = r.getDataValue('role');
      const count = r.getDataValue('count');
      usersByRoleMap[role] = Number(count);
    });

    res.json({
      totalUsers,
      totalResources,
      totalCourses,
      totalDownloads: totalDownloads || 0,
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
