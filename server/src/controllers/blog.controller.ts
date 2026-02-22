import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Helper to generate slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Helper to ensure string
const ensureString = (val: any): string | undefined => {
  return typeof val === 'string' ? val : undefined;
};

// Helper for tags
const parseTags = (val: any): string => {
  if (Array.isArray(val)) return val.join(',');
  if (typeof val === 'string') return val;
  return '';
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { published, status } = req.query as { published?: string, status?: string };
    const user = req.user;

    const where: any = {};

    // Allow filtering by status
    if (status) {
      where.status = status;
    } else if (published === 'true') {
      where.status = 'approved';
    } else if (!user || (user.role !== 'admin')) {
      // Default for non-admins is approved only
      where.status = 'approved';
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: true,
        views: true,
        favorites: user ? { where: { userId: user.id } } : false
      },
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
      tags: p.tags ? p.tags.split(',') : [],
      read_time: p.readTime,
      created_at: p.createdAt,
      status: p.status,
      view_count: p.views.length,
      is_favorited: user ? p.favorites.length > 0 : false,
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
    const user = req.user;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: true,
        views: true,
        favorites: user ? { where: { userId: user.id } } : false
      },
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
      tags: postWithAuthor.tags ? postWithAuthor.tags.split(',') : [],
      read_time: postWithAuthor.readTime,
      created_at: postWithAuthor.createdAt,
      status: postWithAuthor.status,
      view_count: postWithAuthor.views.length,
      is_favorited: user ? postWithAuthor.favorites.length > 0 : false,
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

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, featured_image, category, tags, read_time } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (user.role !== 'admin' && user.role !== 'ambassador') {
        return res.status(403).json({ message: 'Only Ambassadors and Admins can create posts' });
    }

    if (typeof title !== 'string' || !title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    const slug = generateSlug(title);

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ message: 'Title already exists' });
    }

    const status = user.role === 'admin' ? 'approved' : 'pending';

    const postData = {
        title,
        slug,
        excerpt: ensureString(excerpt),
        content: ensureString(content),
        featuredImage: ensureString(featured_image),
        category: ensureString(category),
        tags: parseTags(tags),
        readTime: read_time ? parseInt(read_time) : undefined,
        status,
        authorId: user.id
    } as any;

    const post = await prisma.blogPost.create({
      data: postData
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string }; // Post ID
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_blogPostId: {
          userId: user.id,
          blogPostId: id
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          blogPostId: id
        }
      });
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const recordView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const user = req.user;
    const ip = req.ip || req.connection.remoteAddress;

    const where: any = { blogPostId: id };
    if (user) {
      where.userId = user.id;
    } else {
      where.ipAddress = ip as string;
    }

    const existing = await prisma.blogView.findFirst({ where });

    if (!existing) {
      await prisma.blogView.create({
        data: {
          blogPostId: id,
          userId: user?.id,
          ipAddress: ip as string
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const user = req.user;

    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (typeof status !== 'string') {
        return res.status(400).json({ message: 'Status must be a string' });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: { status: status as string }
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
