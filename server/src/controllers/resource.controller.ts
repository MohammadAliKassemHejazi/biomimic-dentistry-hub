import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AccessLevel } from '@prisma/client';

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
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
      tags: r.tags,
      download_count: r.downloadCount,
      created_at: r.createdAt,
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

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        fileUrl: file_url,
        fileName: file_name,
        fileType: file_type,
        accessLevel: access_level as AccessLevel,
        category,
        tags: tags || [],
        createdById: req.user?.id, // Assumes auth middleware populates req.user
      }
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
      tags: resource.tags,
      download_count: resource.downloadCount,
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
    const { title, description, file_url, file_name, file_type, access_level, category, tags } = req.body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title,
        description,
        fileUrl: file_url,
        fileName: file_name,
        fileType: file_type,
        accessLevel: access_level as AccessLevel,
        category,
        tags: tags || [],
      }
    });

    res.json({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      file_url: resource.fileUrl,
      file_name: resource.fileName,
      file_type: resource.fileType,
      access_level: resource.accessLevel,
      category: resource.category,
      tags: resource.tags,
      download_count: resource.downloadCount,
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
    await prisma.resource.delete({ where: { id } });
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
