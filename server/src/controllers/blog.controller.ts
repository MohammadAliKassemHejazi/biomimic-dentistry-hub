import { Request, Response } from 'express';
import { BlogPost, User, Favorite, BlogView } from '../models';
import { sequelize } from '../config/database';
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
    const { published, status, page, limit } = req.query as { published?: string, status?: string, page?: string, limit?: string };
    const user = req.user;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

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
      { model: User, as: 'author', attributes: ['firstName', 'lastName'] }
    ];

    if (user) {
      include.push({
        model: Favorite,
        as: 'favorites',
        where: { userId: user.id },
        required: false,
        attributes: ['id']
      });
    }

    // P-B1 (Iter 2): scalar subquery count to avoid hydrating every BlogView row
    // per listed post (could be thousands per popular article).
    const { count, rows: posts } = await BlogPost.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      distinct: true,
      attributes: {
        include: [[
          sequelize.literal(
            '(SELECT COUNT(*)::int FROM "blog_views" AS "bv" WHERE "bv"."blog_post_id" = "BlogPost"."id")'
          ),
          'viewCount',
        ]],
        // keep the existing column projection
        exclude: [] as string[],
      },
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featuredImage,
      category: p.category,
      tags: p.tags ? p.tags.split(',') : [],
      read_time: p.readTime,
      created_at: p.createdAt,
      updated_at: (p as any).updatedAt,
      status: p.status,
      view_count: Number((p as any).get?.('viewCount') ?? 0),
      is_favorited: user && p.favorites ? p.favorites.length > 0 : false,
      profiles: {
        first_name: p.author?.firstName,
        last_name: p.author?.lastName,
      },
    }));

    res.json({
      data: formatted,
      meta: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params as { slug: string };
    const user = req.user;

    // SV-20 (Iter 3): scalar subquery for view_count — same pattern as P-B1 (Iter 2).
    // Previously loaded all BlogView rows (post.views?.length) which for a popular post
    // with 50k views materialised 50k rows per detail request. Now O(1).
    const include: any[] = [
      {
        model: User,
        as: 'author',
        attributes: ['firstName', 'lastName'],
      },
    ];

    if (user) {
      include.push({
        model: Favorite,
        as: 'favorites',
        where: { userId: user.id },
        required: false,
      });
    }

    const post = await BlogPost.findOne({
      where: { slug },
      include,
      attributes: {
        include: [[
          sequelize.literal(
            '(SELECT COUNT(*)::int FROM "blog_views" AS "bv" WHERE "bv"."blog_post_id" = "BlogPost"."id")'
          ),
          'viewCount',
        ]],
        exclude: [] as string[],
      },
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
      updated_at: (post as any).updatedAt,
      status: post.status,
      view_count: Number((post as any).get?.('viewCount') ?? 0),
      is_favorited: user && post.favorites ? post.favorites.length > 0 : false,
      images: post.images || [],
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

    let finalFeaturedImage = featured_image;
    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const featuredFile = filesMap?.featured_image?.[0];
    const contentFiles = filesMap?.images || [];

    if (featuredFile) {
      finalFeaturedImage = `/uploads/${featuredFile.filename}`;
    }

    const imageUrls = contentFiles.map(f => `/uploads/${f.filename}`);

    const post = await BlogPost.create({
        title,
        slug,
        excerpt,
        content,
        featuredImage: finalFeaturedImage,
        images: imageUrls,
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

// BE-PERF-01 (Iter 8): Replace BlogView JOIN with scalar subquery.
// Previously included all BlogView rows (could be 500k rows for popular posts).
// Now uses a single COUNT(*) subquery — O(1) per post regardless of view volume.
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const favorites = await Favorite.findAll({
      where: { userId: user.id },
      include: [
        {
          model: BlogPost,
          as: 'blogPost',
          attributes: {
            include: [[
              sequelize.literal(
                // "blogPost" is the Sequelize JOIN alias (not the table name "blog_posts")
                '(SELECT COUNT(*)::int FROM "blog_views" AS "bv" WHERE "bv"."blog_post_id" = "blogPost"."id")'
              ),
              'viewCount',
            ]],
          },
          include: [
            { model: User, as: 'author', attributes: ['firstName', 'lastName'] },
          ],
        },
      ],
    });

    const posts = favorites
      .map((fav: any) => fav.blogPost)
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featured_image: p.featuredImage,
        category: p.category,
        tags: p.tags ? p.tags.split(',') : [],
        read_time: p.readTime,
        created_at: p.createdAt,
        view_count: Number((p as any).get?.('viewCount') ?? 0),
        is_favorited: true,
        profiles: {
          first_name: p.author?.firstName,
          last_name: p.author?.lastName,
        },
      }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching favorites:', error);
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

// BE-BLOG-STATUS (Iter 8): Admin-only handler to approve / reject submitted blog posts.
// Route: PATCH /blog/posts/:id/status  (isAdmin middleware enforced in blog.routes.ts)
export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };

    const validStatuses = Object.values(ContentStatus);
    if (!validStatuses.includes(status as ContentStatus)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const post = await BlogPost.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.update({ status: status as ContentStatus });

    res.json({ success: true, status: post.status });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
