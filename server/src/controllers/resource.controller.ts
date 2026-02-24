import { Request, Response } from 'express';
import { Resource } from '../models';
import { ContentStatus } from '../types/enums';
import { logActivity } from '../utils/activity';

export const getResources = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const where: any = {};

    // If not admin, only show approved resources
    if (user?.role !== 'admin') {
      where.status = ContentStatus.APPROVED;
    }

    const resources = await Resource.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    const formatted = resources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      file_url: r.fileUrl,
      file_name: r.fileName,
      file_type: r.fileType,
      access_level: r.accessLevel,
      category: r.category,
      tags: r.tags ? r.tags.split(',').filter(Boolean) : [],
      download_count: r.downloadCount,
      created_at: r.createdAt,
      status: r.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const { title, description, file_url, file_name, file_type, access_level, category, tags } = req.body;
    const user = req.user;

    // Check permissions: Admin or Ambassador
    if (user?.role !== 'admin' && user?.role !== 'ambassador') {
      return res.status(403).json({ message: 'Only Ambassadors and Admins can create resources' });
    }

    const status = user?.role === 'admin' ? ContentStatus.APPROVED : ContentStatus.PENDING;

    let finalFileUrl = file_url;
    let finalFileName = file_name;
    let finalFileType = file_type;
    let finalFileSize = 0;

    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
      finalFileName = req.file.originalname;
      finalFileType = req.file.mimetype;
      finalFileSize = req.file.size;
    }

    const resource = await Resource.create({
      title,
      description,
      fileUrl: finalFileUrl,
      fileName: finalFileName,
      fileType: finalFileType,
      fileSize: finalFileSize,
      accessLevel: access_level || 'public',
      category,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      status,
      createdById: user?.id,
    });

    res.status(201).json({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      file_url: resource.fileUrl,
      file_name: resource.fileName,
      file_type: resource.fileType,
      access_level: resource.accessLevel,
      category: resource.category,
      tags: resource.tags ? resource.tags.split(',') : [],
      download_count: resource.downloadCount,
      status: resource.status,
      created_at: resource.createdAt,
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, description, file_url, file_name, file_type, access_level, category, tags, status } = req.body;
    const user = req.user;

    const data: any = {
      title,
      description,
      fileUrl: file_url,
      fileName: file_name,
      fileType: file_type,
      accessLevel: access_level,
      category,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || undefined),
    };

    if (status && user?.role === 'admin') {
      data.status = status;
    }

    const [affectedCount, affectedRows] = await Resource.update(data, {
      where: { id },
      returning: true,
    });

    if (affectedCount === 0) {
       return res.status(404).json({ message: 'Resource not found' });
    }

    const resource = affectedRows[0];

    res.json({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      file_url: resource.fileUrl,
      file_name: resource.fileName,
      file_type: resource.fileType,
      access_level: resource.accessLevel,
      category: resource.category,
      tags: resource.tags ? resource.tags.split(',') : [],
      download_count: resource.downloadCount,
      status: resource.status,
      created_at: resource.createdAt,
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deletedCount = await Resource.destroy({ where: { id } });
    if (deletedCount === 0) {
        return res.status(404).json({ message: "Resource not found" });
    }
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const resource = await Resource.findByPk(id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await resource.increment('downloadCount');

    if (req.user) {
      await logActivity(req.user.id, 'download', `Downloaded resource: ${resource.title}`, { resourceId: id });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
