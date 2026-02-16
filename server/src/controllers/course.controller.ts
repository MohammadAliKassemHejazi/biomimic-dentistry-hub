import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
