import { Request, Response } from 'express';
import { ContactMessage } from '../models';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Save to DB
    await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
