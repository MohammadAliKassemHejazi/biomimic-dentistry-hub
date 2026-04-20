import { Request, Response } from 'express';
import { NewsletterSubscriber } from '../models';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const [, created] = await NewsletterSubscriber.findOrCreate({ where: { email } });

    if (!created) return res.status(409).json({ message: 'Email already subscribed' });

    res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const subscribers = await NewsletterSubscriber.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await NewsletterSubscriber.destroy({ where: { id } });
    res.json({ message: 'Subscriber removed' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
