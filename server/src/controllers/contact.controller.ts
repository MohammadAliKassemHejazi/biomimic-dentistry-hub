import { Request, Response } from 'express';
import { ContactMessage } from '../models';
import { ContactStatus } from '../types/enums';
import { isValidEmail, isNonEmptyString } from '../utils/validation';

// Length caps to prevent abuse + DB bloat.
const MAX_NAME = 120;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body ?? {};

    // SV-10: previously accepted `{}` and created a row full of nulls.
    if (!isNonEmptyString(name) || name.length > MAX_NAME) {
      return res.status(400).json({ message: 'A valid name is required' });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (!isNonEmptyString(subject) || subject.length > MAX_SUBJECT) {
      return res.status(400).json({ message: 'A valid subject is required' });
    }
    if (!isNonEmptyString(message) || message.length > MAX_MESSAGE) {
      return res.status(400).json({ message: `Message must be between 1 and ${MAX_MESSAGE} characters` });
    }

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

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
