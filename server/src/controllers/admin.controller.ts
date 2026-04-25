import { Request, Response } from 'express';
import { User, AmbassadorApplication, AmbassadorProfile, BlogPost, Resource, Course, ActivityLog, SiteSetting, PartnershipRequest, TrustedPartner } from '../models';
import { UserRole, AmbassadorApplicationStatus, ContentStatus, PartnershipRequestStatus } from '../types/enums';
import { Sequelize } from 'sequelize-typescript';
import { clearCache } from '../middleware/cache';
import { clearUserCache } from '../middleware/auth.middleware';

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

export const uploadPartnershipKit = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    await SiteSetting.upsert({
      key: 'partnership_kit_url',
      value: fileUrl,
    });

    // SV-13: invalidate cached GETs for /api/admin/settings/*.
    await clearCache('/api/admin/settings/');

    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error uploading partnership kit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPartnershipKit = async (req: Request, res: Response) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key: 'partnership_kit_url' } });
    res.json({ url: setting ? setting.value : null });
  } catch (error) {
    console.error('Error fetching partnership kit:', error);
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
      // We no longer change the user role to AMBASSADOR.
      // Ambassador status is now determined by the existence of an AmbassadorProfile.

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
    // 'gold' kept for backward compatibility if needed, but primarily 'vip'
    const validRoles = ['user', 'bronze', 'silver', 'vip', 'ambassador', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await User.update({ role }, {
      where: { id: userId },
    });

    // SV-14 scope (Iter 4): invalidate the 30s auth cache so role change
    // propagates immediately — no need to wait for cache TTL to expire.
    clearUserCache(userId);

    res.json({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadPartnerTemplate = async (req: Request, res: Response) => {
  try {
    const { tier } = req.params as { tier: string };
    const validTiers = ['silver', 'gold', 'vip'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    await SiteSetting.upsert({ key: `partner_template_${tier}_url`, value: fileUrl });

    // SV-13: invalidate cached GETs for /api/admin/settings/*.
    await clearCache('/api/admin/settings/');

    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error uploading partner template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPartnerTemplates = async (req: Request, res: Response) => {
  try {
    const tiers = ['silver', 'gold', 'vip'];
    const settings = await SiteSetting.findAll({
      where: { key: tiers.map(t => `partner_template_${t}_url`) },
    });
    const templates: Record<string, string | null> = { silver: null, gold: null, vip: null };
    settings.forEach(s => {
      const tier = s.key.replace('partner_template_', '').replace('_url', '');
      templates[tier] = s.value;
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching partner templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPartnerApplications = async (req: Request, res: Response) => {
  try {
    const applications = await PartnershipRequest.findAll({
      order: [['createdAt', 'DESC']],
      include: [User],
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching partner applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PA-01 (Iter 4): When status='approved', automatically create a TrustedPartner
 * record using the submission details. Admin supplies the tier in the request body.
 * Uses findOrCreate keyed on (name, companyName) so re-approving is idempotent.
 */
export const updatePartnerApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status, tier } = req.body as { status: string; tier?: string };

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Fetch the application before updating so we have its fields
    const application = await PartnershipRequest.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only auto-create TrustedPartner when transitioning from pending → approved
    const wasAlreadyApproved = application.status === PartnershipRequestStatus.APPROVED;

    await PartnershipRequest.update({ status: status as PartnershipRequestStatus }, { where: { id } });

    if (status === 'approved' && !wasAlreadyApproved) {
      // Build partner record from submission data
      const partnerName = application.companyName || application.name;
      const partnerRole = application.companyName
        ? application.name // contact person name as role
        : 'Partner';
      const partnerDescription = application.message || '';
      const partnerTier = tier || application.tier || 'Bronze';

      // findOrCreate to be idempotent (architect condition)
      await TrustedPartner.findOrCreate({
        where: { name: partnerName },
        defaults: {
          name: partnerName,
          role: partnerRole,
          description: partnerDescription,
          logo: '🤝', // placeholder — admin can update via Partners tab
          tier: partnerTier,
        },
      });

      // Invalidate Redis cache so public partners list shows the new entry
      await clearCache('/api/partners/');
    }

    res.json({ message: `Application ${status}` });
  } catch (error) {
    console.error('Error updating partner application status:', error);
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
