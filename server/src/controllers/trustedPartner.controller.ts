import { Request, Response } from 'express';
import { TrustedPartner } from '../models';

export const getPartners = async (req: Request, res: Response) => {
  try {
    const partners = await TrustedPartner.findAll();
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Error fetching partners' });
  }
};

export const createPartner = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.logo = `/uploads/${req.file.filename}`;
    }
    const partner = await TrustedPartner.create(data);
    res.status(201).json(partner);
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: 'Error creating partner' });
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file) {
      data.logo = `/uploads/${req.file.filename}`;
    }
    const [updated] = await TrustedPartner.update(data, { where: { id } });
    if (updated) {
      const updatedPartner = await TrustedPartner.findByPk(id as string);
      res.json(updatedPartner);
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ message: 'Error updating partner' });
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await TrustedPartner.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Partner not found' });
    }
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ message: 'Error deleting partner' });
  }
};
