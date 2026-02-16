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

    await prisma.ambassadorApplication.create({
      data: {
        name,
        email,
        country,
        experience,
        bio,
      },
    });

    res.json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
