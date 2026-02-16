import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { published } = req.query as { published?: string };

    const where: any = {};
    if (published === 'true') {
      where.status = 'approved';
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      featured_image: p.featuredImage,
      category: p.category,
      tags: p.tags,
      read_time: p.readTime,
      created_at: p.createdAt,
      profiles: {
        first_name: p.author.firstName,
        last_name: p.author.lastName,
      },
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Explicit cast or access
    const postWithAuthor = post as any;

    res.json({
      id: postWithAuthor.id,
      title: postWithAuthor.title,
      slug: postWithAuthor.slug,
      excerpt: postWithAuthor.excerpt,
      content: postWithAuthor.content,
      featured_image: postWithAuthor.featuredImage,
      category: postWithAuthor.category,
      tags: postWithAuthor.tags,
      read_time: postWithAuthor.readTime,
      created_at: postWithAuthor.createdAt,
      profiles: {
        first_name: postWithAuthor.author.firstName,
        last_name: postWithAuthor.author.lastName,
      },
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
