import { Request, Response } from 'express';
import { LeadershipMember } from '../models';
import { clearCache } from '../middleware/cache';

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await LeadershipMember.findAll();
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const member = await LeadershipMember.create(data);

    // PA-02 (Iter 4): invalidate Redis cache so GET /api/leadership returns fresh data
    await clearCache('/api/leadership/');

    res.status(201).json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ message: 'Error creating member' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const [updated] = await LeadershipMember.update(data, { where: { id } });
    if (updated) {
      const updatedMember = await LeadershipMember.findByPk(id as string);

      // PA-02 (Iter 4): invalidate Redis cache
      await clearCache('/api/leadership/');

      res.json(updatedMember);
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ message: 'Error updating member' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await LeadershipMember.destroy({ where: { id } });
    if (deleted) {
      // PA-02 (Iter 4): invalidate Redis cache
      await clearCache('/api/leadership/');

      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Member not found' });
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Error deleting member' });
  }
};
