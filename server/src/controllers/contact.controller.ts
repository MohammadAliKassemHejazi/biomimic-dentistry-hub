import { Request, Response } from 'express';
import { ContactMessage } from '../models';
import { ContactStatus } from '../types/enums';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    await ContactMessage.create({ name, email, subject, message });

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!Object.values(ContactStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await ContactMessage.update({ status }, { where: { id } });
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
