import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = courses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      price: c.price,
      featured_image: c.featuredImage,
      coming_soon: c.comingSoon,
      launch_date: c.launchDate,
      access_level: c.accessLevel,
      stripe_price_id: c.stripePriceId,
      created_at: c.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, slug, description, price, featured_image, coming_soon, launch_date, access_level, stripe_price_id } = req.body;

    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) return res.status(400).json({ message: 'Slug already exists' });

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price,
        featuredImage: featured_image,
        comingSoon: coming_soon,
        launchDate: launch_date ? new Date(launch_date) : null,
        accessLevel: access_level || 'public',
        stripePriceId: stripe_price_id,
      }
    });

    res.status(201).json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: course.price,
      featured_image: course.featuredImage,
      coming_soon: course.comingSoon,
      launch_date: course.launchDate,
      access_level: course.accessLevel,
      stripe_price_id: course.stripePriceId,
      created_at: course.createdAt,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, slug, description, price, featured_image, coming_soon, launch_date, access_level, stripe_price_id } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        price,
        featuredImage: featured_image,
        comingSoon: coming_soon,
        launchDate: launch_date ? new Date(launch_date) : null,
        accessLevel: access_level,
        stripePriceId: stripe_price_id,
      }
    });

    res.json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      price: course.price,
      featured_image: course.featuredImage,
      coming_soon: course.comingSoon,
      launch_date: course.launchDate,
      access_level: course.accessLevel,
      stripe_price_id: course.stripePriceId,
      created_at: course.createdAt,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.course.delete({ where: { id } });
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const notifyCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    await prisma.contactMessage.create({
      data: {
        name: 'Subscriber',
        email,
        subject: `Course Notification: ${id}`,
        message: `Please notify me when course ${id} launches.`,
      }
    });

    res.json({ message: "You will be notified when the course launches" });
  } catch (error) {
    console.error('Error subscribing to notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
