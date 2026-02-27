import { Request, Response } from 'express';
import { SubscriptionPlan } from '../models';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, features, popular, interval, price, key, stripePriceId } = req.body;

    const [updated] = await SubscriptionPlan.update({
        name, features, popular, interval, price, key, stripePriceId
    }, { where: { id } });

    if (updated) {
      const updatedPlan = await SubscriptionPlan.findByPk(id as string);
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ message: 'Error updating plan' });
  }
};

export const seedPlans = async (req: Request, res: Response) => {
     try {
        // Remove Ambassador plan if exists (since it's now free/add-on)
        await SubscriptionPlan.destroy({ where: { key: 'ambassador' } });
        // Remove old plans if they exist
        await SubscriptionPlan.destroy({ where: { key: 'basic' } });
        // Clean up old 'gold' plan to replace with 'vip'
        await SubscriptionPlan.destroy({ where: { key: 'gold' } });

        const plansData = [
          {
            key: 'bronze',
            name: 'Bronze VIP',
            price: 29,
            interval: 'month',
            stripePriceId: 'price_bronze_placeholder',
            features: [
              'Monthly Q&A Sessions',
              'Exclusive Course Discounts (20%)',
              'Priority Email Support',
              'VIP Community Access',
              'Monthly Newsletter'
            ],
            popular: false
          },
          {
            key: 'silver',
            name: 'Silver VIP',
            price: 59,
            interval: 'month',
            stripePriceId: 'price_silver_placeholder',
            features: [
              'All Bronze Benefits',
              'Bi-weekly Group Mentorship',
              'Course Discounts (40%)',
              'Direct Mentor Access',
              'Case Study Reviews',
              'Early Course Access'
            ],
            popular: true
          },
          {
            key: 'vip',
            name: 'VIP',
            price: 99,
            interval: 'month',
            stripePriceId: 'price_vip_placeholder',
            features: [
              'All Silver Benefits',
              'Weekly 1:1 Mentorship',
              'Free Course Access',
              'Personal Career Guidance',
              'Research Collaboration',
              'Speaking Opportunities'
            ],
            popular: false
          }
        ];

        for (const plan of plansData) {
            const [p, created] = await SubscriptionPlan.findOrCreate({
                where: { key: plan.key },
                defaults: plan
            });
            if (!created) {
                // Update existing plan details
                await p.update(plan);
            }
        }

        const allPlans = await SubscriptionPlan.findAll({ order: [['price', 'ASC']] });
        res.status(200).json({ message: 'Plans seeded/updated', plans: allPlans });
     } catch (error) {
        console.error('Error seeding plans:', error);
        res.status(500).json({ message: 'Error seeding plans' });
     }
}
