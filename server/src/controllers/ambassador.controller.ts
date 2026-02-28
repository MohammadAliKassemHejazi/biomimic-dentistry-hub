import { Request, Response } from 'express';
import { AmbassadorProfile, AmbassadorApplication, User } from '../models';
import { AmbassadorApplicationStatus } from '../types/enums';
import { logActivity } from '../utils/activity';

export const listAmbassadors = async (req: Request, res: Response) => {
  try {
    const profiles = await AmbassadorProfile.findAll({
      include: [User],
    });

    const ambassadors = profiles.map(p => ({
      name: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown User',
      country: p.country,
      region: p.region,
      specialization: p.specialization,
      experience: p.experience,
      students: p.students,
      flag: p.flag,
    }));

    res.json(ambassadors);
  } catch (error) {
    console.error('Error fetching ambassadors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const applyAmbassador = async (req: Request, res: Response) => {
  try {
    const { name, email, country, experience, bio, social_media_links, cv } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'You must be logged in to apply' });
    }

    // Check if already applied
    const existing = await AmbassadorApplication.findOne({
        where: { userId: user.id, status: AmbassadorApplicationStatus.PENDING }
    });

    if (existing) {
        return res.status(400).json({ message: 'You already have a pending application' });
    }

    const application = await AmbassadorApplication.create({
      name: name || `${user.firstName} ${user.lastName}`,
      email: email || user.email,
      country,
      experience,
      bio,
      socialMediaLinks: social_media_links,
      cv,
      userId: user.id
    });

    await logActivity(user.id, 'application', 'Applied for Ambassador role', { applicationId: application.id });

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
