import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const listAmbassadors = async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.ambassadorProfile.findMany({
      include: { user: true },
    });

    const ambassadors = profiles.map(p => ({
      name: `${p.user.firstName} ${p.user.lastName}`,
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
    const { name, email, country, experience, bio } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: 'You must be logged in to apply' });
    }

    // Check if already applied
    const existing = await prisma.ambassadorApplication.findFirst({
        where: { userId: user.id, status: 'pending' }
    });

    if (existing) {
        return res.status(400).json({ message: 'You already have a pending application' });
    }

    await prisma.ambassadorApplication.create({
      data: {
        name: name || `${user.firstName} ${user.lastName}`,
        email: email || user.email,
        country,
        experience,
        bio,
        userId: user.id
      },
    });

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
