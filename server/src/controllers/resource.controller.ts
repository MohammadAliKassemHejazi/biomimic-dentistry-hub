import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
