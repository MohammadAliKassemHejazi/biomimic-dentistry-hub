import { Request, Response } from 'express';
import { BlogPost, User, Favorite, BlogView } from '../models';
import { ContentStatus } from '../types/enums';

// Helper to generate slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
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
      where.status = ContentStatus.APPROVED;
    } else if (!user || (user.role !== 'admin')) {
      // Default for non-admins is approved only
      where.status = ContentStatus.APPROVED;
    }

    const include: any[] = [
      { model: User, as: 'author' },
      { model: BlogView, as: 'views' }
    ];

    if (user) {
      include.push({
        model: Favorite,
        as: 'favorites',
        where: { userId: user.id },
        required: false
      });
    }

    const posts = await BlogPost.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
    });

    const formatted = posts.map((p) => ({
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
      view_count: p.views?.length || 0,
      is_favorited: user && p.favorites ? p.favorites.length > 0 : false,
      profiles: {
        first_name: p.author?.firstName,
        last_name: p.author?.lastName,
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

    const include: any[] = [
      { model: User, as: 'author' },
      { model: BlogView, as: 'views' }
    ];

    if (user) {
      include.push({
        model: Favorite,
        as: 'favorites',
        where: { userId: user.id },
        required: false
      });
    }

    const post = await BlogPost.findOne({
      where: { slug },
      include,
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featuredImage,
      category: post.category,
      tags: post.tags ? post.tags.split(',') : [],
      read_time: post.readTime,
      created_at: post.createdAt,
      status: post.status,
      view_count: post.views?.length || 0,
      is_favorited: user && post.favorites ? post.favorites.length > 0 : false,
      profiles: {
        first_name: post.author?.firstName,
        last_name: post.author?.lastName,
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

    if (typeof title !== 'string' || !title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    const slug = generateSlug(title);

    // Check slug uniqueness
    const existing = await BlogPost.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ message: 'Title already exists' });
    }

    const status = user.role === 'admin' ? ContentStatus.APPROVED : ContentStatus.PENDING;

    const post = await BlogPost.create({
        title,
        slug,
        excerpt,
        content,
        featuredImage: featured_image,
        category,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        readTime: read_time ? parseInt(read_time) : undefined,
        status,
        authorId: user.id
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

    const existing = await Favorite.findOne({
      where: {
        userId: user.id,
        blogPostId: id
      }
    });

    if (existing) {
      await Favorite.destroy({
        where: { id: existing.id }
      });
      res.json({ favorited: false });
    } else {
      await Favorite.create({
        userId: user.id,
        blogPostId: id
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
    const ip = req.ip || req.socket.remoteAddress; // req.connection is deprecated

    const where: any = { blogPostId: id };
    if (user) {
      where.userId = user.id;
    } else {
      where.ipAddress = ip;
    }

    const existing = await BlogView.findOne({ where });

    if (!existing) {
      await BlogView.create({
        blogPostId: id,
        userId: user?.id,
        ipAddress: ip as string
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

    const [affectedCount, affectedRows] = await BlogPost.update(
      { status: status as ContentStatus },
      { where: { id }, returning: true }
    );

    if (affectedCount === 0) {
        return res.status(404).json({ message: 'Post not found' });
    }

    res.json(affectedRows[0]);
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
