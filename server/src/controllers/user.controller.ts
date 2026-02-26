import { Request, Response } from 'express';
import { User, Purchase, Subscription, ActivityLog, AmbassadorProfile } from '../models';
import { PurchaseStatus } from '../types/enums';

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [Subscription, AmbassadorProfile],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map to snake_case as per requirement
    res.json({
      id: user.id,
      user_id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      is_ambassador: !!user.ambassadorProfile,
      ambassador_profile: user.ambassadorProfile,
      created_at: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPurchases = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;

    const purchases = await Purchase.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'courseId', 'createdAt', 'amount', 'status'],
    });

    const formattedPurchases = purchases.map(p => ({
      id: p.id,
      course_id: p.courseId,
      purchase_date: p.createdAt,
      amount: p.amount,
      status: p.status,
    }));

    res.json(formattedPurchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;

    const [user, totalDownloads, coursesCompleted, recentActivity] = await Promise.all([
      User.findByPk(userId, { attributes: ['createdAt'] }),
      ActivityLog.count({ where: { userId, type: 'download' } }),
      Purchase.count({ where: { userId, status: PurchaseStatus.COMPLETED } }),
      ActivityLog.findAll({
        where: { userId },
        order: [['timestamp', 'DESC']],
        limit: 10
      })
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      stats: {
        totalDownloads,
        coursesCompleted,
        memberSince: user.createdAt,
      },
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        type: log.type,
        title: log.description,
        date: log.timestamp,
        description: log.metadata ? JSON.stringify(log.metadata) : '',
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
